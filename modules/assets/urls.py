from django.urls import path
from . import views

urlpatterns = [
    # Asset list and CRUD
    path('assets/', views.assets_list, name='assets'),
    path('assets/new/', views.asset_add, name='asset_add'),
    path('assets/<int:asset_id>/', views.asset_view, name='asset_view'),
    path('assets/<int:asset_id>/edit/', views.asset_edit, name='asset_edit'),
    path('assets/<int:asset_id>/delete/', views.asset_delete, name='asset_delete'),

    # Asset attachments
    path('assets/<int:asset_id>/attachment/', views.asset_upload_attachment, name='asset_upload_attachment'),

    # Asset-Ticket linking
    path('assets/<int:asset_id>/link-ticket/', views.asset_link_ticket, name='asset_link_ticket'),
    path('assets/<int:asset_id>/unlink-ticket/<int:ticket_id>/', views.asset_unlink_ticket, name='asset_unlink_ticket'),

    # Maintenance
    path('assets/maintenance/', views.maintenance_list, name='asset_maintenance'),

    # Locations
    path('assets/locations/', views.locations_list, name='asset_locations'),
    path('assets/locations/save/', views.location_save, name='asset_location_save'),

    # Vendors
    path('assets/vendors/', views.vendors_list, name='asset_vendors'),
    path('assets/vendors/save/', views.vendor_save, name='asset_vendor_save'),

    # Categories
    path('assets/categories/', views.categories_list, name='asset_categories'),
    path('assets/categories/save/', views.category_save, name='asset_category_save'),

    # API endpoints
    path('api/assets/search/', views.api_search_assets, name='api_search_assets'),
    path('api/assets/stats/', views.api_asset_stats, name='api_asset_stats'),
]

