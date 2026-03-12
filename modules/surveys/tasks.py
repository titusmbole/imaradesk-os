"""
Celery tasks for survey processing.
"""
from celery import shared_task
from django_tenants.utils import schema_context, get_tenant_model
from django.utils import timezone
from django.db.models import Q
import logging
import time

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60, rate_limit='10/m')
def send_single_survey_invitation(self, schema_name, invitation_id):
    """
    Send a single survey invitation email with rate limiting.
    Rate limited to 10 per minute to avoid email server throttling.
    """
    from .models import SurveyInvitation
    
    try:
        with schema_context(schema_name):
            invitation = SurveyInvitation.objects.select_related('survey').get(id=invitation_id)
            
            if invitation.status != 'pending':
                logger.info(f"[SURVEY] Invitation {invitation_id} already processed (status: {invitation.status})")
                return {'status': 'skipped', 'reason': 'not_pending'}
            
            now = timezone.now()
            
            # Fix missing scheduled_at/expires_at if needed
            if not invitation.scheduled_at:
                invitation.scheduled_at = now
            if not invitation.expires_at:
                expiry_days = getattr(invitation.survey, 'expiry_days', 7) or 7
                invitation.expires_at = now + timezone.timedelta(days=expiry_days)
                invitation.save(update_fields=['scheduled_at', 'expires_at'])
            
            # Send the email
            success = _send_survey_email(invitation, schema_name)
            
            if success:
                invitation.status = 'sent'
                invitation.sent_at = now
                invitation.save(update_fields=['status', 'sent_at', 'updated_at'])
                logger.info(f"[SURVEY] Sent invitation {invitation_id} to {invitation.email}")
                return {'status': 'success', 'email': invitation.email}
            else:
                logger.warning(f"[SURVEY] Failed to send invitation {invitation_id}")
                return {'status': 'failed', 'email': invitation.email}
                
    except SurveyInvitation.DoesNotExist:
        logger.error(f"[SURVEY] Invitation {invitation_id} not found")
        return {'status': 'error', 'message': 'not_found'}
    except Exception as e:
        logger.error(f"[SURVEY] Error sending invitation {invitation_id}: {e}")
        raise self.retry(exc=e)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_pending_survey_invitations(self):
    """
    Process pending survey invitations and send emails.
    This task runs periodically to send survey invitations that are due.
    """
    from django.db import connection
    
    logger.info("[SURVEY] Starting to process pending survey invitations...")
    
    TenantModel = get_tenant_model()
    total_sent = 0
    total_errors = 0
    
    # Process each tenant
    for tenant in TenantModel.objects.exclude(schema_name='public'):
        try:
            with schema_context(tenant.schema_name):
                sent, errors = _process_tenant_invitations(tenant.schema_name)
                total_sent += sent
                total_errors += errors
        except Exception as e:
            logger.error(f"[SURVEY] Error processing tenant {tenant.schema_name}: {e}")
            total_errors += 1
    
    result = {
        'status': 'completed',
        'invitations_sent': total_sent,
        'errors': total_errors,
    }
    
    logger.info(f"[SURVEY] Finished processing survey invitations: {result}")
    return result


def _process_tenant_invitations(schema_name):
    """Process pending invitations for a specific tenant by queuing rate-limited tasks."""
    from .models import SurveyInvitation, SurveySettings
    
    queued_count = 0
    
    try:
        # Check if surveys are enabled
        settings = SurveySettings.get_settings()
        if not settings.enabled:
            return 0, 0
        
        now = timezone.now()
        
        # Get ALL pending invitations (regardless of scheduled_at)
        # Filter: status=pending AND (no expires_at OR expires_at > now)
        pending_invitations = SurveyInvitation.objects.filter(
            status=SurveyInvitation.Status.PENDING
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=now)
        ).values_list('id', flat=True)[:50]  # Process in batches
        
        # Queue individual rate-limited tasks for each invitation
        for invitation_id in pending_invitations:
            send_single_survey_invitation.delay(schema_name, invitation_id)
            queued_count += 1
        
        if queued_count > 0:
            logger.info(f"[SURVEY] Queued {queued_count} invitation tasks for {schema_name}")
        
        # Mark expired invitations
        expired_count = SurveyInvitation.objects.filter(
            status=SurveyInvitation.Status.PENDING,
            expires_at__lte=now
        ).update(status=SurveyInvitation.Status.EXPIRED)
        
        if expired_count > 0:
            logger.info(f"[SURVEY] Marked {expired_count} invitations as expired in {schema_name}")
        
    except Exception as e:
        logger.error(f"[SURVEY] Error in _process_tenant_invitations for {schema_name}: {e}")
    
    return queued_count, 0


def _send_survey_email(invitation, schema_name=None):
    """Send a survey invitation email."""
    from shared.utilities.Mailer import Mailer
    from django.conf import settings
    from shared.models import Client, Domain
    from django.db import connection
    
    try:
        mailer = Mailer()
        
        # Build survey URL using tenant domain
        # Get schema_name from parameter or current connection
        if not schema_name:
            schema_name = connection.schema_name
        
        # Get tenant's primary domain
        try:
            tenant = Client.objects.get(schema_name=schema_name)
            primary_domain = Domain.objects.filter(tenant=tenant, is_primary=True).first()
            if primary_domain:
                tenant_domain = primary_domain.domain
            else:
                # Fallback: construct from schema_name and PRIMARY_DOMAIN
                primary_domain_setting = getattr(settings, 'PRIMARY_DOMAIN', '127.0.0.1:8000')
                tenant_domain = f"{schema_name}.{primary_domain_setting}"
        except Client.DoesNotExist:
            primary_domain_setting = getattr(settings, 'PRIMARY_DOMAIN', '127.0.0.1:8000')
            tenant_domain = f"{schema_name}.{primary_domain_setting}"
        
        # Determine protocol (use HTTPS in production)
        use_ssl = getattr(settings, 'USE_SSL', False) or getattr(settings, 'SECURE_SSL_REDIRECT', False)
        protocol = 'https' if use_ssl else 'http'
        
        survey_url = f"{protocol}://{tenant_domain}/survey/{invitation.token}/"
        
        # Prepare context
        context = {
            'customer_name': invitation.user_name or invitation.email.split('@')[0],
            'survey_name': invitation.survey.name,
            'survey_description': invitation.survey.description or '',
            'survey_url': survey_url,
            'ticket_number': invitation.metadata.get('ticket_number', ''),
            'ticket_subject': invitation.metadata.get('ticket_title', ''),
            'expiry_days': invitation.survey.expiry_days,
            'company_name': 'Support Team',
        }
        
        # Add agent info if available
        if invitation.agent:
            context['agent_name'] = invitation.agent.get_full_name() or invitation.agent.username
        
        # Send using survey_invitation template
        mailer.send_email(
            template_type='survey_invitation',
            to_emails=[invitation.email],
            context=context
        )
        
        return True
        
    except Exception as e:
        logger.error(f"[SURVEY] Error sending invitation email to {invitation.email}: {e}")
        return False


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_all_pending_invitations(self):
    """
    Send ALL pending survey invitations immediately.
    Picks up all pending invitations, sends emails, and marks them as sent.
    Use this to catch up on any stuck invitations.
    """
    logger.info("[SURVEY] Starting to send all pending invitations...")
    
    TenantModel = get_tenant_model()
    total_sent = 0
    total_errors = 0
    
    for tenant in TenantModel.objects.exclude(schema_name='public'):
        try:
            with schema_context(tenant.schema_name):
                sent, errors = _send_all_pending_for_tenant(tenant.schema_name)
                total_sent += sent
                total_errors += errors
        except Exception as e:
            logger.error(f"[SURVEY] Error processing tenant {tenant.schema_name}: {e}")
            total_errors += 1
    
    result = {
        'status': 'completed',
        'invitations_sent': total_sent,
        'errors': total_errors,
    }
    logger.info(f"[SURVEY] Finished sending all pending invitations: {result}")
    return result


def _send_all_pending_for_tenant(schema_name):
    """Queue all pending invitations for a specific tenant to rate-limited tasks."""
    from .models import SurveyInvitation
    
    queued_count = 0
    now = timezone.now()
    
    # Get ALL pending invitations - no date filters
    pending_invitations = SurveyInvitation.objects.filter(
        status='pending'
    ).select_related('survey')
    
    count = pending_invitations.count()
    logger.info(f"[SURVEY] Found {count} pending invitations in {schema_name}")
    
    for invitation in pending_invitations:
        # Fix missing scheduled_at/expires_at before queuing
        needs_update = False
        if not invitation.scheduled_at:
            invitation.scheduled_at = now
            needs_update = True
        if not invitation.expires_at:
            expiry_days = getattr(invitation.survey, 'expiry_days', 7) or 7
            invitation.expires_at = now + timezone.timedelta(days=expiry_days)
            needs_update = True
        if needs_update:
            invitation.save(update_fields=['scheduled_at', 'expires_at'])
        
        # Queue to rate-limited task
        send_single_survey_invitation.delay(schema_name, invitation.id)
        queued_count += 1
    
    return queued_count, 0


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_survey_reminders(self):
    """
    Send reminders for unopened/incomplete survey invitations.
    """
    from django.db import connection
    
    logger.info("[SURVEY] Starting to send survey reminders...")
    
    TenantModel = get_tenant_model()
    total_sent = 0
    
    for tenant in TenantModel.objects.exclude(schema_name='public'):
        try:
            with schema_context(tenant.schema_name):
                sent = _send_tenant_reminders(tenant.schema_name)
                total_sent += sent
        except Exception as e:
            logger.error(f"[SURVEY] Error sending reminders for tenant {tenant.schema_name}: {e}")
    
    logger.info(f"[SURVEY] Finished sending survey reminders. Total sent: {total_sent}")
    return {'reminders_sent': total_sent}


def _send_tenant_reminders(schema_name):
    """Send reminders for a specific tenant."""
    from .models import SurveyInvitation, SurveySettings
    from datetime import timedelta
    from django.db import models
    
    sent_count = 0
    
    try:
        settings = SurveySettings.get_settings()
        if not settings.enabled or not settings.send_reminders:
            return 0
        
        now = timezone.now()
        reminder_threshold = now - timedelta(days=settings.reminder_delay)
        
        # Get invitations that need reminders
        invitations_to_remind = SurveyInvitation.objects.filter(
            status__in=[SurveyInvitation.Status.SENT, SurveyInvitation.Status.OPENED],
            sent_at__lte=reminder_threshold,
            expires_at__gt=now,
            reminder_count__lt=settings.max_reminders
        ).filter(
            # Either never reminded, or last reminder was long enough ago
            models.Q(last_reminder_at__isnull=True) |
            models.Q(last_reminder_at__lte=reminder_threshold)
        ).select_related('survey', 'ticket')[:20]
        
        for invitation in invitations_to_remind:
            try:
                success = _send_survey_email(invitation, schema_name)
                if success:
                    invitation.reminder_count += 1
                    invitation.last_reminder_at = now
                    invitation.save(update_fields=['reminder_count', 'last_reminder_at', 'updated_at'])
                    sent_count += 1
                    logger.info(f"[SURVEY] Sent reminder {invitation.reminder_count} for invitation {invitation.id}")
            except Exception as e:
                logger.error(f"[SURVEY] Failed to send reminder for invitation {invitation.id}: {e}")
        
    except Exception as e:
        logger.error(f"[SURVEY] Error in _send_tenant_reminders for {schema_name}: {e}")
    
    return sent_count
