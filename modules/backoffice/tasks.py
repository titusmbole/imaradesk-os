"""
Celery tasks for backoffice email campaigns.
"""
from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_campaign_task(self, campaign_id):
    """
    Send an email campaign to all targeted businesses.
    
    This task handles:
    - General (broadcast) templates: Send same content to all
    - Business-specific templates: Personalize with owner name, business name
    
    Args:
        campaign_id: ID of the EmailCampaign to send
    """
    from .models import EmailCampaign, EmailLog
    from django_tenants.utils import get_public_schema_name
    from shared.models import Client, Subscription
    from shared.utilities.Mailer import Mailer
    
    try:
        campaign = EmailCampaign.objects.get(id=campaign_id)
    except EmailCampaign.DoesNotExist:
        logger.error(f"Campaign {campaign_id} not found")
        return {'error': 'Campaign not found'}
    
    # Skip if already sent or cancelled
    if campaign.status in ['sent', 'cancelled']:
        logger.info(f"Campaign {campaign_id} already {campaign.status}, skipping")
        return {'status': campaign.status, 'message': 'Already processed'}
    
    # Mark as sending
    campaign.status = 'sending'
    campaign.save(update_fields=['status'])
    
    # Get template
    template = campaign.template
    
    # Get target businesses
    target_type = campaign.target_type
    selected_businesses = campaign.selected_businesses or []
    
    if target_type == 'all':
        businesses = Client.objects.exclude(schema_name=get_public_schema_name())
    elif target_type == 'active':
        businesses = Client.objects.filter(is_active=True).exclude(schema_name=get_public_schema_name())
    elif target_type == 'trial':
        trial_schemas = Subscription.objects.filter(status='trial').values_list('tenant_schema', flat=True)
        businesses = Client.objects.filter(schema_name__in=trial_schemas)
    elif target_type == 'selected':
        businesses = Client.objects.filter(schema_name__in=selected_businesses)
    else:
        businesses = Client.objects.none()
    
    mailer = Mailer()
    sent_count = 0
    failed_count = 0
    
    for business in businesses:
        # Get owner info
        owner_email = business.created_by_email or ''
        owner_name = business.created_by_name or business.name
        
        # Skip if no email
        if not owner_email:
            failed_count += 1
            EmailLog.objects.create(
                campaign=campaign,
                tenant_schema=business.schema_name,
                business_name=business.name,
                recipient_email='',
                recipient_name=owner_name,
                status='failed',
                subject_sent='',
                error_message='No owner email available'
            )
            continue
        
        # Render template with context
        context = {
            'owner_name': owner_name.split()[0] if owner_name else 'there',
            'business_name': business.name,
            'business_email': owner_email,
        }
        
        # Use custom content if provided, otherwise use template
        if campaign.custom_html_content:
            html_content = campaign.custom_html_content
            for key, value in context.items():
                html_content = html_content.replace('{{' + key + '}}', str(value))
            subject = campaign.custom_subject or template.subject
            for key, value in context.items():
                subject = subject.replace('{{' + key + '}}', str(value))
        else:
            subject, html_content, _ = template.render(context)
        
        # Create log entry
        email_log = EmailLog.objects.create(
            campaign=campaign,
            tenant_schema=business.schema_name,
            business_name=business.name,
            recipient_email=owner_email,
            recipient_name=owner_name,
            subject_sent=subject,
            status='pending'
        )
        
        try:
            # Send email
            success = mailer.send_raw_email(
                to_email=owner_email,
                subject=subject,
                body_html=html_content,
                body_text=template.plain_text_content or '',
                fail_silently=False
            )
            
            if success:
                email_log.status = 'sent'
                email_log.sent_at = timezone.now()
                email_log.save(update_fields=['status', 'sent_at'])
                sent_count += 1
                logger.info(f"Campaign {campaign_id}: Sent to {owner_email}")
            else:
                email_log.status = 'failed'
                email_log.error_message = 'Mailer returned False'
                email_log.save(update_fields=['status', 'error_message'])
                failed_count += 1
                logger.warning(f"Campaign {campaign_id}: Mailer failed for {owner_email}")
        except Exception as e:
            email_log.status = 'failed'
            email_log.error_message = str(e)[:500]
            email_log.save(update_fields=['status', 'error_message'])
            failed_count += 1
            logger.error(f"Campaign {campaign_id}: Error sending to {owner_email}: {e}")
    
    # Update campaign status
    campaign.status = 'sent'
    campaign.sent_at = timezone.now()
    campaign.sent_count = sent_count
    campaign.failed_count = failed_count
    campaign.save(update_fields=['status', 'sent_at', 'sent_count', 'failed_count'])
    
    logger.info(f"Campaign {campaign_id} completed: {sent_count} sent, {failed_count} failed")
    
    return {
        'campaign_id': campaign_id,
        'sent_count': sent_count,
        'failed_count': failed_count,
        'status': 'completed'
    }


@shared_task
def send_single_campaign_email(campaign_id, business_schema):
    """
    Send a single email for a campaign to a specific business.
    Used for individual retries or test sends.
    """
    from .models import EmailCampaign, EmailLog
    from shared.models import Client
    from shared.utilities.Mailer import Mailer
    
    try:
        campaign = EmailCampaign.objects.get(id=campaign_id)
        business = Client.objects.get(schema_name=business_schema)
    except (EmailCampaign.DoesNotExist, Client.DoesNotExist) as e:
        logger.error(f"Email task failed: {e}")
        return {'error': str(e)}
    
    template = campaign.template
    owner_email = business.created_by_email or ''
    owner_name = business.created_by_name or business.name
    
    if not owner_email:
        return {'error': 'No owner email'}
    
    context = {
        'owner_name': owner_name.split()[0] if owner_name else 'there',
        'business_name': business.name,
        'business_email': owner_email,
    }
    
    if campaign.custom_html_content:
        html_content = campaign.custom_html_content
        for key, value in context.items():
            html_content = html_content.replace('{{' + key + '}}', str(value))
        subject = campaign.custom_subject or template.subject
        for key, value in context.items():
            subject = subject.replace('{{' + key + '}}', str(value))
    else:
        subject, html_content, _ = template.render(context)
    
    mailer = Mailer()
    
    try:
        success = mailer.send_raw_email(
            to_email=owner_email,
            subject=subject,
            body_html=html_content,
            body_text=template.plain_text_content or '',
            fail_silently=False
        )
        
        return {
            'success': success,
            'recipient': owner_email,
            'subject': subject
        }
    except Exception as e:
        logger.error(f"Single email failed: {e}")
        return {'error': str(e)}
