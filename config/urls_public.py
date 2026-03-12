"""
Public URLs - accessible without tenant context
Can be used for landing pages, public APIs, etc.
"""
from django.urls import path, re_path, include
from modules.website import views
from modules.integrations import views as integrations_views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('pricing/', views.pricing, name='pricing'),
    path('health/', views.health, name='health'),
    path('features/', views.features, name='features'),
    path('blog/', views.blog, name='blog'),
    path('blog/<str:slug>/', views.blog_post, name='blog_post'),
    path('docs/', views.docs, name='docs'),
    re_path(r'^docs/(?P<slug>[\w/-]+)/$', views.docs_page, name='docs_page'),
    path('contact/', views.contact, name='contact'),
    path('privacy/', views.privacy, name='privacy'),
    path('terms/', views.terms, name='terms'),
    path('register/', views.register, name='register'),
    path('registration-success/', views.registration_success, name='registration_success'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('verification-pending/', views.verification_pending, name='verification_pending'),
    path('api/integrations/slack/callback/', integrations_views.slack_oauth_callback, name='slack_oauth_callback'),
    path('api/integrations/teams/callback/', integrations_views.teams_oauth_callback, name='teams_oauth_callback'),
    path('api/integrations/outlook-mail/callback/', integrations_views.outlook_mail_oauth_callback, name='outlook_mail_oauth_callback'),
    
    # Backoffice administration panel
    path('backoffice/', include('modules.backoffice.urls', namespace='backoffice')),
]

# Custom error handlers
handler404 = 'modules.core.views.page_not_found'
handler500 = 'modules.core.views.server_error'
