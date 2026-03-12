from django.http import JsonResponse
from django.shortcuts import redirect, render
from inertia import inertia, render as inertia_render

from config.settings import PRIMARY_DOMAIN
from modules.users.models import Organization, UserProfile
from django.contrib.auth.models import User, Group
import secrets
import string
from django.views.decorators.csrf import ensure_csrf_cookie


def _seed_asset_data():
    """Helper to seed asset categories, locations, and vendors. Returns counts."""
    from modules.assets.models import AssetCategory, Location, Vendor

    categories_created = 0
    locations_created = 0
    vendors_created = 0

    # Default categories
    categories_data = [
        {'name': 'Hardware', 'description': 'Physical computing equipment', 'icon': 'computer'},
        {'name': 'Laptop', 'description': 'Portable computers', 'icon': 'laptop', 'parent': 'Hardware'},
        {'name': 'Desktop', 'description': 'Desktop computers', 'icon': 'desktop', 'parent': 'Hardware'},
        {'name': 'Monitor', 'description': 'Display monitors', 'icon': 'monitor', 'parent': 'Hardware'},
        {'name': 'Server', 'description': 'Server hardware', 'icon': 'server', 'parent': 'Hardware'},
        {'name': 'Printer', 'description': 'Printing devices', 'icon': 'printer', 'parent': 'Hardware'},
        {'name': 'Network Equipment', 'description': 'Routers, switches, access points', 'icon': 'network'},
        {'name': 'Router', 'description': 'Network routers', 'icon': 'router', 'parent': 'Network Equipment'},
        {'name': 'Switch', 'description': 'Network switches', 'icon': 'switch', 'parent': 'Network Equipment'},
        {'name': 'Access Point', 'description': 'Wireless access points', 'icon': 'wifi', 'parent': 'Network Equipment'},
        {'name': 'Software', 'description': 'Software licenses', 'icon': 'software'},
        {'name': 'Mobile Devices', 'description': 'Phones and tablets', 'icon': 'mobile'},
        {'name': 'Phone', 'description': 'Mobile phones', 'icon': 'phone', 'parent': 'Mobile Devices'},
        {'name': 'Tablet', 'description': 'Tablets', 'icon': 'tablet', 'parent': 'Mobile Devices'},
        {'name': 'Peripherals', 'description': 'Keyboards, mice, etc.', 'icon': 'peripheral'},
        {'name': 'Furniture', 'description': 'Office furniture', 'icon': 'furniture'},
        {'name': 'Other', 'description': 'Other assets', 'icon': 'other'},
    ]

    # First pass: create parent categories
    parent_categories = {}
    for cat_data in categories_data:
        if 'parent' not in cat_data:
            cat, created = AssetCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data.get('description', ''),
                    'icon': cat_data.get('icon', ''),
                }
            )
            parent_categories[cat_data['name']] = cat
            if created:
                categories_created += 1

    # Second pass: create child categories
    for cat_data in categories_data:
        if 'parent' in cat_data:
            parent = parent_categories.get(cat_data['parent'])
            if parent:
                cat, created = AssetCategory.objects.get_or_create(
                    name=cat_data['name'],
                    defaults={
                        'description': cat_data.get('description', ''),
                        'icon': cat_data.get('icon', ''),
                        'parent': parent,
                    }
                )
                if created:
                    categories_created += 1

    # Default locations
    locations_data = [
        {'name': 'Headquarters', 'building': 'Main Building', 'floor': '1', 'city': 'New York'},
        {'name': 'Headquarters', 'building': 'Main Building', 'floor': '2', 'city': 'New York'},
        {'name': 'Headquarters', 'building': 'Main Building', 'floor': '3', 'city': 'New York'},
        {'name': 'Data Center', 'building': 'DC1', 'city': 'Chicago'},
        {'name': 'Remote Office', 'building': 'Branch 1', 'city': 'Los Angeles'},
        {'name': 'Warehouse', 'building': 'Storage', 'city': 'Dallas'},
    ]

    for loc_data in locations_data:
        loc, created = Location.objects.get_or_create(
            name=loc_data['name'],
            building=loc_data.get('building', ''),
            floor=loc_data.get('floor', ''),
            defaults={
                'city': loc_data.get('city', ''),
            }
        )
        if created:
            locations_created += 1

    # Default vendors
    vendors_data = [
        {'name': 'Dell Technologies', 'website': 'https://dell.com'},
        {'name': 'HP Inc.', 'website': 'https://hp.com'},
        {'name': 'Lenovo', 'website': 'https://lenovo.com'},
        {'name': 'Apple Inc.', 'website': 'https://apple.com'},
        {'name': 'Microsoft', 'website': 'https://microsoft.com'},
        {'name': 'Cisco Systems', 'website': 'https://cisco.com'},
        {'name': 'Samsung', 'website': 'https://samsung.com'},
    ]

    for vendor_data in vendors_data:
        vendor, created = Vendor.objects.get_or_create(
            name=vendor_data['name'],
            defaults={
                'website': vendor_data.get('website', ''),
            }
        )
        if created:
            vendors_created += 1

    return categories_created, locations_created, vendors_created


def _seed_tenant_data(schema_name, workspace_name, registration_data):
    """
    Seed all tenant data after email verification.
    This includes roles, organization, user, email templates, views, integrations, and assets.
    Returns the created user and password.
    """
    from django.core.management import call_command
    from django_tenants.utils import schema_context
    from modules.users.models import Role
    from modules.users.permissions import Permission
    from urllib.parse import urlparse
    
    first_name = registration_data['first_name']
    last_name = registration_data['last_name']
    email = registration_data['email']
    username = registration_data['username']
    password = registration_data['password']
    subdomain = registration_data['subdomain']
    tenant_domain = registration_data['tenant_domain']
    
    with schema_context(schema_name):
        # Create default roles
        admin_role = Role.objects.create(
            name='Administrator',
            description='Full system access with all permissions',
            permissions=[p[0] for p in Permission.get_all()],
            is_system=True,
        )
        
        Role.objects.create(
            name='Agent',
            description='Customer support agent with ticket management access',
            permissions=[
                Permission.VIEW_TICKETS,
                Permission.CREATE_TICKETS,
                Permission.EDIT_TICKETS,
                Permission.ASSIGN_TICKETS,
                Permission.VIEW_USERS,
                Permission.VIEW_KNOWLEDGE_BASE,
            ],
            is_system=True,
        )
        
        Role.objects.create(
            name='Manager',
            description='Team manager with extended permissions',
            permissions=[
                Permission.VIEW_TICKETS,
                Permission.CREATE_TICKETS,
                Permission.EDIT_TICKETS,
                Permission.DELETE_TICKETS,
                Permission.ASSIGN_TICKETS,
                Permission.VIEW_USERS,
                Permission.CREATE_USERS,
                Permission.EDIT_USERS,
                Permission.VIEW_REPORTS,
                Permission.VIEW_KNOWLEDGE_BASE,
                Permission.CREATE_KNOWLEDGE_BASE,
            ],
            is_system=True,
        )
        
        Role.objects.create(
            name='Customer',
            description='Customer with limited access',
            permissions=[
                Permission.VIEW_TICKETS,
                Permission.CREATE_TICKETS,
                Permission.VIEW_KNOWLEDGE_BASE,
            ],
            is_system=True,
        )
        
        # Create organization
        organization = Organization.objects.create(
            name=workspace_name,
            domain=subdomain,
            plan=Organization.Plan.BASIC,
        )
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        
        # Get or create admin role
        admin_group, created = Group.objects.get_or_create(name='Admin')
        user.groups.add(admin_group)
        
        # Create user profile with organization and admin role
        UserProfile.objects.create(
            user=user,
            full_name=f"{first_name} {last_name}",
            organization=organization,
            role=admin_role,
            is_agent=True,
            is_customer=False,
        )
        
        # Seed marketplace apps for the new tenant
        try:
            from modules.settings.models import App
            app_count = App.objects.count()
            if app_count == 0:
                call_command('create_marketplace_apps')
                new_app_count = App.objects.count()
                print(f"✓ Seeded {new_app_count} marketplace apps for tenant: {workspace_name}")
            else:
                print(f"⊘ Marketplace apps already exist ({app_count} apps) - skipping")
        except Exception as e:
            print(f"✗ Failed to seed marketplace apps: {e}")
        
        # Seed email templates for the new tenant
        try:
            from modules.settings.models import EmailTemplate
            from modules.settings.email_templates_defaults import DEFAULT_EMAIL_TEMPLATES
            
            template_count = EmailTemplate.objects.count()
            if template_count == 0:
                for template_data in DEFAULT_EMAIL_TEMPLATES:
                    EmailTemplate.objects.create(**template_data)
                print(f"✓ Seeded {len(DEFAULT_EMAIL_TEMPLATES)} email templates for tenant: {workspace_name}")
            else:
                print(f"⊘ Email templates already exist ({template_count} templates) - skipping")
        except Exception as e:
            print(f"✗ Failed to seed email templates: {e}")
        
        # Seed default views for tickets, tasks, and KB
        try:
            from modules.settings.models import SettingsView
            
            DEFAULT_VIEWS = [
                # TICKET VIEWS
                {'type': 'TICKET', 'view_id': 'all_tickets', 'label': 'All Tickets', 'description': 'View all tickets', 'order': 10},
                {'type': 'TICKET', 'view_id': 'unsolved', 'label': 'Your unsolved tickets', 'description': 'Tickets assigned to or requested by you that are not solved', 'order': 20, 'is_default': True},
                {'type': 'TICKET', 'view_id': 'response_overdue', 'label': 'All Response Overdue', 'description': 'Tickets with overdue SLA response time', 'order': 30},
                {'type': 'TICKET', 'view_id': 'resolution_due_today', 'label': 'All Resolution Due Today', 'description': 'Tickets with resolution due today', 'order': 40},
                {'type': 'TICKET', 'view_id': 'my_resolution_overdue', 'label': 'My Resolution Overdue', 'description': 'Your tickets with overdue resolution time', 'order': 50},
                {'type': 'TICKET', 'view_id': 'requested_by_me', 'label': 'Requested By Me', 'description': 'Tickets you have requested', 'order': 60},
                {'type': 'TICKET', 'view_id': 'watching', 'label': "Tickets I'm Watching", 'description': 'Tickets you are watching', 'order': 70},
                {'type': 'TICKET', 'view_id': 'unassigned', 'label': 'Unassigned tickets', 'description': 'Unsolved tickets not assigned to anyone', 'order': 80},
                {'type': 'TICKET', 'view_id': 'all_unsolved', 'label': 'All unsolved tickets', 'description': 'All unsolved tickets in the system', 'order': 90},
                {'type': 'TICKET', 'view_id': 'recently_updated', 'label': 'Recently updated tickets', 'description': 'Tickets updated in the last 7 days', 'order': 100},
                {'type': 'TICKET', 'view_id': 'new_in_groups', 'label': 'New tickets in your groups', 'description': 'New tickets assigned to your groups', 'order': 110},
                {'type': 'TICKET', 'view_id': 'pending', 'label': 'Pending tickets', 'description': 'Tickets in pending status', 'order': 120},
                {'type': 'TICKET', 'view_id': 'recently_solved', 'label': 'Recently solved tickets', 'description': 'Tickets solved in the last 7 days', 'order': 130},
                {'type': 'TICKET', 'view_id': 'unsolved_in_groups', 'label': 'Unsolved tickets in your groups', 'description': 'Unsolved tickets assigned to your groups', 'order': 140},
                # TASK VIEWS
                {'type': 'TASK', 'view_id': 'all', 'label': 'All Tasks', 'description': 'View all tasks', 'order': 10, 'is_default': True},
                {'type': 'TASK', 'view_id': 'my_tasks', 'label': 'My Tasks', 'description': 'Tasks assigned to you', 'order': 20},
                {'type': 'TASK', 'view_id': 'created_by_me', 'label': 'Created by Me', 'description': 'Tasks you have created', 'order': 30},
                {'type': 'TASK', 'view_id': 'watching', 'label': 'Watching', 'description': 'Tasks you are watching', 'order': 40},
                {'type': 'TASK', 'view_id': 'todo', 'label': 'To Do', 'description': 'Tasks in to-do status', 'order': 50},
                {'type': 'TASK', 'view_id': 'in_progress', 'label': 'In Progress', 'description': 'Tasks currently in progress', 'order': 60},
                {'type': 'TASK', 'view_id': 'review', 'label': 'In Review', 'description': 'Tasks under review', 'order': 70},
                {'type': 'TASK', 'view_id': 'done', 'label': 'Done', 'description': 'Completed tasks', 'order': 80},
                {'type': 'TASK', 'view_id': 'high_priority', 'label': 'High Priority', 'description': 'High and urgent priority tasks', 'order': 90},
                # KB VIEWS
                {'type': 'KB', 'view_id': 'all', 'label': 'All Articles', 'description': 'View all KB articles', 'order': 10, 'is_default': True},
                {'type': 'KB', 'view_id': 'published', 'label': 'Published', 'description': 'Published KB articles', 'order': 20},
                {'type': 'KB', 'view_id': 'draft', 'label': 'Drafts', 'description': 'Draft KB articles', 'order': 30},
                {'type': 'KB', 'view_id': 'archived', 'label': 'Archived', 'description': 'Archived KB articles', 'order': 40},
            ]
            
            view_count = SettingsView.objects.count()
            if view_count == 0:
                for view_data in DEFAULT_VIEWS:
                    SettingsView.objects.create(**view_data)
                print(f"✓ Seeded {len(DEFAULT_VIEWS)} default views for tenant: {workspace_name}")
            else:
                print(f"⊘ Views already exist ({view_count} views) - skipping")
        except Exception as e:
            print(f"✗ Failed to seed default views: {e}")
        
        # Seed integrations for the new tenant with all unconnected
        try:
            from modules.settings.models import SettingsIntegrations
            from shared.utilities.enums.Integrations import IntegrationsRegistry
            
            integration_count = SettingsIntegrations.objects.count()
            if integration_count == 0:
                enum_integrations = IntegrationsRegistry.get_all_integrations()
                created_count = 0
                
                for idx, integration_data in enumerate(enum_integrations):
                    SettingsIntegrations.objects.create(
                        name=integration_data['name'],
                        icon=integration_data['icon'],
                        description=integration_data['description'],
                        status=integration_data['status'],
                        color=integration_data['color'],
                        integration_type=integration_data['type'],
                        webhook_url=integration_data.get('webhook_url'),
                        order=idx + 1,
                    )
                    created_count += 1
                
                print(f"✓ Seeded {created_count} integrations for tenant: {workspace_name}")
            else:
                print(f"⊘ Integrations already exist ({integration_count} integrations) - skipping")
        except Exception as e:
            print(f"✗ Failed to seed integrations: {e}")

        # Seed default asset data for the new tenant
        try:
            from modules.assets.models import AssetCategory, Location, Vendor

            category_count = AssetCategory.objects.count()
            if category_count == 0:
                categories_created, locations_created, vendors_created = _seed_asset_data()
                print(f"✓ Seeded {categories_created} categories, {locations_created} locations, {vendors_created} vendors for tenant: {workspace_name}")
            else:
                print(f"⊘ Asset data already exists ({category_count} categories) - skipping")
        except Exception as e:
            print(f"✗ Failed to seed asset data: {e}")
    
    return user, password


@ensure_csrf_cookie
@inertia('Landing')
def landing(request):
    """Public landing page for unauthenticated users."""    
    return {}


def health(request):
    return JsonResponse({"status": "ok"})


@inertia('Pricing')
def pricing(request):
    """Public pricing page."""
    # If user is already logged in, redirect to dashboard
    # if request.user.is_authenticated:
    #     return redirect('/dashboard/')
    
    return {}


@inertia('Features')
def features(request):
    """Public features page."""
    # If user is already logged in, redirect to dashboard
    # if request.user.is_authenticated:
    #     return redirect('/dashboard/')
    
    return {}


@inertia('Blog')
def blog(request):
    """Public blog page."""
    # If user is already logged in, redirect to dashboard
    # if request.user.is_authenticated:
    #     return redirect('/dashboard/')
    
    return {}


@inertia('BlogPost')
def blog_post(request, slug):
    """Public blog post detail page."""
    # If user is already logged in, redirect to dashboard
    # if request.user.is_authenticated:
    #     return redirect('/dashboard/')
    
    # In a real app, you would fetch the post from database by slug
    # For now, return empty dict and let frontend use default data
    return {
        'post': {
            'slug': slug
        }
    }


@inertia('Docs')
def docs(request):
    """Public documentation page."""
    # If user is already logged in, redirect to dashboard
    # if request.user.is_authenticated:
    #     return redirect('/dashboard/')
    
    return {}


@inertia('DocsPage')
def docs_page(request, slug):
    """Individual documentation page."""
    return {
        'slug': slug,
    }


@inertia('Contact')
def contact(request):
    """Public contact page."""
    # If user is already logged in, redirect to dashboard
    # if request.user.is_authenticated:
    #     return redirect('/dashboard/')
    
    return {}


@inertia('Privacy')
def privacy(request):
    """Public privacy policy page."""
    return {}


@inertia('Terms')
def terms(request):
    """Public terms of service page."""
    return {}


@inertia('ForgotPassword')
def forgot_password(request):
    """Forgot password page."""
    if request.method == 'POST':
        email = request.POST.get('email')
        
        if not email:
            return inertia_render(request, 'ForgotPassword', {
                'errors': {'email': 'Email is required'},
            })
        
        # In a real app, you would:
        # 1. Check if email exists in database
        # 2. Generate a password reset token
        # 3. Send email with reset link
        # For now, just return success
        
        return inertia_render(request, 'ForgotPassword', {
            'success': True,
        })
    
    return {}


@inertia('RegistrationSuccess')
def registration_success(request):
    """Registration success page."""
    # Get email and workspace from session if available
    email = request.session.get('registration_email', '')
    workspace_name = request.session.get('registration_workspace', '')
    subdomain = request.session.get('registration_subdomain', '')
    
    # Build login URL for the tenant's subdomain
    if subdomain:
        # Parse PRIMARY_DOMAIN to build correct subdomain URL
        from urllib.parse import urlparse
        parsed = urlparse(PRIMARY_DOMAIN)
        
        if parsed.scheme:
            # Full URL like http://localhost:8000 or https://imaradesk.com
            scheme = parsed.scheme
            domain = parsed.netloc
            login_url = f"{scheme}://{subdomain}.{domain}/login/"
        else:
            # Domain only like coredesk.pro or localhost:8000
            # Assume https for production, http for localhost
            if 'localhost' in PRIMARY_DOMAIN or '127.0.0.1' in PRIMARY_DOMAIN:
                login_url = f"http://{subdomain}.{PRIMARY_DOMAIN}/login/"
            else:
                login_url = f"https://{subdomain}.{PRIMARY_DOMAIN}/login/"
    else:
        login_url = '/login/'
    
    # Clear session data after displaying
    if 'registration_email' in request.session:
        del request.session['registration_email']
    if 'registration_workspace' in request.session:
        del request.session['registration_workspace']
    if 'registration_subdomain' in request.session:
        del request.session['registration_subdomain']
    
    return {
        'email': email,
        'workspace_name': workspace_name,
        'subdomain': subdomain,
        'login_url': login_url,
    }

@ensure_csrf_cookie
@inertia('Register')
def register(request):
    """User registration page with stepper (GET + POST)."""
    if request.method == 'POST':
        from shared.models import Client, Domain, TenantVerificationToken
        from urllib.parse import urlparse
        import re
        import json
        
        # Extract data from stepper form
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        email = request.POST.get('email', '')
        workspace_name = request.POST.get('workspace_name', '')
        subdomain = request.POST.get('subdomain', '')
        org_size = request.POST.get('org_size', '')
        business_type = request.POST.get('business_type', '')
        
        # Parse JSON arrays for service_types and features_interest
        service_types = json.loads(request.POST.get('service_types', '[]'))
        features_interest = json.loads(request.POST.get('features_interest', '[]'))
        
        # Generate username from email
        username = email.split('@')[0] if email else ''
        
        # Generate secure random password (16 characters, alphanumeric only)
        alphabet = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(alphabet) for _ in range(16))
        
        # Normalize subdomain for schema name (lowercase, alphanumeric + underscores)
        schema_name = re.sub(r'[^a-z0-9_]', '_', subdomain.lower())
        
        # Determine domain based on PRIMARY_DOMAIN
        parsed = urlparse(PRIMARY_DOMAIN)
        if parsed.scheme:
            domain_with_port = parsed.netloc
            domain_no_port = domain_with_port.split(':')[0] if ':' in domain_with_port else domain_with_port
            tenant_domain = f"{subdomain}.{domain_no_port}"
        else:
            domain_no_port = PRIMARY_DOMAIN.split(':')[0] if ':' in PRIMARY_DOMAIN else PRIMARY_DOMAIN
            tenant_domain = f"{subdomain}.{domain_no_port}"
        
        # Validation
        errors = {}
        
        if not first_name:
            errors['first_name'] = 'First name is required'
        if not last_name:
            errors['last_name'] = 'Last name is required'
        if not email:
            errors['email'] = 'Email is required'
        elif User.objects.filter(email=email).exists():
            errors['email'] = 'Email already exists'
        else:
            # Check for disposable email domains
            from disposable_email_domains import blocklist
            email_domain = email.split('@')[-1].lower() if '@' in email else ''
            if email_domain in blocklist:
                errors['email'] = 'Disposable email addresses are not allowed. Please use a permanent email.'
        if not workspace_name:
            errors['workspace_name'] = 'Workspace name is required'
        if not subdomain:
            errors['subdomain'] = 'Subdomain is required'
        elif not re.match(r'^[a-z0-9]+$', subdomain):
            errors['subdomain'] = 'Subdomain must contain only lowercase letters and numbers'
        elif Client.objects.filter(schema_name=schema_name).exists():
            errors['subdomain'] = 'Workspace already exists'
        elif Domain.objects.filter(domain=tenant_domain).exists():
            errors['subdomain'] = 'Domain already in use'
        
        if errors:
            return inertia_render(request, 'Register', {
                'errors': errors,
            })
        
        # Capture registration tracking data
        from shared.utilities.geolocation import get_client_ip, get_geolocation
        from django.utils import timezone as django_timezone
        
        registration_ip = get_client_ip(request)
        registration_user_agent = request.META.get('HTTP_USER_AGENT', '')
        registration_timestamp = django_timezone.now()
        
        # Get geolocation data
        geo_data = None
        registration_country = None
        registration_city = None
        registration_region = None
        registration_timezone = None
        
        try:
            geo_data = get_geolocation(registration_ip)
            if geo_data:
                registration_country = geo_data.get('country')
                registration_city = geo_data.get('city')
                registration_region = geo_data.get('region')
                registration_timezone = geo_data.get('timezone')
                print(f"✓ Geolocation: {registration_city}, {registration_region}, {registration_country}")
        except Exception as e:
            print(f"Warning: Geolocation lookup failed: {e}")
        
        # Create tenant (workspace) - NOT VERIFIED YET
        try:
            tenant = Client.objects.create(
                schema_name=schema_name,
                name=workspace_name,
                description=f"Workspace for {workspace_name}",
                is_active=False,  # Inactive until verified
                is_verified=False,  # Not verified yet
                business_type=business_type,
                org_size=org_size,
                service_types=service_types,
                features_interest=features_interest,
                # Registration tracking - Admin info
                created_by_email=email,
                created_by_name=f"{first_name} {last_name}",
                # Registration tracking - Location and device
                registration_ip=registration_ip,
                registration_country=registration_country,
                registration_city=registration_city,
                registration_region=registration_region,
                registration_timezone=registration_timezone,
                registration_location_data=geo_data,
                registration_user_agent=registration_user_agent[:1000] if registration_user_agent else None,
                registration_timestamp=registration_timestamp,
            )
            
            # Create domain for tenant
            Domain.objects.create(
                domain=tenant_domain,
                tenant=tenant,
                is_primary=True,
            )
            
            print(f"✓ Created unverified tenant: {workspace_name} (schema: {schema_name})")
            print(f"✓ Domain: {tenant_domain}")
            
        except Exception as e:
            errors['subdomain'] = f'Failed to create workspace: {str(e)}'
            return inertia_render(request, 'Register', {
                'errors': errors,
            })
        
        # Store registration data for verification (password stored temporarily, will be used after verification)
        registration_data = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'username': username,
            'password': password,  # Will be used to create user after verification
            'workspace_name': workspace_name,
            'subdomain': subdomain,
            'tenant_domain': tenant_domain,
            'schema_name': schema_name,
        }
        
        # Create secure verification token (expires in 24 hours)
        raw_token = TenantVerificationToken.create_for_tenant(tenant, registration_data)
        
        # Build verification URL - strip any existing scheme from PRIMARY_DOMAIN
        domain_clean = PRIMARY_DOMAIN.replace('https://', '').replace('http://', '').rstrip('/')
        if 'localhost' in domain_clean or '127.0.0.1' in domain_clean:
            verification_url = f"http://{domain_clean}/verify-email/?token={raw_token}"
        else:
            verification_url = f"https://{domain_clean}/verify-email/?token={raw_token}"
        
        # Send verification email
        try:
            from shared.utilities.Mailer import Mailer
            from shared.utilities.GlobalEmailTenplates import GlobalEmailTemplates
            
            print("\n" + "="*60)
            print("[Registration] Sending verification email...")
            print("="*60)
            
            mailer = Mailer()
            verification_template = GlobalEmailTemplates.EMAIL_VERIFICATION
            
            email_sent = mailer.send_raw_email(
                to_email=email,
                subject=verification_template['subject'],
                body_html=verification_template['body_html'],
                body_text=verification_template['body_text'],
                context={
                    'user_name': first_name,
                    'workspace_name': workspace_name,
                    'verification_url': verification_url,
                },
                fail_silently=False
            )
            
            if email_sent:
                print(f"✓ Verification email sent to {email}")
            else:
                print(f"✗ Failed to send verification email to {email}")
            
            print("="*60 + "\n")
            
        except Exception as e:
            print(f"✗ Error sending verification email: {e}")
            import traceback
            traceback.print_exc()
        
        # Store data in session for verification pending page
        request.session['verification_email'] = email
        request.session['verification_workspace'] = workspace_name
        
        # Redirect to verification pending page
        return redirect('verification_pending')
    
    # GET request
    return {
        'errors': {},
    }


def verify_email(request):
    """
    Email verification endpoint.
    Validates the token, activates the tenant, seeds data, and sends credentials.
    """
    from shared.models import Client, TenantVerificationToken
    from django.core.management import call_command
    from django.utils import timezone as django_timezone
    from urllib.parse import urlparse
    
    token = request.GET.get('token', '')
    
    if not token:
        return render(request, 'verification_error.html', {
            'error': 'Invalid verification link. No token provided.',
        })
    
    # Verify the token (checks if valid, not expired, and not used)
    token_obj = TenantVerificationToken.verify_token(token)
    
    if not token_obj:
        return render(request, 'verification_error.html', {
            'error': 'This verification link is invalid, expired, or has already been used. Please register again.',
        })
    
    tenant = token_obj.tenant
    registration_data = token_obj.registration_data
    is_existing_business = registration_data.get('is_existing_business', False)
    
    # Mark token as used (single-use enforcement)
    token_obj.mark_as_used()
    
    print("\n" + "="*60)
    print(f"[Verification] Verifying tenant: {tenant.name}")
    if is_existing_business:
        print("[Verification] Mode: Existing business verification")
    print("="*60)
    
    # Run migrations for the tenant schema
    try:
        call_command('migrate_schemas', schema_name=tenant.schema_name, verbosity=0)
        print(f"✓ Ran migrations for schema: {tenant.schema_name}")
    except Exception as e:
        print(f"Warning: Migration failed: {e}")
    
    # For new registrations only: Seed tenant data (roles, user, organization, etc.)
    if not is_existing_business:
        try:
            user, password = _seed_tenant_data(
                tenant.schema_name,
                tenant.name,
                registration_data
            )
            print(f"✓ Seeded data for tenant: {tenant.name}")
        except Exception as e:
            print(f"✗ Failed to seed tenant data: {e}")
            import traceback
            traceback.print_exc()
            return render(request, 'verification_error.html', {
                'error': 'Failed to set up your workspace. Please contact support.',
            })
        
        # Create help email for the tenant (for email-to-ticket)
        try:
            from modules.email_to_ticket.models import TenantHelpEmail
            help_email, _ = TenantHelpEmail.get_or_create_for_tenant(tenant)
            print(f"✓ Help email: {help_email.email_address}")
        except Exception as e:
            print(f"Warning: Failed to create help email: {e}")
    
    # Mark tenant as verified and active
    tenant.is_verified = True
    tenant.is_active = True
    tenant.verified_at = django_timezone.now()
    tenant.save(update_fields=['is_verified', 'is_active', 'verified_at'])
    
    print(f"✓ Tenant verified and activated: {tenant.name}")
    
    # Build login URL
    tenant_domain = registration_data['tenant_domain']
    parsed = urlparse(PRIMARY_DOMAIN)
    if parsed.scheme:
        login_url = f"{parsed.scheme}://{tenant_domain}/login/"
    else:
        if 'localhost' in PRIMARY_DOMAIN or '127.0.0.1' in PRIMARY_DOMAIN:
            login_url = f"http://{tenant_domain}/login/"
        else:
            login_url = f"https://{tenant_domain}/login/"
    
    # For new registrations: Send account creation and welcome emails with credentials
    # For existing businesses: Just show success message (they already have credentials)
    if not is_existing_business:
        try:
            from shared.utilities.Mailer import Mailer
            from shared.utilities.GlobalEmailTenplates import GlobalEmailTemplates
            
            mailer = Mailer()
            email = registration_data['email']
            first_name = registration_data['first_name']
            workspace_name = registration_data['workspace_name']
            username = registration_data['username']
            password = registration_data['password']
            
            # Send account creation email with credentials
            print(f"[Verification] Sending account credentials to {email}...")
            account_template = GlobalEmailTemplates.ACCOUNT_CREATION
            account_sent = mailer.send_raw_email(
                to_email=email,
                subject=account_template['subject'],
                body_html=account_template['body_html'],
                body_text=account_template['body_text'],
                context={
                    'user_name': first_name,
                    'workspace_name': workspace_name,
                    'user_email': email,
                    'username': username,
                    'password': password,
                    'login_url': login_url,
                },
                fail_silently=False
            )
            
            if account_sent:
                print(f"✓ Account credentials email sent to {email}")
            else:
                print(f"✗ Failed to send account credentials email")
            
            # Send welcome email
            welcome_template = GlobalEmailTemplates.WELCOME_BUSINESS
            mailer.send_raw_email(
                to_email=email,
                subject=welcome_template['subject'],
                body_html=welcome_template['body_html'],
                body_text=welcome_template['body_text'],
                context={
                    'user_name': first_name,
                    'workspace_name': workspace_name,
                    'login_url': login_url,
                    'docs_url': 'https://imaradesk.com/docs',
                    'support_url': 'https://support.imaradesk.com',
                },
                fail_silently=True
            )
            
        except Exception as e:
            print(f"✗ Error sending credential emails: {e}")
    else:
        print("✓ Existing business verified - no credential emails sent (credentials already exist)")
    
    # Print summary 
    print("\n" + "="*60)
    print("WORKSPACE VERIFIED AND ACTIVATED")
    print("="*60)
    print(f"Email:        {registration_data['email']}")
    print(f"Workspace:    {tenant.name}")
    print(f"Schema:       {tenant.schema_name}")
    print(f"Login URL:    {login_url}")
    print("="*60 + "\n")
    
    # For existing businesses, show success page with auto-redirect to login
    if is_existing_business:
        return render(request, 'verification_success.html', {
            'workspace_name': tenant.name,
            'login_url': login_url,
        })
    
    # Store data in session for success page (new registrations only)
    request.session['registration_email'] = registration_data['email']
    request.session['registration_workspace'] = tenant.name
    request.session['registration_subdomain'] = registration_data.get('subdomain', tenant.schema_name)
    
    # Redirect to registration success page
    return redirect('registration_success')


@inertia('VerificationPending')
def verification_pending(request):
    """Page shown after registration, prompting user to verify email."""
    email = request.session.get('verification_email', '')
    workspace_name = request.session.get('verification_workspace', '')
    
    return {
        'email': email,
        'workspace_name': workspace_name,
    }
