from django.contrib import admin
from .models import Client, Domain


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'schema_name', 'created_on', 'is_active']
    list_filter = ['is_active', 'created_on']
    search_fields = ['name', 'schema_name', 'description']
    readonly_fields = ['schema_name', 'created_on']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'schema_name', 'description')
        }),
        ('Status', {
            'fields': ('is_active', 'created_on')
        }),
    )


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['domain', 'tenant', 'is_primary']
    list_filter = ['is_primary']
    search_fields = ['domain', 'tenant__name']
