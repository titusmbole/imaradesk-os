# IMAP integration views - removed in open source version
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

@login_required
def custom_imap_connect(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def custom_imap_configure(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def custom_imap_disconnect(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def custom_imap_test(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})

@login_required
def custom_imap_list_mailboxes(request):
    return JsonResponse({'enabled': False, 'status': 'not_available'})
