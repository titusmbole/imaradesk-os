"""
Security decorators for backoffice admin routes.
Provides authentication, authorization, and additional security measures.
"""
from functools import wraps
from django.http import JsonResponse
from django.shortcuts import redirect
from django.core.cache import cache
from django.utils import timezone
from inertia import render as inertia_render
import hashlib
import time

from .models import AdminUser, ActivityLog


def get_client_ip(request):
    """Get the real client IP address."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_admin_from_session(request):
    """Get admin user from session with additional validation."""
    admin_id = request.session.get('backoffice_admin_id')
    session_ip = request.session.get('backoffice_session_ip')
    session_ua_hash = request.session.get('backoffice_session_ua_hash')
    
    if not admin_id:
        return None
    
    # Validate session IP (optional - can be disabled for users with dynamic IPs)
    current_ip = get_client_ip(request)
    
    # Validate user agent hash to prevent session hijacking
    current_ua = request.META.get('HTTP_USER_AGENT', '')
    current_ua_hash = hashlib.sha256(current_ua.encode()).hexdigest()[:16]
    
    if session_ua_hash and session_ua_hash != current_ua_hash:
        # User agent changed - possible session hijacking
        request.session.pop('backoffice_admin_id', None)
        return None
    
    try:
        admin = AdminUser.objects.get(id=admin_id, is_active=True)
        return admin
    except AdminUser.DoesNotExist:
        request.session.pop('backoffice_admin_id', None)
        return None


def set_admin_session(request, admin):
    """Set admin session with security tokens."""
    request.session['backoffice_admin_id'] = admin.id
    request.session['backoffice_session_ip'] = get_client_ip(request)
    request.session['backoffice_session_ua_hash'] = hashlib.sha256(
        request.META.get('HTTP_USER_AGENT', '').encode()
    ).hexdigest()[:16]
    request.session['backoffice_session_created'] = timezone.now().isoformat()
    
    # Set session to expire after 2 hours of inactivity for backoffice
    request.session.set_expiry(7200)  # 2 hours


def clear_admin_session(request):
    """Clear all backoffice session data."""
    keys_to_remove = [
        'backoffice_admin_id',
        'backoffice_session_ip', 
        'backoffice_session_ua_hash',
        'backoffice_session_created'
    ]
    for key in keys_to_remove:
        request.session.pop(key, None)


def backoffice_login_required(view_func):
    """
    Decorator that ensures the user is logged in as a backoffice admin.
    For API endpoints, returns JSON error.
    For page views, redirects to login.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        admin = get_admin_from_session(request)
        
        if not admin:
            # Check if it's an API request
            if request.path.startswith('/backoffice/api/'):
                return JsonResponse({
                    'error': 'Authentication required',
                    'code': 'UNAUTHORIZED'
                }, status=401)
            
            # For Inertia page requests, redirect to login
            return redirect('/backoffice/login/')
        
        # Attach admin to request for easy access
        request.backoffice_admin = admin
        
        # Update last activity
        request.session.modified = True
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def backoffice_permission_required(*permissions):
    """
    Decorator that checks if admin has required permissions.
    Superadmins bypass all permission checks.
    
    Usage:
        @backoffice_permission_required('can_manage_businesses')
        @backoffice_permission_required('can_manage_packages', 'can_manage_billing')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            admin = getattr(request, 'backoffice_admin', None)
            
            if not admin:
                admin = get_admin_from_session(request)
                if not admin:
                    if request.path.startswith('/backoffice/api/'):
                        return JsonResponse({
                            'error': 'Authentication required',
                            'code': 'UNAUTHORIZED'
                        }, status=401)
                    return redirect('/backoffice/login/')
                request.backoffice_admin = admin
            
            # Superadmins have all permissions
            if admin.is_superadmin:
                return view_func(request, *args, **kwargs)
            
            # Check each required permission
            for perm in permissions:
                if not getattr(admin, perm, False):
                    if request.path.startswith('/backoffice/api/'):
                        return JsonResponse({
                            'error': 'Permission denied',
                            'code': 'FORBIDDEN',
                            'required_permission': perm
                        }, status=403)
                    # For pages, show error or redirect
                    return JsonResponse({
                        'error': 'You do not have permission to access this resource'
                    }, status=403)
            
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def backoffice_rate_limit(max_requests=60, window_seconds=60, key_prefix='backoffice'):
    """
    Rate limiting decorator for backoffice endpoints.
    
    Args:
        max_requests: Maximum requests allowed in the window
        window_seconds: Time window in seconds
        key_prefix: Cache key prefix for rate limit tracking
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Create unique key based on IP and endpoint
            ip = get_client_ip(request)
            endpoint = request.path
            cache_key = f"{key_prefix}:rate:{ip}:{endpoint}"
            
            # Get current request count
            current = cache.get(cache_key, {'count': 0, 'start': time.time()})
            
            # Reset if window has passed
            if time.time() - current['start'] > window_seconds:
                current = {'count': 0, 'start': time.time()}
            
            current['count'] += 1
            
            if current['count'] > max_requests:
                # Log rate limit hit
                try:
                    ActivityLog.objects.create(
                        admin_user=None,
                        action_type='rate_limit',
                        target_type='Security',
                        target_name=endpoint,
                        description=f'Rate limit exceeded from IP: {ip}',
                        ip_address=ip,
                        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
                    )
                except:
                    pass
                
                return JsonResponse({
                    'error': 'Too many requests. Please slow down.',
                    'code': 'RATE_LIMITED',
                    'retry_after': window_seconds
                }, status=429)
            
            cache.set(cache_key, current, window_seconds)
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator


def backoffice_log_action(action_type, target_type, get_target_name=None):
    """
    Decorator that automatically logs admin actions.
    
    Args:
        action_type: Type of action (create, update, delete, etc.)
        target_type: Type of target being acted upon
        get_target_name: Optional callable to extract target name from args/kwargs
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            response = view_func(request, *args, **kwargs)
            
            # Only log successful actions
            if hasattr(response, 'status_code') and 200 <= response.status_code < 300:
                admin = getattr(request, 'backoffice_admin', None)
                target_name = ''
                
                if get_target_name and callable(get_target_name):
                    try:
                        target_name = get_target_name(*args, **kwargs)
                    except:
                        pass
                
                try:
                    ActivityLog.objects.create(
                        admin_user=admin,
                        action_type=action_type,
                        target_type=target_type,
                        target_name=target_name,
                        ip_address=get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
                    )
                except:
                    pass
            
            return response
        
        return wrapper
    return decorator
