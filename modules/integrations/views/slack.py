# Slack integration views - removed in open source version
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

@login_required
def slack_integration_setup(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def slack_oauth_config(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

def slack_oauth_callback(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def slack_configure(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

def get_integration_status(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})
