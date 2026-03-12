"""
Surveys & Feedback Models

Comprehensive models for collecting customer feedback after ticket lifecycle events.
Supports CSAT, NPS, and custom surveys with various question types.
"""
import uuid
import secrets
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class SurveySettings(models.Model):
    """
    Global survey settings - controls surveys behavior globally.
    Only one instance should exist per tenant.
    """
    enabled = models.BooleanField(
        default=True,
        help_text="Enable or disable surveys globally"
    )
    
    # Default survey behavior
    default_send_delay = models.IntegerField(
        default=30,
        validators=[MinValueValidator(0)],
        help_text="Default delay before sending survey (in minutes)"
    )
    
    # Response settings
    allow_anonymous_responses = models.BooleanField(
        default=False,
        help_text="Allow users to submit anonymous responses"
    )
    response_expiry_days = models.IntegerField(
        default=7,
        validators=[MinValueValidator(1), MaxValueValidator(365)],
        help_text="Number of days before survey link expires"
    )
    
    # Rating scale defaults
    default_rating_scale = models.IntegerField(
        default=5,
        choices=[(5, '1-5 Scale'), (10, '1-10 Scale')],
        help_text="Default rating scale for CSAT questions"
    )
    
    # Reminder settings
    send_reminders = models.BooleanField(
        default=True,
        help_text="Send reminder emails for incomplete surveys"
    )
    reminder_days = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1)],
        help_text="Days after initial email to send reminder"
    )
    max_reminders = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text="Maximum number of reminders to send"
    )
    
    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Survey Settings"
        verbose_name_plural = "Survey Settings"
    
    def __str__(self):
        return f"Survey Settings ({'Enabled' if self.enabled else 'Disabled'})"
    
    @classmethod
    def get_settings(cls):
        """Get or create the survey settings instance"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings


class Survey(models.Model):
    """
    Survey definition - defines the survey structure and behavior.
    """
    
    class TriggerEvent(models.TextChoices):
        TICKET_RESOLVED = 'resolved', 'After Ticket Resolved'
        TICKET_CLOSED = 'closed', 'After Ticket Closed'
        SLA_BREACH = 'sla_breach', 'After SLA Breach'
        MANUAL = 'manual', 'Manual Trigger'
    
    class SurveyType(models.TextChoices):
        CSAT = 'csat', 'Customer Satisfaction (CSAT)'
        RESOLUTION = 'resolution', 'Resolution Quality'
        AGENT_PERFORMANCE = 'agent', 'Agent Performance'
        NPS = 'nps', 'Net Promoter Score (NPS)'
        CUSTOM = 'custom', 'Custom Survey'
    
    # Basic Information
    name = models.CharField(max_length=200, help_text="Survey name")
    description = models.TextField(blank=True, help_text="Survey description shown to respondents")
    internal_notes = models.TextField(blank=True, help_text="Internal notes (not shown to respondents)")
    
    # Survey type and trigger
    survey_type = models.CharField(
        max_length=20,
        choices=SurveyType.choices,
        default=SurveyType.CSAT,
        help_text="Type of survey"
    )
    trigger_event = models.CharField(
        max_length=20,
        choices=TriggerEvent.choices,
        default=TriggerEvent.TICKET_RESOLVED,
        help_text="Event that triggers the survey"
    )
    
    # Timing
    send_delay = models.IntegerField(
        default=30,
        validators=[MinValueValidator(0)],
        help_text="Delay before sending survey (in minutes)"
    )
    expiry_days = models.IntegerField(
        default=7,
        validators=[MinValueValidator(1)],
        help_text="Number of days the survey link remains valid"
    )
    
    # Response rules
    is_active = models.BooleanField(default=True, help_text="Survey is active and can be sent")
    allow_multiple_responses = models.BooleanField(
        default=False,
        help_text="Allow multiple responses from same user per ticket"
    )
    is_anonymous = models.BooleanField(
        default=False,
        help_text="Allow anonymous responses"
    )
    
    # Appearance
    thank_you_message = models.TextField(
        default="Thank you for your feedback! Your response helps us improve our service.",
        help_text="Message shown after survey completion"
    )
    
    # Default survey for this trigger event
    is_default = models.BooleanField(
        default=False,
        help_text="Default survey for this trigger event"
    )
    
    # Target filtering (optional)
    target_departments = models.ManyToManyField(
        'ticket.Department',
        blank=True,
        related_name='surveys',
        help_text="Only trigger for tickets in these departments (empty = all)"
    )
    target_priorities = models.JSONField(
        default=list,
        blank=True,
        help_text="Only trigger for tickets with these priorities (empty = all)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_surveys'
    )
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'trigger_event']),
            models.Index(fields=['survey_type']),
        ]
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Ensure only one default survey per trigger event
        if self.is_default:
            Survey.objects.filter(
                trigger_event=self.trigger_event,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
    
    @property
    def question_count(self):
        return self.questions.count()
    
    @property
    def response_count(self):
        return self.responses.count()
    
    @property
    def completion_rate(self):
        """Calculate survey completion rate"""
        total = self.invitations.count()
        if total == 0:
            return 0
        completed = self.invitations.filter(status='completed').count()
        return round((completed / total) * 100, 1)


class SurveyQuestion(models.Model):
    """
    Individual question within a survey.
    """
    
    class QuestionType(models.TextChoices):
        RATING = 'rating', 'Rating (Stars/Numeric)'
        SINGLE_CHOICE = 'single_choice', 'Single Choice (Radio)'
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice (Checkbox)'
        TEXT = 'text', 'Free Text'
        YES_NO = 'yes_no', 'Yes / No'
        NPS = 'nps', 'NPS (0-10 Scale)'
    
    survey = models.ForeignKey(
        Survey,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    
    question_text = models.TextField(help_text="The question to ask")
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.RATING
    )
    
    # Validation rules
    is_required = models.BooleanField(default=True, help_text="Response is required")
    
    # For rating questions
    rating_scale = models.IntegerField(
        default=5,
        validators=[MinValueValidator(2), MaxValueValidator(10)],
        help_text="Maximum value for rating scale"
    )
    rating_labels = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom labels for rating values, e.g., {'1': 'Poor', '5': 'Excellent'}"
    )
    
    # For text questions
    min_length = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Minimum text length (0 = no minimum)"
    )
    max_length = models.IntegerField(
        default=2000,
        validators=[MinValueValidator(1)],
        help_text="Maximum text length"
    )
    placeholder_text = models.CharField(
        max_length=255,
        blank=True,
        help_text="Placeholder text for text input"
    )
    
    # Display order
    order = models.PositiveIntegerField(default=0)
    
    # Conditional display (optional - show based on previous answer)
    conditional_question = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dependent_questions',
        help_text="Only show if this question has a specific answer"
    )
    conditional_value = models.CharField(
        max_length=255,
        blank=True,
        help_text="Show only when conditional question has this value"
    )
    
    class Meta:
        ordering = ['order', 'id']
        indexes = [
            models.Index(fields=['survey', 'order']),
        ]
    
    def __str__(self):
        return f"{self.survey.name} - Q{self.order}: {self.question_text[:50]}"


class SurveyChoice(models.Model):
    """
    Choice options for single/multiple choice questions.
    """
    question = models.ForeignKey(
        SurveyQuestion,
        on_delete=models.CASCADE,
        related_name='choices'
    )
    
    label = models.CharField(max_length=255, help_text="Choice label shown to user")
    value = models.CharField(max_length=255, help_text="Value stored in response")
    
    # Optional additional properties
    is_other = models.BooleanField(
        default=False,
        help_text="This is an 'Other' option that allows text input"
    )
    
    # Display order
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order', 'id']
    
    def __str__(self):
        return f"{self.question.question_text[:30]} - {self.label}"


class SurveyInvitation(models.Model):
    """
    Tracks survey invitations sent to users.
    Each invitation has a unique token for anonymous access.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending (Queued)'
        SENT = 'sent', 'Sent'
        OPENED = 'opened', 'Opened'
        COMPLETED = 'completed', 'Completed'
        EXPIRED = 'expired', 'Expired'
        BOUNCED = 'bounced', 'Email Bounced'
    
    survey = models.ForeignKey(
        Survey,
        on_delete=models.CASCADE,
        related_name='invitations'
    )
    
    # Token for secure access
    token = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        editable=False
    )
    
    # Ticket association
    ticket = models.ForeignKey(
        'ticket.Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='survey_invitations'
    )
    
    # User (may be null for anonymous surveys)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='survey_invitations'
    )
    
    # Email to send to (useful for non-authenticated users)
    email = models.EmailField(help_text="Email address to send survey invitation")
    user_name = models.CharField(max_length=255, blank=True, help_text="Name of the recipient")
    
    # Agent who handled the ticket (for agent performance surveys)
    agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='survey_invitations_as_agent'
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Timing
    scheduled_at = models.DateTimeField(
        help_text="When the survey should be sent"
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(
        help_text="When the survey link expires"
    )
    
    # Reminders
    reminder_count = models.IntegerField(default=0)
    last_reminder_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional context data (ticket info, etc.)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'scheduled_at']),
            models.Index(fields=['token']),
            models.Index(fields=['ticket', 'survey']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"Invitation for {self.email} - {self.survey.name}"
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(48)
        if not self.expires_at:
            self.expires_at = self.scheduled_at + timezone.timedelta(days=self.survey.expiry_days)
        super().save(*args, **kwargs)
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def can_respond(self):
        """Check if this invitation can still receive a response"""
        if self.is_expired:
            return False
        if self.status == self.Status.COMPLETED and not self.survey.allow_multiple_responses:
            return False
        return True


class SurveyResponse(models.Model):
    """
    A completed survey response from a user.
    """
    survey = models.ForeignKey(
        Survey,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    
    # Link to invitation
    invitation = models.ForeignKey(
        SurveyInvitation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='responses'
    )
    
    # Ticket association
    ticket = models.ForeignKey(
        'ticket.Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='survey_responses'
    )
    
    # User who submitted (null for anonymous)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='survey_responses'
    )
    
    # Agent being rated (for agent performance surveys)
    agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='survey_responses_as_agent'
    )
    
    # Response metadata
    is_anonymous = models.BooleanField(default=False)
    
    # Computed scores
    overall_rating = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Computed average rating from all rating questions"
    )
    nps_score = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text="NPS score if survey contains NPS question"
    )
    sentiment = models.CharField(
        max_length=20,
        choices=[
            ('positive', 'Positive'),
            ('neutral', 'Neutral'),
            ('negative', 'Negative'),
        ],
        blank=True,
        help_text="Overall sentiment based on responses"
    )
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['survey', '-submitted_at']),
            models.Index(fields=['ticket']),
            models.Index(fields=['agent']),
            models.Index(fields=['sentiment']),
            models.Index(fields=['overall_rating']),
        ]
    
    def __str__(self):
        user_str = self.user.get_full_name() if self.user else "Anonymous"
        return f"Response to {self.survey.name} by {user_str}"
    
    def calculate_overall_rating(self):
        """Calculate and save overall rating from rating questions"""
        rating_answers = self.answers.filter(
            question__question_type__in=['rating', 'nps']
        ).exclude(numeric_value__isnull=True)
        
        if rating_answers.exists():
            total = sum(a.numeric_value for a in rating_answers)
            count = rating_answers.count()
            self.overall_rating = total / count
        
        # Get NPS score if present
        nps_answer = self.answers.filter(question__question_type='nps').first()
        if nps_answer and nps_answer.numeric_value is not None:
            self.nps_score = nps_answer.numeric_value
        
        # Determine sentiment
        if self.overall_rating:
            if self.overall_rating >= 4:
                self.sentiment = 'positive'
            elif self.overall_rating >= 2.5:
                self.sentiment = 'neutral'
            else:
                self.sentiment = 'negative'
        
        self.save(update_fields=['overall_rating', 'nps_score', 'sentiment'])


class SurveyAnswer(models.Model):
    """
    Individual answer to a survey question.
    """
    response = models.ForeignKey(
        SurveyResponse,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    question = models.ForeignKey(
        SurveyQuestion,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    
    # Answer values (one of these will be populated based on question type)
    text_value = models.TextField(blank=True, help_text="Text answer")
    numeric_value = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Numeric/rating answer"
    )
    choice_values = models.JSONField(
        default=list,
        blank=True,
        help_text="Selected choice values for single/multiple choice"
    )
    boolean_value = models.BooleanField(null=True, blank=True, help_text="Yes/No answer")
    
    # For 'Other' option text
    other_text = models.TextField(blank=True, help_text="Text for 'Other' option")
    
    class Meta:
        ordering = ['question__order']
        unique_together = [['response', 'question']]
    
    def __str__(self):
        return f"Answer to {self.question.question_text[:30]}"
    
    @property
    def display_value(self):
        """Return a human-readable version of the answer"""
        q_type = self.question.question_type
        
        if q_type == 'text':
            return self.text_value
        elif q_type in ['rating', 'nps']:
            return str(self.numeric_value) if self.numeric_value else ''
        elif q_type in ['single_choice', 'multiple_choice']:
            if self.choice_values:
                return ', '.join(self.choice_values)
            return ''
        elif q_type == 'yes_no':
            if self.boolean_value is None:
                return ''
            return 'Yes' if self.boolean_value else 'No'
        return ''


class SurveyEmailTemplate(models.Model):
    """
    Email templates for survey communications.
    """
    
    class TemplateType(models.TextChoices):
        INVITATION = 'invitation', 'Survey Invitation'
        REMINDER = 'reminder', 'Survey Reminder'
        THANK_YOU = 'thank_you', 'Thank You / Confirmation'
    
    name = models.CharField(max_length=200, help_text="Template name")
    template_type = models.CharField(
        max_length=20,
        choices=TemplateType.choices,
        default=TemplateType.INVITATION
    )
    
    subject = models.CharField(max_length=255, help_text="Email subject line")
    body_html = models.TextField(help_text="HTML email body")
    body_text = models.TextField(blank=True, help_text="Plain text email body (fallback)")
    
    # Default template for this type
    is_default = models.BooleanField(default=False)
    
    # Active status
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['template_type', 'name']
    
    def __str__(self):
        return f"{self.get_template_type_display()} - {self.name}"
    
    def save(self, *args, **kwargs):
        # Ensure only one default template per type
        if self.is_default:
            SurveyEmailTemplate.objects.filter(
                template_type=self.template_type,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class SurveyAnalytics(models.Model):
    """
    Pre-computed analytics for survey performance.
    Updated periodically or on response submission.
    """
    survey = models.OneToOneField(
        Survey,
        on_delete=models.CASCADE,
        related_name='analytics'
    )
    
    # Response counts
    total_invitations = models.IntegerField(default=0)
    total_responses = models.IntegerField(default=0)
    total_completed = models.IntegerField(default=0)
    
    # Rates
    response_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Percentage of invitations that got responses"
    )
    completion_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text="Percentage of responses that were completed"
    )
    
    # Scores
    average_rating = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True
    )
    nps_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Net Promoter Score (-100 to 100)"
    )
    csat_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Customer Satisfaction Score (percentage)"
    )
    
    # Sentiment distribution
    positive_count = models.IntegerField(default=0)
    neutral_count = models.IntegerField(default=0)
    negative_count = models.IntegerField(default=0)
    
    # Last updated
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Survey Analytics"
    
    def __str__(self):
        return f"Analytics for {self.survey.name}"
    
    def recalculate(self):
        """Recalculate all analytics for this survey"""
        survey = self.survey
        
        # Counts
        self.total_invitations = survey.invitations.count()
        self.total_responses = survey.responses.count()
        self.total_completed = survey.invitations.filter(status='completed').count()
        
        # Rates
        if self.total_invitations > 0:
            self.response_rate = (self.total_responses / self.total_invitations) * 100
            self.completion_rate = (self.total_completed / self.total_invitations) * 100
        
        # Average rating
        responses_with_rating = survey.responses.exclude(overall_rating__isnull=True)
        if responses_with_rating.exists():
            from django.db.models import Avg
            self.average_rating = responses_with_rating.aggregate(
                avg=Avg('overall_rating')
            )['avg']
        
        # NPS Score calculation
        nps_responses = survey.responses.exclude(nps_score__isnull=True)
        if nps_responses.exists():
            promoters = nps_responses.filter(nps_score__gte=9).count()
            detractors = nps_responses.filter(nps_score__lte=6).count()
            total_nps = nps_responses.count()
            self.nps_score = ((promoters - detractors) / total_nps) * 100
        
        # CSAT Score (percentage of 4+ ratings on 5-point scale)
        csat_responses = survey.responses.exclude(overall_rating__isnull=True)
        if csat_responses.exists():
            satisfied = csat_responses.filter(overall_rating__gte=4).count()
            total_csat = csat_responses.count()
            self.csat_score = (satisfied / total_csat) * 100
        
        # Sentiment distribution
        self.positive_count = survey.responses.filter(sentiment='positive').count()
        self.neutral_count = survey.responses.filter(sentiment='neutral').count()
        self.negative_count = survey.responses.filter(sentiment='negative').count()
        
        self.save()
