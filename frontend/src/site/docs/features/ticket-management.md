# Ticket Management

Learn how to efficiently manage, organize, and resolve support tickets in ImaraDesk.

## Ticket List Views

ImaraDesk provides powerful filtering and view options to manage your ticket queue effectively.

### Default Views

| View | Description |
|------|-------------|
| **Your Unsolved** | Tickets assigned to you that are open |
| **Unassigned** | Tickets without an assigned agent |
| **All Unsolved** | All open tickets across the team |
| **Recently Updated** | Tickets updated in the last 7 days |
| **Pending** | Tickets waiting for customer response |
| **Recently Solved** | Resolved tickets from the past week |

### View Customization

Create custom views by combining filters:

1. Go to **Settings > Views**
2. Click **+ New View**
3. Configure filters:

```json
{
  "name": "High Priority This Week",
  "filters": {
    "priority": ["high", "urgent"],
    "status": ["new", "open", "in_progress"],
    "created_at": "last_7_days"
  },
  "sort": "-priority,-created_at"
}
```

---

## Working with Tickets

### Ticket Detail View

Clicking on a ticket opens the full detail view with:

```
┌─────────────────────────────────────────────────────────────┐
│ Header: Subject, Status, Priority badges                     │
├─────────────────────────────────────────────────────────────┤
│                           │                                  │
│   Conversation Thread     │   Ticket Properties              │
│                           │   ├── Status                     │
│   • Original request      │   ├── Priority                   │
│   • Agent replies         │   ├── Assignee                   │
│   • Customer responses    │   ├── Requester                  │
│   • Internal notes        │   ├── Department                 │
│                           │   ├── Tags                       │
│                           │   └── Custom Fields              │
│                           │                                  │
├─────────────────────────────────────────────────────────────┤
│   Activity Stream: Timeline of all ticket events             │
└─────────────────────────────────────────────────────────────┘
```

### Replying to Tickets

#### Public Reply
Visible to the customer:

1. Type your response in the reply box
2. Optionally add attachments
3. Click **Send Reply** or press `Ctrl+Enter`

#### Internal Note
Only visible to agents:

1. Click the **Internal Note** tab
2. Type your note
3. Add @mentions to notify team members
4. Click **Add Note**

### Quick Actions

Use the toolbar for common actions:

| Action | Description |
|--------|-------------|
| **Assign** | Change ticket owner |
| **Status** | Update ticket status |
| **Priority** | Escalate or de-escalate |
| **Merge** | Combine duplicate tickets |
| **Split** | Create new ticket from thread |

---

## Ticket Status Management

### Changing Status

Update status via:
- Dropdown in ticket detail
- Bulk action from list view
- Automatic via automation rules

### Status Triggers

Configure automatic status changes in **Settings > Automation**:

```yaml
# Auto-set to Pending when awaiting reply
trigger: agent_reply
action: set_status
value: pending

# Auto-reopen when customer replies
trigger: customer_reply
condition: status == "pending"
action: set_status
value: open
```

---

## Assignment & Routing

### Manual Assignment

1. Open ticket
2. Click **Assignee** dropdown
3. Search or select agent
4. Assignment notification sent automatically

### Auto-Assignment Rules

Configure in **Settings > Routing Rules**:

#### Round Robin
```json
{
  "name": "Sales Team Round Robin",
  "type": "round_robin",
  "group": "sales-support",
  "conditions": {
    "department": "sales"
  }
}
```

#### Load-Based
```json
{
  "name": "Balance Workload",
  "type": "load_based",
  "max_tickets_per_agent": 20,
  "group": "support-team"
}
```

### Group Assignment

Assign to a team when unsure of the right agent:

1. Select **Group** instead of individual agent
2. Any group member can pick up the ticket
3. Track group performance metrics

---

## Bulk Operations

### Selecting Multiple Tickets

- **Click**: Select single ticket
- **Shift+Click**: Select range
- **Ctrl/Cmd+Click**: Add to selection
- **Select All**: Checkbox in header

### Bulk Actions Available

| Action | Description |
|--------|-------------|
| **Update Status** | Change status for all selected |
| **Assign** | Assign to agent/group |
| **Add Tags** | Apply tags to selection |
| **Change Priority** | Bulk priority update |
| **Delete** | Remove tickets (admin only) |
| **Export** | Download as CSV |

---

## Merging Tickets

Combine duplicate or related tickets:

### How to Merge

1. Open the primary ticket
2. Click **More Actions > Merge**
3. Search for ticket to merge
4. Review merge preview
5. Confirm merge

### Merge Behavior

```
Primary Ticket (Target)
├── All comments preserved
├── Attachments combined
├── Activity log merged
└── Merged ticket closed with link

Merged Ticket (Source)
└── Status: Closed (Merged into #PRIMARY)
```

---

## Ticket Collaboration

### Watchers

Add team members to follow ticket updates:

1. Click **Watchers** in ticket sidebar
2. Search and add users
3. Watchers receive notifications for all updates

### @Mentions

Notify specific team members in notes:

```markdown
@john.smith Can you review this customer's account?

@billing-team Need assistance with invoice adjustment.
```

### Collision Detection

When multiple agents view the same ticket:

```
┌─────────────────────────────────────────┐
│ ⚠️ Sarah is also viewing this ticket    │
│    Last activity: typing a reply...     │
└─────────────────────────────────────────┘
```

---

## Search & Filters

### Quick Search

Press `/` or click search bar:

```
Search supports:
• Ticket number: INC04E5B
• Keywords in subject/description
• Requester name or email
• Tag names
```

### Advanced Filters

| Filter | Options |
|--------|---------|
| Status | Any, New, Open, Pending, Resolved, Closed |
| Priority | Low, Normal, High, Urgent |
| Assignee | Any, Me, Unassigned, Specific agent |
| Created | Today, This week, This month, Custom range |
| Type | Question, Incident, Problem, Task |
| Tags | Match any/all specified tags |

### Saved Searches

Save frequently used filter combinations:

1. Apply filters
2. Click **Save Search**
3. Name your search
4. Access from sidebar

---

## Activity & History

### Activity Stream

Every ticket action is logged:

```
📝 Jan 15, 10:30 AM - John created the ticket
👤 Jan 15, 10:35 AM - Assigned to Sarah
💬 Jan 15, 11:00 AM - Sarah replied
🏷️ Jan 15, 11:05 AM - Tags added: billing, priority
📊 Jan 15, 11:10 AM - Status changed to In Progress
✅ Jan 15, 02:00 PM - Marked as Resolved
```

### Audit Log

For compliance, access detailed audit logs:

- User actions with timestamps
- IP addresses
- System-generated changes
- Export capability

---

## SLA Monitoring

Visual SLA indicators in ticket views:

### SLA Status Badges

| Badge | Meaning |
|-------|---------|
| 🟢 **On Track** | Within SLA targets |
| 🟡 **Warning** | Approaching breach |
| 🔴 **Breached** | SLA target missed |

### SLA Details

View in ticket sidebar:
- First Response due time
- Resolution due time
- Time remaining/elapsed
- Pause history

---

## Tags & Organization

### Tag Management

Create consistent tagging:

1. Go to **Settings > Tags**
2. Define tag taxonomy
3. Set tag colors
4. Enable/disable tag creation

### Recommended Tag Structure

```
Category Tags     │ Feature Tags      │ Status Tags
──────────────────┼───────────────────┼────────────────
billing           │ api               │ needs-info
account           │ mobile-app        │ blocked
technical         │ integration       │ escalated
feature-request   │ reporting         │ vip-customer
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `J` | Next ticket |
| `K` | Previous ticket |
| `N` | New ticket |
| `R` | Reply |
| `I` | Internal note |
| `A` | Assign |
| `S` | Change status |
| `T` | Add tag |
| `/` | Search |
| `?` | Show shortcuts |

---

**Next:** [Ticket Creation](/docs/features/ticket-creation) | [SLA Configuration](/docs/features/sla-configuration)
