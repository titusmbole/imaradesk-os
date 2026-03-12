from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.text import slugify
from decouple import config
from modules.backoffice.models import Package, AdminUser, EmailTemplate, EmailCampaign
from modules.backoffice.views import hash_password
from decimal import Decimal


class Command(BaseCommand):
    help = 'Backoffice administration: seed packages, create admin user, seed email templates'

    def add_arguments(self, parser):
        parser.add_argument(
            '--seed-packages',
            action='store_true',
            help='Seed default subscription packages'
        )
        parser.add_argument(
            '--create-admin',
            action='store_true',
            help='Create admin user from environment variables if not exists'
        )
        parser.add_argument(
            '--seed-email-templates',
            action='store_true',
            help='Seed default email templates for marketing campaigns'
        )
        parser.add_argument(
            '--reinit-templates',
            action='store_true',
            help='Delete all seeded email templates and recreate them with current defaults'
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Run seed-packages, create-admin, and seed-email-templates'
        )

    def handle(self, *args, **options):
        run_all = options.get('all', False)
        seed_packages = options.get('seed_packages', False) or run_all
        create_admin = options.get('create_admin', False) or run_all
        seed_email_templates = options.get('seed_email_templates', False) or run_all
        reinit_templates = options.get('reinit_templates', False)

        if not seed_packages and not create_admin and not seed_email_templates and not reinit_templates:
            self.stdout.write(self.style.WARNING(
                'No action specified. Use --seed-packages, --create-admin, --seed-email-templates, --reinit-templates, or --all'
            ))
            return

        if seed_packages:
            self._seed_packages()

        if create_admin:
            self._create_admin()

        if reinit_templates:
            self._reinit_email_templates()
        elif seed_email_templates:
            self._seed_email_templates()

    def _seed_packages(self):
        self.stdout.write(self.style.HTTP_INFO('\n=== Seeding Packages ==='))
        
        packages_data = [
            {
                'name': 'Free',
                'slug': 'free',
                'description': 'Perfect for small teams getting started',
                'price_monthly': Decimal('0.00'),
                'price_yearly': Decimal('0.00'),
                'max_agents': 2,
                'max_customers': 50,
                'max_tickets_per_month': 100,
                'storage_limit_gb': 1,
                'features': ['basic_ticketing', 'email_support'],
                'display_order': 1,
            },
            {
                'name': 'Starter',
                'slug': 'starter',
                'description': 'For growing teams that need more features',
                'price_monthly': Decimal('29.00'),
                'price_yearly': Decimal('290.00'),
                'max_agents': 5,
                'max_customers': 250,
                'max_tickets_per_month': 500,
                'storage_limit_gb': 5,
                'features': ['basic_ticketing', 'email_support', 'knowledge_base', 'basic_reports'],
                'display_order': 2,
            },
            {
                'name': 'Professional',
                'slug': 'professional',
                'description': 'Advanced features for professional teams',
                'price_monthly': Decimal('79.00'),
                'price_yearly': Decimal('790.00'),
                'max_agents': 15,
                'max_customers': 1000,
                'max_tickets_per_month': 2000,
                'storage_limit_gb': 20,
                'features': ['basic_ticketing', 'email_support', 'knowledge_base', 'basic_reports', 'sla_management', 'automations', 'custom_fields'],
                'is_featured': True,
                'badge_text': 'Most Popular',
                'display_order': 3,
            },
            {
                'name': 'Enterprise',
                'slug': 'enterprise',
                'description': 'Full-featured solution for large organizations',
                'price_monthly': Decimal('199.00'),
                'price_yearly': Decimal('1990.00'),
                'max_agents': 50,
                'max_customers': 10000,
                'max_tickets_per_month': 10000,
                'storage_limit_gb': 100,
                'features': ['basic_ticketing', 'email_support', 'knowledge_base', 'basic_reports', 'sla_management', 'automations', 'custom_fields', 'api_access', 'sso', 'audit_logs', 'priority_support'],
                'display_order': 4,
            },
        ]

        created_count = 0
        updated_count = 0

        for pkg_data in packages_data:
            pkg, created = Package.objects.update_or_create(
                slug=pkg_data['slug'],
                defaults=pkg_data
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  Created package: {pkg.name}'))
            else:
                updated_count += 1
                self.stdout.write(f'  Updated package: {pkg.name}')

        self.stdout.write(self.style.SUCCESS(f'Packages done! Created: {created_count}, Updated: {updated_count}'))

    def _create_admin(self):
        self.stdout.write(self.style.HTTP_INFO('\n=== Creating Admin User ==='))
        
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
                f'  Admin user already exists: {email}'
            ))
            return

        # Create admin user
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

        self.stdout.write(self.style.SUCCESS(f'  Admin user created: {admin.email}'))
        self.stdout.write(self.style.SUCCESS(f'  Full name: {admin.full_name}'))
        self.stdout.write(self.style.SUCCESS(f'  Superadmin: Yes'))

    def _reinit_email_templates(self):
        """Delete all seeded email templates and recreate them."""
        self.stdout.write(self.style.HTTP_INFO('\n=== Reinitializing Email Templates ==='))
        
        # First delete campaigns that use default templates (to avoid ProtectedError)
        default_templates = EmailTemplate.objects.filter(is_default=True)
        campaigns_deleted, _ = EmailCampaign.objects.filter(template__in=default_templates).delete()
        if campaigns_deleted:
            self.stdout.write(self.style.WARNING(f'  Deleted {campaigns_deleted} campaigns using default templates'))
        
        # Delete all default templates
        deleted_count, _ = default_templates.delete()
        self.stdout.write(self.style.WARNING(f'  Deleted {deleted_count} seeded templates'))
        
        # Re-seed with current defaults
        self._seed_email_templates()

    def _seed_email_templates(self):
        """Seed default email templates for marketing campaigns."""
        from modules.backoffice.email_templates_defaults import DEFAULT_BACKOFFICE_EMAIL_TEMPLATES
        
        self.stdout.write(self.style.HTTP_INFO('\n=== Seeding Email Templates ==='))
        
        created_count = 0
        updated_count = 0
        
        for template_data in DEFAULT_BACKOFFICE_EMAIL_TEMPLATES:
            # Ensure slug exists and is unique
            slug = template_data.get('slug') or slugify(template_data['name'])
            
            template, created = EmailTemplate.objects.update_or_create(
                slug=slug,
                defaults={
                    'name': template_data['name'],
                    'template_type': template_data['template_type'],
                    'category': template_data['category'],
                    'subject': template_data['subject'],
                    'preview_text': template_data.get('preview_text', ''),
                    'html_content': template_data['html_content'].strip(),
                    'is_default': True,
                    'is_active': True,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f'  Created: {template.name} ({template.get_template_type_display()})'
                ))
            else:
                updated_count += 1
                self.stdout.write(
                    f'  Updated: {template.name} ({template.get_template_type_display()})'
                )
        
        self.stdout.write(self.style.SUCCESS(
            f'\nEmail templates done! Created: {created_count}, Updated: {updated_count}'
        ))
