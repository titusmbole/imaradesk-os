from django.db import models
from django.utils import timezone

class SMTP(models.Model):
    host = models.CharField(max_length=255, verbose_name="SMTP Host")
    port = models.PositiveIntegerField(verbose_name="SMTP Port")
    username = models.CharField(max_length=255, verbose_name="SMTP Username")
    password = models.CharField(max_length=255, verbose_name="SMTP Password")
    use_tls = models.BooleanField(default=True, verbose_name="Use TLS")
    use_ssl = models.BooleanField(default=False, verbose_name="Use SSL")
    default_from_email = models.EmailField(verbose_name="Default From Email")
    sender_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Sender Name")
    reply_to_email = models.EmailField(blank=True, null=True, verbose_name="Reply-To Email")

    class Meta:
        verbose_name = "SMTP Setting"
        verbose_name_plural = "SMTP Settings"
        db_table = 'setting_smtp'

class App(models.Model):
    """
    Represents an installable app/plugin in the marketplace
    """
    CATEGORY_CHOICES = [
        ('automation', 'Automation'),
        ('communication', 'Communication'),
        ('productivity', 'Productivity'),
        ('asset', 'Asset Management'),
        ('reporting', 'Reporting & Analytics'),
        ('integration', 'Integration'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('coming_soon', 'Coming Soon'),
        ('beta', 'Beta'),
        ('deprecated', 'Deprecated'),
    ]
    
    name = models.CharField(max_length=200, help_text="App name")
    slug = models.SlugField(unique=True, help_text="URL-friendly identifier")
    description = models.TextField(help_text="Short description")
    long_description = models.TextField(help_text="Detailed description with features")
    icon = models.CharField(max_length=50, default='puzzle', help_text="Icon name or emoji")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Monthly price in USD")
    is_free = models.BooleanField(default=False, help_text="Is this app free?")
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_featured = models.BooleanField(default=False, help_text="Show in featured apps")
    
    # Metadata
    version = models.CharField(max_length=20, default='1.0.0')
    developer = models.CharField(max_length=200, default='ImaraDesk')
    install_count = models.IntegerField(default=0, help_text="Number of installations")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "App"
        verbose_name_plural = "Apps"
        ordering = ['-is_featured', 'name']
        db_table = 'setting_apps'
    
    def __str__(self):
        return self.name


class InstalledApp(models.Model):
    """
    Tracks which apps are installed for each tenant.
    Records are never deleted to prevent trial abuse.
    """
    app = models.ForeignKey(App, on_delete=models.CASCADE, related_name='installations')
    installed_at = models.DateTimeField(auto_now_add=True, null=True, blank=True,)
    first_installed_at = models.DateTimeField(auto_now_add=True, null=True, blank=True, help_text="Original installation date - never changes")
    is_active = models.BooleanField(default=True, help_text="Is the app currently active?")
    uninstalled_at = models.DateTimeField(null=True, blank=True, help_text="When the app was uninstalled")
    
    # Subscription info
    subscription_status = models.CharField(
        max_length=20,
        choices=[
            ('trial', 'Trial'),
            ('active', 'Active'),
            ('cancelled', 'Cancelled'),
            ('suspended', 'Suspended'),
            ('expired', 'Expired'),
        ],
        default='trial'
    )
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    next_billing_date = models.DateTimeField(null=True, blank=True)
    
    # Settings (JSON field for app-specific configuration)
    settings = models.JSONField(default=dict, blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Installed App"
        verbose_name_plural = "Installed Apps"
        unique_together = ['app']  # One installation per app per tenant
        db_table = 'setting_installed_apps'
    
    def __str__(self):
        return f"{self.app.name} - {self.subscription_status}"
    
    @property
    def is_trial_expired(self):
        """Check if trial period has ended."""
        if self.subscription_status != 'trial':
            return False
        if self.trial_ends_at is None:
            return False
        from django.utils import timezone
        return timezone.now() > self.trial_ends_at
    
    @property
    def trial_days_remaining(self):
        """Calculate remaining trial days."""
        if self.trial_ends_at is None:
            return None
        from django.utils import timezone
        remaining = self.trial_ends_at - timezone.now()
        days = remaining.days
        return max(0, days)


class SlackIntegration(models.Model):
    """
    Stores Slack workspace integration credentials per tenant.
    Each tenant can connect to their own Slack workspace using the shared Slack app.
    """
    # Link to SettingsIntegrations for status tracking
    app = models.ForeignKey(
        'SettingsIntegrations',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='slack_connections',
        help_text="Reference to the integration app entry"
    )
    
    # Workspace identification
    team_id = models.CharField(
        max_length=50, 
        unique=True, 
        help_text="Slack workspace/team ID"
    )
    team_name = models.CharField(
        max_length=255, 
        help_text="Slack workspace name"
    )
    
    # OAuth tokens
    access_token = models.TextField(
        help_text="Bot access token (xoxb-...)"
    )
    bot_user_id = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="Bot user ID"
    )
    
    # Authed user info (user who installed the app)
    authed_user_id = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="ID of user who authorized the app"
    )
    
    # Scopes granted
    scope = models.TextField(
        blank=True,
        null=True,
        help_text="Comma-separated list of granted scopes"
    )
    
    # Configuration
    default_channel_id = models.CharField(
        max_length=50, 
        blank=True, 
        null=True,
        help_text="Default channel for notifications"
    )
    default_channel_name = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Name of default channel"
    )
    
    # Notification settings
    notify_new_ticket = models.BooleanField(
        default=True,
        help_text="Send notification when new ticket is created"
    )
    notify_ticket_assigned = models.BooleanField(
        default=True,
        help_text="Send notification when ticket is assigned"
    )
    notify_ticket_resolved = models.BooleanField(
        default=True,
        help_text="Send notification when ticket is resolved"
    )
    notify_sla_breach = models.BooleanField(
        default=True,
        help_text="Send notification on SLA breach"
    )
    notify_new_comment = models.BooleanField(
        default=False,
        help_text="Send notification on new comments"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Is integration active"
    )
    
    # Timestamps
    connected_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used_at = models.DateTimeField(
        blank=True, 
        null=True,
        help_text="Last time a message was sent"
    )
    
    class Meta:
        verbose_name = "Slack Integration"
        verbose_name_plural = "Slack Integrations"
        db_table = 'setting_slack_integration'
    
    def __str__(self):
        return f"Slack: {self.team_name}"
    
    @classmethod
    def get_integration(cls):
        """Get the Slack integration for current tenant (singleton per tenant)"""
        return cls.objects.first()
    
    def update_last_used(self):
        """Update last_used_at timestamp"""
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])
    
    def save(self, *args, **kwargs):
        """Override save to auto-link app and update is_integrated status"""
        # Auto-link to Slack app if not set
        if not self.app_id:
            try:
                slack_app = SettingsIntegrations.objects.filter(name__iexact='Slack').first()
                if slack_app:
                    self.app = slack_app
            except:
                pass
        
        super().save(*args, **kwargs)
        
        # Update is_integrated status on linked app
        if self.app and self.access_token:
            SettingsIntegrations.objects.filter(pk=self.app_id).update(is_integrated=True)
    
    def delete(self, *args, **kwargs):
        """Override delete to update is_integrated status"""
        app_id = self.app_id
        super().delete(*args, **kwargs)
        
        # Set is_integrated to False when deleted
        if app_id:
            SettingsIntegrations.objects.filter(pk=app_id).update(is_integrated=False)


class TeamsIntegration(models.Model):
    """
    Stores Microsoft Teams integration credentials per tenant.
    Each tenant can connect to their own Teams workspace using the shared Azure AD app.
    Uses multi-tenant Azure AD app registration.
    """
    # Link to SettingsIntegrations for status tracking
    app = models.ForeignKey(
        'SettingsIntegrations',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='teams_connections',
        help_text="Reference to the integration app entry"
    )
    
    # Tenant identification (Azure AD tenant, not Django tenant)
    tenant_id = models.CharField(
        max_length=100, 
        unique=True, 
        help_text="Azure AD tenant ID"
    )
    tenant_name = models.CharField(
        max_length=255, 
        blank=True,
        null=True,
        help_text="Organization name from Azure AD"
    )
    
    # OAuth tokens
    access_token = models.TextField(
        help_text="Microsoft Graph API access token"
    )
    refresh_token = models.TextField(
        blank=True,
        null=True,
        help_text="OAuth refresh token for token renewal"
    )
    token_expires_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When the access token expires"
    )
    
    # User who authorized the app
    authed_user_id = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Azure AD user ID who authorized the app"
    )
    authed_user_email = models.EmailField(
        blank=True,
        null=True,
        help_text="Email of user who authorized"
    )
    
    # Scopes granted
    scope = models.TextField(
        blank=True,
        null=True,
        help_text="Space-separated list of granted scopes"
    )
    
    # Configuration - Default Team and Channel
    default_team_id = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Default Teams team ID for notifications"
    )
    default_team_name = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Name of default team"
    )
    default_channel_id = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Default channel ID for notifications"
    )
    default_channel_name = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        help_text="Name of default channel"
    )
    
    # Webhook URL for incoming notifications (alternative to Graph API)
    webhook_url = models.URLField(
        blank=True,
        null=True,
        help_text="Teams incoming webhook URL"
    )
    
    # Notification settings
    notify_new_ticket = models.BooleanField(
        default=True,
        help_text="Send notification when new ticket is created"
    )
    notify_ticket_assigned = models.BooleanField(
        default=True,
        help_text="Send notification when ticket is assigned"
    )
    notify_ticket_resolved = models.BooleanField(
        default=True,
        help_text="Send notification when ticket is resolved"
    )
    notify_sla_breach = models.BooleanField(
        default=True,
        help_text="Send notification on SLA breach"
    )
    notify_new_comment = models.BooleanField(
        default=False,
        help_text="Send notification on new comments"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Is integration active"
    )
    
    # Timestamps
    connected_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used_at = models.DateTimeField(
        blank=True, 
        null=True,
        help_text="Last time a message was sent"
    )
    
    class Meta:
        verbose_name = "Teams Integration"
        verbose_name_plural = "Teams Integrations"
        db_table = 'setting_teams_integration'
    
    def __str__(self):
        return f"Teams: {self.tenant_name or self.tenant_id}"
    
    @classmethod
    def get_integration(cls):
        """Get the Teams integration for current tenant (singleton per tenant)"""
        return cls.objects.first()
    
    def update_last_used(self):
        """Update last_used_at timestamp"""
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])
    
    def is_token_expired(self):
        """Check if the access token is expired"""
        if not self.token_expires_at:
            return True
        return timezone.now() >= self.token_expires_at
    
    def save(self, *args, **kwargs):
        """Override save to auto-link app and update is_integrated status"""
        # Auto-link to Teams app if not set
        if not self.app_id:
            try:
                teams_app = SettingsIntegrations.objects.filter(name__iexact='Microsoft Teams').first()
                if teams_app:
                    self.app = teams_app
            except:
                pass
        
        super().save(*args, **kwargs)
        
        # Update is_integrated status on linked app
        if self.app and self.access_token:
            SettingsIntegrations.objects.filter(pk=self.app_id).update(is_integrated=True)
    
    def delete(self, *args, **kwargs):
        """Override delete to update is_integrated status"""
        app_id = self.app_id
        super().delete(*args, **kwargs)
        
        # Set is_integrated to False when deleted
        if app_id:
            SettingsIntegrations.objects.filter(pk=app_id).update(is_integrated=False)


class TelegramIntegration(models.Model):
    """
    Stores Telegram bot integration settings per tenant.
    Each tenant can configure their own Telegram bot for ticket support.
    """
    # Link to SettingsIntegrations for status tracking
    app = models.ForeignKey(
        'SettingsIntegrations',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='telegram_connections',
        help_text="Reference to the integration app entry"
    )
    
    # Bot credentials
    bot_token = models.CharField(
        max_length=255,
        help_text="Telegram Bot Token from @BotFather"
    )
    bot_username = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Bot username (without @)"
    )
    
    # Webhook settings
    webhook_url = models.URLField(
        blank=True,
        null=True,
        help_text="Webhook URL for receiving messages"
    )
    webhook_secret = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Secret token for webhook validation"
    )
    
    # Auto ticket creation settings
    auto_create_tickets = models.BooleanField(
        default=True,
        help_text="Automatically create tickets from new conversations"
    )
    default_priority = models.CharField(
        max_length=20,
        default='normal',
        help_text="Default priority for tickets created from Telegram"
    )
    
    # Welcome message
    welcome_message = models.TextField(
        blank=True,
        default="Hello! Welcome to our support. Send a message to create a support ticket.",
        help_text="Message sent when a new user starts a conversation"
    )
    
    # Notification settings
    notify_new_ticket = models.BooleanField(
        default=True,
        help_text="Send notification when new ticket is created"
    )
    notify_ticket_resolved = models.BooleanField(
        default=True,
        help_text="Send notification when ticket is resolved"
    )
    notify_new_comment = models.BooleanField(
        default=True,
        help_text="Send notification on new comments/replies"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Is integration active"
    )
    
    # Timestamps
    connected_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Last time a message was processed"
    )
    
    class Meta:
        verbose_name = "Telegram Integration"
        verbose_name_plural = "Telegram Integrations"
        db_table = 'setting_telegram_integration'
    
    def __str__(self):
        return f"Telegram: {self.bot_username or 'Bot'}"
    
    @classmethod
    def get_integration(cls):
        """Get the Telegram integration for current tenant (singleton per tenant)"""
        return cls.objects.filter(is_active=True).first()
    
    def update_last_used(self):
        """Update last_used_at timestamp"""
        self.last_used_at = timezone.now()
        self.save(update_fields=['last_used_at'])
    
    def save(self, *args, **kwargs):
        """Override save to auto-link app and update is_integrated status"""
        # Auto-link to Telegram app if not set
        if not self.app_id:
            try:
                telegram_app = SettingsIntegrations.objects.filter(name__iexact='Telegram').first()
                if telegram_app:
                    self.app = telegram_app
            except:
                pass
        
        super().save(*args, **kwargs)
        
        # Update is_integrated status on linked app
        if self.app and self.bot_token:
            SettingsIntegrations.objects.filter(pk=self.app_id).update(is_integrated=True)
    
    def delete(self, *args, **kwargs):
        """Override delete to update is_integrated status"""
        app_id = self.app_id
        super().delete(*args, **kwargs)
        
        # Set is_integrated to False when deleted
        if app_id:
            SettingsIntegrations.objects.filter(pk=app_id).update(is_integrated=False)


class TelegramChat(models.Model):
    """
    Maps Telegram chats to tickets for tracking conversations.
    Enables routing replies to the correct ticket.
    """
    # Telegram chat info
    chat_id = models.BigIntegerField(
        unique=True,
        db_index=True,
        help_text="Telegram chat ID"
    )
    username = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Telegram username"
    )
    first_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="User's first name"
    )
    last_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="User's last name"
    )
    
    # Link to ticket
    ticket = models.ForeignKey(
        'ticket.Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='telegram_chats',
        help_text="Associated ticket"
    )
    
    # Link to user (if matched)
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='telegram_chats',
        help_text="Linked system user"
    )
    
    # Last message tracking for context
    last_message_id = models.BigIntegerField(
        null=True,
        blank=True,
        help_text="Last processed message ID"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Is this chat active"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Telegram Chat"
        verbose_name_plural = "Telegram Chats"
        db_table = 'setting_telegram_chat'
        indexes = [
            models.Index(fields=['chat_id']),
            models.Index(fields=['ticket']),
        ]
    
    def __str__(self):
        name = self.username or f"{self.first_name or ''} {self.last_name or ''}".strip() or str(self.chat_id)
        return f"Chat: {name}"
    
    @property
    def display_name(self):
        """Get a display name for this chat"""
        if self.username:
            return f"@{self.username}"
        name = f"{self.first_name or ''} {self.last_name or ''}".strip()
        return name or str(self.chat_id)


class EmailTemplate(models.Model):
    """
    Email templates for tenant communications
    """
    TYPE_CHOICES = [
        # Ticket template
        ('ticket_created', 'Ticket Created'),
        ('ticket_assigned', 'Ticket Assigned'),
        ('ticket_resolved', 'Ticket Resolved'),
        ('ticket_closed', 'Ticket Closed'),
        ('ticket_updated', 'Ticket Updated'),
        ('ticket_status_changed', 'Ticket Status Changed'),
        ('ticket_priority_changed', 'Ticket Priority Changed'),
        ('ticket_merged', 'Ticket Merged'),
        ('new_activity_notice', 'New Activity Notice'),
        ('new_message_auto_response', 'Message Auto Response'),
        ('new_ticket_notice', 'New Ticket Notice (Agent)'),
        ('response_reply_template', 'Agent Response Reply'),
        ('internal_activity_alert', 'Internal Activity Alert'),
        ('new_message_alert', 'New Message Alert (Agent)'),
        ('overdue_ticket_alert', 'Overdue Ticket Alert'),
        ('ticket_transfer_alert', 'Ticket Transfer Alert'),
        
        # Task templates
        ('task_new_activity_alert', 'Task Activity Alert (Agent)'),
        ('task_new_activity_notice', 'Task Activity Notice (User)'),
        ('new_task_alert', 'New Task Alert'),
        ('overdue_task_alert', 'Overdue Task Alert'),
        ('task_assignment_alert', 'Task Assignment Alert'),
        ('task_transfer_alert', 'Task Transfer Alert'),
        
        # SLA templates
        ('sla_reminder', 'SLA Reminder'),
        ('sla_escalation_notice_task', 'SLA Escalation Notice (Task)'),
        ('sla_escalation_notice', 'SLA Escalation Notice (Ticket)'),
        ('sla_first_response_breach', 'First Response SLA Breach'),
        ('sla_resolution_breach', 'Resolution SLA Breach'),
        ('sla_resolved_notice', 'Ticket Resolved Within SLA'),
        ('sla_breach_warning', 'SLA Breach Warning'),
        ('sla_breached', 'SLA Breached'),
        
        # Comment templates
        ('comment_add_notice', 'Comment Added Notice'),
        ('comment_reply_notice', 'Comment Reply Notice'),
        ('user_mentioned', 'User Mentioned in Ticket'),
        
        # User templates
        ('welcome_user', 'Welcome Email'),
        ('password_reset', 'Password Reset'),
        
        # Survey templates
        ('survey_invitation', 'Survey Invitation'),
        ('survey_reminder', 'Survey Reminder'),
        
        # Report templates
        ('weekly_report', 'Weekly Report'),
        
        # Custom
        ('custom', 'Custom Template'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('draft', 'Draft'),
        ('archived', 'Archived'),
    ]
    
    name = models.CharField(max_length=200, help_text="Template name")
    template_type = models.CharField(max_length=50, choices=TYPE_CHOICES, unique=True, help_text="Template type")
    subject = models.CharField(max_length=500, help_text="Email subject with placeholders like {{ticket_number}}")
    body_html = models.TextField(help_text="HTML email body with placeholders")
    body_text = models.TextField(blank=True, help_text="Plain text fallback")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Available variables for this template
    available_variables = models.JSONField(
        default=dict,
        help_text="Available variables like {'ticket_number': 'Ticket number', 'user_name': 'User name'}"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Email Template"
        verbose_name_plural = "Email Templates"
        ordering = ['template_type']
        db_table = 'setting_email_templates'
    
    def __str__(self):
        return f"{self.name} ({self.template_type})"
    
    @staticmethod
    def get_base_template():
        """
        Returns the base HTML email template wrapper.
        The body content will be inserted where {{email_body}} placeholder is.
        """
        return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{email_title}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 40px 24px 40px; border-bottom: 1px solid #e5e5e5;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">{{email_title}}</h1>
                        </td>
                    </tr>
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 32px 40px;">
                            <div style="font-size: 15px; line-height: 1.6; color: #4a4a4a;">
{{email_body}}
                            </div>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 13px; color: #888888; text-align: center;">
                                {{company_name}}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>'''
    
    def render(self, context):
        """
        Render template with context variables
        
        Args:
            context: Dictionary of variables to replace in template
        
        Returns:
            Tuple of (rendered_subject, rendered_body_html, rendered_body_text)
        """
        import re
        
        def replace_vars(text, ctx):
            # Replace {{variable}} with context values
            def replacer(match):
                var_name = match.group(1).strip()
                return str(ctx.get(var_name, match.group(0)))
            return re.sub(r'{{\s*([^}]+)\s*}}', replacer, text)
        
        # Convert plain text body to HTML paragraphs
        def text_to_html(text):
            if not text:
                return ''
            # First replace variables in the text
            text = replace_vars(text, context)
            # Split by double newlines for paragraphs
            paragraphs = text.strip().split('\n\n')
            html_parts = []
            for para in paragraphs:
                # Handle single line breaks within paragraphs
                lines = para.strip().split('\n')
                formatted_lines = '<br>'.join(line.strip() for line in lines if line.strip())
                if formatted_lines:
                    html_parts.append(f'<p style="margin: 0 0 16px 0;">{formatted_lines}</p>')
            return '\n'.join(html_parts)
        
        rendered_subject = replace_vars(self.subject, context)
        
        # Convert body_text to HTML and wrap in base template
        body_html_content = text_to_html(self.body_text or self.body_html)
        
        # Get the base template and insert content
        base_template = self.get_base_template()
        rendered_html = base_template.replace('{{email_title}}', self.name)
        rendered_html = rendered_html.replace('{{email_body}}', body_html_content)
        rendered_html = replace_vars(rendered_html, context)
        
        # Plain text version
        rendered_text = replace_vars(self.body_text, context) if self.body_text else ''
        
        return rendered_subject, rendered_html, rendered_text


class SecuritySettings(models.Model):
    """
    Security configuration settings - Two-Factor Authentication
    """
    # Two-Factor Authentication Methods
    enable_email_2fa = models.BooleanField(
        default=True,
        help_text="Allow email-based two-factor authentication"
    )
    enable_authenticator_2fa = models.BooleanField(
        default=True,
        help_text="Allow authenticator app (TOTP) two-factor authentication"
    )
    
    # 2FA Requirements
    require_2fa_for_admins = models.BooleanField(
        default=False,
        help_text="Require 2FA for all admin users"
    )
    require_2fa_for_all_users = models.BooleanField(
        default=False,
        help_text="Require 2FA for all users"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Security Settings"
        verbose_name_plural = "Security Settings"
        db_table = 'setting_security_config'
    
    def __str__(self):
        return "Security Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one settings instance exists (singleton pattern)
        if not self.pk and SecuritySettings.objects.exists():
            existing = SecuritySettings.objects.first()
            self.pk = existing.pk
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create the security settings instance"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings


class KnowledgeBaseSettings(models.Model):
    """
    Knowledge Base configuration settings
    """
    # Access Control
    public_access = models.BooleanField(
        default=True,
        help_text="Allow unauthenticated users to view published articles"
    )
    require_login_to_view = models.BooleanField(
        default=False,
        help_text="Require users to login to view any articles"
    )
    allow_article_rating = models.BooleanField(
        default=True,
        help_text="Allow users to rate articles as helpful/not helpful"
    )
    allow_article_comments = models.BooleanField(
        default=True,
        help_text="Allow users to comment on articles"
    )
    
    # Article Creation & Publishing
    require_approval = models.BooleanField(
        default=True,
        help_text="Require approval before articles are published"
    )
    auto_publish_on_approval = models.BooleanField(
        default=True,
        help_text="Automatically publish articles when approved"
    )
    
    # Approval Workflow
    notify_approvers = models.BooleanField(
        default=True,
        help_text="Send email notifications to approvers"
    )
    
    # Notifications
    notify_author_on_approval = models.BooleanField(
        default=True,
        help_text="Notify author when article is approved"
    )
    notify_author_on_rejection = models.BooleanField(
        default=True,
        help_text="Notify author when article is rejected"
    )
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Knowledge Base Settings"
        verbose_name_plural = "Knowledge Base Settings"
        db_table = 'setting_kb'
    
    def __str__(self):
        return "Knowledge Base Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one settings instance exists (singleton pattern)
        if not self.pk and KnowledgeBaseSettings.objects.exists():
            # Update existing instance instead of creating new one
            existing = KnowledgeBaseSettings.objects.first()
            self.pk = existing.pk
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create the KB settings instance"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings


class SettingsView(models.Model):
    """Configurable views for tickets, tasks, and knowledge base."""
    
    TYPE_CHOICES = [
        ('TICKET', 'Ticket'),
        ('TASK', 'Task'),
        ('KB', 'Knowledge Base'),
    ]
    
    type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES,
        db_index=True,
        help_text="Type of view (Ticket, Task, or KB)"
    )
    view_id = models.CharField(
        max_length=100,
        help_text="Unique identifier for the view (e.g., 'all_tickets', 'my_tasks')"
    )
    label = models.CharField(
        max_length=200,
        help_text="Display label for the view"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Optional description of what this view displays"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this view is enabled and visible to users"
    )
    is_default = models.BooleanField(
        default=False,
        help_text="Whether this is the default view to show"
    )
    order = models.IntegerField(
        default=0,
        help_text="Display order (lower numbers appear first)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Settings View"
        verbose_name_plural = "Settings Views"
        db_table = 'setting_view'
        ordering = ['type', 'order', 'label']
        unique_together = ['type', 'view_id']
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.label}"


class SettingsIntegrations(models.Model):
    """
    Database storage for available integrations
    """
    INTEGRATION_STATUS_CHOICES = [
        ('available', 'Available'),
        ('connected', 'Connected'),
        ('coming-soon', 'Coming Soon'),
    ]
    
    INTEGRATION_TYPE_CHOICES = [
        ('communication', 'Communication'),
        ('productivity', 'Productivity'), 
        ('development', 'Development'),
        ('crm', 'CRM'),
        ('automation', 'Automation'),
        ('calendar', 'Calendar'),
        ('enterprise', 'Enterprise'),
    ]
    
    name = models.CharField(max_length=100, unique=True, help_text="Integration name")
    icon = models.CharField(max_length=50, help_text="Lucide React icon name (e.g., 'MessageSquare', 'Mail')")
    description = models.TextField(help_text="Integration description")
    status = models.CharField(
        max_length=20, 
        choices=INTEGRATION_STATUS_CHOICES, 
        default='available',
        help_text="Current integration status"
    )
    color = models.CharField(max_length=7, help_text="Hex color code")
    integration_type = models.CharField(
        max_length=20,
        choices=INTEGRATION_TYPE_CHOICES,
        default='automation',
        help_text="Integration category/type"
    )
    webhook_url = models.URLField(blank=True, null=True, help_text="Optional webhook URL")
   
    is_active = models.BooleanField(default=True, help_text="Is integration visible in UI")

     # Check if integrated
    is_integrated = models.BooleanField(default=False, blank=True, null=True, help_text="Is integration connected/functional")
    order = models.PositiveIntegerField(default=1, help_text="Display order")
    
    # Configuration settings (JSON field for integration-specific settings)
    config_settings = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Integration"
        verbose_name_plural = "Integrations"
        ordering = ['order', 'name']
        db_table = 'setting_integrations'
    
    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"


class CustomDomain(models.Model):
    """
    Custom domains for tenant websites with DNS verification and SSL management.
    Supports domains for helpdesk, knowledge base, or customer portal.
    """
    PURPOSE_CHOICES = [
        ('helpdesk', 'Helpdesk'),
        ('knowledge_base', 'Knowledge Base'),
        ('customer_portal', 'Customer Portal'),
        ('all', 'All Services'),
    ]
    
    DNS_STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('failed', 'Verification Failed'),
    ]
    
    SSL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('provisioning', 'Provisioning'),
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('failed', 'Failed'),
    ]
    
    SSL_PROVIDER_CHOICES = [
        ('cloudflare', 'Cloudflare Origin Certificate'),
        ('letsencrypt', "Let's Encrypt"),
        ('manual', 'Manual Certificate'),
    ]
    
    domain = models.CharField(max_length=255, unique=True, help_text="Custom domain (e.g., support.example.com)")
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='all', help_text="Service this domain is used for")
    
    # DNS Verification
    verification_token = models.CharField(max_length=64, blank=True, help_text="DNS TXT record verification token")
    dns_status = models.CharField(max_length=20, choices=DNS_STATUS_CHOICES, default='pending')
    dns_verified_at = models.DateTimeField(null=True, blank=True, help_text="When DNS was verified")
    dns_last_checked_at = models.DateTimeField(null=True, blank=True, help_text="Last DNS check timestamp")
    dns_error_message = models.TextField(blank=True, help_text="DNS verification error message")
    
    # Required DNS Records (stored for display to user)
    required_cname_record = models.CharField(max_length=255, blank=True, help_text="CNAME record target")
    required_txt_record = models.CharField(max_length=512, blank=True, help_text="TXT record value for verification")
    
    # SSL Certificate
    ssl_provider = models.CharField(max_length=20, choices=SSL_PROVIDER_CHOICES, default='cloudflare', help_text="SSL certificate provider")
    ssl_status = models.CharField(max_length=20, choices=SSL_STATUS_CHOICES, default='pending')
    ssl_issued_at = models.DateTimeField(null=True, blank=True, help_text="SSL certificate issue date")
    ssl_expires_at = models.DateTimeField(null=True, blank=True, help_text="SSL certificate expiry date")
    ssl_certificate_path = models.CharField(max_length=500, blank=True, help_text="Path to SSL certificate file")
    ssl_private_key_path = models.CharField(max_length=500, blank=True, help_text="Path to SSL private key file")
    ssl_error_message = models.TextField(blank=True, help_text="SSL provisioning error message")
    
    # Cloudflare Custom Hostname
    cloudflare_hostname_id = models.CharField(max_length=64, blank=True, help_text="Cloudflare custom hostname ID")
    
    # Active/Primary
    is_active = models.BooleanField(default=True, help_text="Is this domain active")
    is_primary = models.BooleanField(default=False, help_text="Is this the primary custom domain")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Custom Domain"
        verbose_name_plural = "Custom Domains"
        ordering = ['-is_primary', '-created_at']
        db_table = 'setting_custom_domains'
    
    def __str__(self):
        return self.domain
    
    def save(self, *args, **kwargs):
        import secrets
        import hashlib
        
        # Generate verification token if not exists
        if not self.verification_token:
            self.verification_token = hashlib.sha256(
                f"{self.domain}-{secrets.token_hex(16)}".encode()
            ).hexdigest()[:32]
        
        # Set required DNS records
        if not self.required_txt_record:
            self.required_txt_record = f"coredesk-verify={self.verification_token}"
        
        # If setting as primary, unset other primary domains
        if self.is_primary:
            CustomDomain.objects.filter(is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        
        super().save(*args, **kwargs)
    
    @property
    def overall_status(self):
        """Returns overall status combining DNS and SSL status"""
        if self.dns_status != 'verified':
            return 'pending'
        if self.ssl_status == 'active':
            return 'active'
        if self.ssl_status in ['failed', 'expired']:
            return 'error'
        return 'pending'
    
    @property
    def status_display(self):
        """Human readable status"""
        status_map = {
            'active': 'Active',
            'pending': 'Pending Verification',
            'error': 'Configuration Error',
        }
        return status_map.get(self.overall_status, 'Unknown')


class NotificationSettings(models.Model):
    """
    Business-level notification settings.
    Controls which notifications are enabled for the entire organization.
    """
    # Ticket Notifications
    notify_new_ticket_created = models.BooleanField(
        default=True,
        help_text="When a new ticket is submitted"
    )
    notify_ticket_assigned = models.BooleanField(
        default=True,
        help_text="When a ticket is assigned"
    )
    notify_ticket_status_changed = models.BooleanField(
        default=True,
        help_text="When ticket status is updated (open, pending, resolved, closed)"
    )
    notify_ticket_priority_changed = models.BooleanField(
        default=True,
        help_text="When ticket priority is updated (low, medium, high, urgent)"
    )
    notify_new_comment = models.BooleanField(
        default=True,
        help_text="When someone comments on a ticket"
    )
    notify_ticket_reassigned = models.BooleanField(
        default=False,
        help_text="When a ticket is reassigned to another agent"
    )
    notify_ticket_group_assigned = models.BooleanField(
        default=True,
        help_text="When a ticket is assigned to a group (notifies all group members)"
    )
    notify_ticket_merged = models.BooleanField(
        default=True,
        help_text="When tickets are merged together"
    )
    notify_ticket_mentioned = models.BooleanField(
        default=True,
        help_text="When someone is mentioned using @username in a ticket"
    )
    
    # Reports
    weekly_performance_report = models.BooleanField(
        default=False,
        help_text="Send weekly summary of team performance and metrics"
    )
    weekly_report_email = models.EmailField(
        blank=True,
        null=True,
        help_text="Email address to receive weekly reports"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Notification Settings"
        verbose_name_plural = "Notification Settings"
        db_table = 'setting_notifications'
    
    def __str__(self):
        return "Notification Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one settings instance exists (singleton pattern)
        if not self.pk and NotificationSettings.objects.exists():
            existing = NotificationSettings.objects.first()
            self.pk = existing.pk
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create the notification settings instance"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings

