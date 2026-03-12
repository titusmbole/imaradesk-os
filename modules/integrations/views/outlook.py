# Outlook integration views - removed in open source version
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

@login_required
def outlook_mail_oauth_config(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def outlook_mail_oauth_connect(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def outlook_mail_oauth_callback(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def outlook_mail_configure(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def outlook_mail_disconnect(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def outlook_mail_list_mailboxes(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def outlook_mail_test(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})
