from django.core.management.base import BaseCommand
from modules.backoffice.models import AdminUser
from modules.backoffice.views import hash_password
import getpass


class Command(BaseCommand):
    help = 'Creates a backoffice admin user'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email')
        parser.add_argument('--name', type=str, help='Admin full name')
        parser.add_argument('--password', type=str, help='Admin password')
        parser.add_argument('--superadmin', action='store_true', help='Make superadmin')

    def handle(self, *args, **options):
        email = options.get('email')
        name = options.get('name')
        password = options.get('password')
        is_superadmin = options.get('superadmin', False)

        if not email:
            email = input('Email: ').strip()
        if not name:
            name = input('Full name: ').strip()
        if not password:
            password = getpass.getpass('Password: ')
            password2 = getpass.getpass('Confirm password: ')
            if password != password2:
                self.stdout.write(self.style.ERROR('Passwords do not match'))
                return

        if not email or not name or not password:
            self.stdout.write(self.style.ERROR('All fields are required'))
            return

        if AdminUser.objects.filter(email=email.lower()).exists():
            self.stdout.write(self.style.ERROR(f'Admin with email {email} already exists'))
            return

        admin = AdminUser.objects.create(
            email=email.lower(),
            full_name=name,
            password_hash=hash_password(password),
            is_active=True,
            is_superadmin=is_superadmin,
            can_manage_businesses=True,
            can_manage_packages=is_superadmin,
            can_manage_billing=is_superadmin,
            can_view_analytics=True,
            can_manage_admins=is_superadmin,
        )

        self.stdout.write(self.style.SUCCESS(f'Admin user created: {admin.email}'))
        if is_superadmin:
            self.stdout.write(self.style.SUCCESS('User has superadmin privileges'))
