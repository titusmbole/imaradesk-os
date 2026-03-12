# Email integration views - removed in open source version
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

@login_required
def email_integration_setup(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def email_provider_setup(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})
