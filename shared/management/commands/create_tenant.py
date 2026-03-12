from django.core.management.base import BaseCommand
from django_tenants.utils import schema_context
from shared.models import Client, Domain
from modules.users.models import Role
from modules.users.permissions import Permission


class Command(BaseCommand):
    help = 'Create a new tenant with domain'

    def add_arguments(self, parser):
        parser.add_argument('--name', type=str, required=True, help='Tenant name')
        parser.add_argument('--schema', type=str, required=True, help='Schema name (e.g., acme_corp)')
        parser.add_argument('--domain', type=str, required=True, help='Domain (e.g., acme.localhost or acme.yourdomain.com)')
        parser.add_argument('--description', type=str, default='', help='Tenant description')
        parser.add_argument('--skip-roles', action='store_true', help='Skip creating default roles')

    def handle(self, *args, **options):
        name = options['name']
        schema_name = options['schema']
        domain_name = options['domain']
        description = options['description']
        skip_roles = options.get('skip_roles', False)

        # Create tenant
        tenant = Client(
            schema_name=schema_name,
            name=name,
            description=description
        )
        tenant.save()

        # Create domain
        domain = Domain()
        domain.domain = domain_name
        domain.tenant = tenant
        domain.is_primary = True
        domain.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Tenant "{name}" created successfully!\n'
                f'  Schema: {schema_name}\n'
                f'  Domain: {domain_name}'
            )
        )

        # Create default roles for the new tenant
        if not skip_roles:
            self.stdout.write('\nCreating default roles for tenant...')
            with schema_context(schema_name):
                roles_created = []
                
                # Administrator role
                admin_role, created = Role.objects.get_or_create(
                    name='Administrator',
                    defaults={
                        'description': 'Full system access with all permissions',
                        'permissions': [p[0] for p in Permission.get_all()],
                        'is_system': True,
                    }
                )
                if created:
                    roles_created.append('Administrator')
                
                # Agent role
                agent_role, created = Role.objects.get_or_create(
                    name='Agent',
                    defaults={
                        'description': 'Customer support agent with ticket management access',
                        'permissions': [
                            Permission.VIEW_TICKETS,
                            Permission.CREATE_TICKETS,
                            Permission.EDIT_TICKETS,
                            Permission.ASSIGN_TICKETS,
                            Permission.VIEW_USERS,
                            Permission.VIEW_KNOWLEDGE_BASE,
                        ],
                        'is_system': True,
                    }
                )
                if created:
                    roles_created.append('Agent')
                
                # Manager role
                manager_role, created = Role.objects.get_or_create(
                    name='Manager',
                    defaults={
                        'description': 'Team manager with extended permissions',
                        'permissions': [
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
                            Permission.EDIT_KNOWLEDGE_BASE,
                        ],
                        'is_system': True,
                    }
                )
                if created:
                    roles_created.append('Manager')
                
                # Customer role
                customer_role, created = Role.objects.get_or_create(
                    name='Customer',
                    defaults={
                        'description': 'End customer with limited access',
                        'permissions': [
                            Permission.VIEW_TICKETS,
                            Permission.CREATE_TICKETS,
                            Permission.VIEW_KNOWLEDGE_BASE,
                        ],
                        'is_system': True,
                    }
                )
                if created:
                    roles_created.append('Customer')
                
                if roles_created:
                    self.stdout.write(
                        self.style.SUCCESS(f'  ✓ Created roles: {", ".join(roles_created)}')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING('  - Roles already exist')
                    )
                
                # Seed integrations for the new tenant (all unconnected)
                self.stdout.write('\nSeeding integrations for tenant...')
                try:
                    from modules.settings.models import SettingsIntegrations
                    from shared.utilities.enums.Integrations import IntegrationsRegistry
                    
                    integration_count = SettingsIntegrations.objects.count()
                    if integration_count == 0:
                        enum_integrations = IntegrationsRegistry.get_all_integrations()
                        created_count = 0
                        
                        for integration_data in enum_integrations:
                            SettingsIntegrations.objects.create(
                                name=integration_data['name'],
                                icon=integration_data['icon'],
                                description=integration_data['description'],
                                status='available',  # All integrations start as unconnected/available
                                color=integration_data['color'],
                                integration_type=integration_data['type'],
                                webhook_url=integration_data.get('webhook_url'),
                                order=created_count + 1,
                            )
                            created_count += 1
                        
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ Seeded {created_count} integrations (all unconnected)')
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'  - Integrations already exist ({integration_count} integrations)')
                        )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ Failed to seed integrations: {e}')
                    )

                # Seed default asset data for the new tenant
                self.stdout.write('\nSeeding asset data for tenant...')
                try:
                    from modules.assets.models import AssetCategory, Location, Vendor

                    category_count = AssetCategory.objects.count()
                    if category_count == 0:
                        categories_created, locations_created, vendors_created = self._seed_asset_data()
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'  ✓ Seeded {categories_created} categories, '
                                f'{locations_created} locations, {vendors_created} vendors'
                            )
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'  - Asset data already exists ({category_count} categories)')
                        )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ Failed to seed asset data: {e}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Setup complete! Tenant is ready to use.'
            )
        )

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

