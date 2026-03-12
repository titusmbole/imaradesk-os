"""
Management command to seed default asset categories and sample data.
"""
from django.core.management.base import BaseCommand
from modules.assets.models import AssetCategory, Location, Vendor


class Command(BaseCommand):
    help = 'Seed default asset categories, locations, and vendors'

    def handle(self, *args, **options):
        self.stdout.write('Seeding asset data...')

        # Create default categories
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
                    self.stdout.write(f'  Created category: {cat.name}')

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
                        self.stdout.write(f'  Created category: {cat.name} (under {parent.name})')

        # Create sample locations
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
                self.stdout.write(f'  Created location: {loc}')

        # Create sample vendors
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
                self.stdout.write(f'  Created vendor: {vendor.name}')

        self.stdout.write(self.style.SUCCESS('Asset data seeding complete!'))

