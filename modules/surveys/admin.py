"""
Survey Admin Configuration
"""
from django.contrib import admin
from .models import (
    SurveySettings, Survey, SurveyQuestion, SurveyChoice,
    SurveyInvitation, SurveyResponse, SurveyAnswer,
    SurveyEmailTemplate, SurveyAnalytics
)


@admin.register(SurveySettings)
class SurveySettingsAdmin(admin.ModelAdmin):
    list_display = ['enabled', 'default_send_delay', 'response_expiry_days', 'send_reminders', 'updated_at']
    fieldsets = (
        ('Global Settings', {
            'fields': ('enabled', 'allow_anonymous_responses', 'default_rating_scale')
        }),
        ('Timing', {
            'fields': ('default_send_delay', 'response_expiry_days')
        }),
        ('Reminders', {
            'fields': ('send_reminders', 'reminder_days', 'max_reminders')
        }),
    )


class SurveyQuestionInline(admin.TabularInline):
    model = SurveyQuestion
    extra = 1
    ordering = ['order']


class SurveyChoiceInline(admin.TabularInline):
    model = SurveyChoice
    extra = 2
    ordering = ['order']


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ['name', 'survey_type', 'trigger_event', 'is_active', 'is_default', 'question_count', 'response_count', 'created_at']
    list_filter = ['is_active', 'survey_type', 'trigger_event', 'is_default']
    search_fields = ['name', 'description']
    inlines = [SurveyQuestionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'internal_notes')
        }),
        ('Type & Trigger', {
            'fields': ('survey_type', 'trigger_event', 'is_default')
        }),
        ('Timing', {
            'fields': ('send_delay', 'expiry_days')
        }),
        ('Response Rules', {
            'fields': ('is_active', 'allow_multiple_responses', 'is_anonymous')
        }),
        ('Targeting', {
            'fields': ('target_departments', 'target_priorities'),
            'classes': ('collapse',)
        }),
        ('Appearance', {
            'fields': ('thank_you_message',)
        }),
    )
    filter_horizontal = ['target_departments']


@admin.register(SurveyQuestion)
class SurveyQuestionAdmin(admin.ModelAdmin):
    list_display = ['survey', 'question_text', 'question_type', 'is_required', 'order']
    list_filter = ['survey', 'question_type', 'is_required']
    search_fields = ['question_text']
    inlines = [SurveyChoiceInline]
    ordering = ['survey', 'order']


@admin.register(SurveyChoice)
class SurveyChoiceAdmin(admin.ModelAdmin):
    list_display = ['question', 'label', 'value', 'order']
    list_filter = ['question__survey']
    search_fields = ['label', 'value']


@admin.register(SurveyInvitation)
class SurveyInvitationAdmin(admin.ModelAdmin):
    list_display = ['survey', 'email', 'user_name', 'ticket', 'status', 'scheduled_at', 'sent_at', 'completed_at']
    list_filter = ['status', 'survey']
    search_fields = ['email', 'user_name', 'token']
    readonly_fields = ['token', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'


class SurveyAnswerInline(admin.TabularInline):
    model = SurveyAnswer
    extra = 0
    readonly_fields = ['question', 'text_value', 'numeric_value', 'choice_values', 'boolean_value']
    can_delete = False


@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = ['survey', 'user', 'ticket', 'overall_rating', 'sentiment', 'submitted_at']
    list_filter = ['survey', 'sentiment', 'is_anonymous']
    search_fields = ['user__email', 'ticket__ticket_number']
    readonly_fields = ['overall_rating', 'nps_score', 'sentiment', 'submitted_at']
    inlines = [SurveyAnswerInline]
    date_hierarchy = 'submitted_at'


@admin.register(SurveyAnswer)
class SurveyAnswerAdmin(admin.ModelAdmin):
    list_display = ['response', 'question', 'display_value']
    list_filter = ['question__question_type', 'response__survey']


@admin.register(SurveyEmailTemplate)
class SurveyEmailTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'is_default', 'is_active', 'updated_at']
    list_filter = ['template_type', 'is_default', 'is_active']
    search_fields = ['name', 'subject']


@admin.register(SurveyAnalytics)
class SurveyAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['survey', 'total_invitations', 'total_responses', 'response_rate', 'average_rating', 'csat_score', 'nps_score', 'updated_at']
    readonly_fields = ['survey', 'total_invitations', 'total_responses', 'total_completed', 
                       'response_rate', 'completion_rate', 'average_rating', 'nps_score', 
                       'csat_score', 'positive_count', 'neutral_count', 'negative_count', 'updated_at']
    
    def has_add_permission(self, request):
        return False
