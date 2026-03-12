"""
Asset Management Models

Comprehensive models for tracking physical and digital assets,
their lifecycle, maintenance, and relationships to tickets/users.
"""
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Location(models.Model):
    """Physical location for asset tracking."""
    name = models.CharField(max_length=100)
    building = models.CharField(max_length=100, blank=True)
    floor = models.CharField(max_length=50, blank=True)
    room = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        parts = [self.name]
        if self.building:
            parts.append(self.building)
        if self.floor:
            parts.append(f"Floor {self.floor}")
        return ' - '.join(parts)


class Vendor(models.Model):
    """Vendor/Supplier for assets."""
    name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class AssetCategory(models.Model):
    """Category for asset classification."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon name for UI")
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Asset Categories'

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name


class Asset(models.Model):
    """Main Asset model for tracking physical and digital assets."""

    class Status(models.TextChoices):
        IN_STOCK = 'in_stock', 'In Stock'
        ACTIVE = 'active', 'Active'
        IN_REPAIR = 'in_repair', 'In Repair'
        IN_MAINTENANCE = 'in_maintenance', 'In Maintenance'
        RETIRED = 'retired', 'Retired'
        LOST = 'lost', 'Lost'
        DISPOSED = 'disposed', 'Disposed'

    class Condition(models.TextChoices):
        NEW = 'new', 'New'
        EXCELLENT = 'excellent', 'Excellent'
        GOOD = 'good', 'Good'
        FAIR = 'fair', 'Fair'
        POOR = 'poor', 'Poor'
        DAMAGED = 'damaged', 'Damaged'

    # Identification
    asset_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        db_index=True,
        help_text="Auto-generated unique asset identifier"
    )
    name = models.CharField(max_length=255, help_text="Asset name/title")
    description = models.TextField(blank=True, help_text="Detailed description")

    # Classification
    category = models.ForeignKey(
        AssetCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assets'
    )
    asset_type = models.CharField(
        max_length=100,
        blank=True,
        help_text="Specific type/model"
    )

    # Identification Numbers
    serial_number = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        help_text="Manufacturer serial number"
    )
    tag_number = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        help_text="Internal asset tag number"
    )
    barcode = models.CharField(
        max_length=100,
        blank=True,
        help_text="Barcode/QR code value"
    )

    # Ownership & Assignment
    assigned_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_assets',
        help_text="User this asset is assigned to"
    )
    department = models.ForeignKey(
        'ticket.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assets'
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assets'
    )
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assets'
    )

    # Lifecycle & Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_STOCK
    )
    condition = models.CharField(
        max_length=20,
        choices=Condition.choices,
        default=Condition.NEW
    )

    # Important Dates
    purchase_date = models.DateField(null=True, blank=True)
    warranty_expiry_date = models.DateField(null=True, blank=True)
    end_of_life_date = models.DateField(null=True, blank=True)
    last_audit_date = models.DateField(null=True, blank=True)

    # Financial Information
    purchase_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Original purchase cost"
    )
    current_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Current depreciated value"
    )
    invoice_number = models.CharField(max_length=100, blank=True)
    po_number = models.CharField(max_length=100, blank=True, help_text="Purchase order number")

    # Support & Contract
    support_contract = models.CharField(max_length=200, blank=True)
    support_expiry_date = models.DateField(null=True, blank=True)

    # Specifications (flexible JSON field for different asset types)
    specifications = models.JSONField(
        default=dict,
        blank=True,
        help_text="Technical specifications (CPU, RAM, Storage, etc.)"
    )

    # Custom fields support
    custom_fields = models.JSONField(
        default=dict,
        blank=True,
        help_text="Custom fields defined by organization"
    )

    # Notes and metadata
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)

    # Audit fields
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_assets'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['assigned_user']),
            models.Index(fields=['category']),
            models.Index(fields=['location']),
            models.Index(fields=['serial_number']),
            models.Index(fields=['tag_number']),
        ]

    def __str__(self):
        return f"{self.asset_id} - {self.name}"

    def _generate_asset_id(self):
        """Generate a unique asset ID in format AST-XXXXXX"""
        max_attempts = 100
        for _ in range(max_attempts):
            code = uuid.uuid4().hex[:6].upper()
            asset_id = f"AST-{code}"
            if not Asset.objects.filter(asset_id=asset_id).exists():
                return asset_id
        # Fallback
        timestamp = str(int(timezone.now().timestamp() * 1000))
        code = uuid.uuid5(uuid.NAMESPACE_DNS, timestamp).hex[:6].upper()
        return f"AST-{code}"

    def save(self, *args, **kwargs):
        if not self.asset_id:
            self.asset_id = self._generate_asset_id()
        super().save(*args, **kwargs)

    @property
    def is_warranty_active(self):
        """Check if warranty is still active."""
        if not self.warranty_expiry_date:
            return None
        return self.warranty_expiry_date >= timezone.now().date()

    @property
    def days_until_warranty_expiry(self):
        """Days until warranty expires (negative if expired)."""
        if not self.warranty_expiry_date:
            return None
        delta = self.warranty_expiry_date - timezone.now().date()
        return delta.days


class AssetAttachment(models.Model):
    """File attachments for assets (receipts, manuals, images)."""
    asset = models.ForeignKey(
        Asset,
        related_name='attachments',
        on_delete=models.CASCADE
    )
    file_url = models.URLField(max_length=500)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(null=True, blank=True)
    file_type = models.CharField(max_length=100, blank=True)
    description = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.file_name} - {self.asset.asset_id}"


class AssetAssignmentHistory(models.Model):
    """Track asset assignment changes over time."""
    asset = models.ForeignKey(
        Asset,
        related_name='assignment_history',
        on_delete=models.CASCADE
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='asset_assignments'
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='asset_assignments_made'
    )
    department = models.ForeignKey(
        'ticket.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    returned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-assigned_at']
        verbose_name_plural = 'Asset assignment histories'

    def __str__(self):
        user_name = self.assigned_to.get_full_name() if self.assigned_to else 'Unassigned'
        return f"{self.asset.asset_id} → {user_name}"


class MaintenanceSchedule(models.Model):
    """Preventive maintenance schedules for assets."""

    class Frequency(models.TextChoices):
        DAILY = 'daily', 'Daily'
        WEEKLY = 'weekly', 'Weekly'
        BIWEEKLY = 'biweekly', 'Bi-weekly'
        MONTHLY = 'monthly', 'Monthly'
        QUARTERLY = 'quarterly', 'Quarterly'
        BIANNUAL = 'biannual', 'Bi-annual'
        ANNUAL = 'annual', 'Annual'
        CUSTOM = 'custom', 'Custom'

    asset = models.ForeignKey(
        Asset,
        related_name='maintenance_schedules',
        on_delete=models.CASCADE
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    frequency = models.CharField(
        max_length=20,
        choices=Frequency.choices,
        default=Frequency.MONTHLY
    )
    custom_interval_days = models.IntegerField(
        null=True,
        blank=True,
        help_text="Custom interval in days (used when frequency is 'custom')"
    )
    last_performed = models.DateTimeField(null=True, blank=True)
    next_due = models.DateTimeField()
    auto_create_ticket = models.BooleanField(
        default=True,
        help_text="Automatically create a ticket when maintenance is due"
    )
    assigned_vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    estimated_duration = models.DurationField(null=True, blank=True)
    estimated_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['next_due']

    def __str__(self):
        return f"{self.title} - {self.asset.name}"


class MaintenanceLog(models.Model):
    """Log of maintenance activities performed on assets."""

    class MaintenanceType(models.TextChoices):
        PREVENTIVE = 'preventive', 'Preventive'
        CORRECTIVE = 'corrective', 'Corrective'
        EMERGENCY = 'emergency', 'Emergency'
        INSPECTION = 'inspection', 'Inspection'
        UPGRADE = 'upgrade', 'Upgrade'

    class Status(models.TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    asset = models.ForeignKey(
        Asset,
        related_name='maintenance_logs',
        on_delete=models.CASCADE
    )
    schedule = models.ForeignKey(
        MaintenanceSchedule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logs'
    )
    related_ticket = models.ForeignKey(
        'ticket.Ticket',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='maintenance_logs'
    )

    maintenance_type = models.CharField(
        max_length=20,
        choices=MaintenanceType.choices,
        default=MaintenanceType.PREVENTIVE
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    work_performed = models.TextField(blank=True)

    scheduled_date = models.DateTimeField()
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='maintenance_performed'
    )
    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    parts_replaced = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='maintenance_logs_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_date']

    def __str__(self):
        return f"{self.title} - {self.asset.name}"


class AssetTicketRelation(models.Model):
    """Many-to-many relationship between assets and tickets."""
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='ticket_relations'
    )
    ticket = models.ForeignKey(
        'ticket.Ticket',
        on_delete=models.CASCADE,
        related_name='asset_relations'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        unique_together = ['asset', 'ticket']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.asset.asset_id} ↔ {self.ticket.ticket_number}"


class AssetActivityLog(models.Model):
    """Activity log for asset changes and events."""

    class ActivityType(models.TextChoices):
        CREATED = 'created', 'Created'
        UPDATED = 'updated', 'Updated'
        ASSIGNED = 'assigned', 'Assigned'
        UNASSIGNED = 'unassigned', 'Unassigned'
        TRANSFERRED = 'transferred', 'Transferred'
        STATUS_CHANGED = 'status_changed', 'Status Changed'
        MAINTENANCE = 'maintenance', 'Maintenance'
        TICKET_LINKED = 'ticket_linked', 'Ticket Linked'
        TICKET_UNLINKED = 'ticket_unlinked', 'Ticket Unlinked'
        ATTACHMENT_ADDED = 'attachment_added', 'Attachment Added'
        NOTE_ADDED = 'note_added', 'Note Added'

    asset = models.ForeignKey(
        Asset,
        related_name='activity_logs',
        on_delete=models.CASCADE
    )
    activity_type = models.CharField(
        max_length=30,
        choices=ActivityType.choices
    )
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.activity_type} - {self.asset.asset_id}"

