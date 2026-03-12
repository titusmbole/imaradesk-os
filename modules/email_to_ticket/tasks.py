"""
Celery tasks for email-to-ticket processing.

These tasks handle:
- Periodic email polling from IMAP server
- Processing emails into tickets (with threading for multiple tenants)
- Batch processing for high-volume scenarios
"""
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from celery import shared_task
from django.conf import settings
from shared.utilities.tenant_compat import schema_context
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

# Lock to prevent concurrent email processing
_processing_lock = False


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def process_tenant_emails(self):
    """
    Main task to process emails for all tenants.
    
    This task:
    1. Connects to IMAP server
    2. Finds tenant folders
    3. Processes unread emails in batches using threading
    4. Creates tickets and comments
    """
    global _processing_lock
    
    # Prevent concurrent processing
    if _processing_lock:
        logger.info("Email processing already in progress, skipping...")
        return {'status': 'skipped', 'reason': 'already_processing'}
    
    _processing_lock = True
    
    try:
        from modules.email_to_ticket.utils import EmailReader, route_emails_to_tenants, group_emails_into_threads
        from modules.email_to_ticket.models import ProcessedEmail
        from shared.models import Client
        
        # Check settings
        if not getattr(settings, 'EMAIL_HELP_HOST', None):
            logger.warning("EMAIL_HELP_HOST not configured")
            return {'status': 'error', 'reason': 'not_configured'}
        
        results = {
            'status': 'completed',
            'tenants_processed': 0,
            'tickets_created': 0,
            'comments_added': 0,
            'errors': []
        }
        
        with EmailReader() as reader:
            if not reader.connection:
                logger.error("Failed to connect to IMAP server")
                return {'status': 'error', 'reason': 'connection_failed'}
            
            # Get existing tenants
            existing_tenants = list(Client.objects.exclude(
                schema_name='public'
            ).values_list('schema_name', flat=True))
            
            if not existing_tenants:
                return {'status': 'completed', 'reason': 'no_tenants'}
            
            # Get tenant folders
            tenant_folders = reader.get_tenant_folders(existing_tenants)
            if not tenant_folders:
                return {'status': 'completed', 'reason': 'no_tenant_folders'}
            
            logger.info(f"Processing email folders: {tenant_folders}")
            
            # Fetch unread emails from all tenant folders
            all_emails = []
            for folder in tenant_folders:
                emails = reader.fetch_unread_emails(folder=folder, limit=100)
                if emails:
                    for e in emails:
                        e['_folder'] = folder
                    all_emails.extend(emails)
            
            if not all_emails:
                return {'status': 'completed', 'emails_found': 0}
            
            logger.info(f"Found {len(all_emails)} unread emails")
            
            # Route emails to tenants
            routed = route_emails_to_tenants(all_emails)
            
            # Process each tenant's emails using threading for parallelism
            tenant_tasks = []
            for tenant_schema, tenant_emails in routed.items():
                if tenant_schema == '_unrouted':
                    continue
                tenant_tasks.append((tenant_schema, tenant_emails))
            
            # Use ThreadPoolExecutor for parallel tenant processing
            max_workers = min(len(tenant_tasks), getattr(settings, 'EMAIL_PROCESSING_THREADS', 4))
            
            if max_workers > 1 and len(tenant_tasks) > 1:
                # Parallel processing for multiple tenants
                with ThreadPoolExecutor(max_workers=max_workers) as executor:
                    futures = {
                        executor.submit(
                            process_tenant_batch,
                            tenant_schema,
                            tenant_emails,
                            reader
                        ): tenant_schema
                        for tenant_schema, tenant_emails in tenant_tasks
                    }
                    
                    for future in as_completed(futures):
                        tenant_schema = futures[future]
                        try:
                            result = future.result()
                            results['tenants_processed'] += 1
                            results['tickets_created'] += result.get('tickets_created', 0)
                            results['comments_added'] += result.get('comments_added', 0)
                            if result.get('errors'):
                                results['errors'].extend(result['errors'])
                        except Exception as e:
                            logger.error(f"Error processing tenant {tenant_schema}: {e}")
                            results['errors'].append(f"{tenant_schema}: {str(e)}")
            else:
                # Sequential processing for single tenant or when threading disabled
                for tenant_schema, tenant_emails in tenant_tasks:
                    try:
                        result = process_tenant_batch(tenant_schema, tenant_emails, reader)
                        results['tenants_processed'] += 1
                        results['tickets_created'] += result.get('tickets_created', 0)
                        results['comments_added'] += result.get('comments_added', 0)
                        if result.get('errors'):
                            results['errors'].extend(result['errors'])
                    except Exception as e:
                        logger.error(f"Error processing tenant {tenant_schema}: {e}")
                        results['errors'].append(f"{tenant_schema}: {str(e)}")
        
        logger.info(f"Email processing completed: {results}")
        return results
        
    except Exception as e:
        logger.exception(f"Email processing failed: {e}")
        raise self.retry(exc=e)
    finally:
        _processing_lock = False


def process_tenant_batch(tenant_schema: str, emails: list, reader) -> dict:
    """
    Process a batch of emails for a single tenant.
    
    Args:
        tenant_schema: The tenant's schema name
        emails: List of email dictionaries
        reader: EmailReader instance for marking emails as read
    
    Returns:
        dict with tickets_created, comments_added, errors
    """
    from modules.email_to_ticket.utils import group_emails_into_threads
    from modules.email_to_ticket.models import ProcessedEmail
    from modules.ticket.models import Ticket, TicketComment
    from shared.models import Client
    
    User = get_user_model()
    
    result = {
        'tickets_created': 0,
        'comments_added': 0,
        'errors': []
    }
    
    # Verify tenant exists
    try:
        tenant = Client.objects.get(schema_name=tenant_schema)
    except Client.DoesNotExist:
        result['errors'].append(f"Tenant not found: {tenant_schema}")
        return result
    
    # Group emails into threads
    threads = group_emails_into_threads(emails)
    
    for thread in threads:
        thread_emails = thread['emails']
        if not thread_emails:
            continue
        
        first_email = thread_emails[0]
        subject = first_email.get('subject', '').strip() or '(No Subject)'
        from_email = first_email.get('from_email', '')
        from_name = first_email.get('from_name', '')
        body = first_email.get('plain_body', '') or first_email.get('html_body', '')
        message_id = first_email.get('message_id', '')
        
        # Check if already processed
        if message_id and ProcessedEmail.objects.filter(message_id=message_id).exists():
            continue
        
        try:
            with schema_context(tenant_schema):
                # Find or create requester
                requester = None
                try:
                    requester = User.objects.filter(email__iexact=from_email).first()
                except Exception:
                    pass
                
                # Create ticket
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
                
                result['tickets_created'] += 1
                logger.info(f"Created ticket {ticket.ticket_number} for {tenant_schema}")
                
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
                
                # Mark as read
                folder = first_email.get('_folder')
                if first_email.get('uid'):
                    reader.mark_as_seen(first_email['uid'], folder)
                
                # Process replies as comments
                for reply_email in thread_emails[1:]:
                    reply_message_id = reply_email.get('message_id', '')
                    
                    if reply_message_id and ProcessedEmail.objects.filter(message_id=reply_message_id).exists():
                        continue
                    
                    reply_from_email = reply_email.get('from_email', '')
                    reply_from_name = reply_email.get('from_name', '')
                    reply_body = reply_email.get('plain_body', '') or reply_email.get('html_body', '')
                    reply_subject = reply_email.get('subject', '')
                    
                    reply_author = None
                    try:
                        reply_author = User.objects.filter(email__iexact=reply_from_email).first()
                    except Exception:
                        pass
                    
                    comment_message = reply_body
                    if not reply_author:
                        comment_message = f"**From:** {reply_from_name} <{reply_from_email}>\n\n{reply_body}"
                    
                    TicketComment.objects.create(
                        ticket=ticket,
                        author=reply_author,
                        message=comment_message,
                        is_internal=False,
                    )
                    
                    result['comments_added'] += 1
                    
                    # Record processed
                    ProcessedEmail.objects.create(
                        message_id=reply_message_id or f"reply-{ticket.ticket_number}-{result['comments_added']}",
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
                        
        except Exception as e:
            logger.error(f"Error creating ticket from email: {e}")
            result['errors'].append(f"Email '{subject[:30]}...': {str(e)}")
    
    return result


@shared_task(bind=True)
def process_single_tenant_emails(self, tenant_schema: str):
    """
    Process emails for a single tenant.
    Useful for on-demand processing or retry scenarios.
    """
    from modules.email_to_ticket.utils import EmailReader
    from shared.models import Client
    
    try:
        tenant = Client.objects.get(schema_name=tenant_schema)
    except Client.DoesNotExist:
        return {'status': 'error', 'reason': f'Tenant not found: {tenant_schema}'}
    
    with EmailReader() as reader:
        if not reader.connection:
            return {'status': 'error', 'reason': 'connection_failed'}
        
        # Get emails for this tenant's folder
        emails = reader.fetch_unread_emails(folder=tenant_schema, limit=100)
        if not emails:
            return {'status': 'completed', 'emails_found': 0}
        
        for e in emails:
            e['_folder'] = tenant_schema
        
        result = process_tenant_batch(tenant_schema, emails, reader)
        return {
            'status': 'completed',
            **result
        }


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_outlook_emails_task(self):
    """
    Celery task to process Outlook emails for all tenants with connected mailboxes.
    
    This task:
    1. Iterates through all tenants
    2. Finds connected Outlook mailboxes
    3. Fetches unread emails via Microsoft Graph API
    4. Creates tickets from email threads
    """
    from django.core.management import call_command
    from io import StringIO
    
    logger.info("Starting Outlook email processing task...")
    
    try:
        # Capture output from management command
        out = StringIO()
        call_command('process_outlook_emails', stdout=out)
        output = out.getvalue()
        
        # Parse results from output
        tickets_created = 0
        comments_added = 0
        
        for line in output.split('\n'):
            if 'Tickets created:' in line:
                try:
                    tickets_created = int(line.split(':')[1].strip())
                except (ValueError, IndexError):
                    pass
            elif 'Comments added:' in line:
                try:
                    comments_added = int(line.split(':')[1].strip())
                except (ValueError, IndexError):
                    pass
        
        logger.info(f"Outlook email processing complete: {tickets_created} tickets, {comments_added} comments")
        
        return {
            'status': 'completed',
            'tickets_created': tickets_created,
            'comments_added': comments_added,
        }
        
    except Exception as e:
        logger.error(f"Error in Outlook email processing task: {str(e)}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_custom_imap_emails_task(self):
    """
    Celery task to process Custom IMAP emails for all tenants with connected mailboxes.
    
    This task:
    1. Iterates through all tenants
    2. Finds connected Custom IMAP mailboxes
    3. Fetches unread emails via IMAP
    4. Creates tickets from email threads
    """
    from django.core.management import call_command
    from io import StringIO
    
    logger.info("Starting Custom IMAP email processing task...")
    
    try:
        # Capture output from management command
        out = StringIO()
        call_command('process_custom_emails', stdout=out)
        output = out.getvalue()
        
        # Parse results from output
        tickets_created = 0
        comments_added = 0
        
        for line in output.split('\n'):
            if 'Tickets created:' in line:
                try:
                    tickets_created = int(line.split(':')[1].strip())
                except (ValueError, IndexError):
                    pass
            elif 'Comments added:' in line:
                try:
                    comments_added = int(line.split(':')[1].strip())
                except (ValueError, IndexError):
                    pass
        
        logger.info(f"Custom IMAP email processing complete: {tickets_created} tickets, {comments_added} comments")
        
        return {
            'status': 'completed',
            'tickets_created': tickets_created,
            'comments_added': comments_added,
        }
        
    except Exception as e:
        logger.error(f"Error in Custom IMAP email processing task: {str(e)}")
        raise self.retry(exc=e)
