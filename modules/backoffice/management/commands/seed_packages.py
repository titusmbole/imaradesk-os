from django.core.management.base import BaseCommand
from modules.backoffice.models import Package
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seeds default subscription packages'

    def handle(self, *args, **options):
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
                self.stdout.write(self.style.SUCCESS(f'Created package: {pkg.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'Updated package: {pkg.name}'))

        self.stdout.write(self.style.SUCCESS(f'\nDone! Created: {created_count}, Updated: {updated_count}'))
