"""
Email integration views (provider selection and setup)
"""
import logging

from django.contrib.auth.decorators import login_required
from inertia import inertia

logger = logging.getLogger(__name__)


@login_required
@inertia('EmailIntegration')
def email_integration_setup(request):
    """Email integration provider selection page"""
    try:
        connected_providers = []
        
        # Check for connected Outlook mailboxes
        try:
            from modules.email_to_ticket.models import OutlookMailbox
            if OutlookMailbox.objects.filter(is_active=True).exists():
                connected_providers.append('outlook')
        except Exception:
            pass
        
        # Check for connected custom IMAP mailboxes
        try:
            from modules.email_to_ticket.models import CustomIMAPMailbox
            if CustomIMAPMailbox.objects.filter(is_active=True).exists():
                connected_providers.append('imap')
        except Exception:
            pass
        
        return {
            'title': 'Email Integration',
            'connected_providers': connected_providers,
        }
    except Exception as e:
        logger.error(f"Error loading email integration page: {str(e)}")
        return {
            'title': 'Email Integration',
            'connected_providers': [],
            'error': str(e)
        }


@login_required
@inertia('EmailProviderSetup')
def email_provider_setup(request, provider_id):
    """Email provider integration setup page with stepper form"""
    valid_providers = ['gmail', 'outlook', 'yahoo', 'imap']
    
    if provider_id not in valid_providers:
        return {
            'title': 'Email Provider Setup',
            'provider_id': 'gmail',
            'is_connected': False,
            'config': {},
            'error': 'Invalid provider'
        }
    
    try:
        is_connected = False
        config = {}
        connected_mailboxes = []
        
        # Check for Outlook mailbox connections
        if provider_id == 'outlook':
            from modules.email_to_ticket.models import OutlookMailbox
            mailboxes = OutlookMailbox.objects.filter(is_active=True)
            if mailboxes.exists():
                is_connected = True
                connected_mailboxes = [
                    {
                        'id': mb.id,
                        'email': mb.email_address,
                        'display_name': mb.display_name,
                        'connected_at': mb.created_at.isoformat() if mb.created_at else None,
                        'last_checked': mb.last_sync_at.isoformat() if mb.last_sync_at else None,
                    }
                    for mb in mailboxes
                ]
        
        # Check for Custom IMAP mailbox connections
        if provider_id == 'imap':
            from modules.email_to_ticket.models import CustomIMAPMailbox
            mailboxes = CustomIMAPMailbox.objects.filter(is_active=True)
            if mailboxes.exists():
                is_connected = True
                connected_mailboxes = [
                    {
                        'id': mb.id,
                        'email': mb.email_address,
                        'display_name': mb.display_name,
                        'imap_host': mb.imap_host,
                        'connected_at': mb.created_at.isoformat() if mb.created_at else None,
                        'last_checked': mb.last_sync_at.isoformat() if mb.last_sync_at else None,
                    }
                    for mb in mailboxes
                ]
        
        return {
            'title': f'{provider_id.title()} Email Integration',
            'provider_id': provider_id,
            'is_connected': is_connected,
            'config': config,
            'connected_mailboxes': connected_mailboxes,
        }
    except Exception as e:
        logger.error(f"Error loading email provider setup page: {str(e)}")
        return {
            'title': 'Email Provider Setup',
            'provider_id': provider_id,
            'is_connected': False,
            'config': {},
            'error': str(e)
        }
