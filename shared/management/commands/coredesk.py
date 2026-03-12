"""Management command to create public tenant and seed marketplace apps."""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from shared.models import Client, Domain
from django_tenants.utils import schema_context


class Command(BaseCommand):
    help = 'Create public tenant for main site and seed marketplace apps to all tenants'

    def add_arguments(self, parser):
        parser.add_argument(
            '--seed-apps',
            action='store_true',
            help='Seed marketplace apps to all tenant schemas that do not have them',
        )
        parser.add_argument(
            '--seed-email-templates',
            action='store_true',
            help='Seed default email templates to all tenant schemas (skips existing)',
        )
        parser.add_argument(
            '--reseed-email-templates',
            action='store_true',
            help='Delete all existing email templates and create fresh ones for all tenants',
        )
        parser.add_argument(
            '--init-views',
            action='store_true',
            help='Initialize default views for tickets, tasks, and KB in all tenant schemas',
        )
        parser.add_argument(
            '--seed-integrations',
            action='store_true',
            help='Seed integrations from enum to database in all tenant schemas',
        )
        parser.add_argument(
            '--seed-assets',
            action='store_true',
            help='Seed default asset categories, locations, and vendors to all tenant schemas',
        )
        parser.add_argument(
            '--seed-help-emails',
            action='store_true',
            help='Create help email addresses (help+{tenant}@imaradesk.com) for all tenants',
        )
        parser.add_argument(
            '--set-ssl',
            action='store_true',
            help='Enable SSL for all verified custom domains across all tenants using Cloudflare certificates',
        )
        parser.add_argument(
            '--verify-businesses',
            action='store_true',
            help='Send verification emails to all unverified business tenants',
        )
        parser.add_argument(
            '--reverify-businesses',
            action='store_true',
            help='Resend verification emails to all business tenants (including already verified ones)',
        )
        parser.add_argument(
            '--create-backoffice-admin',
            action='store_true',
            help='Create backoffice admin user from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD, etc.)',
        )
        parser.add_argument(
            '--update-integration-icons',
            action='store_true',
            help='Update integration icons from emojis to Lucide React icon names for all tenants',
        )

    def handle(self, *args, **options):
        # Create or update public tenant for main site
        public_tenant, created = Client.objects.get_or_create(
            schema_name='public',
            defaults={
                'name': 'ImaraDesk',
                'description': 'Public tenant for main site',
                'is_active': True,
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created public tenant: {public_tenant.name}'))
        else:
            # Update existing tenant name if needed
            if public_tenant.name != 'ImaraDesk':
                old_name = public_tenant.name
                public_tenant.name = 'ImaraDesk'
                public_tenant.description = 'Public tenant for main site'
                public_tenant.save()
                self.stdout.write(self.style.SUCCESS(f'Updated public tenant: {old_name} → {public_tenant.name}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Public tenant exists: {public_tenant.name}'))
        
        # Update old domains (coredesk.*) to new domain (imaradesk.com)
        old_domains = Domain.objects.filter(domain__icontains='coredesk')
        if old_domains.exists():
            for old_domain in old_domains:
                old_name = old_domain.domain
                # Delete old coredesk domains - they're no longer needed
                old_domain.delete()
                self.stdout.write(self.style.WARNING(f'  Removed old domain: {old_name}'))
        
        # Ensure primary domain exists
        primary_domain, primary_created = Domain.objects.get_or_create(
            domain='imaradesk.com',
            defaults={
                'tenant': public_tenant,
                'is_primary': True,
            }
        )
        if primary_created:
            self.stdout.write(self.style.SUCCESS(f'  Created primary domain: {primary_domain.domain}'))
        else:
            # Ensure it's set as primary and linked to public tenant
            if not primary_domain.is_primary or primary_domain.tenant != public_tenant:
                primary_domain.is_primary = True
                primary_domain.tenant = public_tenant
                primary_domain.save()
                self.stdout.write(self.style.SUCCESS(f'  Updated primary domain: {primary_domain.domain}'))
            else:
                self.stdout.write(f'  Primary domain exists: {primary_domain.domain}')
        
        # Create localhost domains for development
        dev_domains = ['localhost', '127.0.0.1']
        for dev_domain in dev_domains:
            domain_obj, domain_created = Domain.objects.get_or_create(
                domain=dev_domain,
                defaults={
                    'tenant': public_tenant,
                    'is_primary': False,
                }
            )
            if domain_created:
                self.stdout.write(self.style.SUCCESS(f'  Created dev domain: {domain_obj.domain}'))
        
        # Show all current domains
        self.stdout.write(self.style.SUCCESS('\n  Current domains:'))
        for domain in Domain.objects.filter(tenant=public_tenant):
            primary_tag = ' (primary)' if domain.is_primary else ''
            self.stdout.write(f'    - {domain.domain}{primary_tag}')
        
        self.stdout.write(self.style.SUCCESS('\n✓ Public tenant setup complete! '))
        
        # Seed marketplace apps to all tenants if --seed-apps flag is provided
        if options.get('seed_apps'):
            self.seed_marketplace_apps()
        
        # Seed email templates if --seed-email-templates flag is provided
        if options.get('seed_email_templates'):
            self.seed_email_templates(reseed=False)
        
        # Reseed email templates (delete and recreate) if --reseed-email-templates flag is provided
        if options.get('reseed_email_templates'):
            self.seed_email_templates(reseed=True)
        
        # Initialize views if --init-views flag is provided
        if options.get('init_views'):
            self.init_views()
        
        # Seed integrations if --seed-integrations flag is provided
        if options.get('seed_integrations'):
            self.seed_integrations()

        # Seed assets if --seed-assets flag is provided
        if options.get('seed_assets'):
            self.seed_assets()

        # Seed help emails if --seed-help-emails flag is provided
        if options.get('seed_help_emails'):
            self.seed_help_emails()

        # Set SSL for all verified custom domains if --set-ssl flag is provided
        if options.get('set_ssl'):
            self.set_ssl_for_domains()

        # Send verification emails to unverified businesses if --verify-businesses flag is provided
        if options.get('verify_businesses'):
            self.verify_businesses()

        # Resend verification emails to all businesses if --reverify-businesses flag is provided
        if options.get('reverify_businesses'):
            self.reverify_businesses()

        # Create backoffice admin if --create-backoffice-admin flag is provided
        if options.get('create_backoffice_admin'):
            self.create_backoffice_admin()

        # Update integration icons if --update-integration-icons flag is provided
        if options.get('update_integration_icons'):
            self.update_integration_icons()

    def create_backoffice_admin(self):
        """Create backoffice admin user from environment variables."""
        from decouple import config
        from modules.backoffice.models import AdminUser
        from modules.backoffice.views import hash_password
        
        self.stdout.write(self.style.SUCCESS('\n--- Creating Backoffice Admin ---'))
        
        # Get admin credentials from environment
        email = config('ADMIN_EMAIL', default='')
        password = config('ADMIN_PASSWORD', default='')
        first_name = config('ADMIN_FIRST_NAME', default='')
        last_name = config('ADMIN_LAST_NAME', default='')
        
        if not email or not password:
            self.stdout.write(self.style.ERROR(
                '  ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment'
            ))
            return
        
        full_name = f"{first_name} {last_name}".strip() or email.split('@')[0]
        
        # Check if admin already exists
        if AdminUser.objects.filter(email=email.lower()).exists():
            self.stdout.write(self.style.WARNING(
                f'  ⊘ Admin user already exists: {email}'
            ))
            return
        
        # Create admin user with superadmin privileges
        admin = AdminUser.objects.create(
            email=email.lower(),
            full_name=full_name,
            password_hash=hash_password(password),
            is_active=True,
            is_superadmin=True,
            can_manage_businesses=True,
            can_manage_packages=True,
            can_manage_billing=True,
            can_view_analytics=True,
            can_manage_admins=True,
        )
        
        self.stdout.write(self.style.SUCCESS(f'  ✓ Admin user created: {admin.email}'))
        self.stdout.write(self.style.SUCCESS(f'  ✓ Full name: {admin.full_name}'))
        self.stdout.write(self.style.SUCCESS(f'  ✓ Superadmin: Yes'))

    def seed_marketplace_apps(self):
        """Sync marketplace apps to all tenant schemas - creates new, updates existing, removes deleted."""
        from modules.settings.models import App
        
        self.stdout.write(self.style.SUCCESS('\n--- Syncing Marketplace Apps to Tenants ---'))
        
        # Get all tenant schemas (exclude public)
        tenants = Client.objects.exclude(schema_name='public')
        
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenant schemas found.'))
            return
        
        synced_count = 0
        
        for tenant in tenants:
            self.stdout.write(f'\n{tenant.name} ({tenant.schema_name}):')
            with schema_context(tenant.schema_name):
                try:
                    call_command('create_marketplace_apps')
                    synced_count += 1
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'  ✗ Failed - {str(e)}'
                        )
                    )
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Sync complete! Processed {synced_count} tenant(s)'))
    
    def seed_email_templates(self, reseed=False):
        """Seed default email templates to all tenant schemas.
        
        Args:
            reseed: If True, delete all existing templates and recreate fresh ones.
        """
        from django.db import transaction
        from modules.settings.models import EmailTemplate
        from modules.settings.email_templates_defaults import DEFAULT_EMAIL_TEMPLATES
        
        if reseed:
            self.stdout.write(self.style.WARNING('\n--- RESEEDING Email Templates (Delete & Recreate) ---'))
        else:
            self.stdout.write(self.style.SUCCESS('\n--- Seeding Email Templates to Tenants ---'))
        
        # Get all tenant schemas (exclude public - it's global, not a tenant)
        tenants = Client.objects.exclude(schema_name='public')
        
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenant schemas found. Email templates are tenant-specific.'))
            return
        
        created_count = 0
        deleted_count = 0
        skipped_count = 0
        
        for tenant in tenants:
            with schema_context(tenant.schema_name):
                tenant_created = 0
                tenant_deleted = 0
                tenant_skipped = 0
                
                # If reseeding, delete all existing templates first in a transaction
                if reseed:
                    with transaction.atomic():
                        tenant_deleted = EmailTemplate.objects.count()
                        EmailTemplate.objects.all().delete()
                    deleted_count += tenant_deleted
                
                for template_data in DEFAULT_EMAIL_TEMPLATES:
                    template_type = template_data['template_type']
                    
                    # Check if template already exists
                    existing_template = EmailTemplate.objects.filter(
                        template_type=template_type
                    ).first()
                    
                    if existing_template:
                        if reseed:
                            # This shouldn't happen after delete, but handle it safely
                            existing_template.delete()
                        else:
                            # Skip existing templates - don't overwrite customizations
                            tenant_skipped += 1
                            continue
                    
                    # Create new template
                    EmailTemplate.objects.create(**template_data)
                    tenant_created += 1
                
                if reseed:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  ✓ {tenant.name} ({tenant.schema_name}): '
                            f'{tenant_deleted} deleted, {tenant_created} created'
                        )
                    )
                elif tenant_created > 0:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  ✓ {tenant.name} ({tenant.schema_name}): '
                            f'{tenant_created} created, {tenant_skipped} skipped (already exist)'
                        )
                    )
                else:
                    self.stdout.write(
                        f'  - {tenant.name} ({tenant.schema_name}): '
                        f'all {tenant_skipped} templates already exist'
                    )
                created_count += tenant_created
                skipped_count += tenant_skipped
        
        if reseed:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Email template RESEED complete! '
                    f'Deleted: {deleted_count}, Created: {created_count}'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Email template seeding complete! '
                    f'Created: {created_count}, Skipped: {skipped_count}'
                )
            )
    
    def init_views(self):
        """Initialize default views for tickets, tasks, and KB in all tenant schemas."""
        from modules.settings.models import SettingsView
        
        self.stdout.write(self.style.SUCCESS('\n--- Initializing Views in Tenants ---'))
        
        # Define default views for each type
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
            
            # TASK VIEWS (for future use)
            {'type': 'TASK', 'view_id': 'all', 'label': 'All Tasks', 'description': 'View all tasks', 'order': 10, 'is_default': True},
            {'type': 'TASK', 'view_id': 'my_tasks', 'label': 'My Tasks', 'description': 'Tasks assigned to you', 'order': 20},
            {'type': 'TASK', 'view_id': 'created_by_me', 'label': 'Created by Me', 'description': 'Tasks you have created', 'order': 30},
            {'type': 'TASK', 'view_id': 'watching', 'label': 'Watching', 'description': 'Tasks you are watching', 'order': 40},
            {'type': 'TASK', 'view_id': 'todo', 'label': 'To Do', 'description': 'Tasks in to-do status', 'order': 50},
            {'type': 'TASK', 'view_id': 'in_progress', 'label': 'In Progress', 'description': 'Tasks currently in progress', 'order': 60},
            {'type': 'TASK', 'view_id': 'review', 'label': 'In Review', 'description': 'Tasks under review', 'order': 70},
            {'type': 'TASK', 'view_id': 'done', 'label': 'Done', 'description': 'Completed tasks', 'order': 80},
            {'type': 'TASK', 'view_id': 'high_priority', 'label': 'High Priority', 'description': 'High and urgent priority tasks', 'order': 90},
            
            # KB VIEWS (for future use)
            {'type': 'KB', 'view_id': 'all', 'label': 'All Articles', 'description': 'View all KB articles', 'order': 10, 'is_default': True},
            {'type': 'KB', 'view_id': 'published', 'label': 'Published', 'description': 'Published KB articles', 'order': 20},
            {'type': 'KB', 'view_id': 'draft', 'label': 'Drafts', 'description': 'Draft KB articles', 'order': 30},
            {'type': 'KB', 'view_id': 'archived', 'label': 'Archived', 'description': 'Archived KB articles', 'order': 40},
        ]
        
        # Get all tenant schemas (exclude public)
        tenants = Client.objects.exclude(schema_name='public')
        
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenant schemas found.'))
            return
        
        created_count = 0
        updated_count = 0
        
        for tenant in tenants:
            with schema_context(tenant.schema_name):
                tenant_created = 0
                tenant_updated = 0
                
                for view_data in DEFAULT_VIEWS:
                    # Check if view already exists
                    existing_view = SettingsView.objects.filter(
                        type=view_data['type'],
                        view_id=view_data['view_id']
                    ).first()
                    
                    if existing_view:
                        # Update existing view (preserve is_active status)
                        is_active = existing_view.is_active
                        for key, value in view_data.items():
                            setattr(existing_view, key, value)
                        existing_view.is_active = is_active  # Restore custom status
                        existing_view.save()
                        tenant_updated += 1
                    else:
                        # Create new view
                        SettingsView.objects.create(**view_data)
                        tenant_created += 1
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✓ {tenant.name} ({tenant.schema_name}): '
                        f'{tenant_created} created, {tenant_updated} updated'
                    )
                )
                created_count += tenant_created
                updated_count += tenant_updated
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Views initialization complete! '
                f'Created: {created_count}, Updated: {updated_count}'
            )
        )
    
    def seed_integrations(self):
        """Seed integrations from enum to database in all tenant schemas.
        
        This method:
        1. Deletes integrations from DB that are no longer in the enum list
        2. Creates new integrations that don't exist in DB
        3. Updates existing integrations with latest data from enum
        """
        from modules.settings.models import SettingsIntegrations
        from shared.utilities.enums.Integrations import IntegrationsRegistry
        
        self.stdout.write(self.style.SUCCESS('\n--- Syncing Integrations to Tenants ---'))
        
        # Get all tenant schemas (exclude public)
        tenants = Client.objects.exclude(schema_name='public')
        
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenant schemas found.'))
            return
        
        # Get integrations from enum
        enum_integrations = IntegrationsRegistry.get_all_integrations()
        enum_names = {integration['name'] for integration in enum_integrations}
        
        if not enum_integrations:
            self.stdout.write(self.style.WARNING('No integrations found in enum registry.'))
            return
        
        total_created = 0
        total_updated = 0
        total_deleted = 0
        
        for tenant in tenants:
            with schema_context(tenant.schema_name):
                tenant_created = 0
                tenant_updated = 0
                tenant_deleted = 0
                
                # Step 1: Delete integrations that are no longer in the enum
                db_integrations = SettingsIntegrations.objects.all()
                for db_integration in db_integrations:
                    if db_integration.name not in enum_names:
                        self.stdout.write(
                            self.style.WARNING(
                                f'  → Deleting "{db_integration.name}" (no longer in registry)'
                            )
                        )
                        db_integration.delete()
                        tenant_deleted += 1
                
                # Step 2: Create or update integrations from enum
                for idx, integration_data in enumerate(enum_integrations):
                    existing_integration = SettingsIntegrations.objects.filter(
                        name=integration_data['name']
                    ).first()
                    
                    if existing_integration:
                        # Update existing integration (preserve user settings like is_active)
                        existing_integration.icon = integration_data['icon']
                        existing_integration.description = integration_data['description']
                        existing_integration.color = integration_data['color']
                        existing_integration.integration_type = integration_data['type']
                        existing_integration.webhook_url = integration_data.get('webhook_url')
                        existing_integration.order = idx + 1
                        # Update status from enum (reflects availability)
                        existing_integration.status = integration_data['status']
                        existing_integration.save()
                        tenant_updated += 1
                    else:
                        # Create new integration
                        SettingsIntegrations.objects.create(
                            name=integration_data['name'],
                            icon=integration_data['icon'],
                            description=integration_data['description'],
                            status=integration_data['status'],
                            color=integration_data['color'],
                            integration_type=integration_data['type'],
                            webhook_url=integration_data.get('webhook_url'),
                            order=idx + 1
                        )
                        tenant_created += 1
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✓ {tenant.name} ({tenant.schema_name}): '
                        f'{tenant_created} created, {tenant_updated} updated, {tenant_deleted} deleted'
                    )
                )
                total_created += tenant_created
                total_updated += tenant_updated
                total_deleted += tenant_deleted
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Integrations sync complete! '
                f'Created: {total_created}, Updated: {total_updated}, Deleted: {total_deleted}'
            )
        )

    def seed_assets(self):
        """Seed default asset categories, locations, and vendors to all tenant schemas."""
        from modules.assets.models import AssetCategory, Location, Vendor

        self.stdout.write(self.style.SUCCESS('\n--- Seeding Asset Data to Tenants ---'))

        # Get all tenant schemas (exclude public)
        tenants = Client.objects.exclude(schema_name='public')

        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenant schemas found.'))
            return

        seeded_count = 0
        skipped_count = 0

        for tenant in tenants:
            with schema_context(tenant.schema_name):
                # Check if assets data already exists
                existing_categories = AssetCategory.objects.count()

                if existing_categories > 0:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  ⊘ {tenant.name} ({tenant.schema_name}): Already has {existing_categories} categories - skipping'
                        )
                    )
                    skipped_count += 1
                else:
                    # Seed asset data
                    try:
                        categories_created, locations_created, vendors_created = self._seed_asset_data()
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'  ✓ {tenant.name} ({tenant.schema_name}): Seeded {categories_created} categories, '
                                f'{locations_created} locations, {vendors_created} vendors'
                            )
                        )
                        seeded_count += 1
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(
                                f'  ✗ {tenant.name} ({tenant.schema_name}): Failed - {str(e)}'
                            )
                        )

        self.stdout.write(self.style.SUCCESS(f'\n✓ Asset seeding complete! Seeded: {seeded_count}, Skipped: {skipped_count}'))

    def _seed_asset_data(self):
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

    def seed_help_emails(self):
        """Create help email addresses for all existing tenants using plus addressing."""
        from modules.email_to_ticket.models import TenantHelpEmail
        
        self.stdout.write(self.style.SUCCESS('\n--- Seeding Help Emails for Tenants ---'))
        
        # Get all tenant schemas (exclude public)
        tenants = Client.objects.exclude(schema_name='public')
        
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenant schemas found.'))
            return
        
        created_count = 0
        existing_count = 0
        
        for tenant in tenants:
            help_email, created = TenantHelpEmail.get_or_create_for_tenant(tenant)
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'  ✓ Created: {help_email.email_address} → {tenant.name}'
                    )
                )
                created_count += 1
            else:
                self.stdout.write(
                    f'  ⊘ Exists: {help_email.email_address} → {tenant.name}'
                )
                existing_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Help email seeding complete! '
                f'Created: {created_count}, Already existed: {existing_count}'
            )
        )
        
        self.stdout.write(
            self.style.NOTICE(
                f'\nNote: Emails sent to help+{{tenant}}@imaradesk.com will be routed to the corresponding tenant.'
            )
        )

    def set_ssl_for_domains(self):
        """Enable SSL for all verified custom domains using Cloudflare certificates."""
        from django.conf import settings
        from django.utils import timezone
        from datetime import timedelta
        from modules.settings.models import CustomDomain
        
        self.stdout.write(self.style.SUCCESS('\n--- Enabling SSL for Custom Domains ---'))
        
        cert_path = settings.SSL_CERTIFICATE_PATH
        key_path = settings.SSL_PRIVATE_KEY_PATH
        
        self.stdout.write(f'  Certificate: {cert_path}')
        self.stdout.write(f'  Private Key: {key_path}')
        
        # Get all tenant schemas (exclude public)
        tenants = Client.objects.exclude(schema_name='public')
        
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenant schemas found.'))
            return
        
        total_enabled = 0
        total_skipped = 0
        
        for tenant in tenants:
            with schema_context(tenant.schema_name):
                # Get verified domains without active SSL
                domains = CustomDomain.objects.filter(
                    dns_status='verified'
                ).exclude(ssl_status='active')
                
                for domain in domains:
                    domain.ssl_provider = 'cloudflare'
                    domain.ssl_status = 'active'
                    domain.ssl_certificate_path = cert_path
                    domain.ssl_private_key_path = key_path
                    domain.ssl_issued_at = timezone.now()
                    domain.ssl_expires_at = timezone.now() + timedelta(days=5475)  # 15 years
                    domain.ssl_error_message = ''
                    domain.save()
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  ✓ {tenant.schema_name}: {domain.domain} - SSL enabled'
                        )
                    )
                    total_enabled += 1
                
                # Count already active
                active_count = CustomDomain.objects.filter(
                    dns_status='verified',
                    ssl_status='active'
                ).count()
                if active_count > 0:
                    total_skipped += active_count
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ SSL setup complete! Enabled: {total_enabled}, Already active: {total_skipped}'
            )
        )

    def verify_businesses(self):
        """
        Send verification emails to all unverified business tenants.
        Only processes tenants that are:
        - Not the public schema
        - Not already verified (is_verified=False)
        - Have a registered email (created_by_email)
        """
        from shared.models import TenantVerificationToken
        from shared.utilities.Mailer import Mailer
        from shared.utilities.GlobalEmailTenplates import GlobalEmailTemplates
        from django.conf import settings
        import os
        
        self.stdout.write(self.style.SUCCESS('\n--- Sending Verification Emails to Unverified Businesses ---'))
        
        # Get primary domain for verification links - strip any existing scheme
        PRIMARY_DOMAIN = os.getenv('PRIMARY_DOMAIN', 'imaradesk.com')
        domain_clean = PRIMARY_DOMAIN.replace('https://', '').replace('http://', '').rstrip('/')
        if 'localhost' in domain_clean or '127.0.0.1' in domain_clean:
            base_url = f'http://{domain_clean}'
        else:
            base_url = f'https://{domain_clean}'
        
        # Get all unverified tenants (exclude public schema)
        unverified_tenants = Client.objects.exclude(schema_name='public').filter(
            is_verified=False,
            created_by_email__isnull=False,
        ).exclude(created_by_email='')
        
        if not unverified_tenants.exists():
            self.stdout.write(self.style.WARNING('No unverified business tenants found.'))
            return
        
        self.stdout.write(f'Found {unverified_tenants.count()} unverified business(es)\n')
        
        mailer = Mailer()
        verification_template = GlobalEmailTemplates.EMAIL_VERIFICATION
        
        sent_count = 0
        failed_count = 0
        skipped_count = 0
        
        for tenant in unverified_tenants:
            email = tenant.created_by_email
            admin_name = tenant.created_by_name or tenant.name
            workspace_name = tenant.name
            
            # Get primary domain for tenant
            try:
                primary_domain = Domain.objects.filter(
                    tenant=tenant,
                    is_primary=True
                ).first()
                tenant_domain = primary_domain.domain if primary_domain else f'{tenant.schema_name}.{PRIMARY_DOMAIN}'
            except Exception:
                tenant_domain = f'{tenant.schema_name}.{PRIMARY_DOMAIN}'
            
            self.stdout.write(f'  Processing: {tenant.name} ({email})')
            
            # Prepare registration data for token
            registration_data = {
                'email': email,
                'first_name': admin_name.split()[0] if admin_name else 'Admin',
                'last_name': ' '.join(admin_name.split()[1:]) if admin_name and len(admin_name.split()) > 1 else '',
                'workspace_name': workspace_name,
                'tenant_domain': tenant_domain,
                'schema_name': tenant.schema_name,
                'is_existing_business': True,  # Flag to indicate this is for existing business
            }
            
            try:
                # Create secure verification token (expires in 24 hours)
                raw_token = TenantVerificationToken.create_for_tenant(tenant, registration_data)
                
                # Build verification URL
                verification_url = f'{base_url}/verify-email/?token={raw_token}'
                
                # Send verification email
                email_sent = mailer.send_raw_email(
                    to_email=email,
                    subject=verification_template['subject'],
                    body_html=verification_template['body_html'],
                    body_text=verification_template['body_text'],
                    context={
                        'user_name': admin_name.split()[0] if admin_name else 'Admin',
                        'workspace_name': workspace_name,
                        'verification_url': verification_url,
                    },
                    fail_silently=False
                )
                
                if email_sent:
                    sent_count += 1
                    self.stdout.write(self.style.SUCCESS(f'    ✓ Verification email sent'))
                else:
                    failed_count += 1
                    self.stdout.write(self.style.ERROR(f'    ✗ Failed to send email'))
                    
            except Exception as e:
                failed_count += 1
                self.stdout.write(self.style.ERROR(f'    ✗ Error: {str(e)}'))
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Verification emails complete! Sent: {sent_count}, Failed: {failed_count}'
            )
        )

    def reverify_businesses(self):
        """
        Resend verification emails to ALL business tenants (including already verified ones).
        This resets the verification status and requires re-verification.
        """
        from shared.models import TenantVerificationToken
        from shared.utilities.Mailer import Mailer
        from shared.utilities.GlobalEmailTenplates import GlobalEmailTemplates
        from django.conf import settings
        import os
        
        self.stdout.write(self.style.SUCCESS('\n--- Resending Verification Emails to All Businesses ---'))
        
        # Get primary domain for verification links - strip any existing scheme
        PRIMARY_DOMAIN = os.getenv('PRIMARY_DOMAIN', 'imaradesk.com')
        domain_clean = PRIMARY_DOMAIN.replace('https://', '').replace('http://', '').rstrip('/')
        if 'localhost' in domain_clean or '127.0.0.1' in domain_clean:
            base_url = f'http://{domain_clean}'
        else:
            base_url = f'https://{domain_clean}'
        
        # Get ALL tenants with admin email (exclude public schema)
        tenants = Client.objects.exclude(schema_name='public').filter(
            created_by_email__isnull=False,
        ).exclude(created_by_email='')
        
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No business tenants found with admin emails.'))
            return
        
        self.stdout.write(f'Found {tenants.count()} business(es)\n')
        
        mailer = Mailer()
        verification_template = GlobalEmailTemplates.EMAIL_VERIFICATION
        
        sent_count = 0
        failed_count = 0
        
        for tenant in tenants:
            email = tenant.created_by_email
            admin_name = tenant.created_by_name or tenant.name
            workspace_name = tenant.name
            was_verified = tenant.is_verified
            
            # Get primary domain for tenant
            try:
                primary_domain = Domain.objects.filter(
                    tenant=tenant,
                    is_primary=True
                ).first()
                tenant_domain = primary_domain.domain if primary_domain else f'{tenant.schema_name}.{domain_clean}'
            except Exception:
                tenant_domain = f'{tenant.schema_name}.{domain_clean}'
            
            status_tag = ' [was verified]' if was_verified else ' [unverified]'
            self.stdout.write(f'  Processing: {tenant.name} ({email}){status_tag}')
            
            # Reset verification status
            tenant.is_verified = False
            tenant.verified_at = None
            tenant.save(update_fields=['is_verified', 'verified_at'])
            
            # Prepare registration data for token
            registration_data = {
                'email': email,
                'first_name': admin_name.split()[0] if admin_name else 'Admin',
                'last_name': ' '.join(admin_name.split()[1:]) if admin_name and len(admin_name.split()) > 1 else '',
                'workspace_name': workspace_name,
                'tenant_domain': tenant_domain,
                'schema_name': tenant.schema_name,
                'is_existing_business': True,
            }
            
            try:
                # Create secure verification token (expires in 24 hours)
                raw_token = TenantVerificationToken.create_for_tenant(tenant, registration_data)
                
                # Build verification URL
                verification_url = f'{base_url}/verify-email/?token={raw_token}'
                
                # Send verification email
                email_sent = mailer.send_raw_email(
                    to_email=email,
                    subject=verification_template['subject'],
                    body_html=verification_template['body_html'],
                    body_text=verification_template['body_text'],
                    context={
                        'user_name': admin_name.split()[0] if admin_name else 'Admin',
                        'workspace_name': workspace_name,
                        'verification_url': verification_url,
                    },
                    fail_silently=False
                )
                
                if email_sent:
                    sent_count += 1
                    self.stdout.write(self.style.SUCCESS(f'    ✓ Verification email sent'))
                else:
                    failed_count += 1
                    self.stdout.write(self.style.ERROR(f'    ✗ Failed to send email'))
                    
            except Exception as e:
                failed_count += 1
                self.stdout.write(self.style.ERROR(f'    ✗ Error: {str(e)}'))
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Re-verification emails complete! Sent: {sent_count}, Failed: {failed_count}'
            )
        )

    def update_integration_icons(self):
        """Update integration icons from emojis to Lucide React icon names for all tenants.
        
        This command updates the icon field for all integrations using the latest
        Lucide icon names from the IntegrationsRegistry enum.
        """
        from modules.settings.models import SettingsIntegrations
        from shared.utilities.enums.Integrations import IntegrationsRegistry
        
        self.stdout.write(self.style.SUCCESS('\n--- Updating Integration Icons to Lucide ---'))
        
        # Get all tenant schemas (exclude public)
        tenants = Client.objects.exclude(schema_name='public')
        
        if not tenants.exists():
            self.stdout.write(self.style.WARNING('No tenant schemas found.'))
            return
        
        # Build icon mapping from enum
        icon_mapping = {}
        for integration in IntegrationsRegistry.INTEGRATIONS:
            icon_mapping[integration.name] = integration.icon
        
        if not icon_mapping:
            self.stdout.write(self.style.WARNING('No integrations found in enum registry.'))
            return
        
        total_updated = 0
        
        for tenant in tenants:
            with schema_context(tenant.schema_name):
                tenant_updated = 0
                
                # Update icons for all integrations
                db_integrations = SettingsIntegrations.objects.all()
                for db_integration in db_integrations:
                    if db_integration.name in icon_mapping:
                        new_icon = icon_mapping[db_integration.name]
                        if db_integration.icon != new_icon:
                            old_icon = db_integration.icon
                            db_integration.icon = new_icon
                            db_integration.save(update_fields=['icon'])
                            tenant_updated += 1
                            self.stdout.write(
                                f'  → {db_integration.name}: "{old_icon}" → "{new_icon}"'
                            )
                
                if tenant_updated > 0:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  ✓ {tenant.name} ({tenant.schema_name}): {tenant_updated} icons updated'
                        )
                    )
                else:
                    self.stdout.write(
                        f'  • {tenant.name} ({tenant.schema_name}): No changes needed'
                    )
                
                total_updated += tenant_updated
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Integration icons update complete! Total updated: {total_updated}'
            )
        )
