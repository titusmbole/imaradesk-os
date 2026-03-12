"""
Survey Signals

Automatically trigger surveys based on ticket lifecycle events.
"""
import logging
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


def queue_survey_invitation(survey, ticket, user=None, email=None, user_name=None, agent=None):
    """
    Queue a survey invitation to be sent.
    This creates the invitation record which will be processed by a scheduled task.
    """
    from .models import SurveyInvitation, SurveySettings
    
    logger.info(f"[SURVEY] queue_survey_invitation called for survey '{survey.name}' and ticket {ticket.ticket_number}")
    
    settings = SurveySettings.get_settings()
    
    if not settings.enabled:
        logger.info(f"[SURVEY] Survey system is disabled, skipping invitation for ticket {ticket.ticket_number}")
        return None
    
    if not survey.is_active:
        logger.info(f"[SURVEY] Survey '{survey.name}' is not active, skipping invitation")
        return None
    
    # Determine email and user info
    logger.info(f"[SURVEY] Determining recipient - provided email: {email}, user: {user}, user_name: {user_name}")
    if not email:
        if user:
            email = user.email
            user_name = user.get_full_name() or user.username
            logger.info(f"[SURVEY] Got email from user: {email}")
        elif ticket.requester:
            email = ticket.requester.email
            user_name = ticket.requester.get_full_name() or ticket.requester.username
            user = ticket.requester
            logger.info(f"[SURVEY] Got email from ticket requester: {email}")
        elif ticket.is_guest_ticket and ticket.guest_email:
            email = ticket.guest_email
            user_name = ticket.guest_name
            logger.info(f"[SURVEY] Got email from guest ticket: {email}")
    
    if not email:
        logger.warning(f"[SURVEY] No email address for survey invitation on ticket {ticket.ticket_number}")
        return None
    
    logger.info(f"[SURVEY] Final recipient - email: {email}, name: {user_name}")
    
    # Check if invitation already exists (prevent duplicates)
    if not survey.allow_multiple_responses:
        existing = SurveyInvitation.objects.filter(
            survey=survey,
            ticket=ticket,
            email=email,
            status__in=['pending', 'sent', 'opened', 'completed']
        ).exists()
        
        if existing:
            logger.info(f"[SURVEY] Survey invitation already exists for ticket {ticket.ticket_number}, skipping")
            return None
    
    # Calculate scheduled time
    scheduled_at = timezone.now() + timedelta(minutes=survey.send_delay)
    expires_at = scheduled_at + timedelta(days=survey.expiry_days)
    logger.info(f"[SURVEY] Scheduled at: {scheduled_at}, expires at: {expires_at}")
    
    # Determine agent
    if not agent and ticket.assignee:
        agent = ticket.assignee
        logger.info(f"[SURVEY] Agent from ticket assignee: {agent.email if agent else 'None'}")
    
    # Create invitation
    logger.info(f"[SURVEY] Creating survey invitation...")
    invitation = SurveyInvitation.objects.create(
        survey=survey,
        ticket=ticket,
        user=user,
        email=email,
        user_name=user_name or '',
        agent=agent,
        scheduled_at=scheduled_at,
        expires_at=expires_at,
        metadata={
            'ticket_number': ticket.ticket_number,
            'ticket_title': ticket.title,
            'trigger_event': survey.trigger_event,
        }
    )
    
    logger.info(f"[SURVEY] Created survey invitation {invitation.id} (token: {invitation.token}) for ticket {ticket.ticket_number} to {email}")
    return invitation


def get_default_survey_for_event(trigger_event):
    """Get the default survey for a trigger event."""
    from .models import Survey
    
    return Survey.objects.filter(
        trigger_event=trigger_event,
        is_active=True,
        is_default=True
    ).first()


def should_send_survey_for_ticket(survey, ticket):
    """Check if survey should be sent for this ticket based on targeting rules."""
    # Check department targeting
    if survey.target_departments.exists():
        if not ticket.department or ticket.department not in survey.target_departments.all():
            return False
    
    # Check priority targeting
    if survey.target_priorities:
        if ticket.priority not in survey.target_priorities:
            return False
    
    return True


def trigger_survey_on_ticket_resolved(ticket, user=None, email=None, user_name=None):
    """
    Trigger survey when a ticket is resolved.
    Called from ticket signals with creator information.
    """
    from .models import Survey, SurveySettings
    
    logger.info(f"[SURVEY] trigger_survey_on_ticket_resolved called for ticket {ticket.ticket_number}")
    logger.info(f"[SURVEY] Parameters - user: {user}, email: {email}, user_name: {user_name}")
    
    try:
        settings = SurveySettings.get_settings()
        if not settings.enabled:
            logger.info(f"[SURVEY] Survey system disabled in settings")
            return None
        
        # Get default survey for ticket resolved event
        logger.info(f"[SURVEY] Looking for default survey with trigger_event='resolved'...")
        survey = get_default_survey_for_event(Survey.TriggerEvent.TICKET_RESOLVED)
        
        if not survey:
            logger.info(f"[SURVEY] No default survey found for TICKET_RESOLVED event")
            return None
        
        logger.info(f"[SURVEY] Found survey: '{survey.name}' (id: {survey.id}, active: {survey.is_active})")
        
        # Check if survey should be sent for this ticket
        if not should_send_survey_for_ticket(survey, ticket):
            logger.info(f"[SURVEY] Survey targeting rules don't match this ticket, skipping")
            return None
        
        logger.info(f"[SURVEY] Survey targeting rules matched, queuing invitation...")
        
        # Queue invitation with creator info
        invitation = queue_survey_invitation(
            survey=survey,
            ticket=ticket,
            user=user,
            email=email,
            user_name=user_name
        )
        
        if invitation:
            logger.info(f"[SURVEY] Successfully created invitation {invitation.id}")
        else:
            logger.info(f"[SURVEY] Invitation was not created (may already exist or missing info)")
        
        return invitation
        
    except Exception as e:
        logger.error(f"[SURVEY] Error in trigger_survey_on_ticket_resolved for ticket {ticket.ticket_number}: {e}")
        return None


@receiver(pre_save, sender='ticket.Ticket')
def capture_ticket_state(sender, instance, **kwargs):
    """Capture ticket state before save to detect status changes."""
    if instance.pk:
        try:
            old_instance = sender.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except sender.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender='ticket.Ticket')
def trigger_survey_on_ticket_event(sender, instance, created, **kwargs):
    """
    Trigger surveys based on ticket lifecycle events.
    """
    from .models import Survey, SurveySettings
    
    try:
        settings = SurveySettings.get_settings()
        if not settings.enabled:
            return
        
        old_status = getattr(instance, '_old_status', None)
        new_status = instance.status
        
        # Check for resolved status change
        if new_status == 'resolved' and old_status != 'resolved':
            survey = get_default_survey_for_event(Survey.TriggerEvent.TICKET_RESOLVED)
            if survey and should_send_survey_for_ticket(survey, instance):
                queue_survey_invitation(survey, instance)
        
        # Check for closed status change
        elif new_status == 'closed' and old_status != 'closed':
            survey = get_default_survey_for_event(Survey.TriggerEvent.TICKET_CLOSED)
            if survey and should_send_survey_for_ticket(survey, instance):
                queue_survey_invitation(survey, instance)
                
    except Exception as e:
        logger.error(f"Error triggering survey for ticket {instance.ticket_number}: {e}")


def trigger_survey_on_sla_breach(ticket):
    """
    Manually call this function when an SLA breach occurs.
    Can be integrated with SLA monitoring system.
    """
    from .models import Survey, SurveySettings
    
    try:
        settings = SurveySettings.get_settings()
        if not settings.enabled:
            return
        
        survey = get_default_survey_for_event(Survey.TriggerEvent.SLA_BREACH)
        if survey and should_send_survey_for_ticket(survey, ticket):
            queue_survey_invitation(survey, ticket)
    except Exception as e:
        logger.error(f"Error triggering SLA breach survey for ticket {ticket.ticket_number}: {e}")


def send_manual_survey(survey, ticket, user=None, email=None):
    """
    Manually trigger a survey for a ticket.
    Used by agents/admins to send surveys on demand.
    """
    from .models import SurveySettings
    
    settings = SurveySettings.get_settings()
    if not settings.enabled:
        raise ValueError("Survey system is currently disabled")
    
    if not survey.is_active:
        raise ValueError("Survey is not active")
    
    invitation = queue_survey_invitation(
        survey=survey,
        ticket=ticket,
        user=user,
        email=email
    )
    
    return invitation
