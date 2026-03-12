"""
Survey & Feedback Views

Views for survey management, submission, and analytics.
"""
import json
from datetime import datetime, timedelta

from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q, Count, Avg, Sum
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from inertia import inertia, render as inertia_render

from shared.decorators import require_app
from .models import (
    SurveySettings, Survey, SurveyQuestion, SurveyChoice,
    SurveyInvitation, SurveyResponse, SurveyAnswer,
    SurveyEmailTemplate, SurveyAnalytics
)
from modules.ticket.models import Ticket, Department

User = get_user_model()


# ==========================================
# Serializers
# ==========================================

def serialize_survey(survey, include_questions=False):
    """Serialize a survey object to dictionary."""
    data = {
        'id': survey.id,
        'name': survey.name,
        'description': survey.description,
        'survey_type': survey.survey_type,
        'survey_type_display': survey.get_survey_type_display(),
        'trigger_event': survey.trigger_event,
        'trigger_event_display': survey.get_trigger_event_display(),
        'send_delay': survey.send_delay,
        'expiry_days': survey.expiry_days,
        'is_active': survey.is_active,
        'is_default': survey.is_default,
        'allow_multiple_responses': survey.allow_multiple_responses,
        'is_anonymous': survey.is_anonymous,
        'thank_you_message': survey.thank_you_message,
        'question_count': survey.question_count,
        'response_count': survey.response_count,
        'completion_rate': survey.completion_rate,
        'created_at': survey.created_at.isoformat(),
        'updated_at': survey.updated_at.isoformat(),
    }
    
    if include_questions:
        data['questions'] = [serialize_question(q) for q in survey.questions.all()]
    
    return data


def serialize_question(question):
    """Serialize a survey question."""
    data = {
        'id': question.id,
        'question_text': question.question_text,
        'question_type': question.question_type,
        'question_type_display': question.get_question_type_display(),
        'is_required': question.is_required,
        'order': question.order,
        'rating_scale': question.rating_scale,
        'rating_labels': question.rating_labels,
        'min_length': question.min_length,
        'max_length': question.max_length,
        'placeholder_text': question.placeholder_text,
    }
    
    # Include choices for choice-based questions
    if question.question_type in ['single_choice', 'multiple_choice']:
        data['choices'] = [
            {
                'id': c.id,
                'label': c.label,
                'value': c.value,
                'is_other': c.is_other,
                'order': c.order,
            }
            for c in question.choices.all()
        ]
    
    return data


def serialize_response(response, include_answers=False):
    """Serialize a survey response."""
    data = {
        'id': response.id,
        'survey': {
            'id': response.survey.id,
            'name': response.survey.name,
        },
        'ticket': {
            'id': response.ticket.id,
            'ticket_number': response.ticket.ticket_number,
            'title': response.ticket.title,
        } if response.ticket else None,
        'user': {
            'id': response.user.id,
            'name': response.user.get_full_name() or response.user.username,
            'email': response.user.email,
        } if response.user else None,
        'agent': {
            'id': response.agent.id,
            'name': response.agent.get_full_name() or response.agent.username,
        } if response.agent else None,
        'is_anonymous': response.is_anonymous,
        'overall_rating': float(response.overall_rating) if response.overall_rating else None,
        'nps_score': response.nps_score,
        'sentiment': response.sentiment,
        'submitted_at': response.submitted_at.isoformat(),
    }
    
    if include_answers:
        data['answers'] = [
            {
                'question_id': a.question.id,
                'question_text': a.question.question_text,
                'question_type': a.question.question_type,
                'rating_scale': a.question.rating_scale,
                'value': a.display_value,
                'text_value': a.text_value,
                'numeric_value': float(a.numeric_value) if a.numeric_value else None,
                'choice_values': a.choice_values,
                'boolean_value': a.boolean_value,
            }
            for a in response.answers.all()
        ]
    
    return data


def serialize_invitation(invitation):
    """Serialize a survey invitation."""
    return {
        'id': invitation.id,
        'survey': {
            'id': invitation.survey.id,
            'name': invitation.survey.name,
        },
        'ticket': {
            'id': invitation.ticket.id,
            'ticket_number': invitation.ticket.ticket_number,
        } if invitation.ticket else None,
        'email': invitation.email,
        'user_name': invitation.user_name,
        'status': invitation.status,
        'status_display': invitation.get_status_display(),
        'scheduled_at': invitation.scheduled_at.isoformat(),
        'sent_at': invitation.sent_at.isoformat() if invitation.sent_at else None,
        'expires_at': invitation.expires_at.isoformat(),
        'is_expired': invitation.is_expired,
        'created_at': invitation.created_at.isoformat(),
    }


# ==========================================
# Sidebar Helper
# ==========================================

def get_surveys_sidebar(request):
    """Generate sidebar data for survey views."""
    all_count = Survey.objects.count()
    active_count = Survey.objects.filter(is_active=True).count()
    
    # Response counts
    total_responses = SurveyResponse.objects.count()
    pending_invitations = SurveyInvitation.objects.filter(
        status__in=['pending', 'sent']
    ).count()
    
    return {
        'views': [
            {'id': 'all', 'label': 'All Surveys', 'count': all_count, 'active': False},
            {'id': 'active', 'label': 'Active Surveys', 'count': active_count, 'active': False},
            {'id': 'responses', 'label': 'Responses', 'count': total_responses, 'active': False},
            {'id': 'pending', 'label': 'Pending Invitations', 'count': pending_invitations, 'active': False},
        ]
    }


# ==========================================
# Main Survey List View
# ==========================================

@require_app('surveys')
@login_required
@inertia('Surveys')
def surveys_list(request):
    """List all surveys with filtering."""
    view = request.GET.get('view', 'all')
    search = request.GET.get('search', '')
    page_number = request.GET.get('page', 1)
    per_page = 20
    
    # Base queryset
    surveys_qs = Survey.objects.all()
    
    # Apply filters
    if view == 'active':
        surveys_qs = surveys_qs.filter(is_active=True)
    elif view == 'csat':
        surveys_qs = surveys_qs.filter(survey_type=Survey.SurveyType.CSAT)
    elif view == 'nps':
        surveys_qs = surveys_qs.filter(survey_type=Survey.SurveyType.NPS)
    
    if search:
        surveys_qs = surveys_qs.filter(
            Q(name__icontains=search) |
            Q(description__icontains=search)
        )
    
    surveys_qs = surveys_qs.order_by('-created_at')
    
    # Paginate
    paginator = Paginator(surveys_qs, per_page)
    page_obj = paginator.get_page(page_number)
    
    # Serialize
    surveys_data = [serialize_survey(s) for s in page_obj]
    
    # Get settings
    settings = SurveySettings.get_settings()
    
    return {
        'surveys': surveys_data,
        'currentView': view,
        'sidebar': get_surveys_sidebar(request),
        'settings': {
            'enabled': settings.enabled,
            'default_send_delay': settings.default_send_delay,
            'response_expiry_days': settings.response_expiry_days,
        },
        'pagination': {
            'current_page': page_obj.number,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        },
        'filters': {
            'types': [{'value': k, 'label': v} for k, v in Survey.SurveyType.choices],
            'triggers': [{'value': k, 'label': v} for k, v in Survey.TriggerEvent.choices],
        },
    }


# ==========================================
# Survey Detail / Form Views
# ==========================================

@require_app('surveys')
@login_required
@inertia('SurveyForm')
def survey_form(request, survey_id=None):
    """Create or edit a survey."""
    survey = None
    if survey_id:
        survey = get_object_or_404(Survey, id=survey_id)
    
    # Get departments for targeting
    departments = Department.objects.all().values('id', 'name')
    
    return {
        'survey': serialize_survey(survey, include_questions=True) if survey else None,
        'departments': list(departments),
        'surveyTypes': [{'value': k, 'label': v} for k, v in Survey.SurveyType.choices],
        'triggerEvents': [
            {'value': 'manual', 'label': 'Manual Trigger'},
            {'value': 'resolved', 'label': 'After Ticket Resolved'},
        ],
        'questionTypes': [{'value': k, 'label': v} for k, v in SurveyQuestion.QuestionType.choices],
        'sidebar': get_surveys_sidebar(request),
    }


@require_app('surveys')
@login_required
@inertia('SurveyView')
def survey_detail(request, survey_id):
    """View survey details and responses."""
    survey = get_object_or_404(Survey, id=survey_id)
    
    # Get responses with pagination
    responses_qs = survey.responses.select_related('user', 'ticket', 'agent').order_by('-submitted_at')
    paginator = Paginator(responses_qs, 20)
    page_obj = paginator.get_page(request.GET.get('page', 1))
    
    responses_data = [serialize_response(r, include_answers=True) for r in page_obj]
    
    # Get or create analytics
    analytics, _ = SurveyAnalytics.objects.get_or_create(survey=survey)
    analytics.recalculate()
    
    return {
        'survey': serialize_survey(survey, include_questions=True),
        'responses': responses_data,
        'analytics': {
            'total_invitations': analytics.total_invitations,
            'total_responses': analytics.total_responses,
            'response_rate': float(analytics.response_rate),
            'completion_rate': float(analytics.completion_rate),
            'average_rating': float(analytics.average_rating) if analytics.average_rating else None,
            'nps_score': float(analytics.nps_score) if analytics.nps_score else None,
            'csat_score': float(analytics.csat_score) if analytics.csat_score else None,
            'positive_count': analytics.positive_count,
            'neutral_count': analytics.neutral_count,
            'negative_count': analytics.negative_count,
        },
        'pagination': {
            'current_page': page_obj.number,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        },
        'sidebar': get_surveys_sidebar(request),
    }


# ==========================================
# Survey Responses View
# ==========================================

@require_app('surveys')
@login_required
@inertia('SurveyResponses')
def survey_responses(request):
    """View all survey responses with filtering."""
    view = request.GET.get('view', 'all')
    search = request.GET.get('search', '')
    survey_filter = request.GET.get('survey', '')
    sentiment_filter = request.GET.get('sentiment', '')
    date_from = request.GET.get('date_from', '')
    date_to = request.GET.get('date_to', '')
    page_number = request.GET.get('page', 1)
    per_page = 20
    
    # Base queryset
    responses_qs = SurveyResponse.objects.select_related(
        'survey', 'user', 'ticket', 'agent'
    )
    
    # Apply filters
    if survey_filter:
        responses_qs = responses_qs.filter(survey_id=survey_filter)
    
    if sentiment_filter:
        responses_qs = responses_qs.filter(sentiment=sentiment_filter)
    
    if date_from:
        responses_qs = responses_qs.filter(submitted_at__date__gte=date_from)
    
    if date_to:
        responses_qs = responses_qs.filter(submitted_at__date__lte=date_to)
    
    if search:
        responses_qs = responses_qs.filter(
            Q(user__email__icontains=search) |
            Q(ticket__ticket_number__icontains=search) |
            Q(agent__email__icontains=search)
        )
    
    responses_qs = responses_qs.order_by('-submitted_at')
    
    # Paginate
    paginator = Paginator(responses_qs, per_page)
    page_obj = paginator.get_page(page_number)
    
    responses_data = [serialize_response(r, include_answers=True) for r in page_obj]
    
    # Get surveys for filter dropdown
    surveys = Survey.objects.values('id', 'name')
    
    return {
        'responses': responses_data,
        'sidebar': get_surveys_sidebar(request),
        'currentView': view,
        'filters': {
            'surveys': list(surveys),
            'sentiments': [
                {'value': 'positive', 'label': 'Positive'},
                {'value': 'neutral', 'label': 'Neutral'},
                {'value': 'negative', 'label': 'Negative'},
            ],
        },
        'pagination': {
            'current_page': page_obj.number,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        },
    }


# ==========================================
# Survey Analytics View
# ==========================================

@require_app('surveys')
@login_required
@inertia('SurveyAnalytics')
def survey_analytics(request):
    """Survey analytics dashboard."""
    # Overall stats
    total_surveys = Survey.objects.filter(is_active=True).count()
    total_responses = SurveyResponse.objects.count()
    
    # Date range
    date_from = request.GET.get('date_from', '')
    date_to = request.GET.get('date_to', '')
    
    responses_qs = SurveyResponse.objects.all()
    if date_from:
        responses_qs = responses_qs.filter(submitted_at__date__gte=date_from)
    if date_to:
        responses_qs = responses_qs.filter(submitted_at__date__lte=date_to)
    
    # Calculate overall metrics
    avg_rating = responses_qs.aggregate(avg=Avg('overall_rating'))['avg']
    
    # NPS calculation
    nps_responses = responses_qs.exclude(nps_score__isnull=True)
    nps_score = None
    if nps_responses.exists():
        promoters = nps_responses.filter(nps_score__gte=9).count()
        detractors = nps_responses.filter(nps_score__lte=6).count()
        total = nps_responses.count()
        nps_score = ((promoters - detractors) / total) * 100
    
    # CSAT calculation
    csat_responses = responses_qs.exclude(overall_rating__isnull=True)
    csat_score = None
    if csat_responses.exists():
        satisfied = csat_responses.filter(overall_rating__gte=4).count()
        total = csat_responses.count()
        csat_score = (satisfied / total) * 100
    
    # Sentiment distribution
    sentiment_dist = responses_qs.values('sentiment').annotate(count=Count('id'))
    
    # Response trends (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    daily_responses = responses_qs.filter(
        submitted_at__gte=thirty_days_ago
    ).extra(
        select={'date': 'date(submitted_at)'}
    ).values('date').annotate(count=Count('id')).order_by('date')
    
    # Agent performance
    agent_stats = responses_qs.exclude(agent__isnull=True).values(
        'agent__id', 'agent__first_name', 'agent__last_name', 'agent__email'
    ).annotate(
        response_count=Count('id'),
        avg_rating=Avg('overall_rating')
    ).order_by('-avg_rating')[:10]
    
    return {
        'overview': {
            'total_surveys': total_surveys,
            'total_responses': total_responses,
            'average_rating': round(float(avg_rating), 2) if avg_rating else None,
            'nps_score': round(nps_score, 1) if nps_score else None,
            'csat_score': round(csat_score, 1) if csat_score else None,
        },
        'sentiment_distribution': list(sentiment_dist),
        'response_trends': list(daily_responses),
        'agent_performance': [
            {
                'id': a['agent__id'],
                'name': f"{a['agent__first_name']} {a['agent__last_name']}".strip() or a['agent__email'],
                'response_count': a['response_count'],
                'avg_rating': round(float(a['avg_rating']), 2) if a['avg_rating'] else None,
            }
            for a in agent_stats
        ],
        'sidebar': get_surveys_sidebar(request),
    }


# ==========================================
# Survey Settings View
# ==========================================

@require_app('surveys')
@login_required
@inertia('SurveySettings')
def survey_settings(request):
    """Survey settings page."""
    settings = SurveySettings.get_settings()
    
    # Get email templates
    templates = SurveyEmailTemplate.objects.all()
    
    return {
        'settings': {
            'enabled': settings.enabled,
            'default_send_delay': settings.default_send_delay,
            'allow_anonymous_responses': settings.allow_anonymous_responses,
            'response_expiry_days': settings.response_expiry_days,
            'default_rating_scale': settings.default_rating_scale,
            'send_reminders': settings.send_reminders,
            'reminder_days': settings.reminder_days,
            'max_reminders': settings.max_reminders,
        },
        'email_templates': [
            {
                'id': t.id,
                'name': t.name,
                'template_type': t.template_type,
                'template_type_display': t.get_template_type_display(),
                'subject': t.subject,
                'is_default': t.is_default,
                'is_active': t.is_active,
            }
            for t in templates
        ],
        'sidebar': get_surveys_sidebar(request),
    }


# ==========================================
# Public Survey Response View (No Login Required)
# ==========================================

@inertia('SurveySubmit')
def public_survey_view(request, token):
    """
    Public survey submission page.
    Accessed via unique token, no login required.
    """
    invitation = get_object_or_404(SurveyInvitation, token=token)
    
    # Check if expired
    if invitation.is_expired:
        return {
            'error': 'This survey link has expired.',
            'expired': True,
        }
    
    # Check if already completed
    if invitation.status == SurveyInvitation.Status.COMPLETED and not invitation.survey.allow_multiple_responses:
        return {
            'error': 'You have already completed this survey.',
            'already_completed': True,
        }
    
    # Mark as opened if first time
    if invitation.status in [SurveyInvitation.Status.PENDING, SurveyInvitation.Status.SENT]:
        invitation.status = SurveyInvitation.Status.OPENED
        invitation.opened_at = timezone.now()
        invitation.save(update_fields=['status', 'opened_at'])
    
    survey = invitation.survey
    
    return {
        'survey': serialize_survey(survey, include_questions=True),
        'invitation': {
            'token': invitation.token,
            'ticket_number': invitation.ticket.ticket_number if invitation.ticket else None,
            'user_name': invitation.user_name,
        },
        'expired': False,
        'already_completed': False,
    }


# ==========================================
# API Endpoints
# ==========================================

@require_app('surveys')
@login_required
@require_http_methods(["POST"])
def api_create_survey(request):
    """Create a new survey."""
    try:
        data = json.loads(request.body)
        
        survey = Survey.objects.create(
            name=data['name'],
            description=data.get('description', ''),
            survey_type=data.get('survey_type', Survey.SurveyType.CSAT),
            trigger_event=data.get('trigger_event', Survey.TriggerEvent.TICKET_RESOLVED),
            send_delay=data.get('send_delay', 30),
            expiry_days=data.get('expiry_days', 7),
            is_active=data.get('is_active', True),
            is_default=data.get('is_default', False),
            allow_multiple_responses=data.get('allow_multiple_responses', False),
            is_anonymous=data.get('is_anonymous', False),
            thank_you_message=data.get('thank_you_message', ''),
            created_by=request.user,
        )
        
        # Create questions
        for i, q_data in enumerate(data.get('questions', [])):
            question = SurveyQuestion.objects.create(
                survey=survey,
                question_text=q_data['question_text'],
                question_type=q_data.get('question_type', 'rating'),
                is_required=q_data.get('is_required', True),
                order=q_data.get('order', i),
                rating_scale=q_data.get('rating_scale', 5),
                rating_labels=q_data.get('rating_labels', {}),
                placeholder_text=q_data.get('placeholder_text', ''),
            )
            
            # Create choices for choice questions
            for j, c_data in enumerate(q_data.get('choices', [])):
                SurveyChoice.objects.create(
                    question=question,
                    label=c_data['label'],
                    value=c_data.get('value', c_data['label']),
                    is_other=c_data.get('is_other', False),
                    order=c_data.get('order', j),
                )
        
        # Create analytics record
        SurveyAnalytics.objects.create(survey=survey)
        
        return JsonResponse({
            'success': True,
            'survey': serialize_survey(survey, include_questions=True)
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_app('surveys')
@login_required
@require_http_methods(["PUT"])
def api_update_survey(request, survey_id):
    """Update an existing survey."""
    try:
        survey = get_object_or_404(Survey, id=survey_id)
        data = json.loads(request.body)
        
        # Update survey fields
        for field in ['name', 'description', 'survey_type', 'trigger_event', 
                      'send_delay', 'expiry_days', 'is_active', 'is_default',
                      'allow_multiple_responses', 'is_anonymous', 'thank_you_message']:
            if field in data:
                setattr(survey, field, data[field])
        
        survey.save()
        
        # Update questions if provided
        if 'questions' in data:
            # Get existing question IDs
            existing_ids = set(survey.questions.values_list('id', flat=True))
            updated_ids = set()
            
            for i, q_data in enumerate(data['questions']):
                q_id = q_data.get('id')
                
                if q_id and q_id in existing_ids:
                    # Update existing question
                    question = SurveyQuestion.objects.get(id=q_id)
                    for field in ['question_text', 'question_type', 'is_required', 
                                  'rating_scale', 'rating_labels', 'placeholder_text']:
                        if field in q_data:
                            setattr(question, field, q_data[field])
                    question.order = i
                    question.save()
                    updated_ids.add(q_id)
                else:
                    # Create new question
                    question = SurveyQuestion.objects.create(
                        survey=survey,
                        question_text=q_data['question_text'],
                        question_type=q_data.get('question_type', 'rating'),
                        is_required=q_data.get('is_required', True),
                        order=i,
                        rating_scale=q_data.get('rating_scale', 5),
                        rating_labels=q_data.get('rating_labels', {}),
                        placeholder_text=q_data.get('placeholder_text', ''),
                    )
                
                # Handle choices
                if q_data.get('choices'):
                    question.choices.all().delete()
                    for j, c_data in enumerate(q_data['choices']):
                        SurveyChoice.objects.create(
                            question=question,
                            label=c_data['label'],
                            value=c_data.get('value', c_data['label']),
                            is_other=c_data.get('is_other', False),
                            order=j,
                        )
            
            # Delete removed questions
            removed_ids = existing_ids - updated_ids
            if removed_ids:
                SurveyQuestion.objects.filter(id__in=removed_ids).delete()
        
        return JsonResponse({
            'success': True,
            'survey': serialize_survey(survey, include_questions=True)
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_app('surveys')
@login_required
@require_http_methods(["DELETE"])
def api_delete_survey(request, survey_id):
    """Delete a survey."""
    try:
        survey = get_object_or_404(Survey, id=survey_id)
        survey.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_submit_response(request, token):
    """Submit a survey response (public endpoint)."""
    try:
        invitation = get_object_or_404(SurveyInvitation, token=token)
        
        # Validate invitation
        if invitation.is_expired:
            return JsonResponse({'success': False, 'error': 'Survey link has expired'}, status=400)
        
        if invitation.status == SurveyInvitation.Status.COMPLETED and not invitation.survey.allow_multiple_responses:
            return JsonResponse({'success': False, 'error': 'Survey already completed'}, status=400)
        
        data = json.loads(request.body)
        survey = invitation.survey
        
        # Create response
        response = SurveyResponse.objects.create(
            survey=survey,
            invitation=invitation,
            ticket=invitation.ticket,
            user=invitation.user,
            agent=invitation.agent,
            is_anonymous=survey.is_anonymous,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        
        # Process answers
        answers_data = data.get('answers', {})
        for question in survey.questions.all():
            q_id = str(question.id)
            if q_id in answers_data:
                answer_value = answers_data[q_id]
                
                answer = SurveyAnswer(
                    response=response,
                    question=question,
                )
                
                # Set value based on question type
                if question.question_type == 'text':
                    answer.text_value = str(answer_value)
                elif question.question_type in ['rating', 'nps']:
                    answer.numeric_value = float(answer_value)
                elif question.question_type in ['single_choice', 'multiple_choice']:
                    if isinstance(answer_value, list):
                        answer.choice_values = answer_value
                    else:
                        answer.choice_values = [answer_value]
                elif question.question_type == 'yes_no':
                    answer.boolean_value = answer_value in [True, 'true', 'yes', '1', 1]
                
                answer.save()
        
        # Calculate overall rating
        response.calculate_overall_rating()
        
        # Update invitation status
        invitation.status = SurveyInvitation.Status.COMPLETED
        invitation.completed_at = timezone.now()
        invitation.save(update_fields=['status', 'completed_at'])
        
        # Update analytics
        analytics, _ = SurveyAnalytics.objects.get_or_create(survey=survey)
        analytics.recalculate()
        
        return JsonResponse({
            'success': True,
            'message': survey.thank_you_message,
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_app('surveys')
@login_required
@require_http_methods(["POST"])
def api_send_manual_survey(request, ticket_id):
    """Send a survey manually for a ticket."""
    try:
        ticket = get_object_or_404(Ticket, id=ticket_id)
        data = json.loads(request.body)
        
        survey_id = data.get('survey_id')
        if not survey_id:
            return JsonResponse({'success': False, 'error': 'Survey ID required'}, status=400)
        
        survey = get_object_or_404(Survey, id=survey_id)
        
        from .signals import send_manual_survey
        invitation = send_manual_survey(
            survey=survey,
            ticket=ticket,
            email=data.get('email', ticket.customer.email if ticket.customer else None),
        )
        
        if invitation:
            return JsonResponse({
                'success': True,
                'invitation': serialize_invitation(invitation)
            })
        else:
            return JsonResponse({'success': False, 'error': 'Could not create invitation'}, status=400)
            
    except ValueError as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_app('surveys')
@login_required
@require_http_methods(["PUT"])
def api_update_settings(request):
    """Update global survey settings."""
    try:
        settings = SurveySettings.get_settings()
        data = json.loads(request.body)
        
        for field in ['enabled', 'default_send_delay', 'allow_anonymous_responses',
                      'response_expiry_days', 'default_rating_scale', 'send_reminders',
                      'reminder_days', 'max_reminders']:
            if field in data:
                setattr(settings, field, data[field])
        
        settings.save()
        
        return JsonResponse({'success': True})
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@require_app('surveys')
@login_required
def api_get_survey_questions(request, survey_id):
    """Get questions for a specific survey."""
    survey = get_object_or_404(Survey, id=survey_id)
    questions = [serialize_question(q) for q in survey.questions.all()]
    return JsonResponse({'questions': questions})


@require_app('surveys')
@login_required
def api_list_surveys(request):
    """List all active surveys (for dropdown selections)."""
    surveys = Survey.objects.filter(is_active=True).values('id', 'name', 'survey_type', 'trigger_event')
    return JsonResponse({'surveys': list(surveys)})


@require_app('surveys')
@login_required
@require_http_methods(["POST"])
def api_send_test_survey(request, survey_id):
    """
    Send a test survey to a specified email address.
    Creates an invitation without requiring a ticket.
    """
    try:
        survey = get_object_or_404(Survey, id=survey_id)
        data = json.loads(request.body)
        
        email = data.get('email')
        if not email:
            return JsonResponse({'success': False, 'error': 'Email address required'}, status=400)
        
        # Check if survey has questions
        if survey.questions.count() == 0:
            return JsonResponse({'success': False, 'error': 'Survey has no questions'}, status=400)
        
        # Calculate expiry
        expires_at = timezone.now() + timedelta(days=survey.expiry_days)
        
        # Create test invitation (without ticket)
        invitation = SurveyInvitation.objects.create(
            survey=survey,
            ticket=None,
            user=None,
            email=email,
            user_name='Test User',
            agent=request.user,
            status=SurveyInvitation.Status.SENT,
            scheduled_at=timezone.now(),
            expires_at=expires_at,
            sent_at=timezone.now(),
            metadata={
                'is_test': True,
                'sent_by': request.user.email,
            }
        )
        
        # Build survey URL
        tenant_domain = request.get_host()
        protocol = 'https' if request.is_secure() else 'http'
        survey_url = f"{protocol}://{tenant_domain}/survey/{invitation.token}/"
        
        # Send email
        from shared.utilities.Mailer import Mailer
        try:
            mailer = Mailer()
            mailer.send_raw_email(
                to_email=email,
                subject=f"[Test] Survey: {survey.name}",
                body_html=f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #4a154b; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">Survey Test</h1>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                        <p>This is a test survey invitation.</p>
                        <h2 style="color: #4a154b;">{survey.name}</h2>
                        {f'<p>{survey.description}</p>' if survey.description else ''}
                        <p style="margin: 20px 0;">
                            <a href="{survey_url}" style="display: inline-block; background-color: #4a154b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Take Survey</a>
                        </p>
                        <p style="font-size: 12px; color: #666;">This link will expire in {survey.expiry_days} days.</p>
                        <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="font-size: 12px; color: #666; word-break: break-all;">{survey_url}</p>
                    </div>
                </div>
                """,
            )
        except Exception as email_error:
            # If email fails, still return the URL for manual testing
            pass
        
        return JsonResponse({
            'success': True,
            'message': f'Test survey sent to {email}',
            'survey_url': survey_url,
            'token': invitation.token,
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)
