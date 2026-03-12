"""
Custom IMAP/SMTP integration views (Email-to-Ticket)
"""
import json
import logging

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect

logger = logging.getLogger(__name__)


@login_required
def custom_imap_connect(request):
    """Connect a custom IMAP mailbox"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'POST required'}, status=405)
    
    try:
        from modules.email_to_ticket.models import CustomIMAPMailbox
        
        # Parse JSON body
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            data = request.POST
        
        email = data.get('email', '')
        password = data.get('password', '')
        imap_host = data.get('imap_host', '')
        imap_port = int(data.get('imap_port', 993))
        enable_smtp = data.get('enable_smtp', False)
        smtp_host = data.get('smtp_host', '')
        smtp_port = int(data.get('smtp_port', 587))
        use_ssl = data.get('use_ssl', True)
        
        # IMAP is required, SMTP is optional
        if not all([email, password, imap_host]):
            return JsonResponse({'success': False, 'error': 'Email, password, and IMAP host are required'})
        
        # If SMTP is enabled, validate SMTP fields
        if enable_smtp and not smtp_host:
            return JsonResponse({'success': False, 'error': 'SMTP host is required when outgoing email is enabled'})
        
        # Test IMAP connection first
        import imaplib
        import ssl
        
        try:
            if use_ssl:
                context = ssl.create_default_context()
                mail = imaplib.IMAP4_SSL(imap_host, imap_port, ssl_context=context)
            else:
                mail = imaplib.IMAP4(imap_host, imap_port)
            
            mail.login(email, password)
            mail.select('INBOX')
            mail.logout()
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'IMAP connection failed: {str(e)}'})
        
        # Create or update mailbox
        mailbox, created = CustomIMAPMailbox.objects.update_or_create(
            email_address=email,
            defaults={
                'display_name': email.split('@')[0],
                'imap_host': imap_host,
                'imap_port': imap_port,
                'imap_use_ssl': use_ssl,
                'enable_smtp': enable_smtp,
                'smtp_host': smtp_host if enable_smtp else '',
                'smtp_port': smtp_port,
                'smtp_use_tls': smtp_port == 587 and enable_smtp,
                'smtp_use_ssl': smtp_port == 465 and enable_smtp,
                'username': email,
                'password': password,
                'is_active': True,
            }
        )
        
        action = 'connected' if created else 'updated'
        logger.info(f"Custom IMAP mailbox {action}: {email}")
        
        return JsonResponse({
            'success': True,
            'message': f'Mailbox {action} successfully',
            'mailbox_id': mailbox.id,
        })
        
    except Exception as e:
        logger.error(f"Error connecting custom IMAP mailbox: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
def custom_imap_configure(request):
    """Configure custom IMAP mailbox settings"""
    if request.method != 'POST':
        return redirect('/settings/integrations/email/imap/')
    
    try:
        from modules.email_to_ticket.models import CustomIMAPMailbox
        
        # Parse request data
        auto_create_tickets = request.POST.get('auto_create_tickets', 'true') == 'true'
        auto_reply = request.POST.get('auto_reply', 'false') == 'true'
        default_priority = request.POST.get('default_priority', 'normal')
        folder_to_watch = request.POST.get('folder_to_watch', 'INBOX')
        
        # Update all active mailboxes with these settings
        mailboxes = CustomIMAPMailbox.objects.filter(is_active=True)
        updated_count = mailboxes.update(
            auto_create_tickets=auto_create_tickets,
            auto_reply=auto_reply,
            default_priority=default_priority,
            folder_to_watch=folder_to_watch,
        )
        
        logger.info(f"Updated {updated_count} custom IMAP mailbox(es) with new configuration")
        
        return redirect('/settings/integrations/email/imap/')
        
    except Exception as e:
        logger.error(f"Error configuring custom IMAP mailbox: {str(e)}")
        return redirect('/settings/integrations/email/imap/?error=configuration_failed')


@login_required
def custom_imap_disconnect(request):
    """Disconnect a custom IMAP mailbox"""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST required'}, status=405)
    
    try:
        from modules.email_to_ticket.models import CustomIMAPMailbox
        
        # Parse JSON body
        try:
            data = json.loads(request.body)
            mailbox_id = data.get('mailbox_id')
        except json.JSONDecodeError:
            mailbox_id = request.POST.get('mailbox_id')
        
        if not mailbox_id:
            return JsonResponse({'status': 'error', 'message': 'mailbox_id required'}, status=400)
        
        mailbox = CustomIMAPMailbox.objects.filter(id=mailbox_id).first()
        if not mailbox:
            return JsonResponse({'status': 'error', 'message': 'Mailbox not found'}, status=404)
        
        email = mailbox.email_address
        mailbox.delete()
        
        return JsonResponse({
            'status': 'success',
            'message': f'Mailbox {email} disconnected'
        })
    except Exception as e:
        logger.error(f"Error disconnecting custom IMAP mailbox: {str(e)}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@login_required
def custom_imap_test(request):
    """Test custom IMAP mail connection"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'POST required'}, status=405)
    
    try:
        from modules.email_to_ticket.models import CustomIMAPMailbox
        
        # Get first active mailbox
        mailbox = CustomIMAPMailbox.objects.filter(is_active=True).first()
        if not mailbox:
            return JsonResponse({'success': False, 'error': 'No connected mailbox found'})
        
        # Test connection
        success, message = mailbox.test_connection()
        
        if success:
            return JsonResponse({
                'success': True,
                'message': f'Connection successful to {mailbox.email_address}'
            })
        else:
            return JsonResponse({'success': False, 'error': message})
        
    except Exception as e:
        logger.error(f"Error testing custom IMAP connection: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)})


@login_required
def custom_imap_list_mailboxes(request):
    """List connected custom IMAP mailboxes"""
    try:
        from modules.email_to_ticket.models import CustomIMAPMailbox
        
        mailboxes = CustomIMAPMailbox.objects.all().order_by('-created_at')
        
        mailboxes_data = []
        for mb in mailboxes:
            mailboxes_data.append({
                'id': mb.id,
                'email_address': mb.email_address,
                'display_name': mb.display_name,
                'imap_host': mb.imap_host,
                'smtp_host': mb.smtp_host,
                'is_active': mb.is_active,
                'auto_create_tickets': mb.auto_create_tickets,
                'folder_to_watch': mb.folder_to_watch,
                'last_sync_at': mb.last_sync_at.isoformat() if mb.last_sync_at else None,
                'created_at': mb.created_at.isoformat() if mb.created_at else None,
            })
        
        return JsonResponse({
            'status': 'success',
            'mailboxes': mailboxes_data,
            'count': len(mailboxes_data),
        })
    except Exception as e:
        logger.error(f"Error listing custom IMAP mailboxes: {str(e)}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
