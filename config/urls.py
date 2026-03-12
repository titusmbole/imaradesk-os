"""
Main URL Configuration - Single Tenant Application

All application URLs are served from this single configuration.
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static

# Import views
from modules.website import views as website_views
from modules.integrations import views as integrations_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ========================
    # SYSTEM ROUTES
    # ========================
    path('health/', website_views.health, name='health'),
    
    # Onboarding (first-time setup)
    path('onboarding/', website_views.onboarding, name='onboarding'),
    
    # OAuth callbacks
    path('api/integrations/slack/callback/', integrations_views.slack_oauth_callback, name='slack_oauth_callback'),
    path('api/integrations/teams/callback/', integrations_views.teams_oauth_callback, name='teams_oauth_callback'),
    path('api/integrations/outlook-mail/callback/', integrations_views.outlook_mail_oauth_callback, name='outlook_mail_oauth_callback'),
    
    # Backoffice administration panel
    path('backoffice/', include('modules.backoffice.urls', namespace='backoffice')),
    
    # ========================
    # APPLICATION ROUTES
    # ========================
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

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Custom error handlers
handler404 = 'modules.core.views.page_not_found'
handler500 = 'modules.core.views.server_error'
