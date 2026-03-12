from django.urls import path
from .views import (
    # Common
    api_integrations,
    # Slack
    slack_integration_setup,
    slack_oauth_config,
    slack_configure,
    # Teams
    teams_integration_setup,
    teams_oauth_config,
    teams_oauth_connect,
    teams_oauth_callback,
    teams_configure,
    teams_disconnect,
    teams_get_teams,
    teams_get_channels,
    teams_test_message,
    # Email
    email_integration_setup,
    email_provider_setup,
    # Outlook
    outlook_mail_oauth_config,
    outlook_mail_oauth_connect,
    outlook_mail_oauth_callback,
    outlook_mail_configure,
    outlook_mail_disconnect,
    outlook_mail_list_mailboxes,
    outlook_mail_test,
    # IMAP
    custom_imap_connect,
    custom_imap_configure,
    custom_imap_disconnect,
    custom_imap_test,
    custom_imap_list_mailboxes,
    # Telegram
    telegram_integration_setup,
    telegram_get_config,
    telegram_connect,
    telegram_configure,
    telegram_disconnect,
    telegram_test,
    telegram_webhook,
    telegram_list_chats,
)

urlpatterns = [
    # API Endpoints
    path('api/integrations/', api_integrations, name='api_integrations'),

    # Integration Setup Pages
    path('settings/integrations/slack/', slack_integration_setup, name='slack_integration_setup'),
    path('settings/integrations/teams/', teams_integration_setup, name='teams_integration_setup'),
    path('settings/integrations/email/', email_integration_setup, name='email_integration_setup'),
    path('settings/integrations/email/<str:provider_id>/', email_provider_setup, name='email_provider_setup'),

    # Slack OAuth endpoints
    path('api/integrations/slack/config/', slack_oauth_config, name='slack_oauth_config'),
    path('api/integrations/slack/configure/', slack_configure, name='slack_configure'),

    # Teams OAuth endpoints
    path('api/integrations/teams/config/', teams_oauth_config, name='teams_oauth_config'),
    path('api/integrations/teams/connect/', teams_oauth_connect, name='teams_oauth_connect'),
    path('api/integrations/teams/callback/', teams_oauth_callback, name='teams_oauth_callback'),
    path('api/integrations/teams/configure/', teams_configure, name='teams_configure'),
    path('api/integrations/teams/disconnect/', teams_disconnect, name='teams_disconnect'),
    path('api/integrations/teams/teams/', teams_get_teams, name='teams_get_teams'),
    path('api/integrations/teams/channels/', teams_get_channels, name='teams_get_channels'),
    path('api/integrations/teams/test/', teams_test_message, name='teams_test_message'),
    
    # Outlook Mail OAuth endpoints (for email-to-ticket)
    path('api/integrations/outlook-mail/config/', outlook_mail_oauth_config, name='outlook_mail_oauth_config'),
    path('api/integrations/outlook-mail/connect/', outlook_mail_oauth_connect, name='outlook_mail_oauth_connect'),
    path('api/integrations/outlook-mail/callback/', outlook_mail_oauth_callback, name='outlook_mail_oauth_callback'),
    path('api/integrations/outlook-mail/configure/', outlook_mail_configure, name='outlook_mail_configure'),
    path('api/integrations/outlook-mail/disconnect/', outlook_mail_disconnect, name='outlook_mail_disconnect'),
    path('api/integrations/outlook-mail/mailboxes/', outlook_mail_list_mailboxes, name='outlook_mail_list_mailboxes'),
    path('api/integrations/outlook-mail/test/', outlook_mail_test, name='outlook_mail_test'),
    
    # Custom IMAP/SMTP endpoints (for email-to-ticket)
    path('api/integrations/custom-imap/connect/', custom_imap_connect, name='custom_imap_connect'),
    path('api/integrations/custom-imap/configure/', custom_imap_configure, name='custom_imap_configure'),
    path('api/integrations/custom-imap/disconnect/', custom_imap_disconnect, name='custom_imap_disconnect'),
    path('api/integrations/custom-imap/test/', custom_imap_test, name='custom_imap_test'),
    path('api/integrations/custom-imap/mailboxes/', custom_imap_list_mailboxes, name='custom_imap_list_mailboxes'),
    
    # Telegram endpoints
    path('settings/integrations/telegram/', telegram_integration_setup, name='telegram_integration_setup'),
    path('api/integrations/telegram/config/', telegram_get_config, name='telegram_get_config'),
    path('api/integrations/telegram/connect/', telegram_connect, name='telegram_connect'),
    path('api/integrations/telegram/configure/', telegram_configure, name='telegram_configure'),
    path('api/integrations/telegram/disconnect/', telegram_disconnect, name='telegram_disconnect'),
    path('api/integrations/telegram/test/', telegram_test, name='telegram_test'),
    path('api/integrations/telegram/chats/', telegram_list_chats, name='telegram_list_chats'),
    path('api/integrations/telegram/webhook/<str:schema_name>/', telegram_webhook, name='telegram_webhook'),
]

