from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import json
import hashlib
import secrets

from inertia import inertia

from shared.models import Client, Domain
from .models import Package, Subscription, BillingHistory, AdminUser, ActivityLog
from .decorators import (
    backoffice_login_required,
    backoffice_permission_required,
    backoffice_rate_limit,
    get_admin_from_session,
    set_admin_session,
    clear_admin_session,
    get_client_ip,
)


# Helper functions
def hash_password(password):
    """Hash password using SHA-256 with salt."""
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}:{hashed}"


def verify_password(stored_hash, password):
    """Verify password against stored hash."""
    try:
        salt, hashed = stored_hash.split(':')
        return hashlib.sha256((salt + password).encode()).hexdigest() == hashed
    except:
        return False


def log_activity(admin_user, action_type, target_type, target_id='', target_name='', description='', request=None, metadata=None):
    """Log admin activity."""
    ActivityLog.objects.create(
        admin_user=admin_user,
        action_type=action_type,
        target_type=target_type,
        target_id=str(target_id),
        target_name=target_name,
        description=description,
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:500] if request else '',
        metadata=metadata or {}
    )


def get_tenant_agent_count(schema_name):
    """Get agent count for a tenant by querying their schema."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(f'''
                SELECT COUNT(*) FROM "{schema_name}"."users_userprofile" 
                WHERE is_agent = true
            ''')
            result = cursor.fetchone()
            return result[0] if result else 0
    except Exception:
        return 0


def get_tenant_customer_count(schema_name):
    """Get customer count for a tenant."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(f'''
                SELECT COUNT(*) FROM "{schema_name}"."users_userprofile" 
                WHERE is_customer = true
            ''')
            result = cursor.fetchone()
            return result[0] if result else 0
    except Exception:
        return 0


def get_tenant_ticket_count(schema_name):
    """Get total ticket count for a tenant."""
    try:
        with connection.cursor() as cursor:
            cursor.execute(f'''
                SELECT COUNT(*) FROM "{schema_name}"."ticket_ticket"
            ''')
            result = cursor.fetchone()
            return result[0] if result else 0
    except Exception:
        return 0


# Views
@backoffice_login_required
@inertia('Backoffice/Dashboard')
def dashboard(request):
    """Main backoffice dashboard with summary statistics."""
    admin = request.backoffice_admin
    
    # Get summary statistics
    total_businesses = Client.objects.count()
    active_businesses = Client.objects.filter(is_active=True).count()
    inactive_businesses = total_businesses - active_businesses
    
    # Subscription stats
    subscriptions = Subscription.objects.all()
    active_subscriptions = subscriptions.filter(status='active').count()
    trial_subscriptions = subscriptions.filter(status='trial').count()
    
    # Revenue stats
    this_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month = (this_month - timedelta(days=1)).replace(day=1)
    
    monthly_revenue = BillingHistory.objects.filter(
        status='completed',
        created_at__gte=this_month
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    last_month_revenue = BillingHistory.objects.filter(
        status='completed',
        created_at__gte=last_month,
        created_at__lt=this_month
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    # Recent businesses
    recent_businesses = []
    for client in Client.objects.order_by('-created_on')[:5]:
        subscription = Subscription.objects.filter(tenant_schema=client.schema_name).first()
        recent_businesses.append({
            'id': client.id,
            'name': client.name,
            'schema_name': client.schema_name,
            'created_on': client.created_on.isoformat() if client.created_on else None,
            'is_active': client.is_active,
            'package': subscription.package.name if subscription else 'No Package',
            'status': subscription.status if subscription else 'unknown',
        })
    
    # Package distribution
    package_distribution = []
    for package in Package.objects.filter(is_active=True):
        count = Subscription.objects.filter(package=package, status__in=['active', 'trial']).count()
        package_distribution.append({
            'name': package.name,
            'count': count,
            'revenue': float(package.price_monthly * count)
        })
    
    # Recent activity
    recent_activity = []
    for log in ActivityLog.objects.select_related('admin_user')[:10]:
        recent_activity.append({
            'id': log.id,
            'admin_name': log.admin_user.full_name if log.admin_user else 'System',
            'action_type': log.action_type,
            'target_type': log.target_type,
            'target_name': log.target_name,
            'description': log.description,
            'created_at': log.created_at.isoformat()
        })
    
    return {
        'admin': {
            'id': admin.id,
            'email': admin.email,
            'full_name': admin.full_name,
            'is_superadmin': admin.is_superadmin,
        },
        'stats': {
            'total_businesses': total_businesses,
            'active_businesses': active_businesses,
            'inactive_businesses': inactive_businesses,
            'active_subscriptions': active_subscriptions,
            'trial_subscriptions': trial_subscriptions,
            'monthly_revenue': float(monthly_revenue),
            'last_month_revenue': float(last_month_revenue),
            'revenue_growth': float(((monthly_revenue - last_month_revenue) / last_month_revenue * 100) if last_month_revenue > 0 else 0),
        },
        'recent_businesses': recent_businesses,
        'package_distribution': package_distribution,
        'recent_activity': recent_activity,
    }


@inertia('Backoffice/Login')
def login_page(request):
    """Backoffice login page."""
    admin = get_admin_from_session(request)
    if admin:
        return {'redirect': '/backoffice/'}
    return {}


@backoffice_rate_limit(max_requests=5, window_seconds=60, key_prefix='backoffice_login')
@csrf_exempt
@require_http_methods(['POST'])
def login(request):
    """Handle admin login."""
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)
        
        try:
            admin = AdminUser.objects.get(email=email, is_active=True)
        except AdminUser.DoesNotExist:
            # Log failed login attempt
            log_activity(
                None, 'login_failed', 'AdminUser', '', email,
                f'Failed login attempt for {email}', request
            )
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        if not verify_password(admin.password_hash, password):
            # Log failed login attempt
            log_activity(
                None, 'login_failed', 'AdminUser', admin.id, admin.email,
                'Failed login - incorrect password', request
            )
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        # Update last login
        admin.last_login = timezone.now()
        admin.save(update_fields=['last_login'])
        
        # Set secure session
        set_admin_session(request, admin)
        
        # Log activity
        log_activity(admin, 'login', 'AdminUser', admin.id, admin.email, 'Admin logged in', request)
        
        return JsonResponse({
            'success': True,
            'admin': {
                'id': admin.id,
                'email': admin.email,
                'full_name': admin.full_name,
            }
        })
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@backoffice_login_required
@require_http_methods(['POST'])
def logout(request):
    """Handle admin logout."""
    admin = request.backoffice_admin
    log_activity(admin, 'logout', 'AdminUser', admin.id, admin.email, 'Admin logged out', request)
    
    clear_admin_session(request)
    return JsonResponse({'success': True})


@backoffice_login_required
@inertia('Backoffice/Businesses')
def businesses_list(request):
    """List all businesses/tenants."""
    admin = request.backoffice_admin
    
    # Get filter params
    status_filter = request.GET.get('status', 'all')
    search = request.GET.get('search', '')
    package_filter = request.GET.get('package', '')
    
    # Query businesses
    clients = Client.objects.all()
    
    if search:
        clients = clients.filter(
            Q(name__icontains=search) | 
            Q(schema_name__icontains=search) |
            Q(description__icontains=search)
        )
    
    if status_filter == 'active':
        clients = clients.filter(is_active=True)
    elif status_filter == 'inactive':
        clients = clients.filter(is_active=False)
    
    businesses = []
    for client in clients.order_by('-created_on'):
        # Get subscription
        subscription = Subscription.objects.filter(tenant_schema=client.schema_name).first()
        
        # Skip if package filter and doesn't match
        if package_filter and subscription and subscription.package.slug != package_filter:
            continue
        if package_filter and not subscription:
            continue
        
        # Get domains
        domains = Domain.objects.filter(tenant=client)
        primary_domain = domains.filter(is_primary=True).first()
        
        businesses.append({
            'id': client.id,
            'name': client.name,
            'schema_name': client.schema_name,
            'description': client.description,
            'is_active': client.is_active,
            'created_on': client.created_on.isoformat() if client.created_on else None,
            'business_type': client.business_type,
            'org_size': client.org_size,
            'primary_domain': primary_domain.domain if primary_domain else None,
            'subscription': {
                'package': subscription.package.name if subscription else None,
                'package_slug': subscription.package.slug if subscription else None,
                'status': subscription.status if subscription else None,
                'billing_cycle': subscription.billing_cycle if subscription else None,
                'current_period_end': subscription.current_period_end.isoformat() if subscription and subscription.current_period_end else None,
            } if subscription else None,
            'agent_count': get_tenant_agent_count(client.schema_name),
            'customer_count': get_tenant_customer_count(client.schema_name),
            'ticket_count': get_tenant_ticket_count(client.schema_name),
            # Registration tracking - Admin who created the business
            'created_by': {
                'email': client.created_by_email,
                'name': client.created_by_name,
            } if client.created_by_email else None,
            # Registration tracking - Location
            'registration': {
                'ip': client.registration_ip,
                'country': client.registration_country,
                'city': client.registration_city,
                'region': client.registration_region,
                'timezone': client.registration_timezone,
                'location': f"{client.registration_city or ''}{', ' if client.registration_city and client.registration_region else ''}{client.registration_region or ''}{', ' if (client.registration_city or client.registration_region) and client.registration_country else ''}{client.registration_country or ''}" if (client.registration_city or client.registration_region or client.registration_country) else None,
                'timestamp': client.registration_timestamp.isoformat() if client.registration_timestamp else None,
            } if client.registration_ip else None,
        })
    
    # Get packages for filter
    packages = [{'slug': p.slug, 'name': p.name} for p in Package.objects.filter(is_active=True)]
    
    return {
        'admin': {
            'id': admin.id,
            'email': admin.email,
            'full_name': admin.full_name,
            'is_superadmin': admin.is_superadmin,
        },
        'businesses': businesses,
        'packages': packages,
        'filters': {
            'status': status_filter,
            'search': search,
            'package': package_filter,
        }
    }


@backoffice_login_required
@inertia('Backoffice/BusinessDetail')
def business_detail(request, schema_name):
    """View detailed info about a business."""
    admin = request.backoffice_admin
    
    try:
        client = Client.objects.get(schema_name=schema_name)
    except Client.DoesNotExist:
        return {'redirect': '/backoffice/businesses/', 'error': 'Business not found'}
    
    # Get subscription
    subscription = Subscription.objects.filter(tenant_schema=schema_name).first()
    
    # Get domains
    domains = list(Domain.objects.filter(tenant=client).values('domain', 'is_primary'))
    
    # Get billing history
    billing_history = []
    if subscription:
        for record in subscription.billing_history.all()[:20]:
            billing_history.append({
                'id': record.id,
                'type': record.transaction_type,
                'amount': float(record.amount),
                'currency': record.currency,
                'status': record.status,
                'invoice_number': record.invoice_number,
                'description': record.description,
                'created_at': record.created_at.isoformat(),
            })
    
    # Get all packages for plan change
    packages = [
        {
            'id': p.id,
            'slug': p.slug,
            'name': p.name,
            'price_monthly': float(p.price_monthly),
            'price_yearly': float(p.price_yearly),
            'max_agents': p.max_agents,
        }
        for p in Package.objects.filter(is_active=True)
    ]
    
    return {
        'admin': {
            'id': admin.id,
            'email': admin.email,
            'full_name': admin.full_name,
            'is_superadmin': admin.is_superadmin,
        },
        'business': {
            'id': client.id,
            'name': client.name,
            'schema_name': client.schema_name,
            'description': client.description,
            'is_active': client.is_active,
            'created_on': client.created_on.isoformat() if client.created_on else None,
            'business_type': client.business_type,
            'org_size': client.org_size,
            'service_types': client.service_types,
            'features_interest': client.features_interest,
            'domains': domains,
            # Registration tracking - Admin who created the business
            'created_by': {
                'email': client.created_by_email,
                'name': client.created_by_name,
            } if client.created_by_email else None,
            # Registration tracking - Location info
            'registration': {
                'ip': client.registration_ip,
                'country': client.registration_country,
                'city': client.registration_city,
                'region': client.registration_region,
                'timezone': client.registration_timezone,
                'user_agent': client.registration_user_agent,
                'timestamp': client.registration_timestamp.isoformat() if client.registration_timestamp else None,
                'location_data': client.registration_location_data,
            } if client.registration_ip else None,
        },
        'subscription': {
            'id': subscription.id,
            'package': {
                'id': subscription.package.id,
                'slug': subscription.package.slug,
                'name': subscription.package.name,
                'max_agents': subscription.max_agents,
                'max_customers': subscription.max_customers,
                'storage_limit': subscription.storage_limit,
            },
            'status': subscription.status,
            'billing_cycle': subscription.billing_cycle,
            'current_price': float(subscription.current_price),
            'discount_percent': float(subscription.discount_percent),
            'trial_started_at': subscription.trial_started_at.isoformat() if subscription.trial_started_at else None,
            'trial_ends_at': subscription.trial_ends_at.isoformat() if subscription.trial_ends_at else None,
            'started_at': subscription.started_at.isoformat() if subscription.started_at else None,
            'current_period_start': subscription.current_period_start.isoformat() if subscription.current_period_start else None,
            'current_period_end': subscription.current_period_end.isoformat() if subscription.current_period_end else None,
            'notes': subscription.notes,
        } if subscription else None,
        'usage': {
            'agent_count': get_tenant_agent_count(schema_name),
            'customer_count': get_tenant_customer_count(schema_name),
            'ticket_count': get_tenant_ticket_count(schema_name),
        },
        'billing_history': billing_history,
        'packages': packages,
    }


@backoffice_login_required
@backoffice_permission_required('can_manage_businesses')
@backoffice_rate_limit(max_requests=30, window_seconds=60)
@csrf_exempt
@require_http_methods(['POST'])
def toggle_business_status(request, schema_name):
    """Activate or deactivate a business."""
    admin = request.backoffice_admin
    
    try:
        client = Client.objects.get(schema_name=schema_name)
    except Client.DoesNotExist:
        return JsonResponse({'error': 'Business not found'}, status=404)
    
    # Toggle status
    client.is_active = not client.is_active
    client.save(update_fields=['is_active'])
    
    action = 'activate' if client.is_active else 'deactivate'
    log_activity(
        admin, action, 'Client', client.id, client.name,
        f'Business {"activated" if client.is_active else "deactivated"}', request
    )
    
    return JsonResponse({
        'success': True,
        'is_active': client.is_active,
        'message': f'Business {"activated" if client.is_active else "deactivated"} successfully'
    })


@backoffice_login_required
@backoffice_permission_required('can_manage_billing')
@backoffice_rate_limit(max_requests=30, window_seconds=60)
@csrf_exempt
@require_http_methods(['POST'])
def update_subscription(request, schema_name):
    """Update a business subscription."""
    admin = request.backoffice_admin
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        subscription = Subscription.objects.get(tenant_schema=schema_name)
    except Subscription.DoesNotExist:
        return JsonResponse({'error': 'Subscription not found'}, status=404)
    
    # Update fields
    if 'package_id' in data:
        try:
            package = Package.objects.get(id=data['package_id'], is_active=True)
            subscription.package = package
            subscription.current_price = package.get_price(subscription.billing_cycle)
        except Package.DoesNotExist:
            return JsonResponse({'error': 'Package not found'}, status=404)
    
    if 'status' in data:
        subscription.status = data['status']
    
    if 'billing_cycle' in data:
        subscription.billing_cycle = data['billing_cycle']
        subscription.current_price = subscription.package.get_price(data['billing_cycle'])
    
    if 'discount_percent' in data:
        subscription.discount_percent = Decimal(str(data['discount_percent']))
    
    if 'notes' in data:
        subscription.notes = data['notes']
    
    subscription.save()
    
    log_activity(
        admin, 'update', 'Subscription', subscription.id, 
        f'{schema_name} subscription', 'Subscription updated', request, data
    )
    
    return JsonResponse({'success': True, 'message': 'Subscription updated successfully'})


@backoffice_login_required
@inertia('Backoffice/Packages')
def packages_list(request):
    """List and manage packages."""
    admin = request.backoffice_admin
    
    packages = []
    for package in Package.objects.all():
        subscription_count = Subscription.objects.filter(
            package=package, status__in=['active', 'trial']
        ).count()
        
        packages.append({
            'id': package.id,
            'name': package.name,
            'slug': package.slug,
            'description': package.description,
            'price_monthly': float(package.price_monthly),
            'price_yearly': float(package.price_yearly),
            'max_agents': package.max_agents,
            'max_customers': package.max_customers,
            'max_tickets_per_month': package.max_tickets_per_month,
            'storage_limit_gb': package.storage_limit_gb,
            'features': package.features,
            'is_active': package.is_active,
            'is_featured': package.is_featured,
            'badge_text': package.badge_text,
            'badge_color': package.badge_color,
            'display_order': package.display_order,
            'subscription_count': subscription_count,
        })
    
    return {
        'admin': {
            'id': admin.id,
            'email': admin.email,
            'full_name': admin.full_name,
            'is_superadmin': admin.is_superadmin,
            'can_manage_packages': admin.can_manage_packages,
        },
        'packages': packages,
    }


@backoffice_login_required
@backoffice_permission_required('can_manage_packages')
@backoffice_rate_limit(max_requests=20, window_seconds=60)
@csrf_exempt
@require_http_methods(['POST'])
def create_package(request):
    """Create a new package."""
    admin = request.backoffice_admin
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Validate required fields
    if not data.get('name') or not data.get('slug'):
        return JsonResponse({'error': 'Name and slug are required'}, status=400)
    
    # Check for duplicate slug
    if Package.objects.filter(slug=data['slug']).exists():
        return JsonResponse({'error': 'A package with this slug already exists'}, status=400)
    
    package = Package.objects.create(
        name=data['name'],
        slug=data['slug'],
        description=data.get('description', ''),
        price_monthly=Decimal(str(data.get('price_monthly', 0))),
        price_yearly=Decimal(str(data.get('price_yearly', 0))),
        max_agents=data.get('max_agents', 5),
        max_customers=data.get('max_customers', 100),
        max_tickets_per_month=data.get('max_tickets_per_month', 500),
        storage_limit_gb=data.get('storage_limit_gb', 5),
        features=data.get('features', []),
        is_active=data.get('is_active', True),
        is_featured=data.get('is_featured', False),
        badge_text=data.get('badge_text', ''),
        badge_color=data.get('badge_color', 'blue'),
        display_order=data.get('display_order', 0),
    )
    
    log_activity(admin, 'create', 'Package', package.id, package.name, 'Package created', request)
    
    return JsonResponse({'success': True, 'id': package.id, 'message': 'Package created successfully'})


@backoffice_login_required
@backoffice_permission_required('can_manage_packages')
@backoffice_rate_limit(max_requests=30, window_seconds=60)
@csrf_exempt
@require_http_methods(['POST'])
def update_package(request, package_id):
    """Update an existing package."""
    admin = request.backoffice_admin
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        package = Package.objects.get(id=package_id)
    except Package.DoesNotExist:
        return JsonResponse({'error': 'Package not found'}, status=404)
    
    # Update fields
    for field in ['name', 'description', 'badge_text', 'badge_color']:
        if field in data:
            setattr(package, field, data[field])
    
    for field in ['price_monthly', 'price_yearly']:
        if field in data:
            setattr(package, field, Decimal(str(data[field])))
    
    for field in ['max_agents', 'max_customers', 'max_tickets_per_month', 'storage_limit_gb', 'display_order']:
        if field in data:
            setattr(package, field, int(data[field]))
    
    for field in ['is_active', 'is_featured']:
        if field in data:
            setattr(package, field, bool(data[field]))
    
    if 'features' in data:
        package.features = data['features']
    
    package.save()
    
    log_activity(admin, 'update', 'Package', package.id, package.name, 'Package updated', request)
    
    return JsonResponse({'success': True, 'message': 'Package updated successfully'})


@backoffice_login_required
@inertia('Backoffice/Billing')
def billing_overview(request):
    """Billing overview and reports."""
    admin = request.backoffice_admin
    
    # Time periods
    now = timezone.now()
    this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month = (this_month - timedelta(days=1)).replace(day=1)
    this_year = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Revenue stats
    monthly_revenue = BillingHistory.objects.filter(
        status='completed',
        created_at__gte=this_month
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    yearly_revenue = BillingHistory.objects.filter(
        status='completed',
        created_at__gte=this_year
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    # Monthly recurring revenue (MRR)
    active_monthly = Subscription.objects.filter(
        status='active', billing_cycle='monthly'
    ).aggregate(total=Sum('current_price'))['total'] or Decimal('0.00')
    
    active_yearly = Subscription.objects.filter(
        status='active', billing_cycle='yearly'
    ).aggregate(total=Sum('current_price'))['total'] or Decimal('0.00')
    
    mrr = float(active_monthly) + (float(active_yearly) / 12)
    arr = mrr * 12
    
    # Recent transactions
    recent_transactions = []
    for record in BillingHistory.objects.select_related('subscription').order_by('-created_at')[:20]:
        recent_transactions.append({
            'id': record.id,
            'tenant': record.subscription.tenant_schema,
            'type': record.transaction_type,
            'amount': float(record.amount),
            'currency': record.currency,
            'status': record.status,
            'invoice_number': record.invoice_number,
            'created_at': record.created_at.isoformat(),
        })
    
    # Revenue by month (last 6 months)
    revenue_by_month = []
    for i in range(5, -1, -1):
        month_start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        
        month_revenue = BillingHistory.objects.filter(
            status='completed',
            created_at__gte=month_start,
            created_at__lt=month_end
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        revenue_by_month.append({
            'month': month_start.strftime('%B %Y'),
            'revenue': float(month_revenue),
        })
    
    return {
        'admin': {
            'id': admin.id,
            'email': admin.email,
            'full_name': admin.full_name,
            'is_superadmin': admin.is_superadmin,
        },
        'stats': {
            'monthly_revenue': float(monthly_revenue),
            'yearly_revenue': float(yearly_revenue),
            'mrr': mrr,
            'arr': arr,
        },
        'recent_transactions': recent_transactions,
        'revenue_by_month': revenue_by_month,
    }


@backoffice_login_required
@inertia('Backoffice/Activity')
def activity_log(request):
    """View admin activity log."""
    admin = request.backoffice_admin
    
    # Get filter params
    action_filter = request.GET.get('action', '')
    admin_filter = request.GET.get('admin', '')
    
    logs = ActivityLog.objects.select_related('admin_user').all()
    
    if action_filter:
        logs = logs.filter(action_type=action_filter)
    if admin_filter:
        logs = logs.filter(admin_user_id=admin_filter)
    
    activities = []
    for log in logs[:100]:
        activities.append({
            'id': log.id,
            'admin_id': log.admin_user.id if log.admin_user else None,
            'admin_name': log.admin_user.full_name if log.admin_user else 'System',
            'admin_email': log.admin_user.email if log.admin_user else None,
            'action_type': log.action_type,
            'target_type': log.target_type,
            'target_id': log.target_id,
            'target_name': log.target_name,
            'description': log.description,
            'ip_address': log.ip_address,
            'created_at': log.created_at.isoformat(),
        })
    
    # Get admins for filter
    admins = [
        {'id': a.id, 'name': a.full_name}
        for a in AdminUser.objects.all()
    ]
    
    return {
        'admin': {
            'id': admin.id,
            'email': admin.email,
            'full_name': admin.full_name,
            'is_superadmin': admin.is_superadmin,
        },
        'activities': activities,
        'admins': admins,
        'filters': {
            'action': action_filter,
            'admin': admin_filter,
        },
        'action_types': [
            {'value': 'create', 'label': 'Created'},
            {'value': 'update', 'label': 'Updated'},
            {'value': 'delete', 'label': 'Deleted'},
            {'value': 'activate', 'label': 'Activated'},
            {'value': 'deactivate', 'label': 'Deactivated'},
            {'value': 'login', 'label': 'Login'},
            {'value': 'logout', 'label': 'Logout'},
        ]
    }


# API endpoints for creating initial admin
@backoffice_rate_limit(max_requests=3, window_seconds=300, key_prefix='backoffice_setup')
@csrf_exempt
@require_http_methods(['POST'])
def setup_admin(request):
    """Create initial admin user (only works if no admins exist)."""
    if AdminUser.objects.exists():
        return JsonResponse({'error': 'Admin already exists'}, status=403)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '')
    
    if not email or not password or not full_name:
        return JsonResponse({'error': 'Email, password, and full_name are required'}, status=400)
    
    admin = AdminUser.objects.create(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        is_active=True,
        is_superadmin=True,
        can_manage_businesses=True,
        can_manage_packages=True,
        can_manage_billing=True,
        can_view_analytics=True,
        can_manage_admins=True,
    )
    
    return JsonResponse({
        'success': True,
        'message': 'Admin created successfully',
        'admin': {
            'id': admin.id,
            'email': admin.email,
            'full_name': admin.full_name,
        }
    })


# =============================================================================
# Application Logs
# =============================================================================

import os
import subprocess
from django.http import StreamingHttpResponse
from django.conf import settings

# Log file configurations based on supervisord.conf
LOG_SERVICES = {
    'web': {
        'name': 'Web Server (Gunicorn)',
        'files': {
            'access': '/app/logs/gunicorn-access.log',
            'error': '/app/logs/gunicorn-error.log',
            'stdout': '/app/logs/gunicorn-stdout.log',
            'stderr': '/app/logs/gunicorn-stderr.log',
        },
        'default': 'stdout'
    },
    'celery_worker': {
        'name': 'Celery Worker',
        'files': {
            'main': '/app/logs/celery-worker.log',
            'stdout': '/app/logs/celery-worker-stdout.log',
            'stderr': '/app/logs/celery-worker-stderr.log',
        },
        'default': 'main'
    },
    'celery_beat': {
        'name': 'Celery Beat',
        'files': {
            'main': '/app/logs/celery-beat.log',
            'stdout': '/app/logs/celery-beat-stdout.log',
            'stderr': '/app/logs/celery-beat-stderr.log',
        },
        'default': 'main'
    },
    'supervisor': {
        'name': 'Supervisor',
        'files': {
            'main': '/app/logs/supervisord.log',
        },
        'default': 'main'
    }
}


@backoffice_login_required
@inertia('Backoffice/Logs')
def logs_page(request):
    """Application logs page."""
    admin = request.backoffice_admin
    
    # Build services list with available log files
    services = []
    for key, config in LOG_SERVICES.items():
        service_files = []
        for file_key, file_path in config['files'].items():
            exists = os.path.exists(file_path)
            service_files.append({
                'key': file_key,
                'name': file_key.replace('_', ' ').title(),
                'path': file_path,
                'exists': exists,
            })
        
        services.append({
            'key': key,
            'name': config['name'],
            'files': service_files,
            'default_file': config['default'],
        })
    
    return {
        'admin': {
            'id': admin.id,
            'email': admin.email,
            'full_name': admin.full_name,
            'is_superadmin': admin.is_superadmin,
        },
        'services': services,
    }


@backoffice_login_required
@backoffice_rate_limit(max_requests=10, window_seconds=60)
def stream_logs(request, service, log_file):
    """Stream logs in real-time using Server-Sent Events (SSE)."""
    admin = get_admin_from_session(request)
    if not admin:
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    # Validate service and log file
    if service not in LOG_SERVICES:
        return JsonResponse({'error': 'Invalid service'}, status=400)
    
    service_config = LOG_SERVICES[service]
    if log_file not in service_config['files']:
        return JsonResponse({'error': 'Invalid log file'}, status=400)
    
    file_path = service_config['files'][log_file]
    
    if not os.path.exists(file_path):
        return JsonResponse({'error': f'Log file not found: {file_path}'}, status=404)
    
    service_name = service_config['name']
    
    def generate_log_stream():
        """Generator that tails the log file."""
        try:
            # Use tail -f to follow the log file
            process = subprocess.Popen(
                ['tail', '-n', '100', '-f', file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            # Send initial connection message
            msg = json.dumps({'type': 'connected', 'message': f'Streaming {service_name} - {log_file}'})
            yield f"data: {msg}\n\n"
            
            while True:
                line = process.stdout.readline()
                if line:
                    # Format the log line with timestamp if it doesn't have one
                    formatted_line = line.rstrip()
                    log_msg = json.dumps({'type': 'log', 'line': formatted_line})
                    yield f"data: {log_msg}\n\n"
                else:
                    # Keep connection alive
                    yield ": keepalive\n\n"
                    
        except Exception as e:
            err_msg = json.dumps({'type': 'error', 'message': str(e)})
            yield f"data: {err_msg}\n\n"
        finally:
            if 'process' in locals():
                process.terminate()
    
    response = StreamingHttpResponse(
        generate_log_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response


@backoffice_login_required
def get_logs(request, service, log_file):
    """Get recent logs (non-streaming, for initial load)."""
    admin = request.backoffice_admin
    
    # Validate service and log file
    if service not in LOG_SERVICES:
        return JsonResponse({'error': 'Invalid service'}, status=400)
    
    service_config = LOG_SERVICES[service]
    if log_file not in service_config['files']:
        return JsonResponse({'error': 'Invalid log file'}, status=400)
    
    file_path = service_config['files'][log_file]
    
    if not os.path.exists(file_path):
        return JsonResponse({
            'error': f'Log file not found',
            'path': file_path,
            'lines': []
        }, status=404)
    
    # Get number of lines to fetch
    lines_count = int(request.GET.get('lines', 200))
    lines_count = min(lines_count, 1000)  # Max 1000 lines
    
    try:
        # Use tail to get last N lines
        result = subprocess.run(
            ['tail', '-n', str(lines_count), file_path],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        lines = result.stdout.strip().split('\n') if result.stdout.strip() else []
        
        return JsonResponse({
            'service': service,
            'log_file': log_file,
            'file_path': file_path,
            'lines': lines,
            'count': len(lines)
        })
    except subprocess.TimeoutExpired:
        return JsonResponse({'error': 'Timeout reading log file'}, status=500)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ============================================
# Email Marketing Views
# ============================================

@backoffice_login_required
@inertia('Backoffice/Emails')
def emails_list(request):
    """List email templates and campaigns."""
    from .models import EmailTemplate, EmailCampaign
    
    admin = request.backoffice_admin
    
    # Get all templates
    templates = []
    for template in EmailTemplate.objects.filter(is_active=True):
        templates.append({
            'id': template.id,
            'name': template.name,
            'slug': template.slug,
            'template_type': template.template_type,
            'template_type_display': template.get_template_type_display(),
            'category': template.category,
            'category_display': template.get_category_display(),
            'subject': template.subject,
            'preview_text': template.preview_text,
            'is_default': template.is_default,
            'created_at': template.created_at.isoformat(),
        })
    
    # Get recent campaigns
    campaigns = []
    for campaign in EmailCampaign.objects.all()[:20]:
        campaigns.append({
            'id': campaign.id,
            'name': campaign.name,
            'template_name': campaign.template.name,
            'target_type': campaign.target_type,
            'target_type_display': campaign.get_target_type_display(),
            'status': campaign.status,
            'status_display': campaign.get_status_display(),
            'total_recipients': campaign.total_recipients,
            'sent_count': campaign.sent_count,
            'failed_count': campaign.failed_count,
            'scheduled_at': campaign.scheduled_at.isoformat() if campaign.scheduled_at else None,
            'sent_at': campaign.sent_at.isoformat() if campaign.sent_at else None,
            'created_at': campaign.created_at.isoformat(),
        })
    
    # Get target options (businesses by status)
    all_count = Client.objects.count()
    active_count = Client.objects.filter(is_active=True).count()
    trial_count = Subscription.objects.filter(status='trial').count()
    
    return {
        'admin': {
            'email': admin.email,
            'full_name': admin.full_name,
        },
        'templates': templates,
        'campaigns': campaigns,
        'target_stats': {
            'all': all_count,
            'active': active_count,
            'trial': trial_count,
        },
        'template_types': [
            {'value': 'general', 'label': 'General (Broadcast)'},
            {'value': 'business', 'label': 'Business Specific'},
        ],
        'categories': [
            {'value': 'marketing', 'label': 'Marketing'},
            {'value': 'announcement', 'label': 'Announcement'},
            {'value': 'new_release', 'label': 'New Release'},
            {'value': 'newsletter', 'label': 'Newsletter'},
            {'value': 'tips', 'label': 'Tips & Tricks'},
            {'value': 'security', 'label': 'Security Update'},
            {'value': 'maintenance', 'label': 'Maintenance Notice'},
            {'value': 'other', 'label': 'Other'},
        ],
    }


@backoffice_login_required
@inertia('Backoffice/EmailTemplate')
def email_template_detail(request, template_id):
    """View/edit an email template."""
    from .models import EmailTemplate
    
    admin = request.backoffice_admin
    
    try:
        template = EmailTemplate.objects.get(id=template_id)
    except EmailTemplate.DoesNotExist:
        return {'redirect': '/backoffice/emails/'}
    
    return {
        'admin': {
            'email': admin.email,
            'full_name': admin.full_name,
        },
        'template': {
            'id': template.id,
            'name': template.name,
            'slug': template.slug,
            'template_type': template.template_type,
            'template_type_display': template.get_template_type_display(),
            'category': template.category,
            'category_display': template.get_category_display(),
            'subject': template.subject,
            'html_content': template.html_content,
            'plain_text_content': template.plain_text_content,
            'preview_text': template.preview_text,
            'is_default': template.is_default,
            'is_active': template.is_active,
            'created_at': template.created_at.isoformat(),
            'updated_at': template.updated_at.isoformat(),
        },
    }


@backoffice_login_required
@csrf_exempt
@require_http_methods(['POST'])
def create_email_template(request):
    """Create a new email template."""
    from .models import EmailTemplate
    from django.utils.text import slugify
    
    admin = request.backoffice_admin
    
    try:
        data = json.loads(request.body)
        
        name = data.get('name', '').strip()
        if not name:
            return JsonResponse({'error': 'Name is required'}, status=400)
        
        # Generate slug
        slug = slugify(name)
        counter = 1
        base_slug = slug
        while EmailTemplate.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        template = EmailTemplate.objects.create(
            name=name,
            slug=slug,
            template_type=data.get('template_type', 'general'),
            category=data.get('category', 'marketing'),
            subject=data.get('subject', ''),
            html_content=data.get('html_content', ''),
            plain_text_content=data.get('plain_text_content', ''),
            preview_text=data.get('preview_text', ''),
            created_by=admin,
        )
        
        log_activity(
            admin, 'create', 'EmailTemplate',
            target_id=template.id,
            target_name=template.name,
            description=f'Created email template: {template.name}',
            request=request
        )
        
        return JsonResponse({
            'ok': True,
            'template_id': template.id,
            'message': 'Template created successfully'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@backoffice_login_required
@csrf_exempt
@require_http_methods(['POST'])
def update_email_template(request, template_id):
    """Update an email template."""
    from .models import EmailTemplate
    
    admin = request.backoffice_admin
    
    try:
        template = EmailTemplate.objects.get(id=template_id)
    except EmailTemplate.DoesNotExist:
        return JsonResponse({'error': 'Template not found'}, status=404)
    
    try:
        data = json.loads(request.body)
        
        # Update fields
        if 'name' in data:
            template.name = data['name'].strip()
        if 'template_type' in data:
            template.template_type = data['template_type']
        if 'category' in data:
            template.category = data['category']
        if 'subject' in data:
            template.subject = data['subject']
        if 'html_content' in data:
            template.html_content = data['html_content']
        if 'plain_text_content' in data:
            template.plain_text_content = data['plain_text_content']
        if 'preview_text' in data:
            template.preview_text = data['preview_text']
        if 'is_active' in data:
            template.is_active = data['is_active']
        
        template.save()
        
        log_activity(
            admin, 'update', 'EmailTemplate',
            target_id=template.id,
            target_name=template.name,
            description=f'Updated email template: {template.name}',
            request=request
        )
        
        return JsonResponse({'ok': True, 'message': 'Template updated successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@backoffice_login_required
@csrf_exempt
@require_http_methods(['POST'])
def delete_email_template(request, template_id):
    """Delete an email template."""
    from .models import EmailTemplate
    
    admin = request.backoffice_admin
    
    try:
        template = EmailTemplate.objects.get(id=template_id)
    except EmailTemplate.DoesNotExist:
        return JsonResponse({'error': 'Template not found'}, status=404)
    
    if template.is_default:
        return JsonResponse({'error': 'Cannot delete default templates'}, status=400)
    
    name = template.name
    template.delete()
    
    log_activity(
        admin, 'delete', 'EmailTemplate',
        target_name=name,
        description=f'Deleted email template: {name}',
        request=request
    )
    
    return JsonResponse({'ok': True, 'message': 'Template deleted successfully'})


@backoffice_login_required
@require_http_methods(['GET'])
def preview_email_template(request, template_id):
    """Preview an email template with sample data."""
    from .models import EmailTemplate
    
    try:
        template = EmailTemplate.objects.get(id=template_id)
    except EmailTemplate.DoesNotExist:
        return JsonResponse({'error': 'Template not found'}, status=404)
    
    # Sample context for preview
    context = {
        'owner_name': 'John Smith',
        'business_name': 'Acme Corp',
        'business_email': 'admin@acmecorp.com',
    }
    
    subject, html_content, plain_text = template.render(context)
    
    return JsonResponse({
        'subject': subject,
        'html': html_content,
        'plain_text': plain_text,
    })


@backoffice_login_required
@csrf_exempt
@require_http_methods(['POST'])
def create_email_campaign(request):
    """Create and optionally send an email campaign."""
    from .models import EmailTemplate, EmailCampaign
    from .tasks import send_email_campaign_task
    from django_tenants.utils import get_public_schema_name
    
    admin = request.backoffice_admin
    
    try:
        data = json.loads(request.body)
        
        # Validate template
        template_id = data.get('template_id')
        if not template_id:
            return JsonResponse({'error': 'Template is required'}, status=400)
        
        try:
            template = EmailTemplate.objects.get(id=template_id)
        except EmailTemplate.DoesNotExist:
            return JsonResponse({'error': 'Template not found'}, status=404)
        
        # Get target businesses for recipient count
        target_type = data.get('target_type', 'all')
        selected_businesses = data.get('selected_businesses', [])
        
        if target_type == 'all':
            businesses = Client.objects.exclude(schema_name=get_public_schema_name())
        elif target_type == 'active':
            businesses = Client.objects.filter(is_active=True).exclude(schema_name=get_public_schema_name())
        elif target_type == 'trial':
            trial_schemas = Subscription.objects.filter(status='trial').values_list('tenant_schema', flat=True)
            businesses = Client.objects.filter(schema_name__in=trial_schemas)
        elif target_type == 'selected':
            businesses = Client.objects.filter(schema_name__in=selected_businesses)
        else:
            businesses = Client.objects.none()
        
        total_recipients = businesses.count()
        
        # Create campaign
        campaign = EmailCampaign.objects.create(
            name=data.get('name', f"Campaign - {timezone.now().strftime('%Y-%m-%d %H:%M')}"),
            template=template,
            custom_subject=data.get('custom_subject', ''),
            custom_html_content=data.get('custom_html_content', ''),
            target_type=target_type,
            selected_businesses=selected_businesses,
            total_recipients=total_recipients,
            sent_by=admin,
        )
        
        send_now = data.get('send_now', False)
        
        if send_now:
            # Queue campaign for async sending via Celery
            campaign.status = 'sending'
            campaign.save(update_fields=['status'])
            
            # Dispatch Celery task
            send_email_campaign_task.delay(campaign.id)
            
            log_activity(
                admin, 'create', 'EmailCampaign',
                target_id=campaign.id,
                target_name=campaign.name,
                description=f'Queued email campaign: {campaign.name} for {total_recipients} recipients',
                request=request,
                metadata={
                    'total_recipients': total_recipients,
                    'target_type': target_type
                }
            )
            
            return JsonResponse({
                'ok': True,
                'campaign_id': campaign.id,
                'message': f'Campaign queued for {total_recipients} recipients. Emails are being sent in the background.',
                'status': 'sending',
                'total_recipients': total_recipients,
            })
        else:
            # Just save as draft
            log_activity(
                admin, 'create', 'EmailCampaign',
                target_id=campaign.id,
                target_name=campaign.name,
                description=f'Created draft email campaign: {campaign.name}',
                request=request
            )
            
            return JsonResponse({
                'ok': True,
                'campaign_id': campaign.id,
                'message': 'Campaign saved as draft',
            })
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@backoffice_login_required
@inertia('Backoffice/CampaignDetail')
def campaign_detail(request, campaign_id):
    """View campaign details and email logs."""
    from .models import EmailCampaign, EmailLog
    
    admin = request.backoffice_admin
    
    try:
        campaign = EmailCampaign.objects.get(id=campaign_id)
    except EmailCampaign.DoesNotExist:
        return {'redirect': '/backoffice/emails/'}
    
    # Get email logs
    logs = []
    for log in campaign.email_logs.all()[:100]:
        logs.append({
            'id': log.id,
            'tenant_schema': log.tenant_schema,
            'business_name': log.business_name,
            'recipient_email': log.recipient_email,
            'recipient_name': log.recipient_name,
            'status': log.status,
            'status_display': log.get_status_display(),
            'subject_sent': log.subject_sent,
            'sent_at': log.sent_at.isoformat() if log.sent_at else None,
            'error_message': log.error_message,
        })
    
    return {
        'admin': {
            'email': admin.email,
            'full_name': admin.full_name,
        },
        'campaign': {
            'id': campaign.id,
            'name': campaign.name,
            'template_name': campaign.template.name,
            'template_type': campaign.template.template_type,
            'custom_subject': campaign.custom_subject,
            'target_type': campaign.target_type,
            'target_type_display': campaign.get_target_type_display(),
            'status': campaign.status,
            'status_display': campaign.get_status_display(),
            'total_recipients': campaign.total_recipients,
            'sent_count': campaign.sent_count,
            'failed_count': campaign.failed_count,
            'scheduled_at': campaign.scheduled_at.isoformat() if campaign.scheduled_at else None,
            'sent_at': campaign.sent_at.isoformat() if campaign.sent_at else None,
            'sent_by': campaign.sent_by.full_name if campaign.sent_by else None,
            'created_at': campaign.created_at.isoformat(),
        },
        'logs': logs,
    }


@backoffice_login_required
@require_http_methods(['GET'])
def get_businesses_for_campaign(request):
    """Get list of businesses for selecting campaign recipients."""
    businesses = []
    for client in Client.objects.filter(is_active=True).order_by('name'):
        subscription = Subscription.objects.filter(tenant_schema=client.schema_name).first()
        businesses.append({
            'schema_name': client.schema_name,
            'name': client.name,
            'owner_email': client.created_by_email or '',
            'owner_name': client.created_by_name or '',
            'subscription_status': subscription.status if subscription else 'none',
        })
    
    return JsonResponse({'businesses': businesses})
