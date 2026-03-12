"""
Common integrations API views (removed)
"""
import logging

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

logger = logging.getLogger(__name__)


@login_required
def api_integrations(request):
    """API endpoint - integrations removed"""
    return JsonResponse({
        'integrations': [],
        'count': 0,
        'status': 'success'
    })
