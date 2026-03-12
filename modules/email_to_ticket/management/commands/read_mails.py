"""
Management command to read emails from the help mailbox and print them.

This command connects to the IMAP server configured in EMAIL_HELP_* settings,
fetches emails, routes them to tenants based on plus addressing, and prints them.
"""
from django.core.management.base import BaseCommand
from django.conf import settings
from modules.email_to_ticket.utils import EmailReader, route_emails_to_tenants, group_emails_into_threads
from modules.email_to_ticket.models import TenantHelpEmail, ProcessedEmail
from shared.models import Client


class Command(BaseCommand):
    help = 'Read emails from the help mailbox and print them grouped by tenant and conversation threads'

    def add_arguments(self, parser):
        parser.add_argument(
            '--unread-only',
            action='store_true',
            help='Only fetch unread emails (default: fetch all recent)',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=20,
            help='Maximum number of emails to fetch (default: 20)',
        )
        parser.add_argument(
            '--mark-read',
            action='store_true',
            help='Mark fetched emails as read after processing',
        )
        parser.add_argument(
            '--show-body',
            action='store_true',
            help='Show email body content (default: headers only)',
        )
        parser.add_argument(
            '--list-folders',
            action='store_true',
            help='List all available mailbox folders and exit',
        )
        parser.add_argument(
            '--folder',
            type=str,
            default=None,
            help='Specific folder to read emails from (default: auto-detect tenant folders)',
        )
        parser.add_argument(
            '--all-folders',
            action='store_true',
            help='Search all folders for emails',
        )
        parser.add_argument(
            '--inbox-only',
            action='store_true',
            help='Only search INBOX folder (ignore tenant folders)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('  EMAIL TO TICKET - Read Mails Command'))
        self.stdout.write(self.style.SUCCESS('='*60 + '\n'))
        
        # Check settings
        if not hasattr(settings, 'EMAIL_HELP_HOST') or not settings.EMAIL_HELP_HOST:
            self.stdout.write(self.style.ERROR('EMAIL_HELP_HOST not configured in settings'))
            return
        
        imap_port = getattr(settings, 'EMAIL_HELP_IMAP_PORT', 993)
        self.stdout.write(f'Connecting to: {settings.EMAIL_HELP_HOST}:{imap_port} (IMAP)')
        self.stdout.write(f'User: {settings.EMAIL_HELP_HOST_USER}')
        self.stdout.write(f'SSL: {settings.EMAIL_HELP_USE_SSL}\n')
        
        # Read emails
        with EmailReader() as reader:
            if not reader.connection:
                self.stdout.write(self.style.ERROR('Failed to connect to IMAP server'))
                return
            
            self.stdout.write(self.style.SUCCESS('✓ Connected to mailbox\n'))
            
            # List folders if requested
            if options['list_folders']:
                self.stdout.write('Available folders:')
                folders = reader.list_folders()
                for folder in folders:
                    self.stdout.write(f'  - {folder}')
                return
            
            # Get existing tenants for folder detection
            existing_tenants = list(Client.objects.exclude(
                schema_name='public'
            ).values_list('schema_name', flat=True))
            
            # Determine which folders to search
            if options['all_folders']:
                folders = reader.list_folders()
                self.stdout.write(f'Searching {len(folders)} folders...\n')
            elif options['folder']:
                folders = [options['folder']]
            elif options['inbox_only']:
                folders = ['INBOX']
            else:
                # Default: Only search tenant-specific folders (not INBOX)
                # Some email servers (like Spacemail) route plus-addressed emails to separate folders
                tenant_folders = reader.get_tenant_folders(existing_tenants)
                if tenant_folders:
                    folders = tenant_folders
                    self.stdout.write(f'Searching tenant folders: {", ".join(tenant_folders)}\n')
                else:
                    # Fallback to INBOX if no tenant folders found
                    folders = ['INBOX']
                    self.stdout.write('No tenant folders found, searching INBOX...\n')
            
            all_emails = []
            for folder in folders:
                # Fetch emails from this folder
                if options['unread_only']:
                    emails = reader.fetch_unread_emails(folder=folder, limit=options['limit'])
                else:
                    emails = reader.fetch_all_emails(folder=folder, limit=options['limit'])
                
                if emails:
                    self.stdout.write(f'  {folder}: {len(emails)} email(s)')
                    for e in emails:
                        e['_folder'] = folder
                    all_emails.extend(emails)
            
            emails = all_emails
            
            if not emails:
                self.stdout.write(self.style.WARNING('\nNo emails found in tenant folders.'))
                return
            
            # Route emails to tenants
            routed = route_emails_to_tenants(emails)
            
            # Convert to set for validation
            existing_tenants_set = set(existing_tenants)
            
            # Count tenant-routed emails only
            tenant_email_count = sum(len(e) for k, e in routed.items() if k != '_unrouted')
            
            if tenant_email_count == 0:
                self.stdout.write(self.style.WARNING('\nNo tenant-specific emails found.'))
                unrouted_count = len(routed.get('_unrouted', []))
                if unrouted_count > 0:
                    self.stdout.write(f'({unrouted_count} unrouted emails ignored - no plus addressing)')
                return
            
            self.stdout.write(self.style.SUCCESS(f'\n✓ Found {tenant_email_count} tenant email(s)\n'))
            
            # Print emails grouped by tenant (skip unrouted)
            total_threads = 0
            for tenant_schema, tenant_emails in routed.items():
                if tenant_schema == '_unrouted':
                    continue  # Skip unrouted emails
                
                tenant_exists = tenant_schema in existing_tenants_set
                status = '✓' if tenant_exists else '✗ NOT FOUND'
                style = self.style.SUCCESS if tenant_exists else self.style.ERROR
                
                # Group emails into conversation threads
                threads = group_emails_into_threads(tenant_emails)
                total_threads += len(threads)
                
                self.stdout.write('\n' + '='*60)
                self.stdout.write(style(f'  TENANT: {tenant_schema} {status}'))
                self.stdout.write(style(f'  Conversations: {len(threads)} | Emails: {len(tenant_emails)}'))
                self.stdout.write('='*60)
                
                for t_idx, thread in enumerate(threads, 1):
                    email_count = thread['email_count']
                    has_replies = email_count > 1
                    
                    self.stdout.write(f'\n  ┌─ [{t_idx}] {thread["subject"] or "(No Subject)"}')
                    self.stdout.write(f'  │   From: {thread["from_name"]} <{thread["from_email"]}>')
                    self.stdout.write(f'  │   Started: {thread["started_at"]}')
                    if has_replies:
                        self.stdout.write(self.style.NOTICE(f'  │   💬 {email_count} messages in thread'))
                    
                    # Show all emails in the thread
                    for e_idx, email_data in enumerate(thread['emails']):
                        is_first = e_idx == 0
                        is_last = e_idx == len(thread['emails']) - 1
                        
                        if is_first and not has_replies:
                            prefix = '  │'
                        elif is_first:
                            prefix = '  │   ┌─'
                            self.stdout.write(f'  │')
                            self.stdout.write(f'  │   Thread:')
                        elif is_last:
                            prefix = '  │   └─'
                        else:
                            prefix = '  │   ├─'
                        
                        if has_replies:
                            reply_marker = '→' if e_idx > 0 else '●'
                            self.stdout.write(f'{prefix} {reply_marker} [{e_idx + 1}] {email_data.get("subject", "(No Subject)")}')
                            self.stdout.write(f'  │      From: {email_data.get("from_name", "")} <{email_data.get("from_email", "")}>')
                            self.stdout.write(f'  │      Date: {email_data.get("received_at", "N/A")}')
                        
                        attachments = email_data.get('attachments', [])
                        if attachments:
                            self.stdout.write(f'  │      Attachments: {len(attachments)}')
                            for att in attachments:
                                size_kb = att.get('size', 0) / 1024
                                self.stdout.write(f'  │        - {att["filename"]} ({size_kb:.1f} KB)')
                        
                        if options['show_body']:
                            plain_body = email_data.get('plain_body', '')
                            if plain_body:
                                body_preview = plain_body[:300]
                                if len(plain_body) > 300:
                                    body_preview += '...'
                                self.stdout.write(f'  │      ─────')
                                for line in body_preview.split('\n')[:5]:
                                    self.stdout.write(f'  │      {line[:60]}')
                                self.stdout.write(f'  │      ─────')
                        
                        # Mark as read if requested
                        if options['mark_read'] and email_data.get('uid'):
                            reader.mark_as_seen(email_data['uid'])
                            self.stdout.write(self.style.SUCCESS(f'  │      → Marked as read'))
                    
                    self.stdout.write(f'  └─')
            
            # Summary
            self.stdout.write('\n' + '='*60)
            self.stdout.write(self.style.SUCCESS('  SUMMARY'))
            self.stdout.write('='*60)
            
            self.stdout.write(f'  Tenant emails found: {tenant_email_count}')
            self.stdout.write(f'  Conversations: {total_threads}')
            self.stdout.write(f'  Unique tenants: {len([k for k in routed.keys() if k != "_unrouted"])}')
            
            # List tenant help emails
            self.stdout.write('\n  Registered Help Emails:')
            help_emails = TenantHelpEmail.objects.filter(is_active=True).select_related('tenant')
            if help_emails.exists():
                for he in help_emails:
                    self.stdout.write(f'    - {he.email_address} → {he.tenant.name}')
            else:
                self.stdout.write(self.style.WARNING('    No help emails registered. Run: python manage.py coredesk --seed-help-emails'))
            
            self.stdout.write('\n' + '='*60 + '\n')
