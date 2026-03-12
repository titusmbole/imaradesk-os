from django.urls import path
from . import views

app_name = 'backoffice'

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),
    
    # Authentication
    path('login/', views.login_page, name='login_page'),
    path('api/login/', views.login, name='login'),
    path('api/logout/', views.logout, name='logout'),
    path('api/setup/', views.setup_admin, name='setup_admin'),
    
    # Businesses
    path('businesses/', views.businesses_list, name='businesses_list'),
    path('businesses/<str:schema_name>/', views.business_detail, name='business_detail'),
    path('api/businesses/<str:schema_name>/toggle-status/', views.toggle_business_status, name='toggle_business_status'),
    path('api/businesses/<str:schema_name>/subscription/', views.update_subscription, name='update_subscription'),
    
    # Packages
    path('packages/', views.packages_list, name='packages_list'),
    path('api/packages/', views.create_package, name='create_package'),
    path('api/packages/<int:package_id>/', views.update_package, name='update_package'),
    
    # Billing
    path('billing/', views.billing_overview, name='billing_overview'),
    
    # Activity
    path('activity/', views.activity_log, name='activity_log'),
    
    # Application Logs
    path('logs/', views.logs_page, name='logs_page'),
    path('api/logs/<str:service>/<str:log_file>/', views.get_logs, name='get_logs'),
    path('api/logs/<str:service>/<str:log_file>/stream/', views.stream_logs, name='stream_logs'),
    
    # Email Marketing
    path('emails/', views.emails_list, name='emails_list'),
    path('emails/templates/<int:template_id>/', views.email_template_detail, name='email_template_detail'),
    path('emails/campaigns/<int:campaign_id>/', views.campaign_detail, name='campaign_detail'),
    path('api/emails/templates/', views.create_email_template, name='create_email_template'),
    path('api/emails/templates/<int:template_id>/', views.update_email_template, name='update_email_template'),
    path('api/emails/templates/<int:template_id>/delete/', views.delete_email_template, name='delete_email_template'),
    path('api/emails/templates/<int:template_id>/preview/', views.preview_email_template, name='preview_email_template'),
    path('api/emails/campaigns/', views.create_email_campaign, name='create_email_campaign'),
    path('api/emails/businesses/', views.get_businesses_for_campaign, name='get_businesses_for_campaign'),
]
