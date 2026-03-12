"""
Common integrations API views
"""
import logging

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

logger = logging.getLogger(__name__)


@login_required
def api_integrations(request):
    """API endpoint to get integrations data from database"""
    try:
        from modules.settings.models import SettingsIntegrations
        from modules.email_to_ticket.models import OutlookMailbox, CustomIMAPMailbox

        integrations = SettingsIntegrations.objects.filter(is_active=True).order_by('order', 'name')

        # Get connected email providers
        connected_email_providers = []
        
        # Check for Outlook connections
        outlook_count = OutlookMailbox.objects.filter(is_active=True).count()
        if outlook_count > 0:
            connected_email_providers.append({
                'name': 'Microsoft Outlook',
                'count': outlook_count
            })
        
        # Check for Custom IMAP connections
        imap_count = CustomIMAPMailbox.objects.filter(is_active=True).count()
        if imap_count > 0:
            connected_email_providers.append({
                'name': 'Custom IMAP',
                'count': imap_count
            })

        integrations_data = []
        for integration in integrations:
            integration_dict = {
                'id': integration.id,
                'name': integration.name,
                'icon': integration.icon,
                'description': integration.description,
                'status': integration.status,
                'color': integration.color,
                'is_integrated': integration.is_integrated,
                'type': integration.integration_type,
                'webhook_url': integration.webhook_url,
                'config_settings': integration.config_settings,
                'created_at': integration.created_at.isoformat() if integration.created_at else None,
                'updated_at': integration.updated_at.isoformat() if integration.updated_at else None,
            }
            
            # Add connected providers for Email Providers integration
            if integration.name == 'Email Providers':
                integration_dict['connected_providers'] = connected_email_providers
                integration_dict['is_integrated'] = len(connected_email_providers) > 0
            
            integrations_data.append(integration_dict)

        return JsonResponse({
            'integrations': integrations_data,
            'count': len(integrations_data),
            'status': 'success'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)
