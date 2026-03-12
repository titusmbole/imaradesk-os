"""
Outlook Mail integration views (Email-to-Ticket)
"""
import json
import base64
import logging
import requests
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils import timezone

from .teams import get_microsoft_user_info

logger = logging.getLogger(__name__)


@login_required
def outlook_mail_oauth_config(request):
    """Get Outlook Mail OAuth configuration for frontend"""
    try:
        current_host = request.get_host()
        current_protocol = 'https' if request.is_secure() else 'http'

        subdomain = None
        host_parts = current_host.split('.')
        if len(host_parts) > 2 or (len(host_parts) > 1 and 'localhost' in current_host):
            subdomain = host_parts[0]

        state_data = {
            'return_url': '/settings/integrations/outlook-mail/',
            'subdomain': subdomain,
            'schema': 'default',
            'host': current_host,
            'protocol': current_protocol,
            'integration_type': 'outlook_mail',
        }

        state_json = json.dumps(state_data)
        state_encoded = base64.urlsafe_b64encode(state_json.encode()).decode()

        auth_base_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'

        config = {
            'client_id': settings.TEAMS_CLIENT_ID,
            'scopes': settings.OUTLOOK_OAUTH_SCOPES,
            'redirect_uri': settings.OUTLOOK_REDIRECT_URI or settings.TEAMS_REDIRECT_URI,
            'state': state_encoded,
            'auth_url': auth_base_url,
        }

        return JsonResponse({
            'status': 'success',
            'config': config
        })
    except Exception as e:
        logger.error(f"Error getting Outlook Mail OAuth config: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@login_required
def outlook_mail_oauth_connect(request):
    """Initiate Outlook Mail OAuth flow for connecting a mailbox"""
    try:
        from urllib.parse import urlencode
        
        current_host = request.get_host()
        current_protocol = 'https' if request.is_secure() else 'http'

        subdomain = None
        host_parts = current_host.split('.')
        if len(host_parts) > 2 or (len(host_parts) > 1 and 'localhost' in current_host):
            subdomain = host_parts[0]

        state_data = {
            'return_url': '/settings/integrations/outlook-mail/',
            'subdomain': subdomain,
            'schema': 'default',
            'host': current_host,
            'protocol': current_protocol,
            'integration_type': 'outlook_mail',
        }
        state_json = json.dumps(state_data)
        state_encoded = base64.urlsafe_b64encode(state_json.encode()).decode()

        if not settings.TEAMS_CLIENT_ID:
            logger.error("TEAMS_APPLICATION_ID environment variable is not set")
            return redirect('/settings/integrations/?outlook_error=missing_client_id')

        auth_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
        params = {
            'client_id': settings.TEAMS_CLIENT_ID,
            'response_type': 'code',
            'redirect_uri': settings.OUTLOOK_REDIRECT_URI or settings.TEAMS_REDIRECT_URI,
            'response_mode': 'query',
            'scope': ' '.join(settings.OUTLOOK_OAUTH_SCOPES),
            'state': state_encoded,
            'prompt': 'consent',
        }

        full_auth_url = f"{auth_url}?{urlencode(params)}"
        return redirect(full_auth_url)

    except Exception as e:
        logger.error(f"Error initiating Outlook Mail OAuth: {str(e)}")
        return redirect('/settings/integrations/?outlook_error=oauth_init_failed')


def outlook_mail_oauth_callback(request):
    """Handle Microsoft Outlook Mail OAuth callback"""
    try:
        host = request.get_host()
        protocol = 'https' if request.is_secure() else 'http'
        tenant_schema = 'default'

        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')
        error_description = request.GET.get('error_description')

        redirect_host = host
        redirect_protocol = protocol
        target_schema = tenant_schema

        if state:
            try:
                decoded_bytes = base64.urlsafe_b64decode(state)
                state_data = json.loads(decoded_bytes.decode('utf-8'))

                if 'host' in state_data:
                    redirect_host = state_data['host']
                if 'protocol' in state_data:
                    redirect_protocol = state_data['protocol']
                if 'schema' in state_data:
                    target_schema = state_data['schema']
            except Exception as e:
                logger.warning(f"Failed to parse state: {str(e)}")

        if error:
            logger.error(f"Outlook Mail OAuth error: {error} - {error_description}")
            redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/?outlook_error={error}"
            return redirect(redirect_url)

        if not code:
            logger.error("No authorization code received from Microsoft")
            redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/?outlook_error=no_code"
            return redirect(redirect_url)

        # Exchange code for tokens
        token_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        token_data = {
            'client_id': settings.TEAMS_CLIENT_ID,
            'client_secret': settings.TEAMS_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.OUTLOOK_REDIRECT_URI or settings.TEAMS_REDIRECT_URI,
            'grant_type': 'authorization_code',
            'scope': ' '.join(settings.OUTLOOK_OAUTH_SCOPES),
        }

        response = requests.post(token_url, data=token_data)
        token_response = response.json()

        if 'error' in token_response:
            logger.error(f"Token exchange failed: {token_response}")
            redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/?outlook_error=token_exchange_failed"
            return redirect(redirect_url)

        access_token = token_response.get('access_token')
        refresh_token = token_response.get('refresh_token')
        expires_in = token_response.get('expires_in', 3600)
        scope = token_response.get('scope', '')

        # Get user/mailbox info from Microsoft Graph
        user_info = get_microsoft_user_info(access_token)
        token_expires_at = timezone.now() + timedelta(seconds=expires_in)

        # Save the mailbox connection
        try:
            from shared.utilities.tenant_compat import schema_context
            from modules.email_to_ticket.models import OutlookMailbox

            with schema_context(target_schema):
                # Get or create mailbox
                mailbox, created = OutlookMailbox.objects.update_or_create(
                    email_address=user_info.get('email', ''),
                    defaults={
                        'display_name': user_info.get('display_name', ''),
                        'mailbox_id': user_info.get('id', ''),
                        'access_token': access_token,
                        'refresh_token': refresh_token,
                        'token_expires_at': token_expires_at,
                        'scope': scope,
                        'azure_tenant_id': user_info.get('tenant_id', ''),
                        'is_active': True,
                    }
                )
                
                action = 'connected' if created else 'updated'
                logger.info(f"Outlook mailbox {action}: {mailbox.email_address}")
                
        except Exception as save_error:
            logger.error(f"Failed to save OutlookMailbox: {str(save_error)}")
            redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/?outlook_error=save_failed"
            return redirect(redirect_url)

        redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/email/outlook/?connected=true"
        return redirect(redirect_url)

    except Exception as e:
        logger.error(f"Exception during Outlook Mail OAuth callback: {str(e)}", exc_info=True)
        return redirect('/settings/integrations/?outlook_error=unexpected')


@login_required
def outlook_mail_disconnect(request):
    """Disconnect an Outlook mailbox"""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST required'}, status=405)
    
    try:
        from modules.email_to_ticket.models import OutlookMailbox
        
        # Parse JSON body
        try:
            data = json.loads(request.body)
            mailbox_id = data.get('mailbox_id')
        except json.JSONDecodeError:
            mailbox_id = request.POST.get('mailbox_id')
        
        if not mailbox_id:
            return JsonResponse({'status': 'error', 'message': 'mailbox_id required'}, status=400)
        
        mailbox = OutlookMailbox.objects.filter(id=mailbox_id).first()
        if not mailbox:
            return JsonResponse({'status': 'error', 'message': 'Mailbox not found'}, status=404)
        
        email = mailbox.email_address
        mailbox.delete()
        
        return JsonResponse({
            'status': 'success',
            'message': f'Mailbox {email} disconnected'
        })
    except Exception as e:
        logger.error(f"Error disconnecting Outlook mailbox: {str(e)}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@login_required
def outlook_mail_configure(request):
    """Configure Outlook mailbox settings"""
    if request.method != 'POST':
        return redirect('/settings/integrations/email/outlook/')
    
    try:
        from modules.email_to_ticket.models import OutlookMailbox
        
        # Parse request data (Inertia sends form data)
        auto_create_tickets = request.POST.get('auto_create_tickets', 'true') == 'true'
        auto_reply = request.POST.get('auto_reply', 'true') == 'true'
        default_priority = request.POST.get('default_priority', 'normal')
        check_interval = request.POST.get('check_interval', '5')
        
        # Update all active mailboxes with these settings
        mailboxes = OutlookMailbox.objects.filter(is_active=True)
        updated_count = mailboxes.update(
            auto_create_tickets=auto_create_tickets,
            default_priority=default_priority,
        )
        
        logger.info(f"Updated {updated_count} Outlook mailbox(es) with new configuration")
        
        return redirect('/settings/integrations/email/outlook/')
        
    except Exception as e:
        logger.error(f"Error configuring Outlook mailbox: {str(e)}")
        return redirect('/settings/integrations/email/outlook/?error=configuration_failed')


@login_required
def outlook_mail_list_mailboxes(request):
    """List connected Outlook mailboxes for the current tenant"""
    try:
        from modules.email_to_ticket.models import OutlookMailbox
        
        mailboxes = OutlookMailbox.objects.all().order_by('-created_at')
        
        mailboxes_data = []
        for mb in mailboxes:
            mailboxes_data.append({
                'id': mb.id,
                'email_address': mb.email_address,
                'display_name': mb.display_name,
                'is_active': mb.is_active,
                'auto_create_tickets': mb.auto_create_tickets,
                'folder_to_watch': mb.folder_to_watch,
                'last_sync_at': mb.last_sync_at.isoformat() if mb.last_sync_at else None,
                'created_at': mb.created_at.isoformat() if mb.created_at else None,
                'token_valid': not mb.is_token_expired(),
            })
        
        return JsonResponse({
            'status': 'success',
            'mailboxes': mailboxes_data,
            'count': len(mailboxes_data),
        })
    except Exception as e:
        logger.error(f"Error listing Outlook mailboxes: {str(e)}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@login_required
def outlook_mail_test(request):
    """Test Outlook mail connection by fetching recent emails"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'POST required'}, status=405)
    
    try:
        from modules.email_to_ticket.models import OutlookMailbox
        from modules.email_to_ticket.utils import OutlookEmailReader
        
        # Get first active mailbox
        mailbox = OutlookMailbox.objects.filter(is_active=True).first()
        if not mailbox:
            return JsonResponse({'success': False, 'error': 'No connected mailbox found'})
        
        # Create reader and connect
        reader = OutlookEmailReader(mailbox)
        if not reader.connect():
            return JsonResponse({'success': False, 'error': 'Failed to get valid access token. Please reconnect.'})
        
        emails = reader.fetch_unread_emails(limit=5)
        
        return JsonResponse({
            'success': True,
            'message': f'Connection successful! Found {len(emails)} unread email(s) in {mailbox.email_address}'
        })
        
    except Exception as e:
        logger.error(f"Error testing Outlook connection: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)})
