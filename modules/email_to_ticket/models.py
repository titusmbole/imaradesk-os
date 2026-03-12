"""
Models for Email to Ticket functionality.

TenantHelpEmail is a SHARED model that stores help email addresses for each tenant.
It uses plus addressing (help+{tenant}@coredesk.pro) to route emails to the correct tenant.
"""
from django.db import models
from django.utils import timezone
from shared.models import Client


class OutlookMailbox(models.Model):
    """
    Stores connected Microsoft Outlook mailboxes for email-to-ticket processing.
    Uses Microsoft Graph API with OAuth tokens to read emails.
    
    This is a TENANT model - each tenant can connect their own Outlook mailboxes.
    """
    # Mailbox identification
    email_address = models.EmailField(
        unique=True,
        help_text="The Outlook mailbox email address"
    )
    display_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Display name of the mailbox owner"
    )
    mailbox_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="Microsoft Graph user/mailbox ID"
    )
    
    # OAuth tokens from Microsoft
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
    scope = models.TextField(
        blank=True,
        null=True,
        help_text="Space-separated list of granted scopes"
    )
    
    # Azure AD tenant info
    azure_tenant_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="Azure AD tenant ID"
    )
    
    # Configuration
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this mailbox should be processed for tickets"
    )
    auto_create_tickets = models.BooleanField(
        default=True,
        help_text="Automatically create tickets from incoming emails"
    )
    auto_reply = models.BooleanField(
        default=False,
        help_text="Send automatic reply when ticket is created"
    )
    default_priority = models.CharField(
        max_length=20,
        default='normal',
        help_text="Default priority for tickets created from emails"
    )
    
    # Processing settings
    folder_to_watch = models.CharField(
        max_length=100,
        default='Inbox',
        help_text="Mail folder to watch for new emails (e.g., Inbox)"
    )
    mark_as_read = models.BooleanField(
        default=True,
        help_text="Mark emails as read after processing"
    )
    move_to_folder = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optionally move processed emails to this folder"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_sync_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Last time emails were fetched from this mailbox"
    )
    
    class Meta:
        verbose_name = "Outlook Mailbox"
        verbose_name_plural = "Outlook Mailboxes"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.display_name or self.email_address}"
    
    def is_token_expired(self):
        """Check if the access token is expired or about to expire (within 5 minutes)"""
        if not self.token_expires_at:
            return True
        # Consider expired if within 5 minutes of expiration
        buffer = timezone.timedelta(minutes=5)
        return timezone.now() >= (self.token_expires_at - buffer)
    
    def refresh_access_token(self):
        """
        Refresh the access token using the refresh token.
        Returns True if successful, False otherwise.
        """
        if not self.refresh_token:
            return False
        
        from django.conf import settings
        import requests
        
        try:
            token_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
            token_data = {
                'client_id': settings.TEAMS_CLIENT_ID,
                'client_secret': settings.TEAMS_CLIENT_SECRET,
                'refresh_token': self.refresh_token,
                'grant_type': 'refresh_token',
                'scope': self.scope or 'Mail.Read Mail.ReadWrite offline_access',
            }
            
            response = requests.post(token_url, data=token_data)
            token_response = response.json()
            
            if 'error' in token_response:
                return False
            
            self.access_token = token_response.get('access_token', self.access_token)
            if token_response.get('refresh_token'):
                self.refresh_token = token_response['refresh_token']
            
            expires_in = token_response.get('expires_in', 3600)
            self.token_expires_at = timezone.now() + timezone.timedelta(seconds=expires_in)
            self.save(update_fields=['access_token', 'refresh_token', 'token_expires_at'])
            
            return True
        except Exception:
            return False
    
    def get_valid_token(self):
        """
        Get a valid access token, refreshing if necessary.
        Returns the token or None if unable to get a valid token.
        """
        if self.is_token_expired():
            if not self.refresh_access_token():
                return None
        return self.access_token
    
    def update_last_sync(self):
        """Update last_sync_at timestamp"""
        self.last_sync_at = timezone.now()
        self.save(update_fields=['last_sync_at'])


class CustomIMAPMailbox(models.Model):
    """
    Stores custom IMAP/SMTP mailbox connections for email-to-ticket processing.
    This is a TENANT model - each tenant has their own custom IMAP mailboxes.
    """
    
    # Connection details
    email_address = models.EmailField(
        unique=True,
        help_text="Email address for this mailbox"
    )
    display_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Display name for this mailbox"
    )
    
    # IMAP Settings (for reading emails)
    imap_host = models.CharField(
        max_length=255,
        help_text="IMAP server hostname (e.g., imap.gmail.com)"
    )
    imap_port = models.IntegerField(
        default=993,
        help_text="IMAP server port (993 for SSL, 143 for non-SSL)"
    )
    imap_use_ssl = models.BooleanField(
        default=True,
        help_text="Use SSL/TLS for IMAP connection"
    )
    
    # SMTP Settings (for sending replies) - OPTIONAL
    enable_smtp = models.BooleanField(
        default=False,
        help_text="Enable outgoing email (SMTP) for this mailbox"
    )
    smtp_host = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="SMTP server hostname (e.g., smtp.gmail.com)"
    )
    smtp_port = models.IntegerField(
        default=587,
        help_text="SMTP server port (587 for TLS, 465 for SSL, 25 for non-secure)"
    )
    smtp_use_tls = models.BooleanField(
        default=True,
        help_text="Use TLS for SMTP connection"
    )
    smtp_use_ssl = models.BooleanField(
        default=False,
        help_text="Use SSL for SMTP connection"
    )
    
    # Authentication
    username = models.CharField(
        max_length=255,
        help_text="Username for authentication (usually email address)"
    )
    password = models.CharField(
        max_length=255,
        help_text="Password or app-specific password"
    )
    
    # Configuration
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this mailbox should be processed for tickets"
    )
    auto_create_tickets = models.BooleanField(
        default=True,
        help_text="Automatically create tickets from incoming emails"
    )
    auto_reply = models.BooleanField(
        default=False,
        help_text="Send automatic reply when ticket is created"
    )
    default_priority = models.CharField(
        max_length=20,
        default='normal',
        help_text="Default priority for tickets created from emails"
    )
    
    # Processing settings
    folder_to_watch = models.CharField(
        max_length=100,
        default='INBOX',
        help_text="Mail folder to watch for new emails (e.g., INBOX)"
    )
    mark_as_read = models.BooleanField(
        default=True,
        help_text="Mark emails as read after processing"
    )
    move_to_folder = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optionally move processed emails to this folder"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_sync_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Last time emails were fetched from this mailbox"
    )
    
    class Meta:
        verbose_name = "Custom IMAP Mailbox"
        verbose_name_plural = "Custom IMAP Mailboxes"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.display_name or self.email_address}"
    
    def update_last_sync(self):
        """Update last_sync_at timestamp"""
        self.last_sync_at = timezone.now()
        self.save(update_fields=['last_sync_at'])
    
    def test_connection(self):
        """Test IMAP connection with provided credentials"""
        import imaplib
        import ssl
        
        try:
            if self.imap_use_ssl:
                context = ssl.create_default_context()
                mail = imaplib.IMAP4_SSL(self.imap_host, self.imap_port, ssl_context=context)
            else:
                mail = imaplib.IMAP4(self.imap_host, self.imap_port)
            
            mail.login(self.username, self.password)
            mail.select(self.folder_to_watch)
            mail.logout()
            return True, "Connection successful"
        except Exception as e:
            return False, str(e)


class TenantHelpEmail(models.Model):
    """
    Stores the help email address for each tenant.
    Uses plus addressing: help+{schema_name}@coredesk.pro
    
    This is a SHARED model (stored in public schema) because it maps
    email addresses to tenants and needs to be accessible when routing
    incoming emails.
    """
    tenant = models.OneToOneField(
        Client,
        on_delete=models.CASCADE,
        related_name='help_email',
        help_text="The tenant this help email belongs to"
    )
    email_address = models.EmailField(
        unique=True,
        help_text="The help email address for this tenant (e.g., help+tenant@coredesk.pro)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this help email is active and should process incoming emails"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Email processing settings
    auto_create_tickets = models.BooleanField(
        default=True,
        help_text="Automatically create tickets from incoming emails"
    )
    auto_reply = models.BooleanField(
        default=True,
        help_text="Send automatic reply when ticket is created"
    )
    default_priority = models.CharField(
        max_length=20,
        default='normal',
        help_text="Default priority for tickets created from emails"
    )
    
    class Meta:
        verbose_name = "Tenant Help Email"
        verbose_name_plural = "Tenant Help Emails"
        ordering = ['tenant__name']
    
    def __str__(self):
        return f"{self.tenant.name}: {self.email_address}"
    
    @classmethod
    def generate_email_for_tenant(cls, tenant):
        """
        Generate the help email address for a tenant using plus addressing.
        Format: help+{schema_name}@coredesk.pro
        """
        from django.conf import settings
        base_email = getattr(settings, 'EMAIL_HELP_HOST_USER', 'help@coredesk.pro')
        # Split at @ to insert plus addressing
        local_part, domain = base_email.split('@')
        return f"{local_part}+{tenant.schema_name}@{domain}"
    
    @classmethod
    def get_or_create_for_tenant(cls, tenant):
        """
        Get or create a help email for the given tenant.
        """
        help_email, created = cls.objects.get_or_create(
            tenant=tenant,
            defaults={
                'email_address': cls.generate_email_for_tenant(tenant),
                'is_active': True,
            }
        )
        return help_email, created
    
    @classmethod
    def get_tenant_from_email(cls, to_address):
        """
        Extract tenant from plus-addressed email.
        E.g., help+acme@coredesk.pro -> returns 'acme' tenant
        
        Returns the tenant schema_name or None if not found.
        """
        import re
        # Match email with plus addressing: help+{tenant}@domain
        match = re.match(r'^([^+]+)\+([^@]+)@(.+)$', to_address.lower())
        if match:
            return match.group(2)  # Return the tenant schema name
        return None


class ProcessedEmail(models.Model):
    """
    Tracks processed emails to avoid duplicates.
    This is also a SHARED model to track all processed emails across tenants.
    """
    message_id = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
        help_text="The Message-ID header from the email"
    )
    tenant = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='processed_emails',
        help_text="The tenant this email was processed for"
    )
    from_address = models.EmailField(help_text="Sender email address")
    to_address = models.EmailField(help_text="Recipient email address")
    subject = models.CharField(max_length=500, blank=True)
    received_at = models.DateTimeField(help_text="When the email was received")
    processed_at = models.DateTimeField(auto_now_add=True)
    
    # Processing result
    ticket_created = models.BooleanField(default=False)
    ticket_number = models.CharField(max_length=20, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Processed Email"
        verbose_name_plural = "Processed Emails"
        ordering = ['-processed_at']
    
    def __str__(self):
        return f"{self.message_id} -> {self.tenant.name}"
