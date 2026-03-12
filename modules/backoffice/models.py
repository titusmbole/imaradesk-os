from django.db import models
from django.conf import settings
from decimal import Decimal
from django.utils import timezone


class Package(models.Model):
    """
    Subscription packages/plans available for businesses.
    """
    class BillingCycle(models.TextChoices):
        MONTHLY = 'monthly', 'Monthly'
        YEARLY = 'yearly', 'Yearly'
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    
    # Pricing
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Limits
    max_agents = models.IntegerField(default=5, help_text='Maximum number of agents allowed')
    max_customers = models.IntegerField(default=100, help_text='Maximum number of customers allowed')
    max_tickets_per_month = models.IntegerField(default=500, help_text='Maximum tickets per month')
    storage_limit_gb = models.IntegerField(default=5, help_text='Storage limit in GB')
    
    # Features (JSON list of feature keys)
    features = models.JSONField(default=list, help_text='List of feature keys enabled')
    
    # Display
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False, help_text='Show as recommended plan')
    display_order = models.IntegerField(default=0)
    
    # Badge/label
    badge_text = models.CharField(max_length=50, blank=True, help_text='e.g., "Most Popular"')
    badge_color = models.CharField(max_length=20, default='blue')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'price_monthly']
    
    def __str__(self):
        return self.name
    
    def get_price(self, cycle='monthly'):
        """Get price based on billing cycle."""
        if cycle == 'yearly':
            return self.price_yearly
        return self.price_monthly


class Subscription(models.Model):
    """
    Tracks business subscriptions to packages.
    """
    class Status(models.TextChoices):
        TRIAL = 'trial', 'Trial'
        ACTIVE = 'active', 'Active'
        PAST_DUE = 'past_due', 'Past Due'
        CANCELLED = 'cancelled', 'Cancelled'
        EXPIRED = 'expired', 'Expired'
        SUSPENDED = 'suspended', 'Suspended'
    
    # Link to tenant/client using schema_name since Client is in shared app
    tenant_schema = models.CharField(max_length=63, unique=True, help_text='Tenant schema name')
    package = models.ForeignKey(Package, on_delete=models.PROTECT, related_name='subscriptions')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TRIAL)
    billing_cycle = models.CharField(
        max_length=20, 
        choices=Package.BillingCycle.choices, 
        default=Package.BillingCycle.MONTHLY
    )
    
    # Billing info
    current_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    
    # Trial period
    trial_started_at = models.DateTimeField(null=True, blank=True)
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    
    # Subscription period
    started_at = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Payment integration (Stripe, etc.)
    payment_provider = models.CharField(max_length=50, blank=True)
    external_subscription_id = models.CharField(max_length=255, blank=True)
    external_customer_id = models.CharField(max_length=255, blank=True)
    
    # Custom limits override
    custom_max_agents = models.IntegerField(null=True, blank=True)
    custom_max_customers = models.IntegerField(null=True, blank=True)
    custom_storage_limit_gb = models.IntegerField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.tenant_schema} - {self.package.name}"
    
    @property
    def max_agents(self):
        """Get effective max agents (custom or package default)."""
        return self.custom_max_agents or self.package.max_agents
    
    @property
    def max_customers(self):
        """Get effective max customers."""
        return self.custom_max_customers or self.package.max_customers
    
    @property
    def storage_limit(self):
        """Get effective storage limit."""
        return self.custom_storage_limit_gb or self.package.storage_limit_gb


class BillingHistory(models.Model):
    """
    Records all billing transactions for businesses.
    """
    class TransactionType(models.TextChoices):
        SUBSCRIPTION = 'subscription', 'Subscription Payment'
        UPGRADE = 'upgrade', 'Plan Upgrade'
        DOWNGRADE = 'downgrade', 'Plan Downgrade'
        ADDON = 'addon', 'Add-on Purchase'
        REFUND = 'refund', 'Refund'
        CREDIT = 'credit', 'Credit Applied'
        ADJUSTMENT = 'adjustment', 'Manual Adjustment'
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'
        CANCELLED = 'cancelled', 'Cancelled'
    
    subscription = models.ForeignKey(
        Subscription, 
        on_delete=models.CASCADE, 
        related_name='billing_history'
    )
    
    transaction_type = models.CharField(
        max_length=20, 
        choices=TransactionType.choices, 
        default=TransactionType.SUBSCRIPTION
    )
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    status = models.CharField(
        max_length=20, 
        choices=PaymentStatus.choices, 
        default=PaymentStatus.PENDING
    )
    
    # Invoice
    invoice_number = models.CharField(max_length=100, blank=True)
    invoice_url = models.URLField(blank=True)
    
    # Payment details
    payment_method = models.CharField(max_length=50, blank=True)
    external_transaction_id = models.CharField(max_length=255, blank=True)
    
    # Period covered
    period_start = models.DateTimeField(null=True, blank=True)
    period_end = models.DateTimeField(null=True, blank=True)
    
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Billing history'
    
    def __str__(self):
        return f"{self.subscription.tenant_schema} - {self.amount} {self.currency}"


class AdminUser(models.Model):
    """
    Users authorized to access the backoffice admin panel.
    Separate from tenant users since backoffice is in public schema.
    """
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    
    full_name = models.CharField(max_length=128)
    
    is_active = models.BooleanField(default=True)
    is_superadmin = models.BooleanField(default=False)
    
    # Permissions
    can_manage_businesses = models.BooleanField(default=True)
    can_manage_packages = models.BooleanField(default=False)
    can_manage_billing = models.BooleanField(default=False)
    can_view_analytics = models.BooleanField(default=True)
    can_manage_admins = models.BooleanField(default=False)
    
    last_login = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['full_name']
    
    def __str__(self):
        return self.email


class ActivityLog(models.Model):
    """
    Audit log for backoffice admin actions.
    """
    class ActionType(models.TextChoices):
        CREATE = 'create', 'Created'
        UPDATE = 'update', 'Updated'
        DELETE = 'delete', 'Deleted'
        ACTIVATE = 'activate', 'Activated'
        DEACTIVATE = 'deactivate', 'Deactivated'
        LOGIN = 'login', 'Logged In'
        LOGOUT = 'logout', 'Logged Out'
    
    admin_user = models.ForeignKey(
        AdminUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='activity_logs'
    )
    
    action_type = models.CharField(max_length=20, choices=ActionType.choices)
    target_type = models.CharField(max_length=100, help_text='Model name of target')
    target_id = models.CharField(max_length=100, blank=True)
    target_name = models.CharField(max_length=255, blank=True)
    
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.admin_user} - {self.action_type} - {self.target_type}"


class EmailTemplate(models.Model):
    """
    Email templates for marketing and communication with businesses.
    """
    class TemplateType(models.TextChoices):
        GENERAL = 'general', 'General (Broadcast)'  # No personalization, for all businesses
        BUSINESS = 'business', 'Business Specific'  # Personalized with owner name
    
    class Category(models.TextChoices):
        MARKETING = 'marketing', 'Marketing'
        ANNOUNCEMENT = 'announcement', 'Announcement'
        NEW_RELEASE = 'new_release', 'New Release'
        NEWSLETTER = 'newsletter', 'Newsletter'
        TIPS = 'tips', 'Tips & Tricks'
        SECURITY = 'security', 'Security Update'
        MAINTENANCE = 'maintenance', 'Maintenance Notice'
        OTHER = 'other', 'Other'
    
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    
    template_type = models.CharField(
        max_length=20,
        choices=TemplateType.choices,
        default=TemplateType.GENERAL
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.MARKETING
    )
    
    subject = models.CharField(max_length=255)
    
    # Email content - HTML with optional placeholders
    # Available placeholders for business-specific:
    # {{owner_name}}, {{business_name}}, {{business_email}}
    html_content = models.TextField()
    plain_text_content = models.TextField(blank=True, help_text='Plain text version (optional)')
    
    # Preview/thumbnail text
    preview_text = models.CharField(max_length=255, blank=True, help_text='Email preview text shown in inbox')
    
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False, help_text='Default templates from seed')
    
    created_by = models.ForeignKey(
        AdminUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_templates'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"
    
    def render(self, context=None):
        """Render template with context variables."""
        context = context or {}
        html = self.html_content
        subject = self.subject
        
        for key, value in context.items():
            placeholder = '{{' + key + '}}'
            html = html.replace(placeholder, str(value))
            subject = subject.replace(placeholder, str(value))
        
        return {
            'subject': subject,
            'html': html,
            'plain_text': self.plain_text_content or '',
        }


class EmailCampaign(models.Model):
    """
    Email campaigns/broadcasts sent to businesses.
    """
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SCHEDULED = 'scheduled', 'Scheduled'
        SENDING = 'sending', 'Sending'
        SENT = 'sent', 'Sent'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    class TargetType(models.TextChoices):
        ALL = 'all', 'All Businesses'
        ACTIVE = 'active', 'Active Businesses Only'
        TRIAL = 'trial', 'Trial Businesses Only'
        SELECTED = 'selected', 'Selected Businesses'
    
    name = models.CharField(max_length=255)
    
    template = models.ForeignKey(
        EmailTemplate,
        on_delete=models.PROTECT,
        related_name='campaigns'
    )
    
    # Custom subject/content overrides (if not using template as-is)
    custom_subject = models.CharField(max_length=255, blank=True)
    custom_html_content = models.TextField(blank=True)
    
    target_type = models.CharField(
        max_length=20,
        choices=TargetType.choices,
        default=TargetType.ALL
    )
    
    # For selected businesses - list of schema names
    selected_businesses = models.JSONField(default=list, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    
    # Scheduling
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # Statistics
    total_recipients = models.IntegerField(default=0)
    sent_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    
    sent_by = models.ForeignKey(
        AdminUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_campaigns'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"


class EmailLog(models.Model):
    """
    Log of individual emails sent in a campaign.
    """
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SENT = 'sent', 'Sent'
        DELIVERED = 'delivered', 'Delivered'
        OPENED = 'opened', 'Opened'
        CLICKED = 'clicked', 'Clicked'
        BOUNCED = 'bounced', 'Bounced'
        FAILED = 'failed', 'Failed'
    
    campaign = models.ForeignKey(
        EmailCampaign,
        on_delete=models.CASCADE,
        related_name='email_logs'
    )
    
    # Recipient info
    tenant_schema = models.CharField(max_length=63)
    business_name = models.CharField(max_length=255)
    recipient_email = models.EmailField()
    recipient_name = models.CharField(max_length=255, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Rendered content (in case template changes)
    subject_sent = models.CharField(max_length=255)
    
    # Tracking
    sent_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.campaign.name} -> {self.recipient_email}"
