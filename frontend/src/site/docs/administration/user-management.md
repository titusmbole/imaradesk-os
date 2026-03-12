# User Management

Learn how to manage users, roles, and permissions in ImaraDesk.

## Overview

ImaraDesk provides comprehensive user management with role-based access control (RBAC) to ensure team members have appropriate access levels.

---

## User Types

### Agent Roles

| Role | Description |
|------|-------------|
| **Admin** | Full system access, all settings |
| **Agent** | Ticket management, customer interaction |
| **Viewer** | Read-only access |

### Customer Roles

| Role | Description |
|------|-------------|
| **Primary Contact** | Full access, admin of their organization |
| **Standard User** | Submit/view own tickets |
| **View Only** | Can only view ticket status |

---

## Managing Users

### Adding Users

1. Navigate to **Settings > Users**
2. Click **+ Add User**
3. Fill in user details:

| Field | Required | Description |
|-------|----------|-------------|
| Email | Yes | Login email address |
| First Name | Yes | User's first name |
| Last Name | Yes | User's last name |
| Role | Yes | Permission level |
| Group | No | Team assignment |

4. Click **Send Invitation**

### User Invitation Flow

```
Admin creates user → Invitation email sent → User sets password → Account active
```

### Bulk Import

Import multiple users via CSV:

```csv
email,first_name,last_name,role,group
john@example.com,John,Smith,agent,support
jane@example.com,Jane,Doe,agent,billing
```

---

## Roles & Permissions

### Default Roles

#### Administrator

| Permission | Access |
|------------|--------|
| Tickets | Full CRUD |
| Users | Manage all users |
| Settings | All settings |
| Reports | All reports |
| API | Full API access |
| Billing | View/manage billing |

#### Agent

| Permission | Access |
|------------|--------|
| Tickets | View/edit assigned + unassigned |
| Users | View team members |
| Settings | Personal settings only |
| Reports | Own performance reports |
| API | Limited API access |
| Billing | No access |

#### Viewer

| Permission | Access |
|------------|--------|
| Tickets | View only |
| Users | View only |
| Settings | Personal settings only |
| Reports | No access |
| API | No access |
| Billing | No access |

### Custom Roles

Create custom roles for specific needs:

1. Go to **Settings > Roles**
2. Click **+ New Role**
3. Configure permissions:

```json
{
  "name": "Team Lead",
  "permissions": {
    "tickets": {
      "view": "all",
      "create": true,
      "edit": "team",
      "delete": false
    },
    "users": {
      "view": "team",
      "manage": false
    },
    "reports": {
      "view": "team"
    }
  }
}
```

---

## Groups & Teams

### Creating Groups

Organize users into teams:

1. Go to **Settings > Groups**
2. Click **+ New Group**
3. Configure:

| Field | Description |
|-------|-------------|
| Name | Group name (e.g., "Billing Support") |
| Description | Team purpose |
| Manager | Group lead |
| Members | Team members |

### Group Assignment

Assign tickets to groups for team collaboration:

```
Ticket #12345
├── Group: Technical Support
├── Members: John, Jane, Bob
└── Any member can work on the ticket
```

### Group Permissions

| Setting | Options |
|---------|---------|
| **Members can view** | Own, Team, All tickets |
| **Members can assign** | Within team, Any agent |
| **Notifications** | All members, Assigned only |

---

## User Settings

### Profile Settings

Users can configure their own settings:

| Setting | Description |
|---------|-------------|
| **Name** | Display name |
| **Email** | Contact email |
| **Avatar** | Profile picture |
| **Timezone** | Local timezone |
| **Language** | Interface language |

### Notification Preferences

| Notification | Options |
|--------------|---------|
| New ticket assigned | Email, In-app, Both, None |
| Ticket reply | Email, In-app, Both, None |
| @Mention | Email, In-app, Both, None |
| SLA warning | Email, In-app, Both, None |

### Security Settings

| Setting | Description |
|---------|-------------|
| **Password** | Change password |
| **2FA** | Enable two-factor auth |
| **Sessions** | View active sessions |
| **API Keys** | Manage personal API keys |

---

## Two-Factor Authentication

### Enabling 2FA

1. Go to **Profile > Security**
2. Click **Enable 2FA**
3. Scan QR code with authenticator app
4. Enter verification code
5. Save backup codes

### Enforcing 2FA

Admins can require 2FA for all users:

1. Go to **Settings > Security**
2. Enable **Require 2FA**
3. Set enforcement deadline
4. Users prompted on next login

### Supported 2FA Methods

| Method | Description |
|--------|-------------|
| **Authenticator App** | Google Authenticator, Authy, etc. |
| **SMS** | Text message codes |
| **Email** | Email verification codes |
| **Hardware Key** | YubiKey, etc. |

---

## Agent Availability

### Status Management

Agents can set their availability:

| Status | Description |
|--------|-------------|
| 🟢 **Available** | Ready to receive tickets |
| 🟡 **Busy** | Working, limited availability |
| 🔴 **Away** | Not available |
| ⚫ **Offline** | Not working |

### Schedule Settings

Configure working hours:

```
┌─────────────────────────────────────────┐
│ Agent: John Smith                       │
├─────────────────────────────────────────┤
│ Monday     │ 09:00 - 18:00             │
│ Tuesday    │ 09:00 - 18:00             │
│ Wednesday  │ 09:00 - 18:00             │
│ Thursday   │ 09:00 - 18:00             │
│ Friday     │ 09:00 - 17:00             │
│ Saturday   │ Off                        │
│ Sunday     │ Off                        │
└─────────────────────────────────────────┘
```

### Out of Office

Set vacation or leave:

```json
{
  "out_of_office": {
    "enabled": true,
    "start": "2024-12-24",
    "end": "2024-12-31",
    "message": "I'm on holiday. Contact @jane for urgent issues.",
    "reassign_to": "jane@example.com"
  }
}
```

---

## User Activity

### Activity Log

Track user actions:

```
John Smith - Recent Activity
├── 10:30 AM - Updated ticket #12345 status
├── 10:25 AM - Replied to ticket #12344
├── 10:15 AM - Logged in
├── Yesterday - Resolved 15 tickets
└── Yesterday - First response avg: 12 min
```

### Performance Metrics

| Metric | Description |
|--------|-------------|
| Tickets Handled | Total tickets worked on |
| First Response Time | Average first reply time |
| Resolution Time | Average time to resolve |
| Customer Satisfaction | CSAT score |
| Ticket Volume | Tickets per day/week |

---

## Deactivating Users

### Deactivation vs Deletion

| Action | Effect |
|--------|--------|
| **Deactivate** | Cannot login, data preserved |
| **Delete** | Account removed, tickets reassigned |

### Deactivating a User

1. Go to **Settings > Users**
2. Find user and click **...**
3. Select **Deactivate**
4. Confirm action

### Handling Departures

When an employee leaves:

1. Reassign open tickets
2. Transfer knowledge base ownership
3. Deactivate account
4. Revoke API keys
5. Update group memberships

---

## SSO Integration

### Supported Providers

| Provider | Protocol |
|----------|----------|
| Google Workspace | SAML 2.0, OIDC |
| Microsoft Azure AD | SAML 2.0, OIDC |
| Okta | SAML 2.0, OIDC |
| OneLogin | SAML 2.0 |
| Custom | SAML 2.0, OIDC |

### SSO Configuration

1. Go to **Settings > Security > SSO**
2. Select provider
3. Enter configuration:

```json
{
  "provider": "azure_ad",
  "tenant_id": "your-tenant-id",
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "auto_provision": true,
  "default_role": "agent"
}
```

---

## Best Practices

### Role Assignment

✅ **Do:**
- Apply principle of least privilege
- Use groups for team management
- Review permissions regularly
- Document custom roles

❌ **Avoid:**
- Giving admin to everyone
- Sharing accounts
- Unused admin accounts
- Orphaned permissions

### Security Checklist

- [ ] Enable 2FA for all admins
- [ ] Review user access quarterly
- [ ] Remove inactive accounts
- [ ] Monitor failed login attempts
- [ ] Use SSO where possible
- [ ] Audit API key usage

---

**Next:** [Security & Permissions](/docs/administration/security) | [Groups Configuration](/docs/administration/groups)
