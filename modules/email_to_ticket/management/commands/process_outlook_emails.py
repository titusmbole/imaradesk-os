"""
Management command to process Microsoft Outlook emails and create tickets.

This command:
1. Reads emails from connected Outlook mailboxes using Microsoft Graph API
2. Creates tickets from the first email in a conversation thread
3. Adds replies as ticket comments
4. Marks emails as read after processing (optional)
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from shared.utilities.tenant_compat import schema_context, get_tenant_model
from modules.email_to_ticket.utils import OutlookEmailReader, group_outlook_emails_into_threads
from modules.email_to_ticket.models import OutlookMailbox, ProcessedEmail

User = get_user_model()
TenantModel = get_tenant_model()


class Command(BaseCommand):
    help = 'Process emails from connected Microsoft Outlook mailboxes and create tickets'

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
            help='Maximum number of emails to process per mailbox (default: 50)',
        )
        parser.add_argument(
            '--tenant',
            type=str,
            help='Process only this tenant schema name',
        )
        parser.add_argument(
            '--mailbox',
            type=str,
            help='Process only this mailbox email address',
        )
        parser.add_argument(
            '--reprocess',
            action='store_true',
            help='Process all emails (including read ones). Will skip already processed.',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('  OUTLOOK EMAIL TO TICKET - Process Emails'))
        self.stdout.write(self.style.SUCCESS('='*60 + '\n'))
        
        dry_run = options['dry_run']
        reprocess = options['reprocess']
        limit = options['limit']
        target_tenant = options.get('tenant')
        target_mailbox = options.get('mailbox')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No tickets will be created\n'))
        if reprocess:
            self.stdout.write(self.style.WARNING('REPROCESS MODE - Processing all emails (read & unread)\n'))
        
        # Get all tenants to process
        tenants = TenantModel.objects.exclude(schema_name='public')
        if target_tenant:
            tenants = tenants.filter(schema_name=target_tenant)
        
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenants found to process.'))
            return
        
        # Global stats
        total_tickets_created = 0
        total_comments_added = 0
        total_errors = 0
        
        for tenant in tenants:
            self.stdout.write(f'\nProcessing tenant: {tenant.name} ({tenant.schema_name})')
            self.stdout.write('-' * 50)
            
            with schema_context(tenant.schema_name):
                # Get active Outlook mailboxes for this tenant
                mailboxes = OutlookMailbox.objects.filter(is_active=True)
                if target_mailbox:
                    mailboxes = mailboxes.filter(email_address__iexact=target_mailbox)
                
                if not mailboxes.exists():
                    self.stdout.write(self.style.NOTICE('  No active Outlook mailboxes configured.'))
                    continue
                
                for mailbox in mailboxes:
                    self.stdout.write(f'\n  Mailbox: {mailbox.email_address}')
                    
                    t_created, c_added, errors = self.process_mailbox(
                        mailbox, tenant, limit, dry_run, reprocess
                    )
                    
                    total_tickets_created += t_created
                    total_comments_added += c_added
                    total_errors += errors
        
        # Summary
        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS('  PROCESSING COMPLETE'))
        self.stdout.write('='*60)
        self.stdout.write(f'  Tickets created: {total_tickets_created}')
        self.stdout.write(f'  Comments added: {total_comments_added}')
        if total_errors:
            self.stdout.write(self.style.ERROR(f'  Errors: {total_errors}'))
        self.stdout.write('='*60 + '\n')

    def process_mailbox(self, mailbox, tenant, limit, dry_run, reprocess):
        """
        Process emails from a single Outlook mailbox.
        
        Returns (tickets_created, comments_added, errors)
        """
        tickets_created = 0
        comments_added = 0
        errors = 0
        
        try:
            with OutlookEmailReader(mailbox) as reader:
                if not reader.access_token:
                    self.stdout.write(self.style.ERROR('    ✗ Failed to authenticate with mailbox'))
                    return 0, 0, 1
                
                self.stdout.write(self.style.SUCCESS('    ✓ Connected to mailbox'))
                
                # Fetch emails
                folder = mailbox.folder_to_watch or 'Inbox'
                if reprocess:
                    emails = reader.fetch_all_emails(folder=folder, limit=limit)
                else:
                    emails = reader.fetch_unread_emails(folder=folder, limit=limit)
                
                if not emails:
                    self.stdout.write(self.style.SUCCESS('    ✓ No new emails to process.'))
                    mailbox.update_last_sync()
                    return 0, 0, 0
                
                email_type = 'email(s)' if reprocess else 'unread email(s)'
                self.stdout.write(f'    Found {len(emails)} {email_type}')
                
                # Group emails into conversation threads
                threads = group_outlook_emails_into_threads(emails)
                self.stdout.write(f'    Grouped into {len(threads)} conversation thread(s)')
                
                # Process each thread
                for thread in threads:
                    try:
                        t_created, c_added = self.process_thread(
                            thread, mailbox, tenant, reader, dry_run
                        )
                        tickets_created += t_created
                        comments_added += c_added
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'    ✗ Error processing thread: {e}'))
                        errors += 1
                
                # Update last sync time
                mailbox.update_last_sync()
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'    ✗ Error: {e}'))
            errors += 1
        
        return tickets_created, comments_added, errors

    def process_thread(self, thread, mailbox, tenant, reader, dry_run=False):
        """
        Process an email thread:
        - First email creates a ticket
        - Subsequent emails become comments
        
        Returns (tickets_created, comments_added)
        """
        from modules.ticket.models import Ticket, TicketComment
        from shared.models import Client
        
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
        graph_id = first_email.get('graph_id', '')
        
        # Get tenant Client object for ProcessedEmail
        try:
            tenant_client = Client.objects.get(schema_name=tenant.schema_name)
        except Client.DoesNotExist:
            tenant_client = None
        
        # Check if this email was already processed
        if message_id and ProcessedEmail.objects.filter(message_id=message_id).exists():
            self.stdout.write(f'      ⊘ Already processed: {subject[:40]}...')
            return 0, 0
        
        self.stdout.write(f'      → Creating ticket: {subject[:50]}...')
        
        if dry_run:
            self.stdout.write(self.style.NOTICE(f'        [DRY RUN] Would create ticket from: {from_email}'))
            return 0, 0
        
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
            priority=mailbox.default_priority or 'normal',
            type='incident',
            requester=requester,
            is_guest_ticket=requester is None,
            guest_name=from_name if requester is None else None,
            guest_email=from_email if requester is None else None,
        )
        
        self.stdout.write(self.style.SUCCESS(f'        ✓ Created ticket: {ticket.ticket_number}'))
        tickets_created = 1
        
        # Note: Confirmation email is sent by ticket signals 
        # based on NotificationSettings.notify_new_ticket_created
        
        # Record processed email (in public schema for cross-tenant tracking)
        with schema_context('public'):
            ProcessedEmail.objects.create(
                message_id=message_id or f"outlook-{graph_id}",
                tenant=tenant_client,
                from_address=from_email,
                to_address=mailbox.email_address,
                subject=subject,
                received_at=first_email.get('received_at'),
                ticket_created=True,
                ticket_number=ticket.ticket_number,
            )
        
        # Mark as read if configured
        if mailbox.mark_as_read and graph_id:
            if reader.mark_as_read(graph_id):
                self.stdout.write('        ✓ Marked as read')
        
        # Move to folder if configured
        if mailbox.move_to_folder and graph_id:
            if reader.move_to_folder(graph_id, mailbox.move_to_folder):
                self.stdout.write(f'        ✓ Moved to {mailbox.move_to_folder}')
        
        # Process replies as comments
        for reply_email in emails[1:]:
            reply_message_id = reply_email.get('message_id', '')
            reply_graph_id = reply_email.get('graph_id', '')
            
            # Skip if already processed
            with schema_context('public'):
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
            
            self.stdout.write(f'        ✓ Added reply as comment from: {reply_from_email}')
            comments_added += 1
            
            # Record processed email
            with schema_context('public'):
                ProcessedEmail.objects.create(
                    message_id=reply_message_id or f"outlook-reply-{reply_graph_id}",
                    tenant=tenant_client,
                    from_address=reply_from_email,
                    to_address=mailbox.email_address,
                    subject=reply_subject,
                    received_at=reply_email.get('received_at'),
                    ticket_created=False,
                    ticket_number=ticket.ticket_number,
                )
            
            # Mark reply as read
            if mailbox.mark_as_read and reply_graph_id:
                reader.mark_as_read(reply_graph_id)
            
            # Move reply to folder
            if mailbox.move_to_folder and reply_graph_id:
                reader.move_to_folder(reply_graph_id, mailbox.move_to_folder)
        
        return tickets_created, comments_added
