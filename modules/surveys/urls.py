"""
Survey URLs
"""
from django.urls import path
from . import views

app_name = 'surveys'

urlpatterns = [
    # Main survey views
    path('surveys/', views.surveys_list, name='list'),
    path('surveys/new/', views.survey_form, name='create'),
    path('surveys/<int:survey_id>/edit/', views.survey_form, name='edit'),
    path('surveys/<int:survey_id>/', views.survey_detail, name='detail'),
    
    # Responses
    path('surveys/responses/', views.survey_responses, name='responses'),
    
    # Analytics
    path('surveys/analytics/', views.survey_analytics, name='analytics'),
    
    # Settings
    path('surveys/settings/', views.survey_settings, name='settings'),
    
    # Public survey submission (no login required)
    path('survey/<str:token>/', views.public_survey_view, name='public_survey'),
    
    # API endpoints
    path('api/surveys/', views.api_create_survey, name='api_create'),
    path('api/surveys/list/', views.api_list_surveys, name='api_list'),
    path('api/surveys/<int:survey_id>/', views.api_update_survey, name='api_update'),
    path('api/surveys/<int:survey_id>/delete/', views.api_delete_survey, name='api_delete'),
    path('api/surveys/<int:survey_id>/questions/', views.api_get_survey_questions, name='api_questions'),
    path('api/surveys/<int:survey_id>/send-test/', views.api_send_test_survey, name='api_send_test'),
    
    # Public API (no login)
    path('api/survey/<str:token>/submit/', views.api_submit_response, name='api_submit'),
    
    # Manual survey sending
    path('api/tickets/<int:ticket_id>/send-survey/', views.api_send_manual_survey, name='api_send_manual'),
    
    # Settings API
    path('api/surveys/settings/', views.api_update_settings, name='api_settings'),
]
