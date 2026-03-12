# Ticket Creation

Learn how to create, manage, and track support tickets in ImaraDesk. This guide covers all aspects of ticket creation for both agents and customers.

## Overview

Tickets are the core of ImaraDesk. They represent customer inquiries, issues, or requests that need to be addressed by your support team.

### Ticket Sources

Tickets can be created from multiple channels:

| Source | Description |
|--------|-------------|
| **Web Portal** | Customer creates via self-service portal |
| **Email** | Automatic conversion from incoming emails |
| **Agent Created** | Support team creates on behalf of customer |
| **API** | Programmatically via REST API |
| **Live Chat** | Converted from chat conversations |
| **Customer Portal** | Via the customer portal interface |

---

## Creating a Ticket (Agent View)

### Quick Create

1. Click **+ New Ticket** button in the header or press `N`
2. Fill in the required fields
3. Click **Create Ticket**

### Ticket Form Fields

#### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Subject** | Brief summary of the issue | "Cannot login to account" |
| **Description** | Detailed explanation | Steps to reproduce, error messages |
| **Priority** | Urgency level | Low, Normal, High, Urgent |
| **Type** | Category of issue | Question, Incident, Problem, Task |

#### Requester Information

```
┌─────────────────────────────────────────┐
│  Requester Details                       │
├─────────────────────────────────────────┤
│  • Search existing customers             │
│  • Create new customer on-the-fly       │
│  • Guest ticket (no account required)    │
└─────────────────────────────────────────┘
```

#### Guest Tickets

For one-off requests without creating a user account:

- **Guest Name**: Contact person's name
- **Guest Email**: Email for replies
- **Guest Phone**: Optional contact number

### Optional Fields

| Field | Purpose |
|-------|---------|
| **Assignee** | Agent responsible for resolution |
| **Department** | Business unit categorization |
| **Group** | Team assignment group |
| **Tags** | Labels for filtering and organization |
| **Due Date** | Expected resolution deadline |

---

## Ticket Properties

### Priority Levels

| Priority | Description | Typical Response Time |
|----------|-------------|----------------------|
| 🟢 **Low** | Non-urgent issues | 24-48 hours |
| 🔵 **Normal** | Standard requests | 8-24 hours |
| 🟠 **High** | Important issues | 2-8 hours |
| 🔴 **Urgent** | Critical business impact | < 1 hour |

### Ticket Types

| Type | Description | Example |
|------|-------------|---------|
| **Question** | General inquiry | "How do I export reports?" |
| **Incident** | Service disruption | "App is showing error 500" |
| **Problem** | Root cause issue | "Recurring login failures" |
| **Task** | Action item | "Reset user password" |

### Status Workflow

```
┌──────┐    ┌──────┐    ┌─────────────┐    ┌─────────┐    ┌──────────┐    ┌────────┐
│ New  │───▶│ Open │───▶│ In Progress │───▶│ Pending │───▶│ Resolved │───▶│ Closed │
└──────┘    └──────┘    └─────────────┘    └─────────┘    └──────────┘    └────────┘
                              │                  │              │
                              │                  │              │
                              └──────────────────┴──────────────┘
                                        (can reopen)
```

| Status | Description |
|--------|-------------|
| **New** | Just created, unread by agents |
| **Open** | Being reviewed, not yet worked on |
| **In Progress** | Actively being worked on |
| **Pending** | Awaiting customer response |
| **Resolved** | Issue fixed, awaiting confirmation |
| **Closed** | Completed and archived |

---

## Creating a Ticket (Customer Portal)

Customers can submit tickets through the self-service portal:

### Customer Form

1. Navigate to the customer portal
2. Click **Submit a Request**
3. Select request type/category
4. Fill in subject and description
5. Attach relevant files (optional)
6. Submit ticket

### Portal Customization

Configure the customer portal form in **Settings > Customer Portal**:

- Required fields
- Custom fields
- Categories/departments
- File attachment limits

---

## Ticket Templates

Save time with predefined ticket templates.

### Creating Templates

1. Go to **Settings > Templates > Ticket Templates**
2. Click **+ New Template**
3. Configure template:

```json
{
  "name": "Password Reset Request",
  "subject": "Password Reset - {{customer_name}}",
  "description": "Customer {{customer_name}} is requesting a password reset for their account.",
  "priority": "normal",
  "type": "task",
  "tags": ["password-reset", "account"]
}
```

### Using Templates

When creating a ticket:
1. Click **Use Template** dropdown
2. Select template
3. Fields auto-populate
4. Modify as needed

---

## File Attachments

### Supported File Types

| Category | Extensions |
|----------|------------|
| Documents | .pdf, .doc, .docx, .txt, .rtf |
| Images | .jpg, .jpeg, .png, .gif, .webp |
| Data | .csv, .xlsx, .xls |
| Archives | .zip, .rar |

### Attachment Limits

| Setting | Default | Configurable |
|---------|---------|--------------|
| Max file size | 25 MB | Yes |
| Max attachments | 10 per ticket | Yes |
| Total storage | Based on plan | Yes |

### Adding Attachments

```jsx
// Drag and drop supported
// Or click to browse

// Supported actions:
// - Preview images inline
// - Download attachments
// - Delete (with permission)
```

---

## Ticket Assignment

### Manual Assignment

Select an agent from the **Assignee** dropdown when creating or updating a ticket.

### Auto-Assignment Rules

Configure automatic assignment in **Settings > Automation**:

- **Round Robin**: Distribute evenly among team
- **Load Based**: Assign to agent with lowest workload
- **Skill Based**: Match to agent expertise
- **Department Based**: Route to relevant team

### Assignment Groups

Create groups for team-based assignment:

1. Go to **Settings > Groups**
2. Create group (e.g., "Billing Support")
3. Add team members
4. Assign tickets to group

---

## Best Practices

### Writing Good Ticket Subjects

✅ **Good Examples:**
- "Unable to login - Error 401"
- "Invoice #12345 payment question"
- "Feature request: Export to PDF"

❌ **Avoid:**
- "Help!!"
- "Problem"
- "Urgent request"

### Description Guidelines

Include these details when creating tickets:

1. **What happened**: Clear description of the issue
2. **Expected behavior**: What should have happened
3. **Steps to reproduce**: How to recreate the issue
4. **Environment**: Browser, OS, account details
5. **Screenshots**: Visual evidence when applicable

### Using Tags Effectively

```
Recommended tagging strategy:

┌─────────────────────────────────────────┐
│ Feature Area    │ billing, login, api   │
├─────────────────────────────────────────┤
│ Priority Info   │ vip, enterprise       │
├─────────────────────────────────────────┤
│ Status Flags    │ needs-info, blocked   │
├─────────────────────────────────────────┤
│ Source          │ chat-converted, email │
└─────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | New ticket |
| `R` | Reply to ticket |
| `A` | Assign ticket |
| `S` | Change status |
| `Ctrl+Enter` | Submit form |
| `/` | Focus search |

---

## API Examples

### Create Ticket via API

```bash
curl -X POST https://api.coredesk.pro/v1/tickets \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "API Created Ticket",
    "description": "This ticket was created via API",
    "priority": "high",
    "type": "incident",
    "requester_email": "customer@example.com",
    "tags": ["api", "automated"]
  }'
```

### Response

```json
{
  "id": 1234,
  "ticket_number": "INC04E5B",
  "status": "new",
  "subject": "API Created Ticket",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

**Next:** [Ticket Management](/docs/features/ticket-management) | [SLA Configuration](/docs/features/sla-configuration)
