"""
Microsoft Teams integration views
"""
import json
import base64
import logging
import requests
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.db import connection
from inertia import inertia

logger = logging.getLogger(__name__)


@login_required
@inertia('TeamsIntegration')
def teams_integration_setup(request):
    """Teams integration setup page"""
    try:
        from modules.settings.models import TeamsIntegration

        teams_integration = TeamsIntegration.objects.filter(is_active=True).first()

        is_connected = teams_integration is not None and bool(teams_integration.access_token)

        workspace = {
            'name': teams_integration.tenant_name if teams_integration else 'Your Organization',
            'tenant_id': teams_integration.tenant_id if teams_integration else None,
            'user_email': teams_integration.authed_user_email if teams_integration else None,
        }

        integration_config = {}
        if teams_integration:
            integration_config = {
                'default_team_id': teams_integration.default_team_id or '',
                'default_team_name': teams_integration.default_team_name or '',
                'default_channel_id': teams_integration.default_channel_id or '',
                'default_channel_name': teams_integration.default_channel_name or '',
                'webhook_url': teams_integration.webhook_url or '',
                'notify_new_ticket': teams_integration.notify_new_ticket,
                'notify_ticket_assigned': teams_integration.notify_ticket_assigned,
                'notify_ticket_resolved': teams_integration.notify_ticket_resolved,
                'notify_sla_breach': teams_integration.notify_sla_breach,
                'notify_new_comment': teams_integration.notify_new_comment,
            }

        return {
            'title': 'Microsoft Teams Integration Setup',
            'workspace': workspace,
            'is_connected': is_connected,
            'integration': integration_config
        }
    except Exception as e:
        logger.error(f"Error loading Teams integration setup: {str(e)}")
        return {
            'title': 'Microsoft Teams Integration Setup',
            'workspace': {},
            'is_connected': False,
            'integration': {},
            'error': str(e)
        }


@login_required
def teams_oauth_config(request):
    """Get Teams OAuth configuration for frontend"""
    try:
        user_domain = None
        if hasattr(request.user, 'profile') and request.user.profile.organization:
            user_domain = request.user.profile.organization.domain

        current_host = request.get_host()
        current_protocol = 'https' if request.is_secure() else 'http'

        subdomain = None
        host_parts = current_host.split('.')
        if len(host_parts) > 2 or (len(host_parts) > 1 and 'localhost' in current_host):
            subdomain = host_parts[0]

        state_data = {
            'return_url': '/settings/integrations/teams/',
            'user_domain': user_domain,
            'subdomain': subdomain,
            'schema': connection.schema_name,
            'host': current_host,
            'protocol': current_protocol,
        }

        state_json = json.dumps(state_data)
        state_encoded = base64.urlsafe_b64encode(state_json.encode()).decode()

        auth_base_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'

        config = {
            'client_id': settings.TEAMS_CLIENT_ID,
            'scopes': settings.TEAMS_OAUTH_SCOPES,
            'redirect_uri': settings.TEAMS_REDIRECT_URI,
            'state': state_encoded,
            'auth_url': auth_base_url,
        }

        return JsonResponse({
            'status': 'success',
            'config': config
        })
    except Exception as e:
        logger.error(f"Error getting Teams OAuth config: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@login_required
def teams_oauth_connect(request):
    """Initiate Teams OAuth flow"""
    try:
        user_domain = None
        if hasattr(request.user, 'profile') and request.user.profile.organization:
            user_domain = request.user.profile.organization.domain

        current_host = request.get_host()
        current_protocol = 'https' if request.is_secure() else 'http'

        subdomain = None
        host_parts = current_host.split('.')
        if len(host_parts) > 2 or (len(host_parts) > 1 and 'localhost' in current_host):
            subdomain = host_parts[0]

        state_data = {
            'return_url': '/settings/integrations/teams/',
            'user_domain': user_domain,
            'subdomain': subdomain,
            'schema': connection.schema_name,
            'host': current_host,
            'protocol': current_protocol,
        }
        state_json = json.dumps(state_data)
        state_encoded = base64.urlsafe_b64encode(state_json.encode()).decode()

        if not settings.TEAMS_CLIENT_ID:
            logger.error("TEAMS_APPLICATION_ID environment variable is not set")
            return redirect('/settings/integrations/?teams_error=missing_client_id')

        auth_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
        params = {
            'client_id': settings.TEAMS_CLIENT_ID,
            'response_type': 'code',
            'redirect_uri': settings.TEAMS_REDIRECT_URI,
            'response_mode': 'query',
            'scope': ' '.join(settings.TEAMS_OAUTH_SCOPES),
            'state': state_encoded,
            'prompt': 'consent',
        }

        full_auth_url = f"{auth_url}?{urlencode(params)}"
        return redirect(full_auth_url)

    except Exception as e:
        logger.error(f"Error initiating Teams OAuth: {str(e)}")
        return redirect('/settings/integrations/?teams_error=oauth_init_failed')


def teams_oauth_callback(request):
    """Handle Microsoft Teams OAuth callback"""
    try:
        host = request.get_host()
        protocol = 'https' if request.is_secure() else 'http'
        tenant_schema = connection.schema_name

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
            logger.error(f"Teams OAuth error: {error} - {error_description}")
            redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/?teams_error={error}"
            return redirect(redirect_url)

        if not code:
            logger.error("No authorization code received from Microsoft")
            redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/?teams_error=no_code"
            return redirect(redirect_url)

        token_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        token_data = {
            'client_id': settings.TEAMS_CLIENT_ID,
            'client_secret': settings.TEAMS_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.TEAMS_REDIRECT_URI,
            'grant_type': 'authorization_code',
            'scope': ' '.join(settings.TEAMS_OAUTH_SCOPES),
        }

        response = requests.post(token_url, data=token_data)
        token_response = response.json()

        if 'error' in token_response:
            logger.error(f"Token exchange failed: {token_response}")
            redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/?teams_error=token_exchange_failed"
            return redirect(redirect_url)

        access_token = token_response.get('access_token')
        refresh_token = token_response.get('refresh_token')
        expires_in = token_response.get('expires_in', 3600)
        scope = token_response.get('scope', '')

        user_info = get_microsoft_user_info(access_token)
        token_expires_at = timezone.now() + timedelta(seconds=expires_in)

        try:
            from django_tenants.utils import schema_context
            from modules.settings.models import TeamsIntegration

            with schema_context(target_schema):
                tenant_id = user_info.get('tenant_id', '')
                tenant_name = user_info.get('organization_name', '')

                TeamsIntegration.objects.update_or_create(
                    tenant_id=tenant_id,
                    defaults={
                        'tenant_name': tenant_name,
                        'access_token': access_token,
                        'refresh_token': refresh_token,
                        'token_expires_at': token_expires_at,
                        'authed_user_id': user_info.get('id', ''),
                        'authed_user_email': user_info.get('email', ''),
                        'scope': scope,
                        'is_active': True,
                    }
                )
        except Exception as save_error:
            logger.error(f"Failed to save TeamsIntegration: {str(save_error)}")

        redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/teams/?connected=true"
        return redirect(redirect_url)

    except Exception as e:
        logger.error(f"Exception during Teams OAuth callback: {str(e)}", exc_info=True)
        return redirect('/settings/integrations/?teams_error=unexpected')


def get_microsoft_user_info(access_token):
    """Get user and organization info from Microsoft Graph API"""
    try:
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }

        user_response = requests.get('https://graph.microsoft.com/v1.0/me', headers=headers)
        user_data = user_response.json() if user_response.ok else {}

        org_response = requests.get('https://graph.microsoft.com/v1.0/organization', headers=headers)
        org_data = org_response.json() if org_response.ok else {}

        organizations = org_data.get('value', [])
        tenant_id = organizations[0].get('id', '') if organizations else ''
        org_name = organizations[0].get('displayName', '') if organizations else ''

        return {
            'id': user_data.get('id', ''),
            'email': user_data.get('mail') or user_data.get('userPrincipalName', ''),
            'display_name': user_data.get('displayName', ''),
            'tenant_id': tenant_id,
            'organization_name': org_name,
        }
    except Exception as e:
        logger.error(f"Error getting Microsoft user info: {str(e)}")
        return {}


@login_required
def teams_get_teams(request):
    """Get list of Teams the user has access to"""
    try:
        from modules.settings.models import TeamsIntegration

        integration = TeamsIntegration.get_integration()
        if not integration or not integration.access_token:
            return JsonResponse({
                'success': False,
                'error': 'Teams integration not connected'
            }, status=400)

        if integration.is_token_expired():
            if not refresh_teams_token(integration):
                return JsonResponse({
                    'success': False,
                    'error': 'Token expired. Please reconnect Teams.',
                    'needs_reconnect': True
                }, status=401)

        headers = {
            'Authorization': f'Bearer {integration.access_token}',
            'Content-Type': 'application/json',
        }

        response = requests.get('https://graph.microsoft.com/v1.0/me/joinedTeams', headers=headers)

        if not response.ok:
            error_data = response.json()
            return JsonResponse({
                'success': False,
                'error': error_data.get('error', {}).get('message', 'Failed to fetch teams')
            }, status=response.status_code)

        teams_data = response.json()
        teams = []

        for team in teams_data.get('value', []):
            teams.append({
                'id': team.get('id'),
                'name': team.get('displayName'),
                'description': team.get('description', ''),
            })

        return JsonResponse({
            'success': True,
            'teams': teams
        })

    except Exception as e:
        logger.error(f"Error fetching Teams: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
def teams_get_channels(request):
    """Get channels for a specific team"""
    try:
        from modules.settings.models import TeamsIntegration

        team_id = request.GET.get('team_id')
        if not team_id:
            return JsonResponse({
                'success': False,
                'error': 'team_id is required'
            }, status=400)

        integration = TeamsIntegration.get_integration()
        if not integration or not integration.access_token:
            return JsonResponse({
                'success': False,
                'error': 'Teams integration not connected'
            }, status=400)

        if integration.is_token_expired():
            if not refresh_teams_token(integration):
                return JsonResponse({
                    'success': False,
                    'error': 'Token expired. Please reconnect Teams.',
                    'needs_reconnect': True
                }, status=401)

        headers = {
            'Authorization': f'Bearer {integration.access_token}',
            'Content-Type': 'application/json',
        }

        response = requests.get(
            f'https://graph.microsoft.com/v1.0/teams/{team_id}/channels',
            headers=headers
        )

        if not response.ok:
            error_data = response.json()
            return JsonResponse({
                'success': False,
                'error': error_data.get('error', {}).get('message', 'Failed to fetch channels')
            }, status=response.status_code)

        channels_data = response.json()
        channels = []

        for channel in channels_data.get('value', []):
            channels.append({
                'id': channel.get('id'),
                'name': channel.get('displayName'),
                'description': channel.get('description', ''),
                'membership_type': channel.get('membershipType', 'standard'),
            })

        return JsonResponse({
            'success': True,
            'channels': channels
        })

    except Exception as e:
        logger.error(f"Error fetching channels: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["POST"])
def teams_test_message(request):
    """Send a test message to Teams channel"""
    try:
        from modules.settings.models import TeamsIntegration

        data = json.loads(request.body)
        team_id = data.get('team_id')
        channel_id = data.get('channel_id')
        message = data.get('message', '🎉 ImaraDesk Teams integration is working!')

        if not team_id or not channel_id:
            return JsonResponse({
                'success': False,
                'error': 'team_id and channel_id are required'
            }, status=400)

        integration = TeamsIntegration.get_integration()
        if not integration or not integration.access_token:
            return JsonResponse({
                'success': False,
                'error': 'Teams integration not connected'
            }, status=400)

        if integration.is_token_expired():
            if not refresh_teams_token(integration):
                return JsonResponse({
                    'success': False,
                    'error': 'Token expired. Please reconnect Teams.',
                    'needs_reconnect': True
                }, status=401)

        success = send_teams_message(
            integration.access_token,
            team_id,
            channel_id,
            message
        )

        if success:
            integration.update_last_used()
            return JsonResponse({
                'success': True,
                'message': 'Test message sent successfully!'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to send test message'
            }, status=500)

    except Exception as e:
        logger.error(f"Error sending test message: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


def send_teams_message(access_token, team_id, channel_id, message, card_content=None):
    """Send a message to a Teams channel"""
    try:
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
        }

        if card_content:
            body = {
                'body': {
                    'contentType': 'html',
                    'content': message,
                },
                'attachments': [{
                    'contentType': 'application/vnd.microsoft.card.adaptive',
                    'content': card_content,
                }]
            }
        else:
            body = {
                'body': {
                    'contentType': 'html',
                    'content': message,
                }
            }

        response = requests.post(
            f'https://graph.microsoft.com/v1.0/teams/{team_id}/channels/{channel_id}/messages',
            headers=headers,
            json=body
        )

        if response.ok:
            logger.info(f"Teams message sent successfully to {team_id}/{channel_id}")
            return True
        else:
            error_data = response.json()
            logger.error(f"Failed to send Teams message: {error_data}")
            return False

    except Exception as e:
        logger.error(f"Error sending Teams message: {str(e)}")
        return False


def refresh_teams_token(integration):
    """Refresh the Microsoft Teams access token"""
    try:
        if not integration.refresh_token:
            logger.error("No refresh token available")
            return False

        token_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        token_data = {
            'client_id': settings.TEAMS_CLIENT_ID,
            'client_secret': settings.TEAMS_CLIENT_SECRET,
            'refresh_token': integration.refresh_token,
            'grant_type': 'refresh_token',
            'scope': ' '.join(settings.TEAMS_OAUTH_SCOPES),
        }

        response = requests.post(token_url, data=token_data)
        token_response = response.json()

        if 'error' in token_response:
            logger.error(f"Token refresh failed: {token_response}")
            return False

        integration.access_token = token_response.get('access_token')
        if token_response.get('refresh_token'):
            integration.refresh_token = token_response.get('refresh_token')

        expires_in = token_response.get('expires_in', 3600)
        integration.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        integration.save()

        logger.info("Teams token refreshed successfully")
        return True

    except Exception as e:
        logger.error(f"Error refreshing Teams token: {str(e)}")
        return False


@login_required
@require_http_methods(["POST"])
def teams_configure(request):
    """Configure Teams integration settings"""
    try:
        from modules.settings.models import TeamsIntegration

        integration = TeamsIntegration.get_integration()
        if not integration or not integration.access_token:
            return JsonResponse({
                'status': 'error',
                'message': 'Teams integration is not connected'
            }, status=400)

        integration.default_team_id = request.POST.get('default_team_id', '')
        integration.default_team_name = request.POST.get('default_team_name', '')
        integration.default_channel_id = request.POST.get('default_channel_id', '')
        integration.default_channel_name = request.POST.get('default_channel_name', '')
        integration.webhook_url = request.POST.get('webhook_url', '')
        integration.notify_new_ticket = request.POST.get('notify_new_ticket') == 'true'
        integration.notify_ticket_assigned = request.POST.get('notify_ticket_assigned') == 'true'
        integration.notify_ticket_resolved = request.POST.get('notify_ticket_resolved') == 'true'
        integration.notify_sla_breach = request.POST.get('notify_sla_breach') == 'true'
        integration.notify_new_comment = request.POST.get('notify_new_comment') == 'true'
        integration.save()

        return redirect('/settings/integrations/')

    except Exception as e:
        logger.error(f"Error configuring Teams: {str(e)}")
        return redirect('/settings/integrations/teams/?error=config_failed')


@login_required
@require_http_methods(["POST"])
def teams_disconnect(request):
    """Disconnect Teams integration"""
    try:
        from modules.settings.models import TeamsIntegration

        integration = TeamsIntegration.get_integration()
        if integration:
            integration.delete()
            logger.info("Teams integration disconnected")

        return JsonResponse({
            'success': True,
            'message': 'Teams disconnected successfully'
        })

    except Exception as e:
        logger.error(f"Error disconnecting Teams: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
