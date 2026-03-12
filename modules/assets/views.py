"""
Asset Management Views

Views for managing assets, maintenance schedules, and related functionality.
"""
import json
from datetime import datetime, timedelta

from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Q, Count
from django.core.paginator import Paginator
from inertia import inertia, render as inertia_render

from shared.decorators import require_app
from .models import (
    Asset, AssetCategory, Location, Vendor, AssetAttachment,
    AssetAssignmentHistory, MaintenanceSchedule, MaintenanceLog,
    AssetTicketRelation, AssetActivityLog
)
from modules.ticket.models import Department

User = get_user_model()


def serialize_asset(asset, include_relations=False):
    """Serialize an asset object to dictionary."""
    data = {
        'id': asset.id,
        'asset_id': asset.asset_id,
        'name': asset.name,
        'description': asset.description,
        'category': {
            'id': asset.category.id,
            'name': asset.category.name,
        } if asset.category else None,
        'asset_type': asset.asset_type,
        'serial_number': asset.serial_number,
        'tag_number': asset.tag_number,
        'barcode': asset.barcode,
        'assigned_user': {
            'id': asset.assigned_user.id,
            'name': asset.assigned_user.get_full_name() or asset.assigned_user.username,
            'email': asset.assigned_user.email,
        } if asset.assigned_user else None,
        'department': {
            'id': asset.department.id,
            'name': asset.department.name,
        } if asset.department else None,
        'location': {
            'id': asset.location.id,
            'name': str(asset.location),
        } if asset.location else None,
        'vendor': {
            'id': asset.vendor.id,
            'name': asset.vendor.name,
        } if asset.vendor else None,
        'status': asset.status,
        'status_display': asset.get_status_display(),
        'condition': asset.condition,
        'condition_display': asset.get_condition_display(),
        'purchase_date': asset.purchase_date.isoformat() if asset.purchase_date else None,
        'warranty_expiry_date': asset.warranty_expiry_date.isoformat() if asset.warranty_expiry_date else None,
        'end_of_life_date': asset.end_of_life_date.isoformat() if asset.end_of_life_date else None,
        'is_warranty_active': asset.is_warranty_active,
        'days_until_warranty_expiry': asset.days_until_warranty_expiry,
        'purchase_cost': str(asset.purchase_cost) if asset.purchase_cost else None,
        'current_value': str(asset.current_value) if asset.current_value else None,
        'invoice_number': asset.invoice_number,
        'po_number': asset.po_number,
        'support_contract': asset.support_contract,
        'specifications': asset.specifications,
        'custom_fields': asset.custom_fields,
        'notes': asset.notes,
        'tags': asset.tags,
        'created_at': asset.created_at.isoformat(),
        'updated_at': asset.updated_at.isoformat(),
    }

    if include_relations:
        # Include ticket count
        data['ticket_count'] = asset.ticket_relations.count()
        # Include maintenance count
        data['maintenance_count'] = asset.maintenance_logs.count()

    return data


def get_assets_sidebar(request):
    """Generate sidebar data for asset views."""
    all_count = Asset.objects.count()
    assigned_to_me_count = Asset.objects.filter(assigned_user=request.user).count()
    unassigned_count = Asset.objects.filter(assigned_user__isnull=True).count()
    in_repair_count = Asset.objects.filter(status=Asset.Status.IN_REPAIR).count()
    thirty_days = timezone.now().date() + timedelta(days=30)
    warranty_expiring_count = Asset.objects.filter(
        warranty_expiry_date__lte=thirty_days,
        warranty_expiry_date__gte=timezone.now().date()
    ).count()
    retired_count = Asset.objects.filter(status=Asset.Status.RETIRED).count()

    return {
        'views': [
            {'id': 'all', 'label': 'All Assets', 'count': all_count, 'active': False},
            {'id': 'assigned_to_me', 'label': 'Assigned to Me', 'count': assigned_to_me_count, 'active': False},
            {'id': 'unassigned', 'label': 'Unassigned', 'count': unassigned_count, 'active': False},
            {'id': 'in_repair', 'label': 'In Repair', 'count': in_repair_count, 'active': False},
            {'id': 'warranty_expiring', 'label': 'Warranty Expiring', 'count': warranty_expiring_count, 'active': False},
            {'id': 'retired', 'label': 'Retired', 'count': retired_count, 'active': False},
        ]
    }


@require_app('asset-management')
@login_required
@inertia('Assets')
def assets_list(request):
    """List all assets with filtering and pagination."""
    # Get filter parameters
    view = request.GET.get('view', 'all')
    status_filter = request.GET.get('status', '')
    category_filter = request.GET.get('category', '')
    location_filter = request.GET.get('location', '')
    search = request.GET.get('search', '')
    page_number = request.GET.get('page', 1)
    per_page = 20

    # Base queryset
    assets_qs = Asset.objects.select_related(
        'category', 'assigned_user', 'department', 'location', 'vendor'
    ).prefetch_related('ticket_relations')

    # Apply filters
    if view == 'assigned_to_me':
        assets_qs = assets_qs.filter(assigned_user=request.user)
    elif view == 'unassigned':
        assets_qs = assets_qs.filter(assigned_user__isnull=True)
    elif view == 'in_repair':
        assets_qs = assets_qs.filter(status=Asset.Status.IN_REPAIR)
    elif view == 'warranty_expiring':
        thirty_days = timezone.now().date() + timedelta(days=30)
        assets_qs = assets_qs.filter(
            warranty_expiry_date__lte=thirty_days,
            warranty_expiry_date__gte=timezone.now().date()
        )
    elif view == 'retired':
        assets_qs = assets_qs.filter(status=Asset.Status.RETIRED)

    if status_filter:
        assets_qs = assets_qs.filter(status=status_filter)

    if category_filter:
        assets_qs = assets_qs.filter(category_id=category_filter)

    if location_filter:
        assets_qs = assets_qs.filter(location_id=location_filter)

    if search:
        assets_qs = assets_qs.filter(
            Q(name__icontains=search) |
            Q(asset_id__icontains=search) |
            Q(serial_number__icontains=search) |
            Q(tag_number__icontains=search)
        )

    assets_qs = assets_qs.order_by('-created_at')

    # Paginate
    paginator = Paginator(assets_qs, per_page)
    page_obj = paginator.get_page(page_number)

    # Serialize assets
    assets_data = [serialize_asset(a, include_relations=True) for a in page_obj]

    # Get counts for sidebar
    all_count = Asset.objects.count()
    assigned_to_me_count = Asset.objects.filter(assigned_user=request.user).count()
    unassigned_count = Asset.objects.filter(assigned_user__isnull=True).count()
    in_repair_count = Asset.objects.filter(status=Asset.Status.IN_REPAIR).count()
    thirty_days = timezone.now().date() + timedelta(days=30)
    warranty_expiring_count = Asset.objects.filter(
        warranty_expiry_date__lte=thirty_days,
        warranty_expiry_date__gte=timezone.now().date()
    ).count()
    retired_count = Asset.objects.filter(status=Asset.Status.RETIRED).count()

    # Get filter options
    categories = AssetCategory.objects.filter(is_active=True).values('id', 'name')
    locations = Location.objects.filter(is_active=True).values('id', 'name')

    return {
        'assets': assets_data,
        'currentView': view,
        'sidebar': {
            'views': [
                {'id': 'all', 'label': 'All Assets', 'count': all_count, 'active': view == 'all'},
                {'id': 'assigned_to_me', 'label': 'Assigned to Me', 'count': assigned_to_me_count, 'active': view == 'assigned_to_me'},
                {'id': 'unassigned', 'label': 'Unassigned', 'count': unassigned_count, 'active': view == 'unassigned'},
                {'id': 'in_repair', 'label': 'In Repair', 'count': in_repair_count, 'active': view == 'in_repair'},
                {'id': 'warranty_expiring', 'label': 'Warranty Expiring', 'count': warranty_expiring_count, 'active': view == 'warranty_expiring'},
                {'id': 'retired', 'label': 'Retired', 'count': retired_count, 'active': view == 'retired'},
            ]
        },
        'filters': {
            'categories': list(categories),
            'locations': list(locations),
            'statuses': [{'value': s[0], 'label': s[1]} for s in Asset.Status.choices],
        },
        'pagination': {
            'current_page': page_obj.number,
            'total_pages': paginator.num_pages,
            'per_page': per_page,
            'total_count': paginator.count,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
        }
    }


@require_app('asset-management')
@login_required
@inertia('AssetForm')
def asset_add(request):
    """Add new asset form."""
    if request.method == 'POST':
        return handle_asset_save(request)

    return get_asset_form_data(request)


@require_app('asset-management')
@login_required
@inertia('AssetForm')
def asset_edit(request, asset_id):
    """Edit existing asset."""
    asset = get_object_or_404(Asset, id=asset_id)

    if request.method == 'POST':
        return handle_asset_save(request, asset)

    form_data = get_asset_form_data(request)
    form_data['mode'] = 'edit'
    form_data['asset'] = serialize_asset(asset)
    return form_data


def get_asset_form_data(request):
    """Get common data needed for asset form."""
    categories = AssetCategory.objects.filter(is_active=True)
    locations = Location.objects.filter(is_active=True)
    vendors = Vendor.objects.filter(is_active=True)
    departments = Department.objects.all()
    users = User.objects.filter(is_active=True).order_by('first_name', 'last_name')

    return {
        'mode': 'add',
        'asset': None,
        'categories': [{'id': c.id, 'name': str(c)} for c in categories],
        'locations': [{'id': l.id, 'name': str(l)} for l in locations],
        'vendors': [{'id': v.id, 'name': v.name} for v in vendors],
        'departments': [{'id': d.id, 'name': d.name} for d in departments],
        'users': [{'id': u.id, 'name': u.get_full_name() or u.username, 'email': u.email} for u in users],
        'statuses': [{'value': s[0], 'label': s[1]} for s in Asset.Status.choices],
        'conditions': [{'value': c[0], 'label': c[1]} for c in Asset.Condition.choices],
        'sidebar': get_assets_sidebar(request),
    }


def handle_asset_save(request, asset=None):
    """Handle asset creation or update."""
    if request.content_type == 'application/json':
        data = json.loads(request.body)
    else:
        data = request.POST

    is_new = asset is None
    if is_new:
        asset = Asset(created_by=request.user)

    # Update fields
    asset.name = data.get('name', '')
    asset.description = data.get('description', '')
    asset.asset_type = data.get('asset_type', '')
    asset.serial_number = data.get('serial_number', '')
    asset.tag_number = data.get('tag_number', '')
    asset.barcode = data.get('barcode', '')
    asset.status = data.get('status', Asset.Status.IN_STOCK)
    asset.condition = data.get('condition', Asset.Condition.NEW)
    asset.invoice_number = data.get('invoice_number', '')
    asset.po_number = data.get('po_number', '')
    asset.support_contract = data.get('support_contract', '')
    asset.notes = data.get('notes', '')

    # Foreign keys
    category_id = data.get('category')
    if category_id:
        asset.category_id = category_id
    else:
        asset.category = None

    location_id = data.get('location')
    if location_id:
        asset.location_id = location_id
    else:
        asset.location = None

    vendor_id = data.get('vendor')
    if vendor_id:
        asset.vendor_id = vendor_id
    else:
        asset.vendor = None

    department_id = data.get('department')
    if department_id:
        asset.department_id = department_id
    else:
        asset.department = None

    # Handle user assignment with history tracking
    old_assigned_user = asset.assigned_user
    assigned_user_id = data.get('assigned_user')
    if assigned_user_id:
        asset.assigned_user_id = assigned_user_id
    else:
        asset.assigned_user = None

    # Dates
    purchase_date = data.get('purchase_date')
    asset.purchase_date = purchase_date if purchase_date else None

    warranty_expiry_date = data.get('warranty_expiry_date')
    asset.warranty_expiry_date = warranty_expiry_date if warranty_expiry_date else None

    end_of_life_date = data.get('end_of_life_date')
    asset.end_of_life_date = end_of_life_date if end_of_life_date else None

    support_expiry_date = data.get('support_expiry_date')
    asset.support_expiry_date = support_expiry_date if support_expiry_date else None

    # Financial
    purchase_cost = data.get('purchase_cost')
    asset.purchase_cost = purchase_cost if purchase_cost else None

    current_value = data.get('current_value')
    asset.current_value = current_value if current_value else None

    # JSON fields
    specifications = data.get('specifications')
    if specifications:
        asset.specifications = json.loads(specifications) if isinstance(specifications, str) else specifications

    tags = data.get('tags')
    if tags:
        asset.tags = json.loads(tags) if isinstance(tags, str) else tags

    asset.save()

    # Create assignment history if user changed
    if old_assigned_user != asset.assigned_user:
        if old_assigned_user:
            # Close previous assignment
            AssetAssignmentHistory.objects.filter(
                asset=asset,
                assigned_to=old_assigned_user,
                returned_at__isnull=True
            ).update(returned_at=timezone.now())

        if asset.assigned_user:
            # Create new assignment record
            AssetAssignmentHistory.objects.create(
                asset=asset,
                assigned_to=asset.assigned_user,
                assigned_by=request.user,
                department=asset.department,
                location=asset.location
            )

    # Create activity log
    if is_new:
        AssetActivityLog.objects.create(
            asset=asset,
            activity_type=AssetActivityLog.ActivityType.CREATED,
            actor=request.user,
            description=f"Asset created by {request.user.get_full_name() or request.user.username}"
        )
    else:
        AssetActivityLog.objects.create(
            asset=asset,
            activity_type=AssetActivityLog.ActivityType.UPDATED,
            actor=request.user,
            description=f"Asset updated by {request.user.get_full_name() or request.user.username}"
        )

    return redirect('assets')


@require_app('asset-management')
@login_required
@inertia('AssetView')
def asset_view(request, asset_id):
    """View single asset details."""
    asset = get_object_or_404(
        Asset.objects.select_related(
            'category', 'assigned_user', 'department', 'location', 'vendor', 'created_by'
        ),
        id=asset_id
    )

    # Get related tickets
    ticket_relations = asset.ticket_relations.select_related('ticket', 'ticket__requester', 'ticket__assignee').all()[:10]
    tickets = []
    for rel in ticket_relations:
        t = rel.ticket
        tickets.append({
            'id': t.id,
            'ticket_number': t.ticket_number,
            'title': t.title,
            'status': t.status,
            'status_display': t.get_status_display(),
            'priority': t.priority,
            'created_at': t.created_at.isoformat(),
        })

    # Get maintenance history
    maintenance_logs = asset.maintenance_logs.select_related('performed_by', 'vendor').all()[:10]
    maintenance = []
    for log in maintenance_logs:
        maintenance.append({
            'id': log.id,
            'title': log.title,
            'maintenance_type': log.maintenance_type,
            'maintenance_type_display': log.get_maintenance_type_display(),
            'status': log.status,
            'status_display': log.get_status_display(),
            'scheduled_date': log.scheduled_date.isoformat(),
            'completed_at': log.completed_at.isoformat() if log.completed_at else None,
        })

    # Get assignment history
    assignments = asset.assignment_history.select_related('assigned_to', 'assigned_by', 'department', 'location').all()[:10]
    assignment_history = []
    for a in assignments:
        assignment_history.append({
            'id': a.id,
            'assigned_to': {
                'id': a.assigned_to.id,
                'name': a.assigned_to.get_full_name() or a.assigned_to.username,
            } if a.assigned_to else None,
            'assigned_by': {
                'name': a.assigned_by.get_full_name() or a.assigned_by.username,
            } if a.assigned_by else None,
            'department': a.department.name if a.department else None,
            'location': str(a.location) if a.location else None,
            'assigned_at': a.assigned_at.isoformat(),
            'returned_at': a.returned_at.isoformat() if a.returned_at else None,
        })

    # Get activity log
    activities = asset.activity_logs.select_related('actor').all()[:20]
    activity_log = []
    for act in activities:
        activity_log.append({
            'id': act.id,
            'activity_type': act.activity_type,
            'activity_type_display': act.get_activity_type_display(),
            'actor': {
                'name': act.actor.get_full_name() or act.actor.username,
            } if act.actor else None,
            'description': act.description,
            'created_at': act.created_at.isoformat(),
        })

    # Get attachments
    attachments = asset.attachments.select_related('uploaded_by').all()
    attachments_data = []
    for att in attachments:
        attachments_data.append({
            'id': att.id,
            'file_url': att.file_url,
            'file_name': att.file_name,
            'file_size': att.file_size,
            'file_type': att.file_type,
            'description': att.description,
            'uploaded_by': att.uploaded_by.get_full_name() if att.uploaded_by else None,
            'uploaded_at': att.uploaded_at.isoformat(),
        })

    return {
        'asset': serialize_asset(asset),
        'tickets': tickets,
        'maintenance': maintenance,
        'assignment_history': assignment_history,
        'activity_log': activity_log,
        'attachments': attachments_data,
        'sidebar': get_assets_sidebar(request),
    }


@require_app('asset-management')
@login_required
def asset_delete(request, asset_id):
    """Delete an asset."""
    if request.method == 'POST':
        asset = get_object_or_404(Asset, id=asset_id)
        asset.delete()
    return redirect('assets')


@require_app('asset-management')
@login_required
def asset_link_ticket(request, asset_id):
    """Link a ticket to an asset."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    asset = get_object_or_404(Asset, id=asset_id)

    if request.content_type == 'application/json':
        data = json.loads(request.body)
    else:
        data = request.POST

    ticket_id = data.get('ticket_id')
    if not ticket_id:
        return JsonResponse({'error': 'ticket_id is required'}, status=400)

    from modules.ticket.models import Ticket
    ticket = get_object_or_404(Ticket, id=ticket_id)

    relation, created = AssetTicketRelation.objects.get_or_create(
        asset=asset,
        ticket=ticket,
        defaults={
            'created_by': request.user,
            'notes': data.get('notes', '')
        }
    )

    if created:
        AssetActivityLog.objects.create(
            asset=asset,
            activity_type=AssetActivityLog.ActivityType.TICKET_LINKED,
            actor=request.user,
            description=f"Linked to ticket {ticket.ticket_number}",
            metadata={'ticket_id': ticket.id, 'ticket_number': ticket.ticket_number}
        )

    return JsonResponse({'success': True, 'created': created})


@require_app('asset-management')
@login_required
def asset_unlink_ticket(request, asset_id, ticket_id):
    """Unlink a ticket from an asset."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    relation = get_object_or_404(AssetTicketRelation, asset_id=asset_id, ticket_id=ticket_id)
    ticket_number = relation.ticket.ticket_number
    asset = relation.asset

    relation.delete()

    AssetActivityLog.objects.create(
        asset=asset,
        activity_type=AssetActivityLog.ActivityType.TICKET_UNLINKED,
        actor=request.user,
        description=f"Unlinked from ticket {ticket_number}",
        metadata={'ticket_id': ticket_id, 'ticket_number': ticket_number}
    )

    return JsonResponse({'success': True})


@require_app('asset-management')
@login_required
def asset_upload_attachment(request, asset_id):
    """Upload attachment to asset."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    asset = get_object_or_404(Asset, id=asset_id)

    file_url = request.POST.get('file_url')
    file_name = request.POST.get('file_name')
    file_size = request.POST.get('file_size', 0)
    file_type = request.POST.get('file_type', '')
    description = request.POST.get('description', '')

    if not file_url or not file_name:
        return JsonResponse({'error': 'file_url and file_name are required'}, status=400)

    attachment = AssetAttachment.objects.create(
        asset=asset,
        file_url=file_url,
        file_name=file_name,
        file_size=int(file_size) if file_size else None,
        file_type=file_type,
        description=description,
        uploaded_by=request.user
    )

    AssetActivityLog.objects.create(
        asset=asset,
        activity_type=AssetActivityLog.ActivityType.ATTACHMENT_ADDED,
        actor=request.user,
        description=f"Attachment '{file_name}' added"
    )

    return JsonResponse({
        'id': attachment.id,
        'file_url': attachment.file_url,
        'file_name': attachment.file_name,
        'uploaded_at': attachment.uploaded_at.isoformat(),
    })


# =============================================================================
# Maintenance Views
# =============================================================================

@require_app('asset-management')
@login_required
@inertia('AssetMaintenance')
def maintenance_list(request):
    """List maintenance schedules and logs."""
    # Get upcoming maintenance
    upcoming = MaintenanceSchedule.objects.filter(
        is_active=True,
        next_due__gte=timezone.now()
    ).select_related('asset', 'assigned_vendor').order_by('next_due')[:20]

    upcoming_data = []
    for m in upcoming:
        upcoming_data.append({
            'id': m.id,
            'title': m.title,
            'asset': {
                'id': m.asset.id,
                'asset_id': m.asset.asset_id,
                'name': m.asset.name,
            },
            'frequency': m.frequency,
            'frequency_display': m.get_frequency_display(),
            'next_due': m.next_due.isoformat(),
            'vendor': m.assigned_vendor.name if m.assigned_vendor else None,
        })

    # Get recent maintenance logs
    recent_logs = MaintenanceLog.objects.select_related(
        'asset', 'performed_by', 'vendor'
    ).order_by('-scheduled_date')[:20]

    logs_data = []
    for log in recent_logs:
        logs_data.append({
            'id': log.id,
            'title': log.title,
            'asset': {
                'id': log.asset.id,
                'asset_id': log.asset.asset_id,
                'name': log.asset.name,
            },
            'maintenance_type': log.maintenance_type,
            'maintenance_type_display': log.get_maintenance_type_display(),
            'status': log.status,
            'status_display': log.get_status_display(),
            'scheduled_date': log.scheduled_date.isoformat(),
            'completed_at': log.completed_at.isoformat() if log.completed_at else None,
            'performed_by': log.performed_by.get_full_name() if log.performed_by else None,
        })

    return {
        'upcoming': upcoming_data,
        'logs': logs_data,
        'sidebar': get_assets_sidebar(request),
    }


# =============================================================================
# Location & Vendor Views
# =============================================================================

@require_app('asset-management')
@login_required
@inertia('AssetLocations')
def locations_list(request):
    """List all locations."""
    locations = Location.objects.annotate(
        asset_count=Count('assets')
    ).order_by('name')

    locations_data = []
    for loc in locations:
        locations_data.append({
            'id': loc.id,
            'name': loc.name,
            'building': loc.building,
            'floor': loc.floor,
            'room': loc.room,
            'address': loc.address,
            'city': loc.city,
            'country': loc.country,
            'asset_count': loc.asset_count,
            'is_active': loc.is_active,
        })

    return {
        'locations': locations_data,
        'sidebar': get_assets_sidebar(request),
    }


@require_app('asset-management')
@login_required
def location_save(request):
    """Create or update a location."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    if request.content_type == 'application/json':
        data = json.loads(request.body)
    else:
        data = request.POST

    location_id = data.get('id')
    if location_id:
        location = get_object_or_404(Location, id=location_id)
    else:
        location = Location()

    location.name = data.get('name', '')
    location.building = data.get('building', '')
    location.floor = data.get('floor', '')
    location.room = data.get('room', '')
    location.address = data.get('address', '')
    location.city = data.get('city', '')
    location.country = data.get('country', '')
    location.is_active = data.get('is_active', True)
    location.save()

    return JsonResponse({'success': True, 'id': location.id})


@require_app('asset-management')
@login_required
@inertia('AssetVendors')
def vendors_list(request):
    """List all vendors."""
    vendors = Vendor.objects.annotate(
        asset_count=Count('assets')
    ).order_by('name')

    vendors_data = []
    for v in vendors:
        vendors_data.append({
            'id': v.id,
            'name': v.name,
            'contact_name': v.contact_name,
            'email': v.email,
            'phone': v.phone,
            'website': v.website,
            'asset_count': v.asset_count,
            'is_active': v.is_active,
        })

    return {
        'vendors': vendors_data,
        'sidebar': get_assets_sidebar(request),
    }


@require_app('asset-management')
@login_required
def vendor_save(request):
    """Create or update a vendor."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    if request.content_type == 'application/json':
        data = json.loads(request.body)
    else:
        data = request.POST

    vendor_id = data.get('id')
    if vendor_id:
        vendor = get_object_or_404(Vendor, id=vendor_id)
    else:
        vendor = Vendor()

    vendor.name = data.get('name', '')
    vendor.contact_name = data.get('contact_name', '')
    vendor.email = data.get('email', '')
    vendor.phone = data.get('phone', '')
    vendor.website = data.get('website', '')
    vendor.address = data.get('address', '')
    vendor.notes = data.get('notes', '')
    vendor.is_active = data.get('is_active', True)
    vendor.save()

    return JsonResponse({'success': True, 'id': vendor.id})


# =============================================================================
# Category Views
# =============================================================================

@require_app('asset-management')
@login_required
@inertia('AssetCategories')
def categories_list(request):
    """List all asset categories."""
    categories = AssetCategory.objects.annotate(
        asset_count=Count('assets')
    ).select_related('parent').order_by('name')

    categories_data = []
    for c in categories:
        categories_data.append({
            'id': c.id,
            'name': c.name,
            'description': c.description,
            'icon': c.icon,
            'parent': {
                'id': c.parent.id,
                'name': c.parent.name,
            } if c.parent else None,
            'asset_count': c.asset_count,
            'is_active': c.is_active,
        })

    return {
        'categories': categories_data,
        'sidebar': get_assets_sidebar(request),
    }


@require_app('asset-management')
@login_required
def category_save(request):
    """Create or update a category."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    if request.content_type == 'application/json':
        data = json.loads(request.body)
    else:
        data = request.POST

    category_id = data.get('id')
    if category_id:
        category = get_object_or_404(AssetCategory, id=category_id)
    else:
        category = AssetCategory()

    category.name = data.get('name', '')
    category.description = data.get('description', '')
    category.icon = data.get('icon', '')

    parent_id = data.get('parent')
    if parent_id:
        category.parent_id = parent_id
    else:
        category.parent = None

    category.is_active = data.get('is_active', True)
    category.save()

    return JsonResponse({'success': True, 'id': category.id})


# =============================================================================
# API Endpoints for Ticket Integration
# =============================================================================

@require_app('asset-management')
@login_required
def api_search_assets(request):
    """Search assets for linking to tickets."""
    search = request.GET.get('q', '')
    limit = int(request.GET.get('limit', 10))

    if len(search) < 2:
        return JsonResponse({'assets': []})

    assets = Asset.objects.filter(
        Q(name__icontains=search) |
        Q(asset_id__icontains=search) |
        Q(serial_number__icontains=search) |
        Q(tag_number__icontains=search)
    ).select_related('category', 'location')[:limit]

    assets_data = []
    for a in assets:
        assets_data.append({
            'id': a.id,
            'asset_id': a.asset_id,
            'name': a.name,
            'category': a.category.name if a.category else None,
            'location': str(a.location) if a.location else None,
            'status': a.status,
            'status_display': a.get_status_display(),
        })

    return JsonResponse({'assets': assets_data})


@require_app('asset-management')
@login_required
def api_asset_stats(request):
    """Get asset statistics for dashboard."""
    total = Asset.objects.count()
    by_status = Asset.objects.values('status').annotate(count=Count('id'))
    by_condition = Asset.objects.values('condition').annotate(count=Count('id'))

    thirty_days = timezone.now().date() + timedelta(days=30)
    warranty_expiring = Asset.objects.filter(
        warranty_expiry_date__lte=thirty_days,
        warranty_expiry_date__gte=timezone.now().date()
    ).count()

    return JsonResponse({
        'total': total,
        'by_status': list(by_status),
        'by_condition': list(by_condition),
        'warranty_expiring': warranty_expiring,
    })

