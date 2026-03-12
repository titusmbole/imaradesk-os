"""
Integrations views package - organized by integration provider
"""
from .common import api_integrations
from .slack import (
    slack_integration_setup,
    slack_oauth_config,
    slack_oauth_callback,
    slack_configure,
)
from .teams import (
    teams_integration_setup,
    teams_oauth_config,
    teams_oauth_connect,
    teams_oauth_callback,
    teams_configure,
    teams_disconnect,
    teams_get_teams,
    teams_get_channels,
    teams_test_message,
    get_microsoft_user_info,
    send_teams_message,
    refresh_teams_token,
)
from .outlook import (
    outlook_mail_oauth_config,
    outlook_mail_oauth_connect,
    outlook_mail_oauth_callback,
    outlook_mail_configure,
    outlook_mail_disconnect,
    outlook_mail_list_mailboxes,
    outlook_mail_test,
)
from .imap import (
    custom_imap_connect,
    custom_imap_configure,
    custom_imap_disconnect,
    custom_imap_test,
    custom_imap_list_mailboxes,
)
from .email import (
    email_integration_setup,
    email_provider_setup,
)
from .telegram import (
    telegram_integration_setup,
    telegram_get_config,
    telegram_connect,
    telegram_configure,
    telegram_disconnect,
    telegram_test,
    telegram_webhook,
    telegram_list_chats,
    send_ticket_reply_to_telegram,
)

__all__ = [
    # Common
    'api_integrations',
    # Slack
    'slack_integration_setup',
    'slack_oauth_config',
    'slack_oauth_callback',
    'slack_configure',
    # Teams
    'teams_integration_setup',
    'teams_oauth_config',
    'teams_oauth_connect',
    'teams_oauth_callback',
    'teams_configure',
    'teams_disconnect',
    'teams_get_teams',
    'teams_get_channels',
    'teams_test_message',
    'get_microsoft_user_info',
    'send_teams_message',
    'refresh_teams_token',
    # Outlook
    'outlook_mail_oauth_config',
    'outlook_mail_oauth_connect',
    'outlook_mail_oauth_callback',
    'outlook_mail_configure',
    'outlook_mail_disconnect',
    'outlook_mail_list_mailboxes',
    'outlook_mail_test',
    # IMAP
    'custom_imap_connect',
    'custom_imap_configure',
    'custom_imap_disconnect',
    'custom_imap_test',
    'custom_imap_list_mailboxes',
    # Email
    'email_integration_setup',
    'email_provider_setup',
    # Telegram
    'telegram_integration_setup',
    'telegram_get_config',
    'telegram_connect',
    'telegram_configure',
    'telegram_disconnect',
    'telegram_test',
    'telegram_webhook',
    'telegram_list_chats',
    'send_ticket_reply_to_telegram',
]
