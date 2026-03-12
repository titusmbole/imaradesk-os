"""
Main URL Configuration - Tenant Application URLs

For tenant-specific application features.
Public schema URLs are configured in settings.PUBLIC_SCHEMA_URLCONF
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Core module - dashboard, login, reports
    path('', include('modules.core.urls')),
    # Tickets module
    path('', include('modules.tickets.urls')),
    # Tasks module
    path('', include('modules.tasks.urls')),
    # Assets module
    path('', include('modules.assets.urls')),
    # People module - users, organizations
    path('', include('modules.people.urls')),
    # Integrations module - Slack, Teams
    path('', include('modules.integrations.urls')),
    # Users module URLs
    path('', include('modules.users.urls')),
    # Settings module URLs
    path('', include('modules.settings.urls')),
    # KB module URLs
    path('', include('modules.kb.urls')),
    # SLA module URLs
    path('sla/', include('modules.sla.urls')),
    # Customer portal
    path('', include('modules.customer_portal.urls')),
    # Surveys & Feedback
    path('', include('modules.surveys.urls')),
]

# Serve media files in development 07509189
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Custom error handlers
handler404 = 'modules.core.views.page_not_found'
handler500 = 'modules.core.views.server_error'
