"""
Management command to process custom IMAP emails into tickets.

This command connects to custom IMAP mailboxes configured by tenants,
reads unread emails, and creates tickets from them.

Usage:
    python manage.py process_custom_emails [options]

Options:
    --dry-run       Show what would be processed without creating tickets
    --limit N       Limit emails per mailbox (default: 50)
    --tenant NAME   Only process specific tenant schema
    --mailbox EMAIL Only process specific mailbox
    --reprocess     Reprocess all emails (ignore already processed)
"""

import imaplib
import email
import ssl
import logging
from datetime import datetime
from email.header import decode_header
from email.utils import parseaddr, parsedate_to_datetime

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from shared.utilities.tenant_compat import schema_context, get_tenant_model

logger = logging.getLogger(__name__)
User = get_user_model()


def decode_email_header(header_value):
    """Decode email header value to string"""
    if not header_value:
        return ''
    
    decoded_parts = decode_header(header_value)
    result = []
    for part, encoding in decoded_parts:
        if isinstance(part, bytes):
            try:
                result.append(part.decode(encoding or 'utf-8', errors='replace'))
            except (UnicodeDecodeError, LookupError):
                result.append(part.decode('utf-8', errors='replace'))
        else:
            result.append(part)
    return ''.join(result)


def get_email_body(message):
    """Extract plain text and HTML body from email message"""
    plain_body = ''
    html_body = ''
    
    if message.is_multipart():
        for part in message.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get('Content-Disposition', ''))
            
            # Skip attachments
            if 'attachment' in content_disposition:
                continue
            
            try:
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or 'utf-8'
                    text = payload.decode(charset, errors='replace')
                    
                    if content_type == 'text/plain':
                        plain_body = text
                    elif content_type == 'text/html':
                        html_body = text
            except Exception:
                pass
    else:
        content_type = message.get_content_type()
        try:
            payload = message.get_payload(decode=True)
            if payload:
                charset = message.get_content_charset() or 'utf-8'
                text = payload.decode(charset, errors='replace')
                
                if content_type == 'text/plain':
                    plain_body = text
                elif content_type == 'text/html':
                    html_body = text
        except Exception:
            pass
    
    return plain_body, html_body


class CustomIMAPReader:
    """Read emails from a custom IMAP mailbox"""
    
    def __init__(self, mailbox):
        """
        Initialize with CustomIMAPMailbox instance.
        
        Args:
            mailbox: CustomIMAPMailbox model instance
        """
        self.mailbox = mailbox
        self.connection = None
    
    def connect(self):
        """Connect to IMAP server"""
        try:
            if self.mailbox.imap_use_ssl:
                context = ssl.create_default_context()
                self.connection = imaplib.IMAP4_SSL(
                    self.mailbox.imap_host,
                    self.mailbox.imap_port,
                    ssl_context=context
                )
            else:
                self.connection = imaplib.IMAP4(
                    self.mailbox.imap_host,
                    self.mailbox.imap_port
                )
            
            self.connection.login(self.mailbox.username, self.mailbox.password)
            return True
        except Exception as e:
            logger.error(f"Failed to connect to IMAP: {str(e)}")
            return False
    
    def disconnect(self):
        """Disconnect from IMAP server"""
        if self.connection:
            try:
                self.connection.logout()
            except Exception:
                pass
            self.connection = None
    
    def fetch_unread_emails(self, limit=50):
        """Fetch unread emails from the mailbox"""
        emails = []
        
        if not self.connection:
            return emails
        
        try:
            # Select folder
            status, _ = self.connection.select(self.mailbox.folder_to_watch)
            if status != 'OK':
                logger.error(f"Failed to select folder: {self.mailbox.folder_to_watch}")
                return emails
            
            # Search for unread emails
            status, message_numbers = self.connection.search(None, 'UNSEEN')
            if status != 'OK':
                return emails
            
            message_ids = message_numbers[0].split()
            
            # Limit results
            if limit and len(message_ids) > limit:
                message_ids = message_ids[-limit:]  # Get most recent
            
            for num in message_ids:
                try:
                    status, msg_data = self.connection.fetch(num, '(RFC822)')
                    if status != 'OK':
                        continue
                    
                    raw_email = msg_data[0][1]
                    msg = email.message_from_bytes(raw_email)
                    
                    # Parse headers
                    message_id = msg.get('Message-ID', '')
                    subject = decode_email_header(msg.get('Subject', ''))
                    from_header = msg.get('From', '')
                    from_name, from_email_addr = parseaddr(from_header)
                    from_name = decode_email_header(from_name) or from_email_addr.split('@')[0]
                    
                    # Parse date
                    date_str = msg.get('Date', '')
                    try:
                        received_at = parsedate_to_datetime(date_str)
                    except Exception:
                        received_at = timezone.now()
                    
                    # Get body
                    plain_body, html_body = get_email_body(msg)
                    
                    # Get references for threading
                    references = msg.get('References', '')
                    in_reply_to = msg.get('In-Reply-To', '')
                    
                    emails.append({
                        'uid': num.decode() if isinstance(num, bytes) else str(num),
                        'message_id': message_id,
                        'subject': subject,
                        'from_email': from_email_addr.lower(),
                        'from_name': from_name,
                        'plain_body': plain_body,
                        'html_body': html_body,
                        'received_at': received_at,
                        'references': references,
                        'in_reply_to': in_reply_to,
                    })
                    
                except Exception as e:
                    logger.error(f"Error fetching email {num}: {str(e)}")
                    continue
            
        except Exception as e:
            logger.error(f"Error fetching emails: {str(e)}")
        
        return emails
    
    def mark_as_read(self, uid):
        """Mark email as read"""
        if not self.connection:
            return False
        
        try:
            self.connection.store(uid.encode() if isinstance(uid, str) else uid, '+FLAGS', '\\Seen')
            return True
        except Exception as e:
            logger.error(f"Error marking email as read: {str(e)}")
            return False


def group_emails_into_threads(emails):
    """
    Group emails into conversation threads based on subject and references.
    
    Returns list of thread lists, where each thread is a list of related emails
    sorted by date (oldest first).
    """
    threads = {}
    
    for email_data in emails:
        # Normalize subject for threading
        subject = email_data.get('subject', '')
        normalized_subject = subject.lower()
        for prefix in ['re:', 'fwd:', 'fw:']:
            normalized_subject = normalized_subject.replace(prefix, '')
        normalized_subject = normalized_subject.strip()
        
        # Use subject as thread key
        thread_key = normalized_subject
        
        if thread_key not in threads:
            threads[thread_key] = []
        threads[thread_key].append(email_data)
    
    # Sort emails within each thread by date
    result = []
    for thread_emails in threads.values():
        sorted_thread = sorted(
            thread_emails,
            key=lambda x: x.get('received_at') or timezone.now()
        )
        result.append(sorted_thread)
    
    return result


class Command(BaseCommand):
    help = 'Process custom IMAP emails and create tickets for all tenants with connected mailboxes'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be processed without creating tickets',
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
            help='Only process emails for a specific tenant schema',
        )
        parser.add_argument(
            '--mailbox',
            type=str,
            help='Only process emails for a specific mailbox email address',
        )
        parser.add_argument(
            '--reprocess',
            action='store_true',
            help='Reprocess all emails (ignore already processed check)',
        )
    
    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        limit = options.get('limit', 50)
        tenant_filter = options.get('tenant')
        mailbox_filter = options.get('mailbox')
        reprocess = options.get('reprocess', False)
        
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write('  CUSTOM IMAP EMAIL TO TICKET - Process Emails')
        self.stdout.write('=' * 60 + '\n')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('  [DRY RUN MODE - No tickets will be created]\n'))
        
        # Get all tenants
        Client = get_tenant_model()
        tenants = Client.objects.exclude(schema_name='public')
        
        if tenant_filter:
            tenants = tenants.filter(schema_name=tenant_filter)
        
        total_tickets = 0
        total_comments = 0
        
        for tenant in tenants:
            self.stdout.write(f'\nProcessing tenant: {tenant.name} ({tenant.schema_name})')
            self.stdout.write('-' * 50)
            
            with schema_context(tenant.schema_name):
                from modules.email_to_ticket.models import CustomIMAPMailbox
                
                # Get active mailboxes for this tenant
                mailboxes = CustomIMAPMailbox.objects.filter(is_active=True)
                
                if mailbox_filter:
                    mailboxes = mailboxes.filter(email_address=mailbox_filter)
                
                if not mailboxes.exists():
                    self.stdout.write(self.style.WARNING('  No active custom IMAP mailboxes found'))
                    continue
                
                for mailbox in mailboxes:
                    self.stdout.write(f'\n  Mailbox: {mailbox.email_address}')
                    
                    tickets, comments = self.process_mailbox(
                        mailbox, tenant, dry_run, limit, reprocess
                    )
                    total_tickets += tickets
                    total_comments += comments
                    
                    # Update last sync time
                    if not dry_run:
                        mailbox.update_last_sync()
        
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write('  PROCESSING COMPLETE')
        self.stdout.write('=' * 60)
        self.stdout.write(f'  Tickets created: {total_tickets}')
        self.stdout.write(f'  Comments added: {total_comments}')
        self.stdout.write('=' * 51 + '\n')
    
    def process_mailbox(self, mailbox, tenant, dry_run, limit, reprocess):
        """Process emails from a single mailbox"""
        from modules.email_to_ticket.models import ProcessedEmail
        from modules.ticket.models import Ticket, TicketComment
        
        tickets_created = 0
        comments_added = 0
        
        # Connect to mailbox
        reader = CustomIMAPReader(mailbox)
        if not reader.connect():
            self.stdout.write(self.style.ERROR(f'    ✗ Failed to connect to mailbox'))
            return 0, 0
        
        self.stdout.write(self.style.SUCCESS(f'    ✓ Connected to mailbox'))
        
        try:
            # Fetch unread emails
            emails = reader.fetch_unread_emails(limit=limit)
            
            if not emails:
                self.stdout.write('    No unread emails found')
                return 0, 0
            
            self.stdout.write(f'    Found {len(emails)} unread email(s)')
            
            # Filter out already processed emails
            if not reprocess:
                unprocessed = []
                for e in emails:
                    message_id = e.get('message_id', '')
                    with schema_context('public'):
                        if message_id and ProcessedEmail.objects.filter(message_id=message_id).exists():
                            continue
                    unprocessed.append(e)
                emails = unprocessed
                
                if not emails:
                    self.stdout.write('    All emails already processed')
                    return 0, 0
            
            # Group into threads
            threads = group_emails_into_threads(emails)
            self.stdout.write(f'    Grouped into {len(threads)} conversation thread(s)')
            
            # Get tenant Client object for ProcessedEmail
            Client = get_tenant_model()
            with schema_context('public'):
                tenant_client = Client.objects.get(schema_name=tenant.schema_name)
            
            # Process each thread
            for thread_emails in threads:
                t, c = self.process_thread(
                    thread_emails, mailbox, tenant, tenant_client, reader, dry_run
                )
                tickets_created += t
                comments_added += c
                
        finally:
            reader.disconnect()
        
        return tickets_created, comments_added
    
    def process_thread(self, emails, mailbox, tenant, tenant_client, reader, dry_run):
        """Process a single email thread - creates ticket from first email, comments from replies"""
        from modules.email_to_ticket.models import ProcessedEmail
        from modules.ticket.models import Ticket, TicketComment
        
        tickets_created = 0
        comments_added = 0
        
        if not emails:
            return 0, 0
        
        first_email = emails[0]
        subject = first_email.get('subject', 'No Subject')
        from_email = first_email.get('from_email', '')
        from_name = first_email.get('from_name', '')
        body = first_email.get('plain_body', '') or first_email.get('html_body', '')
        message_id = first_email.get('message_id', '')
        uid = first_email.get('uid', '')
        
        # Skip if no valid sender
        if not from_email:
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
                message_id=message_id or f"imap-{uid}-{ticket.ticket_number}",
                tenant=tenant_client,
                from_address=from_email,
                to_address=mailbox.email_address,
                subject=subject,
                received_at=first_email.get('received_at'),
                ticket_created=True,
                ticket_number=ticket.ticket_number,
            )
        
        # Mark as read if configured
        if mailbox.mark_as_read and uid:
            if reader.mark_as_read(uid):
                self.stdout.write('        ✓ Marked as read')
        
        # Process replies as comments
        for reply_email in emails[1:]:
            reply_message_id = reply_email.get('message_id', '')
            reply_uid = reply_email.get('uid', '')
            
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
                comment_message = f"**From:** {reply_from_name} <{reply_from_email}>\n\n{reply_body}"
            
            TicketComment.objects.create(
                ticket=ticket,
                author=reply_author,
                message=comment_message,
                is_internal=False,
            )
            
            comments_added += 1
            self.stdout.write(f'        ✓ Added comment from {reply_from_email}')
            
            # Record processed
            with schema_context('public'):
                ProcessedEmail.objects.create(
                    message_id=reply_message_id or f"imap-reply-{reply_uid}-{ticket.ticket_number}",
                    tenant=tenant_client,
                    from_address=reply_from_email,
                    to_address=mailbox.email_address,
                    subject=reply_subject,
                    received_at=reply_email.get('received_at'),
                    ticket_created=False,
                    ticket_number=ticket.ticket_number,
                )
            
            # Mark reply as read
            if mailbox.mark_as_read and reply_uid:
                reader.mark_as_read(reply_uid)
        
        return tickets_created, comments_added
