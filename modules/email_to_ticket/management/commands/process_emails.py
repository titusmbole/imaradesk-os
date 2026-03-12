"""
Management command to process emails and create tickets.

This command:
1. Reads UNREAD emails from tenant folders
2. Creates tickets from the first email in a conversation thread
3. Adds replies as ticket comments
4. Marks emails as read after processing
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model
from django_tenants.utils import schema_context
from modules.email_to_ticket.utils import EmailReader, route_emails_to_tenants, group_emails_into_threads
from modules.email_to_ticket.models import TenantHelpEmail, ProcessedEmail
from shared.models import Client

User = get_user_model()


class Command(BaseCommand):
    help = 'Process unread emails and create tickets (replies become comments)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating tickets',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=50,
            help='Maximum number of emails to process (default: 50)',
        )
        parser.add_argument(
            '--reprocess',
            action='store_true',
            help='Process all emails (including read ones). Will skip already processed.',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('  EMAIL TO TICKET - Process Emails'))
        self.stdout.write(self.style.SUCCESS('='*60 + '\n'))
        
        dry_run = options['dry_run']
        reprocess = options['reprocess']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No tickets will be created\n'))
        if reprocess:
            self.stdout.write(self.style.WARNING('REPROCESS MODE - Processing all emails (read & unread)\n'))
        
        # Check settings
        if not hasattr(settings, 'EMAIL_HELP_HOST') or not settings.EMAIL_HELP_HOST:
            self.stdout.write(self.style.ERROR('EMAIL_HELP_HOST not configured in settings'))
            return
        
        imap_port = getattr(settings, 'EMAIL_HELP_IMAP_PORT', 993)
        self.stdout.write(f'Connecting to: {settings.EMAIL_HELP_HOST}:{imap_port} (IMAP)')
        self.stdout.write(f'User: {settings.EMAIL_HELP_HOST_USER}\n')
        
        # Read emails
        with EmailReader() as reader:
            if not reader.connection:
                self.stdout.write(self.style.ERROR('Failed to connect to IMAP server'))
                return
            
            self.stdout.write(self.style.SUCCESS('✓ Connected to mailbox\n'))
            
            # Get existing tenants for folder detection
            existing_tenants = list(Client.objects.exclude(
                schema_name='public'
            ).values_list('schema_name', flat=True))
            
            if not existing_tenants:
                self.stdout.write(self.style.WARNING('No tenants found.'))
                return
            
            # Get tenant folders
            tenant_folders = reader.get_tenant_folders(existing_tenants)
            if not tenant_folders:
                self.stdout.write(self.style.WARNING('No tenant folders found in mailbox.'))
                return
            
            self.stdout.write(f'Searching tenant folders: {", ".join(tenant_folders)}\n')
            
            # Fetch emails from tenant folders (UNREAD only, or ALL if reprocess)
            all_emails = []
            for folder in tenant_folders:
                if reprocess:
                    emails = reader.fetch_all_emails(folder=folder, limit=options['limit'])
                else:
                    emails = reader.fetch_unread_emails(folder=folder, limit=options['limit'])
                if emails:
                    status = 'email(s)' if reprocess else 'unread email(s)'
                    self.stdout.write(f'  {folder}: {len(emails)} {status}')
                    for e in emails:
                        e['_folder'] = folder
                    all_emails.extend(emails)
            
            if not all_emails:
                self.stdout.write(self.style.SUCCESS('\n✓ No unread emails to process.'))
                return
            
            self.stdout.write(self.style.SUCCESS(f'\n✓ Found {len(all_emails)} unread email(s)\n'))
            
            # Route emails to tenants
            routed = route_emails_to_tenants(all_emails)
            
            # Process stats
            tickets_created = 0
            comments_added = 0
            errors = 0
            
            # Process each tenant's emails
            for tenant_schema, tenant_emails in routed.items():
                if tenant_schema == '_unrouted':
                    continue
                
                # Check if tenant exists
                try:
                    tenant = Client.objects.get(schema_name=tenant_schema)
                except Client.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f'  ✗ Tenant not found: {tenant_schema}'))
                    errors += len(tenant_emails)
                    continue
                
                self.stdout.write(f'\n  Processing tenant: {tenant.name} ({tenant_schema})')
                
                # Group into threads
                threads = group_emails_into_threads(tenant_emails)
                
                for thread in threads:
                    try:
                        t_created, c_added = self.process_thread(
                            thread, tenant, reader, dry_run
                        )
                        tickets_created += t_created
                        comments_added += c_added
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'    ✗ Error processing thread: {e}'))
                        errors += 1
            
            # Summary
            self.stdout.write('\n' + '='*60)
            self.stdout.write(self.style.SUCCESS('  PROCESSING COMPLETE'))
            self.stdout.write('='*60)
            self.stdout.write(f'  Tickets created: {tickets_created}')
            self.stdout.write(f'  Comments added: {comments_added}')
            if errors:
                self.stdout.write(self.style.ERROR(f'  Errors: {errors}'))
            self.stdout.write('='*60 + '\n')

    def process_thread(self, thread, tenant, reader, dry_run=False):
        """
        Process an email thread:
        - First email creates a ticket
        - Subsequent emails become comments
        
        Returns (tickets_created, comments_added)
        """
        from modules.ticket.models import Ticket, TicketComment
        
        emails = thread['emails']
        if not emails:
            return 0, 0
        
        tickets_created = 0
        comments_added = 0
        
        # First email creates the ticket
        first_email = emails[0]
        subject = first_email.get('subject', '').strip() or '(No Subject)'
        from_email = first_email.get('from_email', '')
        from_name = first_email.get('from_name', '')
        body = first_email.get('plain_body', '') or first_email.get('html_body', '')
        message_id = first_email.get('message_id', '')
        
        # Check if this email was already processed
        if message_id and ProcessedEmail.objects.filter(message_id=message_id).exists():
            self.stdout.write(f'    ⊘ Already processed: {subject[:40]}...')
            return 0, 0
        
        self.stdout.write(f'    → Creating ticket: {subject[:50]}...')
        
        if dry_run:
            self.stdout.write(self.style.NOTICE(f'      [DRY RUN] Would create ticket from: {from_email}'))
            # Mark as read even in dry run to test
            return 0, 0
        
        # Create ticket in tenant schema
        with schema_context(tenant.schema_name):
            # Try to find or create user from email
            requester = None
            try:
                requester = User.objects.filter(email__iexact=from_email).first()
            except Exception:
                pass
            
            # Create the ticket
            ticket = Ticket.objects.create(
                title=subject,
                description=body or f"Email from {from_name} <{from_email}>",
                source='email',
                status='new',
                priority='normal',
                type='incident',
                requester=requester,
                is_guest_ticket=requester is None,
                guest_name=from_name if requester is None else None,
                guest_email=from_email if requester is None else None,
            )
            
            self.stdout.write(self.style.SUCCESS(f'      ✓ Created ticket: {ticket.ticket_number}'))
            tickets_created = 1
            
            # Note: Confirmation email is sent by ticket signals 
            # based on NotificationSettings.notify_new_ticket_created
            
            # Record processed email
            ProcessedEmail.objects.create(
                message_id=message_id or f"no-id-{ticket.ticket_number}",
                tenant=tenant,
                from_address=from_email,
                to_address=first_email.get('matched_tenant_email', ''),
                subject=subject,
                received_at=first_email.get('received_at'),
                ticket_created=True,
                ticket_number=ticket.ticket_number,
            )
            
            # Mark first email as read
            folder = first_email.get('_folder')
            if first_email.get('uid'):
                reader.mark_as_seen(first_email['uid'], folder)
                self.stdout.write(f'      ✓ Marked as read')
            
            # Process replies as comments
            for reply_email in emails[1:]:
                reply_message_id = reply_email.get('message_id', '')
                
                # Skip if already processed
                if reply_message_id and ProcessedEmail.objects.filter(message_id=reply_message_id).exists():
                    continue
                
                reply_from_email = reply_email.get('from_email', '')
                reply_from_name = reply_email.get('from_name', '')
                reply_body = reply_email.get('plain_body', '') or reply_email.get('html_body', '')
                reply_subject = reply_email.get('subject', '')
                
                # Try to find user
                reply_author = None
                try:
                    reply_author = User.objects.filter(email__iexact=reply_from_email).first()
                except Exception:
                    pass
                
                # Add comment
                comment_message = reply_body
                if not reply_author:
                    # Add sender info for guest comments
                    comment_message = f"**From:** {reply_from_name} <{reply_from_email}>\n\n{reply_body}"
                
                TicketComment.objects.create(
                    ticket=ticket,
                    author=reply_author,
                    message=comment_message,
                    is_internal=False,
                )
                
                self.stdout.write(f'      ✓ Added reply as comment from: {reply_from_email}')
                comments_added += 1
                
                # Record processed email
                ProcessedEmail.objects.create(
                    message_id=reply_message_id or f"reply-{ticket.ticket_number}-{comments_added}",
                    tenant=tenant,
                    from_address=reply_from_email,
                    to_address=reply_email.get('matched_tenant_email', ''),
                    subject=reply_subject,
                    received_at=reply_email.get('received_at'),
                    ticket_created=False,
                    ticket_number=ticket.ticket_number,
                )
                
                # Mark reply as read
                reply_folder = reply_email.get('_folder')
                if reply_email.get('uid'):
                    reader.mark_as_seen(reply_email['uid'], reply_folder)
        
        return tickets_created, comments_added
