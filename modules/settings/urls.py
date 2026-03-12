from django.urls import path
from . import views

urlpatterns = [
    path('settings/', views.general_settings, name='general_settings'),
    path('settings/update-business/', views.update_business_info, name='update_business_info'),
    path('settings/notifications/', views.notifications_settings, name='notifications_settings'),
    path('settings/notifications/update/', views.notifications_settings_update, name='notifications_settings_update'),
    path('settings/security/', views.security_settings, name='security_settings'),
    path('settings/security/update/', views.security_settings_update, name='security_settings_update'),
    
    # 2FA Endpoints
    path('settings/security/2fa/email/send/', views.send_email_2fa_code, name='send_email_2fa_code'),
    path('settings/security/2fa/email/verify/', views.verify_email_2fa_code, name='verify_email_2fa_code'),
    path('settings/security/2fa/authenticator/setup/', views.setup_authenticator_2fa, name='setup_authenticator_2fa'),
    path('settings/security/2fa/authenticator/verify/', views.verify_authenticator_2fa, name='verify_authenticator_2fa'),
    path('settings/security/2fa/disable/send/', views.send_disable_2fa_code, name='send_disable_2fa_code'),
    path('settings/security/2fa/email/disable/', views.disable_email_2fa, name='disable_email_2fa'),
    path('settings/security/2fa/authenticator/disable/', views.disable_authenticator_2fa, name='disable_authenticator_2fa'),
    
    path('settings/custom-domains/', views.custom_domains, name='custom_domains'),
    
    # Custom Domain API
    path('api/settings/domains/add/', views.api_add_custom_domain, name='api_add_custom_domain'),
    path('api/settings/domains/<int:domain_id>/verify/', views.api_verify_domain_dns, name='api_verify_domain_dns'),
    path('api/settings/domains/<int:domain_id>/delete/', views.api_delete_custom_domain, name='api_delete_custom_domain'),
    path('api/settings/domains/<int:domain_id>/set-primary/', views.api_set_primary_domain, name='api_set_primary_domain'),
    path('api/settings/domains/<int:domain_id>/dns-records/', views.api_get_domain_dns_records, name='api_get_domain_dns_records'),
    path('api/settings/domains/<int:domain_id>/provision-ssl/', views.api_provision_ssl, name='api_provision_ssl'),
    path('api/settings/domains/<int:domain_id>/check-ssl/', views.api_check_ssl_status, name='api_check_ssl_status'),
    
    path('settings/integrations/', views.integrations_settings, name='integrations_settings'),
    
    # Slack Integration
    path('api/integrations/slack/connect/', views.slack_oauth_start, name='slack_oauth_start'),
    path('api/integrations/slack/callback/', views.slack_oauth_callback, name='slack_oauth_callback'),
    path('api/integrations/slack/disconnect/', views.slack_disconnect, name='slack_disconnect'),
    path('api/integrations/slack/status/', views.slack_status, name='slack_status'),
    path('api/integrations/slack/channels/', views.slack_channels, name='slack_channels'),
    path('api/integrations/slack/settings/', views.slack_update_settings, name='slack_update_settings'),
    path('api/integrations/slack/test/', views.slack_test_message, name='slack_test_message'),
    
    # Team section
    path('settings/team/users/', views.team_users, name='team_users'),
    path('settings/team/users/add/', views.team_user_add, name='team_user_add'),
    path('settings/team/users/<int:user_id>/edit/', views.team_user_edit, name='team_user_edit'),
    path('settings/team/users/<int:user_id>/view/', views.team_user_view, name='team_user_view'),
    path('settings/team/users/<int:user_id>/delete/', views.team_user_delete, name='team_user_delete'),
    path('settings/team/roles/', views.team_roles, name='team_roles'),
    path('settings/team/roles/add/', views.team_role_add, name='team_role_add'),
    path('settings/team/roles/<int:role_id>/edit/', views.team_role_edit, name='team_role_edit'),
    path('settings/team/roles/<int:role_id>/view/', views.team_role_view, name='team_role_view'),
    path('settings/team/roles/<int:role_id>/permissions/', views.team_role_update_permissions, name='team_role_update_permissions'),
    path('settings/team/roles/<int:role_id>/delete/', views.team_role_delete, name='team_role_delete'),
    path('settings/team/groups/', views.team_groups, name='team_groups'),
    path('settings/team/groups/add/', views.team_group_add, name='team_group_add'),
    path('settings/team/groups/<int:group_id>/edit/', views.team_group_edit, name='team_group_edit'),
    path('settings/team/groups/<int:group_id>/view/', views.team_group_view, name='team_group_view'),
    path('settings/team/groups/<int:group_id>/delete/', views.team_group_delete, name='team_group_delete'),
    path('settings/team/groups/<int:group_id>/available-agents/', views.team_group_available_agents, name='team_group_available_agents'),
    path('settings/team/groups/<int:group_id>/add-members/', views.team_group_add_members, name='team_group_add_members'),
    path('settings/team/import/', views.team_import, name='team_import'),
    # Emails section
    path('settings/emails/templates/', views.emails_templates, name='emails_templates'),
    path('settings/emails/templates/<int:template_id>/edit/', views.edit_email_template, name='edit_email_template'),
    path('settings/emails/templates/<int:template_id>/update/', views.update_email_template, name='update_email_template'),
    path('settings/emails/templates/<int:template_id>/test/', views.test_email_template, name='test_email_template'),
    path('settings/emails/smtp/', views.emails_smtp, name='emails_smtp'),
    path('settings/emails/automation/', views.emails_automation, name='emails_automation'),
    # Marketplace
    path('settings/marketplace/', views.marketplace, name='marketplace'),
    path('settings/marketplace/installed/', views.installed_apps, name='installed_apps'),
    path('settings/marketplace/install/<int:app_id>/', views.install_app, name='install_app'),
    path('settings/marketplace/uninstall/<int:app_id>/', views.uninstall_app, name='uninstall_app'),
    # Views Management
    path('settings/views/', views.settings_views, name='settings_views'),
    path('settings/views/<int:view_id>/toggle/', views.toggle_view, name='toggle_view'),
    path('settings/views/<int:view_id>/set-default/', views.set_default_view, name='set_default_view'),
    path('settings/views/reorder/', views.reorder_views, name='reorder_views'),
    # Billing
    path('settings/billing/', views.billing, name='billing'),
    # SLA section
    path('settings/sla/policies/', views.sla_policies, name='sla_policies'),
    path('settings/sla/policies/add/', views.sla_policy_add, name='sla_policy_add'),
    path('settings/sla/policies/<int:policy_id>/edit/', views.sla_policy_edit, name='sla_policy_edit'),
    path('settings/sla/business-hours/', views.sla_business_hours, name='sla_business_hours'),
    path('settings/sla/holidays/', views.sla_holidays, name='sla_holidays'),
]
