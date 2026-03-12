"""Management command to setup and seed data for single-tenant ImaraDesk."""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from shared.models import Client


class Command(BaseCommand):
    help = 'Setup and seed data for ImaraDesk (single-tenant)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--init',
            action='store_true',
            help='Initialize the organization and all default data (runs all seed commands)',
        )
        parser.add_argument(
            '--seed-apps',
            action='store_true',
            help='Seed marketplace apps',
        )
        parser.add_argument(
            '--seed-email-templates',
            action='store_true',
            help='Seed default email templates (skips existing)',
        )
        parser.add_argument(
            '--reseed-email-templates',
            action='store_true',
            help='Delete all existing email templates and create fresh ones',
        )
        parser.add_argument(
            '--init-views',
            action='store_true',
            help='Initialize default views for tickets, tasks, and KB',
        )
        parser.add_argument(
            '--seed-integrations',
            action='store_true',
            help='Seed integrations from enum to database',
        )
        parser.add_argument(
            '--seed-assets',
            action='store_true',
            help='Seed default asset categories, locations, and vendors',
        )
        parser.add_argument(
            '--create-backoffice-admin',
            action='store_true',
            help='Create backoffice admin user from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD)',
        )

    def handle(self, *args, **options):
        # Create or get organization
        org = Client.get_current()
        self.stdout.write(self.style.SUCCESS(f'Organization: {org.name}'))
        
        # Run all seeds if --init is provided
        if options.get('init'):
            self.stdout.write(self.style.SUCCESS('\n=== Initializing ImaraDesk ===\n'))
            self.seed_marketplace_apps()
            self.seed_email_templates(reseed=False)
            self.init_views()
            self.seed_integrations()
            self.seed_assets()
            self.stdout.write(self.style.SUCCESS('\n=== Initialization Complete ==='))
            return
        
        # Individual seed commands
        if options.get('seed_apps'):
            self.seed_marketplace_apps()
        
        if options.get('seed_email_templates'):
            self.seed_email_templates(reseed=False)
        
        if options.get('reseed_email_templates'):
            self.seed_email_templates(reseed=True)
        
        if options.get('init_views'):
            self.init_views()
        
        if options.get('seed_integrations'):
            self.seed_integrations()

        if options.get('seed_assets'):
            self.seed_assets()

        if options.get('create_backoffice_admin'):
            self.create_backoffice_admin()

    def create_backoffice_admin(self):
        """Create backoffice admin user from environment variables."""
        from decouple import config
        from modules.backoffice.models import AdminUser
        from modules.backoffice.views import hash_password
        
        self.stdout.write(self.style.SUCCESS('\n--- Creating Backoffice Admin ---'))
        
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
        
        if AdminUser.objects.filter(email=email.lower()).exists():
            self.stdout.write(self.style.WARNING(f'  ⊘ Admin user already exists: {email}'))
            return
        
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

    def seed_marketplace_apps(self):
        """Seed marketplace apps."""
        self.stdout.write(self.style.SUCCESS('\n--- Seeding Marketplace Apps ---'))
        
        try:
            call_command('create_marketplace_apps')
            self.stdout.write(self.style.SUCCESS('  ✓ Marketplace apps seeded'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  ✗ Failed - {str(e)}'))
    
    def seed_email_templates(self, reseed=False):
        """Seed default email templates."""
        from django.db import transaction
        from modules.settings.models import EmailTemplate
        from modules.settings.email_templates_defaults import DEFAULT_EMAIL_TEMPLATES
        
        if reseed:
            self.stdout.write(self.style.WARNING('\n--- RESEEDING Email Templates (Delete & Recreate) ---'))
        else:
            self.stdout.write(self.style.SUCCESS('\n--- Seeding Email Templates ---'))
        
        created_count = 0
        deleted_count = 0
        skipped_count = 0
        
        if reseed:
            with transaction.atomic():
                deleted_count = EmailTemplate.objects.count()
                EmailTemplate.objects.all().delete()
        
        for template_data in DEFAULT_EMAIL_TEMPLATES:
            template_type = template_data['template_type']
            
            existing = EmailTemplate.objects.filter(template_type=template_type).first()
            
            if existing:
                if reseed:
                    existing.delete()
                else:
                    skipped_count += 1
                    continue
            
            EmailTemplate.objects.create(**template_data)
            created_count += 1
        
        if reseed:
            self.stdout.write(self.style.SUCCESS(
                f'  ✓ Deleted: {deleted_count}, Created: {created_count}'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'  ✓ Created: {created_count}, Skipped: {skipped_count}'
            ))
    
    def init_views(self):
        """Initialize default views for tickets, tasks, and KB."""
        from modules.settings.models import SettingsView
        
        self.stdout.write(self.style.SUCCESS('\n--- Initializing Views ---'))
        
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
        
        created_count = 0
        updated_count = 0
        
        for view_data in DEFAULT_VIEWS:
            existing = SettingsView.objects.filter(
                type=view_data['type'],
                view_id=view_data['view_id']
            ).first()
            
            if existing:
                is_active = existing.is_active
                for key, value in view_data.items():
                    setattr(existing, key, value)
                existing.is_active = is_active
                existing.save()
                updated_count += 1
            else:
                SettingsView.objects.create(**view_data)
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'  ✓ Created: {created_count}, Updated: {updated_count}'
        ))
    
    def seed_integrations(self):
        """Seed integrations from enum to database."""
        from modules.settings.models import SettingsIntegrations
        from shared.utilities.enums.Integrations import IntegrationsRegistry
        
        self.stdout.write(self.style.SUCCESS('\n--- Seeding Integrations ---'))
        
        enum_integrations = IntegrationsRegistry.get_all_integrations()
        enum_names = {integration['name'] for integration in enum_integrations}
        
        if not enum_integrations:
            self.stdout.write(self.style.WARNING('  No integrations found in enum registry.'))
            return
        
        created_count = 0
        updated_count = 0
        deleted_count = 0
        
        # Delete integrations no longer in enum
        for db_integration in SettingsIntegrations.objects.all():
            if db_integration.name not in enum_names:
                db_integration.delete()
                deleted_count += 1
        
        # Create or update from enum
        for idx, integration_data in enumerate(enum_integrations):
            existing = SettingsIntegrations.objects.filter(name=integration_data['name']).first()
            
            if existing:
                existing.icon = integration_data['icon']
                existing.description = integration_data['description']
                existing.color = integration_data['color']
                existing.integration_type = integration_data['type']
                existing.webhook_url = integration_data.get('webhook_url')
                existing.order = idx + 1
                existing.status = integration_data['status']
                existing.save()
                updated_count += 1
            else:
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
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'  ✓ Created: {created_count}, Updated: {updated_count}, Deleted: {deleted_count}'
        ))

    def seed_assets(self):
        """Seed default asset categories, locations, and vendors."""
        from modules.assets.models import AssetCategory, Location, Vendor

        self.stdout.write(self.style.SUCCESS('\n--- Seeding Asset Data ---'))

        existing_categories = AssetCategory.objects.count()
        if existing_categories > 0:
            self.stdout.write(self.style.WARNING(
                f'  ⊘ Already has {existing_categories} categories - skipping'
            ))
            return

        categories_created, locations_created, vendors_created = self._seed_asset_data()
        self.stdout.write(self.style.SUCCESS(
            f'  ✓ Categories: {categories_created}, Locations: {locations_created}, Vendors: {vendors_created}'
        ))

    def _seed_asset_data(self):
        """Helper to seed asset categories, locations, and vendors."""
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
                defaults={'city': loc_data.get('city', '')}
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
                defaults={'website': vendor_data.get('website', '')}
            )
            if created:
                vendors_created += 1

        return categories_created, locations_created, vendors_created
