"""
Slack integration views
"""
import json
import base64
import logging
import requests

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect
from django.db import connection
from inertia import inertia

logger = logging.getLogger(__name__)


@login_required
@inertia('SlackIntegration')
def slack_integration_setup(request):
    """Slack integration setup page"""
    try:
        from modules.settings.models import SlackIntegration

        slack_integration = SlackIntegration.objects.filter(is_active=True).first()

        is_connected = slack_integration is not None and bool(slack_integration.access_token)

        workspace = {
            'name': slack_integration.team_name if slack_integration else 'Your Workspace',
            'url': f'{slack_integration.team_name.lower().replace(" ", "-")}.slack.com' if slack_integration else 'your-workspace.slack.com',
            'team_id': slack_integration.team_id if slack_integration else None
        }

        channels = [
            {'id': 'general', 'name': 'general'},
            {'id': 'support', 'name': 'support'},
            {'id': 'helpdesk', 'name': 'helpdesk'},
            {'id': 'alerts', 'name': 'alerts'},
            {'id': 'notifications', 'name': 'notifications'},
        ]

        integration_config = {}
        if slack_integration:
            integration_config = {
                'default_channel_id': slack_integration.default_channel_id or '',
                'default_channel_name': slack_integration.default_channel_name or '',
                'notify_new_ticket': slack_integration.notify_new_ticket,
                'notify_ticket_assigned': slack_integration.notify_ticket_assigned,
                'notify_ticket_resolved': slack_integration.notify_ticket_resolved,
                'notify_sla_breach': slack_integration.notify_sla_breach,
                'notify_new_comment': slack_integration.notify_new_comment,
            }

        return {
            'title': 'Slack Integration Setup',
            'workspace': workspace,
            'channels': channels,
            'is_connected': is_connected,
            'integration': integration_config
        }
    except Exception as e:
        return {
            'title': 'Slack Integration Setup',
            'workspace': {},
            'channels': [],
            'is_connected': False,
            'integration': {},
            'error': str(e)
        }


@login_required
def slack_oauth_config(request):
    """Get Slack OAuth configuration"""
    try:
        user_domain = None
        if hasattr(request.user, 'profile') and request.user.profile.organization:
            user_domain = request.user.profile.organization.domain

        state_data = {
            'return_url': '/settings/integrations/slack/',
            'user_domain': user_domain
        }

        config = {
            'client_id': settings.SLACK_CLIENT_ID,
            'scopes': settings.SLACK_OAUTH_SCOPES.split(','),
            'redirect_uri': settings.SLACK_REDIRECT_URI,
            'state': json.dumps(state_data)
        }
        return JsonResponse({
            'status': 'success',
            'config': config
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


def slack_oauth_callback(request):
    """Handle Slack OAuth callback"""
    try:
        host = request.get_host()
        protocol = 'https' if request.is_secure() else 'http'
        tenant_schema = connection.schema_name

        code = request.GET.get("code")
        state = request.GET.get("state")
        error = request.GET.get("error")

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
            logger.error(f"Slack returned error: {error}")

        if code:
            token_url = "https://slack.com/api/oauth.v2.access"
            token_data = {
                "client_id": settings.SLACK_CLIENT_ID,
                "client_secret": settings.SLACK_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.SLACK_REDIRECT_URI,
            }

            response = requests.post(token_url, data=token_data)
            token_response = response.json()

            if token_response.get('ok'):
                try:
                    from shared.utilities.tenant_compat import schema_context
                    from modules.settings.models import SlackIntegration

                    with schema_context(target_schema):
                        team_id = token_response.get('team', {}).get('id', '')
                        team_name = token_response.get('team', {}).get('name', '')
                        access_token = token_response.get('access_token', '')
                        bot_user_id = token_response.get('bot_user_id', '')
                        scope = token_response.get('scope', '')
                        authed_user_id = token_response.get('authed_user', {}).get('id', '')

                        SlackIntegration.objects.update_or_create(
                            team_id=team_id,
                            defaults={
                                'team_name': team_name,
                                'access_token': access_token,
                                'bot_user_id': bot_user_id,
                                'scope': scope,
                                'authed_user_id': authed_user_id,
                                'is_active': True,
                            }
                        )
                except Exception as save_error:
                    logger.error(f"Failed to save SlackIntegration: {str(save_error)}")

    except Exception as e:
        logger.error(f"Exception during Slack OAuth callback: {str(e)}", exc_info=True)

    redirect_url = f"{redirect_protocol}://{redirect_host}/settings/integrations/?slack=connected"
    return redirect(redirect_url)


@login_required
def slack_configure(request):
    """Configure Slack integration settings"""
    if request.method == 'POST':
        try:
            from modules.settings.models import SlackIntegration

            slack_integration = SlackIntegration.get_integration()

            if not slack_integration or not slack_integration.access_token:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Slack integration is not connected'
                }, status=400)

            slack_integration.default_channel_id = request.POST.get('default_channel_id', '')
            slack_integration.default_channel_name = request.POST.get('default_channel_name', '')
            slack_integration.notify_new_ticket = request.POST.get('notify_new_ticket') == 'true'
            slack_integration.notify_ticket_assigned = request.POST.get('notify_ticket_assigned') == 'true'
            slack_integration.notify_ticket_resolved = request.POST.get('notify_ticket_resolved') == 'true'
            slack_integration.notify_sla_breach = request.POST.get('notify_sla_breach') == 'true'
            slack_integration.notify_new_comment = request.POST.get('notify_new_comment') == 'true'
            slack_integration.save()

            messages.success(request, 'Slack integration configured successfully!')
            return redirect('/settings/integrations/')

        except Exception as e:
            messages.error(request, f'Error configuring Slack: {str(e)}')
            return redirect('/settings/integrations/slack/')

    return redirect('/settings/integrations/slack/')
