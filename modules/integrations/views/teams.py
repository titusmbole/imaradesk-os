# Teams integration views - removed in open source version
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

@login_required
def teams_integration_setup(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def teams_oauth_config(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def teams_oauth_connect(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

def teams_oauth_callback(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def teams_configure(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def teams_disconnect(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def teams_get_teams(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def teams_get_channels(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def teams_test_message(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

def get_microsoft_user_info(access_token):
    return None

def send_teams_message(integration, message, channel_id=None):
    return False

def refresh_teams_token(integration):
    return None

def get_integration_status(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})
