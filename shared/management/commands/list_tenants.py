from django.core.management.base import BaseCommand
from shared.models import Client


class Command(BaseCommand):
    help = 'List all tenants'

    def handle(self, *args, **options):
        tenants = Client.objects.all()
        
        if not tenants:
            self.stdout.write(self.style.WARNING('No tenants found.'))
            return

        self.stdout.write(self.style.SUCCESS(f'\nFound {tenants.count()} tenant(s):\n'))
        
        for tenant in tenants:
            domains = ', '.join([d.domain for d in tenant.domains.all()])
            status = '✓ Active' if tenant.is_active else '✗ Inactive'
            
            self.stdout.write(
                f'\n{tenant.name}\n'
                f'  Schema: {tenant.schema_name}\n'
                f'  Domains: {domains or "No domains"}\n'
                f'  Status: {status}\n'
                f'  Created: {tenant.created_on}\n'
            )
