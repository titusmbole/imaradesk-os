from django.core.management.base import BaseCommand
from django.db import connection
from modules.settings.models import App


# Canonical list of marketplace apps - this is the source of truth
MARKETPLACE_APPS = [
    {
        'name': 'Email to Ticket',
        'slug': 'email-to-ticket',
        'description': 'Automatically convert incoming emails into tickets',
        'long_description': 'Transform your support inbox into a powerful ticketing system. Email to Ticket automatically converts customer emails into organized tickets, ensuring no inquiry goes unanswered. Features include: automatic ticket creation from emails, custom email routing rules, attachment support, email threading, and smart duplicate detection.',
        'icon': '📧',
        'category': 'communication',
        'price': 5.00,
        'is_free': False,
        'status': 'active',
        'is_featured': True,
        'version': '2.1.0',
    },
    {
        'name': 'Asset Management',
        'slug': 'asset-management',
        'description': 'Track and manage IT assets, inventory, and equipment',
        'long_description': 'Complete asset lifecycle management for IT teams. Track hardware, software licenses, and equipment from procurement to retirement. Features include: asset inventory tracking, depreciation calculation, maintenance scheduling, warranty management, QR code labeling, asset check-in/out system, and comprehensive reporting.',
        'icon': '💻',
        'category': 'asset',
        'price': 5.00,
        'is_free': False,
        'status': 'active',
        'is_featured': True,
        'version': '3.0.1',
    },
    {
        'name': 'Tasks & Projects',
        'slug': 'tasks-projects',
        'description': 'Advanced task management and project tracking',
        'long_description': 'Streamline your workflow with integrated task and project management. Create tasks from tickets, organize work into projects, and track progress with Kanban boards. Features include: task assignment and tracking, project timelines, Gantt charts, time tracking, resource allocation, milestone tracking, and team collaboration tools.',
        'icon': '✅',
        'category': 'productivity',
        'price': 5.00,
        'is_free': False,
        'status': 'active',
        'is_featured': True,
        'version': '1.5.2',
    },
    {
        'name': 'Customer Portal',
        'slug': 'customer-portal',
        'description': 'Self-service portal for customers',
        'long_description': 'Empower customers with a branded self-service portal. Allow customers to create tickets, track progress, and access knowledge base articles. Features include: customizable branding, ticket submission forms, ticket tracking, knowledge base access, customer dashboard, and mobile-responsive design.',
        'icon': '🌐',
        'category': 'productivity',
        'price': 0.00,
        'is_free': True,
        'status': 'beta',
        'is_featured': False,
        'version': '1.0.0-beta',
    },
    {
        'name': 'AI Assistant',
        'slug': 'ai-assistant',
        'description': 'AI-powered ticket categorization and responses',
        'long_description': 'Leverage artificial intelligence to improve support efficiency. Get smart ticket categorization, suggested responses, and sentiment analysis. Features include: automatic ticket categorization, AI-powered response suggestions, sentiment analysis, priority prediction, duplicate ticket detection, and knowledge base recommendations.',
        'icon': '🤖',
        'category': 'automation',
        'price': 10.00,
        'is_free': False,
        'status': 'beta',
        'is_featured': True,
        'version': '0.9.5-beta',
    },
    {
        'name': 'Survey & Feedback',
        'slug': 'surveys',
        'description': 'Collect customer feedback with surveys',
        'long_description': 'Measure customer satisfaction with automated surveys. Send CSAT, NPS, and custom surveys after ticket resolution. Features include: CSAT and NPS surveys, custom survey builder, automated survey sending, feedback analytics, rating trends, and customer testimonials collection.',
        'icon': '📝',
        'category': 'productivity',
        'price': 5.00,
        'is_free': False,
        'status': 'active',
        'is_featured': False,
        'version': '1.6.0',
    },
    {
        'name': 'Knowledge Base',
        'slug': 'knowledge-base',
        'description': 'Self-service knowledge base for customers and agents',
        'long_description': 'Create and manage a comprehensive knowledge base to help customers find answers quickly. Reduce support tickets with searchable articles, FAQs, and documentation. Features include: article categories, rich text editor, article versioning, search functionality, article ratings, related articles, and public/internal visibility options.',
        'icon': '📚',
        'category': 'productivity',
        'price': 0.00,
        'is_free': True,
        'status': 'active',
        'is_featured': True,
        'version': '2.0.0',
    },
]


class Command(BaseCommand):
    help = 'Sync marketplace apps - creates new, updates existing, removes deleted'

    def handle(self, *args, **options):
        # Skip if running on public schema (no tenant-specific tables)
        if connection.schema_name == 'public':
            self.stdout.write(self.style.WARNING('Skipping public schema - this command is for tenant schemas only'))
            return

        created_count = 0
        updated_count = 0
        deleted_count = 0

        # Get all valid slugs from the canonical list
        valid_slugs = {app['slug'] for app in MARKETPLACE_APPS}

        # Create or update apps from the canonical list
        for app_data in MARKETPLACE_APPS:
            slug = app_data['slug']
            app, created = App.objects.update_or_create(
                slug=slug,
                defaults=app_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  + Created: {app.name}'))
                created_count += 1
            else:
                self.stdout.write(f'  ~ Updated: {app.name}')
                updated_count += 1

        # Delete apps that are no longer in the canonical list
        orphaned_apps = App.objects.exclude(slug__in=valid_slugs)
        for app in orphaned_apps:
            self.stdout.write(self.style.WARNING(f'  - Deleted: {app.name} ({app.slug})'))
            app.delete()
            deleted_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSync complete! Created: {created_count}, Updated: {updated_count}, Deleted: {deleted_count}'
            )
        )
