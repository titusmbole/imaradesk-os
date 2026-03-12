# SLA Configuration

Configure Service Level Agreements to ensure timely response and resolution of customer tickets.

## Overview

SLA (Service Level Agreement) policies define target response and resolution times based on ticket priority. ImaraDesk automatically tracks SLA compliance and alerts agents when targets are at risk.

### Key Benefits

- **Accountability**: Clear expectations for response times
- **Visibility**: Dashboard metrics for SLA performance
- **Automation**: Automatic escalation when SLAs are at risk
- **Reporting**: Track SLA compliance over time

---

## Enabling SLA

### Global Settings

Navigate to **Settings > SLA** to configure:

| Setting | Description |
|---------|-------------|
| **Enable SLA** | Turn SLA tracking on/off globally |
| **Auto-pause on Resolved** | Stop clock when ticket resolved |
| **Auto-resume on Reopen** | Restart clock when reopened |
| **Escalation Enabled** | Enable automatic escalations |
| **Send Notifications** | Alert on warnings/breaches |

### Enabling SLA

```
1. Go to Settings > SLA
2. Toggle "Enable SLA Tracking" to ON
3. Save settings
4. Create SLA policies for each priority
```

---

## SLA Policies

### Creating a Policy

1. Navigate to **Settings > SLA > Policies**
2. Click **+ New Policy**
3. Configure policy settings

### Policy Configuration

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Policy identifier | "Critical Priority SLA" |
| **Priority** | Ticket priority level | Critical, High, Medium, Low |
| **First Response Time** | Target for initial reply | 30 minutes |
| **Resolution Time** | Target for ticket closure | 4 hours |
| **Business Hours** | Only count work hours | Yes/No |

### Recommended SLA Targets

| Priority | First Response | Resolution |
|----------|---------------|------------|
| 🔴 **Critical** | 15 minutes | 1 hour |
| 🟠 **High** | 1 hour | 4 hours |
| 🔵 **Normal** | 4 hours | 24 hours |
| 🟢 **Low** | 8 hours | 72 hours |

---

## Time Calculations

### Business Hours

Configure business hours in **Settings > SLA > Business Hours**:

```
┌─────────────────────────────────────────┐
│ Business Hours Configuration            │
├─────────────────────────────────────────┤
│ Monday    │ 09:00 - 18:00              │
│ Tuesday   │ 09:00 - 18:00              │
│ Wednesday │ 09:00 - 18:00              │
│ Thursday  │ 09:00 - 18:00              │
│ Friday    │ 09:00 - 17:00              │
│ Saturday  │ Closed                      │
│ Sunday    │ Closed                      │
├─────────────────────────────────────────┤
│ Timezone: America/New_York              │
└─────────────────────────────────────────┘
```

### Holiday Calendar

Exclude holidays from SLA calculations:

1. Go to **Settings > SLA > Holidays**
2. Add holiday dates
3. Enable "Apply to Holidays" on policies

### Time Calculation Example

```
Ticket Created: Friday 4:00 PM
Policy: 4-hour First Response (Business Hours)

Business Hours: Mon-Fri 9:00 AM - 6:00 PM

Calculation:
- Friday 4:00 PM - 6:00 PM = 2 hours
- Monday 9:00 AM - 11:00 AM = 2 hours

First Response Due: Monday 11:00 AM
```

---

## SLA Tracking

### SLA Status Indicators

Visual indicators show SLA status on tickets:

| Indicator | Status | Action Needed |
|-----------|--------|---------------|
| 🟢 **Green** | On Track | No immediate action |
| 🟡 **Yellow** | Warning (80% elapsed) | Prioritize this ticket |
| 🔴 **Red** | Breached | SLA target missed |

### Ticket SLA Panel

Each ticket displays:

```
┌─────────────────────────────────────────┐
│ SLA Status                              │
├─────────────────────────────────────────┤
│ First Response                          │
│ ████████░░ 80%                          │
│ Due in: 15 minutes                      │
│ Target: 1 hour                          │
├─────────────────────────────────────────┤
│ Resolution                              │
│ ████░░░░░░ 40%                          │
│ Due in: 2h 24m                          │
│ Target: 4 hours                         │
└─────────────────────────────────────────┘
```

### SLA Views

Filter tickets by SLA status:

| View | Description |
|------|-------------|
| **Response Overdue** | First response SLA breached |
| **Resolution Due Today** | Resolution target due today |
| **My Resolution Overdue** | Your tickets with breached resolution |

---

## Pause & Resume

### Automatic Pausing

SLA timer automatically pauses when:

- Ticket status set to **Pending** (awaiting customer)
- Ticket status set to **Resolved**
- Manual pause by agent

### Manual Pause

Agents can manually pause SLA:

1. Open ticket
2. Click **SLA > Pause Timer**
3. Select reason
4. Timer stops counting

### Pause Reasons

| Reason | Description |
|--------|-------------|
| Awaiting Customer | Waiting for customer response |
| Third-Party Dependency | Waiting on external vendor |
| Scheduled Maintenance | Planned downtime |
| Customer Request | Customer requested delay |

### Resume Behavior

SLA automatically resumes when:
- Customer replies to pending ticket
- Ticket reopened from resolved
- Manual resume by agent

---

## Escalations

### Configuring Escalations

Set up automatic escalations when SLA is at risk:

1. Go to **Settings > SLA > Escalations**
2. Create escalation rules

### Escalation Rule Example

```json
{
  "name": "High Priority Response Warning",
  "trigger": "first_response_warning",
  "percentage": 80,
  "actions": [
    {
      "type": "notify",
      "recipients": ["assignee", "team_lead"]
    },
    {
      "type": "tag",
      "value": "sla-at-risk"
    }
  ]
}
```

### Escalation Types

| Trigger | When |
|---------|------|
| **Warning** | 80% of time elapsed |
| **Breach** | Target time exceeded |
| **Extended Breach** | 2x target exceeded |

### Escalation Actions

| Action | Description |
|--------|-------------|
| **Notify** | Send email/notification |
| **Reassign** | Change assignee |
| **Add Tag** | Apply tag to ticket |
| **Change Priority** | Escalate priority |
| **Notify Manager** | Alert supervisor |

---

## Notifications

### Configuring Alerts

Set up SLA notifications in **Settings > Notifications**:

| Notification | Recipients |
|--------------|------------|
| Warning (80%) | Assignee |
| Breach | Assignee + Manager |
| Extended Breach | Team Lead + Admin |

### Email Templates

Customize SLA notification emails:

```html
Subject: ⚠️ SLA Warning - Ticket #{{ticket_number}}

Hi {{assignee_name}},

Ticket #{{ticket_number}} is approaching its SLA target.

Ticket: {{ticket_subject}}
Priority: {{ticket_priority}}
{{sla_type}} Due: {{due_time}}
Time Remaining: {{time_remaining}}

Please take action to meet the SLA target.

View Ticket: {{ticket_url}}
```

---

## Reporting

### SLA Dashboard

The SLA dashboard shows:

```
┌─────────────────────────────────────────────────────────────┐
│ SLA Performance Overview                                     │
├──────────────────────┬──────────────────────────────────────┤
│ First Response       │ Resolution                            │
│                      │                                        │
│ Compliance: 94%      │ Compliance: 87%                        │
│ Avg Time: 45 min     │ Avg Time: 3.2 hours                   │
│ Breached: 12         │ Breached: 26                           │
└──────────────────────┴──────────────────────────────────────┤
│                                                              │
│ [Chart: SLA Compliance Over Time]                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Key Metrics

| Metric | Description |
|--------|-------------|
| **SLA Compliance %** | Tickets meeting targets |
| **Average Response** | Mean first response time |
| **Average Resolution** | Mean time to resolve |
| **Breach Count** | Number of SLA breaches |
| **At Risk** | Currently approaching breach |

### SLA Reports

Generate reports for:

- Daily/weekly/monthly compliance
- Compliance by priority
- Compliance by agent/team
- Breach analysis
- Trend analysis

---

## Best Practices

### Setting Realistic Targets

✅ **Do:**
- Analyze historical data first
- Consider team capacity
- Account for complexity variations
- Start conservative, adjust over time

❌ **Avoid:**
- Copying competitors blindly
- Ignoring business hours
- Setting impossible targets
- Forgetting about holidays

### Improving SLA Performance

1. **Staffing**: Ensure adequate coverage during business hours
2. **Training**: Equip agents to resolve issues efficiently
3. **Knowledge Base**: Deflect common issues with self-service
4. **Automation**: Use rules to route tickets faster
5. **Monitoring**: Watch dashboards for real-time status

### SLA Reporting Cadence

| Audience | Frequency | Focus |
|----------|-----------|-------|
| Agents | Daily | Individual compliance |
| Team Leads | Weekly | Team performance |
| Management | Monthly | Trends and exceptions |
| Executives | Quarterly | Strategic metrics |

---

## Troubleshooting

### Common Issues

**SLA Not Tracking**
- Check if SLA is enabled globally
- Verify policy exists for ticket priority
- Ensure policy status is "Active"

**Wrong Time Calculation**
- Verify business hours configuration
- Check timezone settings
- Review holiday calendar

**Escalations Not Firing**
- Confirm escalation rules are active
- Check notification settings
- Verify recipient email addresses

---

**Next:** [Knowledge Base](/docs/features/knowledge-base) | [Automation Rules](/docs/features/automation-rules)
