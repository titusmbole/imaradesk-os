# Telegram integration views - removed in open source version
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

@login_required
def telegram_integration_setup(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def telegram_get_config(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def telegram_connect(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def telegram_configure(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def telegram_disconnect(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def telegram_test(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@csrf_exempt
def telegram_webhook(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def telegram_list_chats(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

def send_ticket_reply_to_telegram(ticket, reply_content):
    return False

def get_integration_status(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})
