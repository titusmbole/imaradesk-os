from django.contrib import admin
from .models import (
    Location, Vendor, AssetCategory, Asset, AssetAttachment,
    AssetAssignmentHistory, MaintenanceSchedule, MaintenanceLog,
    AssetTicketRelation, AssetActivityLog
)


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'building', 'floor', 'city', 'is_active']
    list_filter = ['is_active', 'city', 'country']
    search_fields = ['name', 'building', 'address']


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_name', 'email', 'phone', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'contact_name', 'email']


@admin.register(AssetCategory)
class AssetCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_active']
    list_filter = ['is_active', 'parent']
    search_fields = ['name', 'description']


class AssetAttachmentInline(admin.TabularInline):
    model = AssetAttachment
    extra = 0


class AssetAssignmentHistoryInline(admin.TabularInline):
    model = AssetAssignmentHistory
    extra = 0
    readonly_fields = ['assigned_at']


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = [
        'asset_id', 'name', 'category', 'status', 'condition',
        'assigned_user', 'location', 'created_at'
    ]
    list_filter = ['status', 'condition', 'category', 'location', 'department']
    search_fields = ['asset_id', 'name', 'serial_number', 'tag_number']
    readonly_fields = ['asset_id', 'created_at', 'updated_at']
    inlines = [AssetAttachmentInline, AssetAssignmentHistoryInline]

    fieldsets = (
        ('Identification', {
            'fields': ('asset_id', 'name', 'description', 'category', 'asset_type')
        }),
        ('Serial/Tag Numbers', {
            'fields': ('serial_number', 'tag_number', 'barcode')
        }),
        ('Assignment', {
            'fields': ('assigned_user', 'department', 'location', 'vendor')
        }),
        ('Status', {
            'fields': ('status', 'condition')
        }),
        ('Dates', {
            'fields': ('purchase_date', 'warranty_expiry_date', 'end_of_life_date', 'last_audit_date')
        }),
        ('Financial', {
            'fields': ('purchase_cost', 'current_value', 'invoice_number', 'po_number'),
            'classes': ('collapse',)
        }),
        ('Support', {
            'fields': ('support_contract', 'support_expiry_date'),
            'classes': ('collapse',)
        }),
        ('Additional', {
            'fields': ('specifications', 'custom_fields', 'notes', 'tags'),
            'classes': ('collapse',)
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = ['title', 'asset', 'frequency', 'next_due', 'is_active']
    list_filter = ['frequency', 'is_active', 'auto_create_ticket']
    search_fields = ['title', 'asset__name', 'asset__asset_id']


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ['title', 'asset', 'maintenance_type', 'status', 'scheduled_date']
    list_filter = ['maintenance_type', 'status']
    search_fields = ['title', 'asset__name', 'asset__asset_id']


@admin.register(AssetTicketRelation)
class AssetTicketRelationAdmin(admin.ModelAdmin):
    list_display = ['asset', 'ticket', 'created_at']
    search_fields = ['asset__asset_id', 'ticket__ticket_number']


@admin.register(AssetActivityLog)
class AssetActivityLogAdmin(admin.ModelAdmin):
    list_display = ['asset', 'activity_type', 'actor', 'created_at']
    list_filter = ['activity_type']
    search_fields = ['asset__asset_id', 'description']
    readonly_fields = ['created_at']

