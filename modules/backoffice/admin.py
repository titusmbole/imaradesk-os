from django.contrib import admin
from .models import Package, Subscription, BillingHistory, AdminUser, ActivityLog


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_monthly', 'price_yearly', 'max_agents', 'is_active', 'is_featured']
    list_filter = ['is_active', 'is_featured']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['display_order', 'price_monthly']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['tenant_schema', 'package', 'status', 'billing_cycle', 'current_period_end']
    list_filter = ['status', 'billing_cycle', 'package']
    search_fields = ['tenant_schema', 'notes']
    raw_id_fields = ['package']


@admin.register(BillingHistory)
class BillingHistoryAdmin(admin.ModelAdmin):
    list_display = ['subscription', 'transaction_type', 'amount', 'currency', 'status', 'created_at']
    list_filter = ['status', 'transaction_type', 'currency']
    search_fields = ['subscription__tenant_schema', 'invoice_number']
    date_hierarchy = 'created_at'


@admin.register(AdminUser)
class AdminUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'is_active', 'is_superadmin', 'last_login']
    list_filter = ['is_active', 'is_superadmin']
    search_fields = ['email', 'full_name']


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['admin_user', 'action_type', 'target_type', 'target_name', 'created_at']
    list_filter = ['action_type', 'target_type']
    search_fields = ['target_name', 'description']
    date_hierarchy = 'created_at'
