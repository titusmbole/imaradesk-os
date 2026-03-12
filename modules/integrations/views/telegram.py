"""
Telegram Bot integration views
Handles webhook messages, ticket creation, and replies.
Each tenant configures their own Telegram bot.
"""
import json
import logging
import requests
import secrets

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import connection
from inertia import inertia

logger = logging.getLogger(__name__)


# =============================================================================
# Telegram Integration Setup Pages
# =============================================================================

@login_required
@inertia('TelegramIntegration')
def telegram_integration_setup(request):
    """
    Telegram integration setup page with stepper UI.
    Step 1: Enter bot token and connect
    Step 2: Configure ticket settings
    Step 3: Test and complete
    """
    try:
        from modules.settings.models import TelegramIntegration

        integration = TelegramIntegration.get_integration()

        is_connected = integration is not None and bool(integration.bot_token)

        bot_info = {}
        integration_config = {}
        
        if integration:
            bot_info = {
                'username': integration.bot_username,
                'webhook_url': integration.webhook_url,
            }
            integration_config = {
                'bot_username': integration.bot_username or '',
                'auto_create_tickets': integration.auto_create_tickets,
                'default_priority': integration.default_priority,
                'welcome_message': integration.welcome_message,
                'notify_new_ticket': integration.notify_new_ticket,
                'notify_ticket_resolved': integration.notify_ticket_resolved,
                'notify_new_comment': integration.notify_new_comment,
            }

        # Get current host for webhook URL preview
        current_host = request.get_host()
        protocol = 'https' if request.is_secure() else 'http'
        webhook_preview = f"{protocol}://{current_host}/api/integrations/telegram/webhook/{connection.schema_name}/"

        return {
            'title': 'Telegram Integration Setup',
            'bot_info': bot_info,
            'is_connected': is_connected,
            'integration': integration_config,
            'webhook_preview': webhook_preview,
            'priorities': [
                {'id': 'low', 'name': 'Low'},
                {'id': 'normal', 'name': 'Normal'},
                {'id': 'high', 'name': 'High'},
                {'id': 'urgent', 'name': 'Urgent'},
            ]
        }
    except Exception as e:
        logger.error(f"Error loading Telegram integration setup: {str(e)}")
        return {
            'title': 'Telegram Integration Setup',
            'bot_info': {},
            'is_connected': False,
            'integration': {},
            'error': str(e)
        }


@login_required
def telegram_get_config(request):
    """Get Telegram integration configuration for current tenant"""
    try:
        from modules.settings.models import TelegramIntegration
        
        integration = TelegramIntegration.get_integration()
        
        if not integration:
            return JsonResponse({
                'status': 'success',
                'is_connected': False,
                'config': {}
            })
        
        return JsonResponse({
            'status': 'success',
            'is_connected': bool(integration.bot_token),
            'config': {
                'bot_username': integration.bot_username,
                'auto_create_tickets': integration.auto_create_tickets,
                'default_priority': integration.default_priority,
                'welcome_message': integration.welcome_message,
                'notify_new_ticket': integration.notify_new_ticket,
                'notify_ticket_resolved': integration.notify_ticket_resolved,
                'notify_new_comment': integration.notify_new_comment,
                'webhook_url': integration.webhook_url,
            }
        })
    except Exception as e:
        logger.error(f"Error getting Telegram config: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@login_required
@require_http_methods(["POST"])
def telegram_connect(request):
    """
    Connect Telegram bot with token provided by user.
    Each tenant provides their own bot token from @BotFather.
    """
    try:
        from modules.settings.models import TelegramIntegration
        
        # Parse request data
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            data = request.POST
        
        bot_token = data.get('bot_token', '').strip()
        
        if not bot_token:
            return JsonResponse({
                'success': False,
                'error': 'Bot token is required. Get one from @BotFather on Telegram.'
            }, status=400)
        
        # Verify the token by calling getMe
        bot_info = get_telegram_bot_info(bot_token)
        if not bot_info:
            return JsonResponse({
                'success': False,
                'error': 'Invalid bot token. Please verify with @BotFather and try again.'
            }, status=400)
        
        # Generate webhook secret for security
        webhook_secret = secrets.token_hex(32)
        
        # Check if integration already exists (update) or create new
        existing = TelegramIntegration.objects.first()
        
        if existing:
            # Update existing integration
            existing.bot_token = bot_token
            existing.bot_username = bot_info.get('username', '')
            existing.webhook_secret = webhook_secret
            existing.is_active = True
            existing.save()
            integration = existing
        else:
            # Create new integration
            integration = TelegramIntegration.objects.create(
                bot_token=bot_token,
                bot_username=bot_info.get('username', ''),
                webhook_secret=webhook_secret,
                is_active=True,
            )
        
        # Set up webhook
        current_host = request.get_host()
        protocol = 'https' if request.is_secure() else 'http'
        
        # Webhook URL includes tenant schema for multi-tenant routing
        webhook_url = f"{protocol}://{current_host}/api/integrations/telegram/webhook/{connection.schema_name}/"
        
        webhook_set = set_telegram_webhook(bot_token, webhook_url, webhook_secret)
        
        if webhook_set:
            integration.webhook_url = webhook_url
            integration.save()
        
        logger.info(f"Telegram bot connected for tenant {connection.schema_name}: @{bot_info.get('username')}")
        
        return JsonResponse({
            'success': True,
            'message': f'Connected to @{bot_info.get("username")}',
            'bot_username': bot_info.get('username'),
            'bot_first_name': bot_info.get('first_name'),
            'webhook_set': webhook_set,
            'webhook_url': webhook_url if webhook_set else None,
        })
        
    except Exception as e:
        logger.error(f"Error connecting Telegram bot: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["POST"])
def telegram_configure(request):
    """Configure Telegram integration settings for current tenant"""
    try:
        from modules.settings.models import TelegramIntegration
        
        integration = TelegramIntegration.get_integration()
        if not integration:
            return JsonResponse({
                'status': 'error',
                'message': 'Telegram integration is not connected. Please connect a bot first.'
            }, status=400)
        
        # Parse request data
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            data = request.POST
        
        # Update settings
        integration.auto_create_tickets = data.get('auto_create_tickets', True)
        integration.default_priority = data.get('default_priority', 'normal')
        integration.welcome_message = data.get('welcome_message', integration.welcome_message)
        integration.notify_new_ticket = data.get('notify_new_ticket', True)
        integration.notify_ticket_resolved = data.get('notify_ticket_resolved', True)
        integration.notify_new_comment = data.get('notify_new_comment', True)
        integration.save()
        
        logger.info(f"Telegram integration configured for tenant {connection.schema_name}")
        
        return JsonResponse({
            'status': 'success',
            'message': 'Configuration saved successfully'
        })
        
    except Exception as e:
        logger.error(f"Error configuring Telegram: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@login_required
@require_http_methods(["POST"])
def telegram_disconnect(request):
    """Disconnect Telegram integration for current tenant"""
    try:
        from modules.settings.models import TelegramIntegration, TelegramChat
        
        integration = TelegramIntegration.get_integration()
        if integration:
            # Remove webhook from Telegram
            delete_telegram_webhook(integration.bot_token)
            
            # Delete integration
            integration.delete()
            
            # Clear chat mappings
            TelegramChat.objects.all().delete()
            
            logger.info(f"Telegram integration disconnected for tenant {connection.schema_name}")
        
        return JsonResponse({
            'success': True,
            'message': 'Telegram bot disconnected successfully'
        })
        
    except Exception as e:
        logger.error(f"Error disconnecting Telegram: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["POST"])
def telegram_test(request):
    """Test Telegram bot connection by sending a test message"""
    try:
        from modules.settings.models import TelegramIntegration
        
        data = json.loads(request.body) if request.body else {}
        chat_id = data.get('chat_id')
        message = data.get('message', '✅ Test message from ImaraDesk - Your Telegram integration is working!')
        
        integration = TelegramIntegration.get_integration()
        if not integration or not integration.bot_token:
            return JsonResponse({
                'success': False,
                'error': 'Telegram integration not connected. Please connect a bot first.'
            }, status=400)
        
        if not chat_id:
            # No chat_id - just verify bot is working
            bot_info = get_telegram_bot_info(integration.bot_token)
            if bot_info:
                return JsonResponse({
                    'success': True,
                    'message': f'Bot @{bot_info.get("username")} is connected and ready!',
                    'bot_info': {
                        'username': bot_info.get('username'),
                        'first_name': bot_info.get('first_name'),
                        'can_join_groups': bot_info.get('can_join_groups'),
                        'can_read_all_group_messages': bot_info.get('can_read_all_group_messages'),
                    }
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Bot token is no longer valid. Please reconnect.'
                }, status=400)
        
        # Send test message to specific chat
        success = send_telegram_message(integration.bot_token, chat_id, message)
        
        if success:
            integration.update_last_used()
            return JsonResponse({
                'success': True,
                'message': 'Test message sent successfully!'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to send test message. Check the chat ID.'
            }, status=500)
            
    except Exception as e:
        logger.error(f"Error testing Telegram: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
def telegram_list_chats(request):
    """List all Telegram chats linked to tickets for current tenant"""
    try:
        from modules.settings.models import TelegramChat
        
        chats = TelegramChat.objects.all().select_related('ticket', 'user').order_by('-updated_at')
        
        chats_data = []
        for chat in chats:
            chats_data.append({
                'id': chat.id,
                'chat_id': chat.chat_id,
                'username': chat.username,
                'display_name': chat.display_name,
                'ticket_id': chat.ticket.id if chat.ticket else None,
                'ticket_number': chat.ticket.ticket_number if chat.ticket else None,
                'ticket_status': chat.ticket.status if chat.ticket else None,
                'is_active': chat.is_active,
                'created_at': chat.created_at.isoformat() if chat.created_at else None,
                'updated_at': chat.updated_at.isoformat() if chat.updated_at else None,
            })
        
        return JsonResponse({
            'status': 'success',
            'chats': chats_data,
            'count': len(chats_data),
        })
        
    except Exception as e:
        logger.error(f"Error listing Telegram chats: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


# =============================================================================
# Telegram Webhook Handler (Public - No Auth Required)
# =============================================================================

@csrf_exempt
@require_http_methods(["POST"])
def telegram_webhook(request, schema_name):
    """
    Handle incoming Telegram webhook updates.
    Routes to correct tenant based on schema_name in URL.
    Creates tickets from new chats and adds comments from replies.
    """
    try:
        from shared.utilities.tenant_compat import schema_context
        
        with schema_context(schema_name):
            from modules.settings.models import TelegramIntegration, TelegramChat
            from modules.ticket.models import Ticket, TicketComment
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            
            integration = TelegramIntegration.get_integration()
            if not integration or not integration.is_active:
                logger.warning(f"Telegram webhook called but integration not active for tenant: {schema_name}")
                return HttpResponse('OK')
            
            # Parse update
            try:
                update = json.loads(request.body)
            except json.JSONDecodeError:
                logger.error("Invalid JSON in Telegram webhook")
                return HttpResponse('OK')
            
            # Handle message updates
            message = update.get('message')
            if not message:
                # Could be edited_message, callback_query, etc.
                return HttpResponse('OK')
            
            chat = message.get('chat', {})
            chat_id = chat.get('id')
            chat_type = chat.get('type')
            
            # Only handle private chats for now
            if chat_type != 'private':
                return HttpResponse('OK')
            
            from_user = message.get('from', {})
            message_text = message.get('text', '')
            message_id = message.get('message_id')
            
            if not message_text:
                # Handle photos, documents, etc. later
                return HttpResponse('OK')
            
            # Check for /start command
            if message_text.strip().startswith('/start'):
                if integration.welcome_message:
                    send_telegram_message(
                        integration.bot_token,
                        chat_id,
                        integration.welcome_message
                    )
                return HttpResponse('OK')
            
            # Get or create TelegramChat mapping
            telegram_chat, chat_created = TelegramChat.objects.get_or_create(
                chat_id=chat_id,
                defaults={
                    'username': from_user.get('username'),
                    'first_name': from_user.get('first_name'),
                    'last_name': from_user.get('last_name'),
                }
            )
            
            # Update user info if changed
            if not chat_created:
                telegram_chat.username = from_user.get('username') or telegram_chat.username
                telegram_chat.first_name = from_user.get('first_name') or telegram_chat.first_name
                telegram_chat.last_name = from_user.get('last_name') or telegram_chat.last_name
                telegram_chat.save()
            
            # Check if there's an active ticket for this chat
            active_ticket = None
            if telegram_chat.ticket:
                if telegram_chat.ticket.status not in ['closed', 'resolved']:
                    active_ticket = telegram_chat.ticket
            
            if active_ticket:
                # Add message as comment to existing ticket
                TicketComment.objects.create(
                    ticket=active_ticket,
                    author=telegram_chat.user,
                    message=f"[Telegram] {message_text}",
                    is_internal=False,
                )
                
                logger.info(f"Added Telegram message to ticket {active_ticket.ticket_number} for tenant {schema_name}")
                
            elif integration.auto_create_tickets:
                # Create new ticket
                display_name = telegram_chat.display_name
                
                ticket = Ticket.objects.create(
                    title=f"Telegram: {message_text[:50]}{'...' if len(message_text) > 50 else ''}",
                    description=message_text,
                    source='telegram',
                    status='new',
                    priority=integration.default_priority,
                    is_guest_ticket=True,
                    guest_name=f"{from_user.get('first_name', '')} {from_user.get('last_name', '')}".strip() or display_name,
                    guest_email=None,
                    guest_phone=None,
                )
                
                # Link chat to ticket
                telegram_chat.ticket = ticket
                telegram_chat.last_message_id = message_id
                telegram_chat.save()
                
                logger.info(f"Created ticket {ticket.ticket_number} from Telegram for tenant {schema_name}")
            
            # Update timestamps
            integration.update_last_used()
            telegram_chat.last_message_id = message_id
            telegram_chat.save()
        
        return HttpResponse('OK')
        
    except Exception as e:
        logger.error(f"Error processing Telegram webhook: {str(e)}", exc_info=True)
        return HttpResponse('OK')


# =============================================================================
# Send Reply to Telegram (Called when agent replies to ticket)
# =============================================================================

def send_ticket_reply_to_telegram(ticket, comment_text, is_resolution=False):
    """
    Send a ticket reply/comment to the associated Telegram chat.
    Called when an agent replies to a ticket that came from Telegram.
    """
    try:
        from modules.settings.models import TelegramIntegration, TelegramChat
        
        integration = TelegramIntegration.get_integration()
        if not integration or not integration.is_active:
            return False
        
        # Check notification settings
        if is_resolution and not integration.notify_ticket_resolved:
            return False
        if not is_resolution and not integration.notify_new_comment:
            return False
        
        # Find Telegram chat for this ticket
        telegram_chat = TelegramChat.objects.filter(ticket=ticket).first()
        if not telegram_chat:
            return False
        
        # Format message - just send the comment text directly
        message = comment_text
        
        success = send_telegram_message(
            integration.bot_token,
            telegram_chat.chat_id,
            message
        )
        
        if success:
            integration.update_last_used()
        
        return success
        
    except Exception as e:
        logger.error(f"Error sending reply to Telegram: {str(e)}")
        return False


# =============================================================================
# Telegram API Helpers
# =============================================================================

def get_telegram_bot_info(bot_token):
    """Get bot information from Telegram API"""
    try:
        response = requests.get(
            f"https://api.telegram.org/bot{bot_token}/getMe",
            timeout=10
        )
        data = response.json()
        
        if data.get('ok'):
            return data.get('result', {})
        else:
            logger.error(f"Telegram getMe failed: {data.get('description')}")
            return None
            
    except Exception as e:
        logger.error(f"Error getting Telegram bot info: {str(e)}")
        return None


def set_telegram_webhook(bot_token, webhook_url, secret_token=None):
    """Set webhook for Telegram bot"""
    try:
        params = {
            'url': webhook_url,
            'allowed_updates': ['message', 'edited_message'],
        }
        
        if secret_token:
            params['secret_token'] = secret_token
        
        response = requests.post(
            f"https://api.telegram.org/bot{bot_token}/setWebhook",
            json=params,
            timeout=10
        )
        data = response.json()
        
        if data.get('ok'):
            logger.info(f"Telegram webhook set to {webhook_url}")
            return True
        else:
            logger.error(f"Failed to set Telegram webhook: {data.get('description')}")
            return False
            
    except Exception as e:
        logger.error(f"Error setting Telegram webhook: {str(e)}")
        return False


def delete_telegram_webhook(bot_token):
    """Remove webhook from Telegram bot"""
    try:
        response = requests.post(
            f"https://api.telegram.org/bot{bot_token}/deleteWebhook",
            timeout=10
        )
        data = response.json()
        
        if data.get('ok'):
            logger.info("Telegram webhook deleted")
            return True
        else:
            logger.error(f"Failed to delete Telegram webhook: {data.get('description')}")
            return False
            
    except Exception as e:
        logger.error(f"Error deleting Telegram webhook: {str(e)}")
        return False


def send_telegram_message(bot_token, chat_id, text, parse_mode='HTML', reply_to_message_id=None):
    """Send a message via Telegram Bot API"""
    try:
        params = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': parse_mode,
        }
        
        if reply_to_message_id:
            params['reply_to_message_id'] = reply_to_message_id
        
        response = requests.post(
            f"https://api.telegram.org/bot{bot_token}/sendMessage",
            json=params,
            timeout=10
        )
        data = response.json()
        
        if data.get('ok'):
            return True
        else:
            logger.error(f"Failed to send Telegram message: {data.get('description')}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending Telegram message: {str(e)}")
        return False
