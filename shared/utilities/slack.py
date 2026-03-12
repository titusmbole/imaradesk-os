"""
Slack Integration Utility Module

Provides functions for interacting with Slack API in a multi-tenant environment.
Each tenant has their own Slack workspace integration stored in SlackIntegration model.
"""
import json
import logging
import urllib.request
import urllib.parse
import urllib.error
from typing import Optional, Dict, Any, List
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


class SlackAPIError(Exception):
    """Custom exception for Slack API errors"""
    def __init__(self, message: str, error_code: str = None, response: dict = None):
        super().__init__(message)
        self.error_code = error_code
        self.response = response


class SlackClient:
    """
    Slack API client for multi-tenant integration.
    Uses the tenant's access token from SlackIntegration model.
    """
    
    BASE_URL = "https://slack.com/api"
    
    def __init__(self, access_token: str):
        """
        Initialize Slack client with access token.
        
        Args:
            access_token: Bot OAuth access token (xoxb-...)
        """
        self.access_token = access_token
    
    @classmethod
    def from_tenant(cls) -> Optional['SlackClient']:
        """
        Create SlackClient from current tenant's integration.
        
        Returns:
            SlackClient instance or None if not configured
        """
        from modules.settings.models import SlackIntegration
        integration = SlackIntegration.get_integration()
        
        if not integration or not integration.is_active:
            return None
        
        return cls(access_token=integration.access_token)
    
    def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: dict = None,
        params: dict = None
    ) -> dict:
        """
        Make HTTP request to Slack API.
        
        Args:
            method: HTTP method (GET, POST)
            endpoint: API endpoint (e.g., 'chat.postMessage')
            data: Request body for POST requests
            params: Query parameters for GET requests
            
        Returns:
            API response as dictionary
        """
        url = f"{self.BASE_URL}/{endpoint}"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json; charset=utf-8",
        }
        
        if method == "GET" and params:
            url = f"{url}?{urllib.parse.urlencode(params)}"
        
        request_data = None
        if method == "POST" and data:
            request_data = json.dumps(data).encode('utf-8')
        
        req = urllib.request.Request(
            url,
            data=request_data,
            headers=headers,
            method=method
        )
        
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8') if e.fp else ''
            logger.error(f"Slack API HTTP error: {e.code} - {error_body}")
            raise SlackAPIError(
                f"HTTP error {e.code}", 
                error_code=str(e.code),
                response={'error': error_body}
            )
        except urllib.error.URLError as e:
            logger.error(f"Slack API URL error: {e.reason}")
            raise SlackAPIError(f"Connection error: {e.reason}")
        except json.JSONDecodeError as e:
            logger.error(f"Slack API JSON decode error: {e}")
            raise SlackAPIError("Invalid JSON response from Slack API")
        
        if not response_data.get('ok', False):
            error = response_data.get('error', 'unknown_error')
            logger.error(f"Slack API error: {error}")
            raise SlackAPIError(
                f"Slack API error: {error}",
                error_code=error,
                response=response_data
            )
        
        return response_data
    
    def post_message(
        self,
        channel: str,
        text: str = None,
        blocks: List[dict] = None,
        attachments: List[dict] = None,
        thread_ts: str = None,
        reply_broadcast: bool = False,
        unfurl_links: bool = True,
        unfurl_media: bool = True,
    ) -> dict:
        """
        Post a message to a Slack channel.
        
        Args:
            channel: Channel ID or name
            text: Message text (also used as fallback for blocks)
            blocks: Block Kit blocks for rich formatting
            attachments: Legacy attachments
            thread_ts: Reply to this message timestamp
            reply_broadcast: Also post reply to channel
            unfurl_links: Enable link previews
            unfurl_media: Enable media previews
            
        Returns:
            API response with message details
        """
        data = {
            "channel": channel,
            "unfurl_links": unfurl_links,
            "unfurl_media": unfurl_media,
        }
        
        if text:
            data["text"] = text
        
        if blocks:
            data["blocks"] = blocks
            # Text is required as fallback when using blocks
            if not text:
                data["text"] = "New notification from ImaraDesk"
        
        if attachments:
            data["attachments"] = attachments
        
        if thread_ts:
            data["thread_ts"] = thread_ts
            data["reply_broadcast"] = reply_broadcast
        
        return self._make_request("POST", "chat.postMessage", data=data)
    
    def list_channels(
        self,
        types: str = "public_channel,private_channel",
        exclude_archived: bool = True,
        limit: int = 100,
    ) -> List[dict]:
        """
        List channels in the workspace.
        
        Args:
            types: Comma-separated channel types
            exclude_archived: Exclude archived channels
            limit: Maximum channels to return
            
        Returns:
            List of channel objects
        """
        params = {
            "types": types,
            "exclude_archived": str(exclude_archived).lower(),
            "limit": limit,
        }
        
        response = self._make_request("GET", "conversations.list", params=params)
        return response.get('channels', [])
    
    def get_channel_info(self, channel: str) -> dict:
        """
        Get information about a channel.
        
        Args:
            channel: Channel ID
            
        Returns:
            Channel information
        """
        params = {"channel": channel}
        response = self._make_request("GET", "conversations.info", params=params)
        return response.get('channel', {})
    
    def join_channel(self, channel: str) -> dict:
        """
        Join a public channel.
        
        Args:
            channel: Channel ID
            
        Returns:
            API response
        """
        return self._make_request("POST", "conversations.join", data={"channel": channel})
    
    def test_auth(self) -> dict:
        """
        Test the authentication token.
        
        Returns:
            Auth info including team, user, etc.
        """
        return self._make_request("GET", "auth.test")
    
    def get_user_info(self, user_id: str) -> dict:
        """
        Get information about a user.
        
        Args:
            user_id: User ID
            
        Returns:
            User information
        """
        params = {"user": user_id}
        response = self._make_request("GET", "users.info", params=params)
        return response.get('user', {})


# =============================================================================
# OAuth Helper Functions
# =============================================================================

def get_oauth_authorize_url(state: str, redirect_uri: str = None) -> str:
    """
    Generate Slack OAuth authorization URL.
    
    Args:
        state: State parameter for CSRF protection
        redirect_uri: Optional override for redirect URI
        
    Returns:
        Full authorization URL
    """
    client_id = settings.SLACK_CLIENT_ID
    scopes = settings.SLACK_OAUTH_SCOPES
    redirect = redirect_uri or settings.SLACK_REDIRECT_URI
    
    params = {
        "client_id": client_id,
        "scope": scopes,
        "redirect_uri": redirect,
        "state": state,
    }
    
    # Log the OAuth parameters being sent to Slack
    print("=" * 60)
    print("SLACK OAUTH AUTHORIZATION REQUEST (from slack.py)")
    print("=" * 60)
    print(f"Client ID: {client_id}")
    print(f"Scopes: {scopes}")
    print(f"Redirect URI: {redirect}")
    print(f"State length: {len(state)} chars")
    print(f"State (first 100 chars): {state[:100]}...")
    print("=" * 60)
    
    logger.info("=" * 50)
    logger.info("SLACK OAUTH AUTHORIZATION REQUEST")
    logger.info("=" * 50)
    logger.info(f"Client ID: {client_id}")
    logger.info(f"Scopes: {scopes}")
    logger.info(f"Redirect URI: {redirect}")
    logger.info(f"State (first 100 chars): {state[:100]}...")
    logger.info(f"Full params: {params}")
    
    full_url = f"https://slack.com/oauth/v2/authorize?{urllib.parse.urlencode(params)}"
    print(f"Full Authorization URL: {full_url}")
    logger.info(f"Full Authorization URL: {full_url}")
    logger.info("=" * 50)
    
    return full_url


def exchange_code_for_token(code: str, redirect_uri: str = None) -> dict:
    """
    Exchange OAuth authorization code for access token.
    
    Args:
        code: Authorization code from callback
        redirect_uri: Redirect URI (must match authorization request)
        
    Returns:
        Token response with access_token, team info, etc.
    """
    from decouple import config
    
    logger.info("=" * 50)
    logger.info("EXCHANGING CODE FOR TOKEN")
    logger.info("=" * 50)
    
    client_id = settings.SLACK_CLIENT_ID
    client_secret = config('SLACK_CLIENT_SECRET')
    redirect = redirect_uri or settings.SLACK_REDIRECT_URI
    
    logger.info(f"Client ID: {client_id}")
    logger.info(f"Redirect URI: {redirect}")
    logger.info(f"Code (first 20 chars): {code[:20]}...")
    
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": redirect,
    }
    
    url = "https://slack.com/api/oauth.v2.access"
    logger.info(f"Token exchange URL: {url}")
    
    # Use form-urlencoded for token exchange
    encoded_data = urllib.parse.urlencode(data).encode('utf-8')
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }
    
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method="POST")
    
    try:
        logger.info("Sending token exchange request...")
        with urllib.request.urlopen(req, timeout=30) as response:
            response_data = json.loads(response.read().decode('utf-8'))
            logger.info(f"Response status: {response.status}")
            logger.info(f"Response ok: {response_data.get('ok')}")
    except (urllib.error.HTTPError, urllib.error.URLError) as e:
        logger.error(f"OAuth token exchange HTTP error: {e}")
        if hasattr(e, 'read'):
            error_body = e.read().decode('utf-8')
            logger.error(f"Error body: {error_body}")
        raise SlackAPIError(f"Failed to exchange code: {e}")
    
    if not response_data.get('ok', False):
        error = response_data.get('error', 'unknown_error')
        logger.error(f"Token exchange failed with error: {error}")
        logger.error(f"Full response: {response_data}")
        raise SlackAPIError(f"Token exchange failed: {error}", error_code=error)
    
    logger.info("Token exchange successful!")
    logger.info(f"Team: {response_data.get('team', {}).get('name')}")
    logger.info("=" * 50)
    
    return response_data


# =============================================================================
# High-Level Notification Functions
# =============================================================================

def send_ticket_notification(
    ticket,
    event_type: str,
    extra_context: dict = None
) -> bool:
    """
    Send a ticket-related notification to Slack.
    
    Args:
        ticket: Ticket model instance
        event_type: Type of event ('created', 'assigned', 'resolved', 'sla_breach')
        extra_context: Additional context data
        
    Returns:
        True if sent successfully, False otherwise
    """
    from modules.settings.models import SlackIntegration
    
    integration = SlackIntegration.get_integration()
    
    if not integration or not integration.is_active:
        logger.debug("Slack integration not configured or inactive")
        return False
    
    # Check notification preferences
    notification_checks = {
        'created': integration.notify_new_ticket,
        'assigned': integration.notify_ticket_assigned,
        'resolved': integration.notify_ticket_resolved,
        'sla_breach': integration.notify_sla_breach,
        'comment': integration.notify_new_comment,
    }
    
    if not notification_checks.get(event_type, False):
        logger.debug(f"Slack notification for {event_type} is disabled")
        return False
    
    if not integration.default_channel_id:
        logger.warning("No default Slack channel configured")
        return False
    
    try:
        client = SlackClient(integration.access_token)
        
        # Build notification message
        blocks = _build_ticket_notification_blocks(ticket, event_type, extra_context)
        fallback_text = _get_ticket_notification_text(ticket, event_type)
        
        client.post_message(
            channel=integration.default_channel_id,
            text=fallback_text,
            blocks=blocks
        )
        
        # Update last used timestamp
        integration.update_last_used()
        
        logger.info(f"Slack notification sent for ticket #{ticket.number} ({event_type})")
        return True
        
    except SlackAPIError as e:
        logger.error(f"Failed to send Slack notification: {e}")
        return False


def _build_ticket_notification_blocks(
    ticket,
    event_type: str,
    extra_context: dict = None
) -> List[dict]:
    """Build Block Kit blocks for ticket notification."""
    
    # Event type configurations
    event_configs = {
        'created': {
            'emoji': '🎫',
            'color': '#36a64f',
            'title': 'New Ticket Created',
        },
        'assigned': {
            'emoji': '👤',
            'color': '#3498db',
            'title': 'Ticket Assigned',
        },
        'resolved': {
            'emoji': '✅',
            'color': '#2ecc71',
            'title': 'Ticket Resolved',
        },
        'sla_breach': {
            'emoji': '⚠️',
            'color': '#e74c3c',
            'title': 'SLA Breach Alert',
        },
        'comment': {
            'emoji': '💬',
            'color': '#9b59b6',
            'title': 'New Comment',
        },
    }
    
    config = event_configs.get(event_type, {
        'emoji': '📋',
        'color': '#95a5a6',
        'title': 'Ticket Update',
    })
    
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"{config['emoji']} {config['title']}",
                "emoji": True
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*Ticket:*\n#{ticket.number}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Priority:*\n{getattr(ticket, 'priority', 'Normal')}"
                }
            ]
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Subject:*\n{ticket.subject}"
            }
        },
    ]
    
    # Add assignee if available
    assignee = getattr(ticket, 'assigned_to', None)
    if assignee:
        blocks.append({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*Assigned to:*\n{assignee.get_full_name() or assignee.username}"
                }
            ]
        })
    
    # Add requester if available
    requester = getattr(ticket, 'requester', None) or getattr(ticket, 'created_by', None)
    if requester:
        blocks.append({
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*Requester:*\n{getattr(requester, 'email', requester)}"
                }
            ]
        })
    
    # Add context
    blocks.append({
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": f"Sent from ImaraDesk at {timezone.now().strftime('%Y-%m-%d %H:%M UTC')}"
            }
        ]
    })
    
    return blocks


def _get_ticket_notification_text(ticket, event_type: str) -> str:
    """Get fallback text for ticket notification."""
    
    messages = {
        'created': f"🎫 New ticket #{ticket.number}: {ticket.subject}",
        'assigned': f"👤 Ticket #{ticket.number} has been assigned",
        'resolved': f"✅ Ticket #{ticket.number} has been resolved",
        'sla_breach': f"⚠️ SLA breach alert for ticket #{ticket.number}",
        'comment': f"💬 New comment on ticket #{ticket.number}",
    }
    
    return messages.get(event_type, f"📋 Update for ticket #{ticket.number}")


def send_test_message(channel_id: str = None, message: str = None) -> dict:
    """
    Send a test message to verify Slack integration.
    
    Args:
        channel_id: Channel to send to (uses default if not specified)
        message: Custom message (uses default if not specified)
        
    Returns:
        API response or error dict
    """
    from modules.settings.models import SlackIntegration
    
    integration = SlackIntegration.get_integration()
    
    if not integration:
        return {'ok': False, 'error': 'Slack integration not configured'}
    
    channel = channel_id or integration.default_channel_id
    
    if not channel:
        return {'ok': False, 'error': 'No channel specified'}
    
    try:
        client = SlackClient(integration.access_token)
        
        test_message = message or "🎉 ImaraDesk Slack integration is working!"
        
        blocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": test_message
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": f"Test message sent at {timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')}"
                    }
                ]
            }
        ]
        
        response = client.post_message(
            channel=channel,
            text=test_message,
            blocks=blocks
        )
        
        integration.update_last_used()
        
        return {'ok': True, 'message': 'Test message sent successfully', 'ts': response.get('ts')}
        
    except SlackAPIError as e:
        return {'ok': False, 'error': str(e), 'error_code': e.error_code}
