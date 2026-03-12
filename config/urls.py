"""
Main URL Configuration - Single Tenant Application

All application URLs are served from this single configuration.
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static

# Import views for public/website pages
from modules.website import views as website_views
from modules.integrations import views as integrations_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ========================
    # PUBLIC/WEBSITE ROUTES
    # ========================
    path('', website_views.landing, name='landing'),
    path('pricing/', website_views.pricing, name='pricing'),
    path('health/', website_views.health, name='health'),
    path('features/', website_views.features, name='features'),
    path('blog/', website_views.blog, name='blog'),
    path('blog/<str:slug>/', website_views.blog_post, name='blog_post'),
    path('docs/', website_views.docs, name='docs'),
    re_path(r'^docs/(?P<slug>[\w/-]+)/$', website_views.docs_page, name='docs_page'),
    path('contact/', website_views.contact, name='contact'),
    path('privacy/', website_views.privacy, name='privacy'),
    path('terms/', website_views.terms, name='terms'),
    path('register/', website_views.register, name='register'),
    path('registration-success/', website_views.registration_success, name='registration_success'),
    path('verify-email/', website_views.verify_email, name='verify_email'),
    path('verification-pending/', website_views.verification_pending, name='verification_pending'),
    
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
