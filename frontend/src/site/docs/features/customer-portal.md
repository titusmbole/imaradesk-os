# Customer Portal

Configure and manage the self-service customer portal for your organization.

## Overview

The Customer Portal provides your customers with:
- Self-service ticket submission
- Ticket status tracking
- Knowledge base access
- Account management

---

## Portal Setup

### Enabling the Portal

1. Go to **Settings > Customer Portal**
2. Toggle **Enable Customer Portal**
3. Configure portal settings
4. Save changes

### Portal URL

Your customer portal is accessible at:
```
https://yourcompany.coredesk.pro/portal
```

Or with custom domain:
```
https://support.yourcompany.com
```

---

## Portal Configuration

### General Settings

| Setting | Description |
|---------|-------------|
| **Portal Name** | Display name (e.g., "Acme Support Center") |
| **Welcome Message** | Homepage greeting text |
| **Allow Registration** | Let customers create accounts |
| **Require Approval** | Admin approval for new accounts |

### Feature Toggles

| Feature | Description |
|---------|-------------|
| **Ticket Creation** | Allow customers to submit tickets |
| **Knowledge Base** | Show KB articles to customers |
| **Ticket History** | Let customers view past tickets |
| **File Attachments** | Enable attachment uploads |

---

## Branding

### Logo & Colors

Customize portal appearance:

```
┌─────────────────────────────────────────┐
│ Branding Settings                       │
├─────────────────────────────────────────┤
│ Logo        │ [Upload]                  │
│ Favicon     │ [Upload]                  │
│ Primary Color    │ #4a154b              │
│ Secondary Color  │ #825084              │
│ Background       │ #ffffff              │
└─────────────────────────────────────────┘
```

### Custom CSS

Add custom styling:

```css
/* Custom portal styles */
.portal-header {
  background: linear-gradient(135deg, #4a154b, #825084);
}

.submit-button {
  background-color: #4a154b;
  border-radius: 8px;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

---

## Ticket Submission

### Ticket Form Configuration

Customize what customers see when submitting tickets:

#### Required Fields

| Field | Configurable |
|-------|--------------|
| Subject | Required (always) |
| Description | Required (always) |
| Email | Required for guests |
| Category | Optional |
| Priority | Optional (or hide) |

#### Custom Fields

Add custom fields to the submission form:

```json
{
  "fields": [
    {
      "name": "product_version",
      "label": "Product Version",
      "type": "dropdown",
      "options": ["v1.0", "v2.0", "v3.0"],
      "required": true
    },
    {
      "name": "order_number",
      "label": "Order Number",
      "type": "text",
      "placeholder": "ORD-XXXXX",
      "required": false
    }
  ]
}
```

### Categories/Request Types

Define ticket categories customers can choose:

```
📝 Submit a Request

Choose a category:
┌────────────────────────────────────────┐
│ 💳 Billing & Payments                  │
│ 🔧 Technical Support                   │
│ 📦 Orders & Shipping                   │
│ 🔐 Account Management                  │
│ 💡 Feature Request                     │
│ ❓ General Question                    │
└────────────────────────────────────────┘
```

---

## Customer Management

### Customer Accounts

Manage customer organizations:

| Field | Description |
|-------|-------------|
| **Company Name** | Organization name |
| **Email** | Primary contact email |
| **Status** | Active, Inactive, Suspended |
| **Tier** | Free, Basic, Professional, Enterprise |
| **Portal Access** | Enable/disable portal login |

### Customer Contacts

Each customer can have multiple contacts:

```
Acme Corporation
├── John Smith (Primary Contact)
│   └── john@acme.com
├── Jane Doe (Technical Contact)
│   └── jane@acme.com
└── Bob Wilson (Billing Contact)
    └── billing@acme.com
```

### Contact Roles

| Role | Permissions |
|------|-------------|
| **Primary** | Full access, receives all notifications |
| **Technical** | Can submit/view technical tickets |
| **Billing** | Access to billing-related tickets |
| **View Only** | Can view tickets, cannot submit |

---

## Access Control

### Portal Access Settings

Configure who can access the portal:

| Option | Behavior |
|--------|----------|
| **Open** | Anyone can view KB, login to submit tickets |
| **Login Required** | Must login to view anything |
| **Invite Only** | Only invited customers can access |

### Ticket Visibility

Control what customers can see:

| Setting | Options |
|---------|---------|
| **Own Tickets Only** | Customer sees only their tickets |
| **Organization Tickets** | See all tickets from their company |
| **Ticket Updates** | Hide internal notes from customers |

---

## Self-Service Features

### Knowledge Base Integration

Show relevant articles on the portal:

1. Enable **Knowledge Base** in portal settings
2. Mark articles as "Customer Visible"
3. Articles appear in portal search and categories

### Ticket Deflection

Show suggested articles during ticket creation:

```
┌─────────────────────────────────────────┐
│ Before submitting your ticket...        │
│                                         │
│ 📄 How to Reset Your Password           │
│ 📄 Troubleshooting Login Issues         │
│ 📄 Account Recovery Guide               │
│                                         │
│ [These articles might help]             │
│                                         │
│ None of these help? [Submit Ticket]     │
└─────────────────────────────────────────┘
```

---

## Notifications

### Customer Notifications

Configure email notifications for customers:

| Event | Description |
|-------|-------------|
| **Ticket Created** | Confirmation email |
| **Agent Reply** | New response notification |
| **Status Changed** | Ticket status updates |
| **Ticket Resolved** | Resolution notification |

### Email Templates

Customize customer-facing emails:

```html
Subject: Your ticket #{{ticket_number}} has been updated

Hi {{customer_name}},

{{agent_name}} has replied to your support request.

Ticket: {{ticket_subject}}
Status: {{ticket_status}}

{{agent_reply}}

View your ticket: {{ticket_url}}

Best regards,
 Imara Desk Support Team
```

---

## Surveys & Feedback

### Satisfaction Surveys

Collect feedback after ticket resolution:

```
┌─────────────────────────────────────────┐
│ How would you rate your experience?     │
│                                         │
│ ⭐ ⭐ ⭐ ⭐ ⭐                             │
│                                         │
│ What could we improve?                  │
│ [________________________________]      │
│                                         │
│ [Submit Feedback]                       │
└─────────────────────────────────────────┘
```

### Survey Configuration

1. Go to **Settings > Surveys**
2. Enable customer satisfaction surveys
3. Configure timing (on resolution, X days after)
4. Customize survey questions

---

## Security

### Authentication Options

| Method | Description |
|--------|-------------|
| **Email/Password** | Standard login |
| **Magic Link** | Passwordless email login |
| **SSO** | Single Sign-On integration |
| **Social Login** | Google, Microsoft, etc. |

### Session Settings

| Setting | Recommendation |
|---------|----------------|
| Session Timeout | 30 minutes - 8 hours |
| Remember Me | Enable for convenience |
| Force HTTPS | Always enabled |

### IP Restrictions

Restrict portal access by IP:

```json
{
  "allowed_ips": [
    "192.168.1.0/24",
    "10.0.0.0/8"
  ],
  "blocked_ips": [
    "1.2.3.4"
  ]
}
```

---

## Custom Domain

### Setting Up Custom Domain

1. Go to **Settings > Customer Portal > Domain**
2. Enter your custom domain (e.g., `support.yourcompany.com`)
3. Add DNS records:

```
Type: CNAME
Host: support
Value: yourcompany.coredesk.pro
TTL: 3600
```

4. Request SSL certificate (automatic via Let's Encrypt)
5. Verify and activate

---

## Portal Analytics

### Metrics Dashboard

Track portal usage:

| Metric | Description |
|--------|-------------|
| **Portal Visits** | Total page views |
| **Tickets Submitted** | Tickets via portal |
| **KB Articles Viewed** | Self-service engagement |
| **Deflection Rate** | Issues solved without ticket |
| **Login Rate** | Account usage |

### Customer Insights

Understand customer behavior:
- Most viewed articles
- Search queries with no results
- Peak usage times
- Device/browser breakdown

---

## Troubleshooting

### Common Issues

**Customers Can't Login**
- Verify customer account is active
- Check portal access is enabled
- Reset password if needed

**Portal Not Loading**
- Check custom domain DNS
- Verify SSL certificate
- Clear browser cache

**Tickets Not Showing**
- Verify ticket visibility settings
- Check customer organization link
- Review access permissions

---

**Next:** [User Management](/docs/administration/user-management) | [Knowledge Base](/docs/features/knowledge-base)
