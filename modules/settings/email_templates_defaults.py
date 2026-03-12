"""
Default email templates for initial seeding.
Templates use plain text body that will be wrapped in the base HTML template.
"""

DEFAULT_EMAIL_TEMPLATES = [
    {
        'name': 'Ticket Created',
        'template_type': 'ticket_created',
        'subject': 'New Ticket Created #{{ticket_number}}',
        'body_text': '''Hi {{customer_name}},

Your support ticket has been created successfully.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Status: {{ticket_status}}

We will respond to your ticket as soon as possible.

Thank you,
{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'ticket_status': 'Ticket status',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Assigned',
        'template_type': 'ticket_assigned',
        'subject': 'Ticket #{{ticket_number}} Assigned to You',
        'body_text': '''Hi {{agent_name}},

A new ticket has been assigned to you.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Customer: {{customer_name}}



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'customer_name': 'Customer name',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Resolved',
        'template_type': 'ticket_resolved',
        'subject': 'Ticket #{{ticket_number}} Has Been Resolved',
        'body_text': '''Hi {{customer_name}},

Great news! Your support ticket has been resolved.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

If you have any further questions or if the issue persists, please reopen the ticket or create a new one.

Thank you,
{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'agent_name': 'Agent name',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Welcome Email',
        'template_type': 'welcome_user',
        'subject': 'Welcome to {{company_name}}',
        'body_text': '''Hi {{user_name}},

Welcome! Your account has been created successfully.

Email: {{user_email}}
Username: {{username}}

Login: {{login_url}}

Best regards,
{{company_name}} Team''',
        'status': 'active',
        'available_variables': {
            'user_name': 'User full name',
            'user_email': 'User email address',
            'username': 'Username',
            'login_url': 'Login URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Password Reset',
        'template_type': 'password_reset',
        'subject': 'Reset Your Password',
        'body_text': '''Hi {{user_name}},

We received a request to reset your password. Use the link below to create a new password:

{{reset_url}}

This link will expire in {{expiry_hours}} hours.

If you didn't request this, please ignore this email.

{{company_name}}''',
        'status': 'active',
        'available_variables': {
            'user_name': 'User full name',
            'reset_url': 'Password reset URL',
            'expiry_hours': 'Link expiry hours',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'SLA Breach Warning',
        'template_type': 'sla_breach_warning',
        'subject': 'SLA Breach Warning - Ticket #{{ticket_number}}',
        'body_text': '''Hi {{agent_name}},

A ticket is approaching SLA breach!

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Time Remaining: {{time_remaining}}


{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'time_remaining': 'Time remaining before breach',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'SLA Breached',
        'template_type': 'sla_breached',
        'subject': 'SLA Breached - Ticket #{{ticket_number}}',
        'body_text': '''Hi {{agent_name}},

A ticket has breached its SLA!

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
SLA Policy: {{policy_name}}
Overdue: {{overdue_time}}

Please take immediate action to resolve this ticket.



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'policy_name': 'SLA policy name',
            'overdue_time': 'How long overdue',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'New Activity on Ticket',
        'template_type': 'new_activity_notice',
        'subject': 'New Activity on Ticket #{{ticket_number}}',
        'body_text': '''Hi {{customer_name}},

There has been new activity on your ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Activity: {{activity_type}}
By: {{updated_by}}



{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'activity_type': 'Type of activity',
            'updated_by': 'Person who made the update',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Message Received Auto-Response',
        'template_type': 'new_message_auto_response',
        'subject': 'Re: Your Message Regarding Ticket #{{ticket_number}}',
        'body_text': '''Hi {{customer_name}},

Thank you for your message. We have received your update on ticket #{{ticket_number}}.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Our team will review your message and respond as soon as possible.

{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'New Ticket Notice (Agent)',
        'template_type': 'new_ticket_notice',
        'subject': 'New Ticket Created: #{{ticket_number}} - {{ticket_subject}}',
        'body_text': '''Hi Team,

A new ticket has been created in the system.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Customer: {{customer_name}}
Priority: {{ticket_priority}}
Status: {{ticket_status}}



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'customer_name': 'Customer name',
            'ticket_priority': 'Ticket priority',
            'ticket_status': 'Ticket status',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Agent Response Reply',
        'template_type': 'response_reply_template',
        'subject': 'Re: Ticket #{{ticket_number}} - {{ticket_subject}}',
        'body_text': '''Hi {{customer_name}},

{{agent_name}} has responded to your ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Response:
{{response_message}}



{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'response_message': 'Response message content',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Internal Activity Alert',
        'template_type': 'internal_activity_alert',
        'subject': 'Internal Activity on Ticket #{{ticket_number}}',
        'body_text': '''Hi {{agent_name}},

An internal note or activity has been added to a ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Added By: {{added_by}}

Note:
{{internal_note}}



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'added_by': 'Person who added the note',
            'internal_note': 'Internal note content',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'New Message Alert (Agent)',
        'template_type': 'new_message_alert',
        'subject': 'New Message on Ticket #{{ticket_number}}: {{ticket_subject}}',
        'body_text': '''Hi {{agent_name}},

{{customer_name}} has sent a new message on a ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Customer: {{customer_name}}

Message:
{{message_content}}



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'message_content': 'Message content',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Overdue Ticket Alert',
        'template_type': 'overdue_ticket_alert',
        'subject': 'Overdue Ticket Alert - #{{ticket_number}}',
        'body_text': '''Hi {{agent_name}},

A ticket assigned to you is now overdue.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Overdue By: {{overdue_time}}

Please take immediate action.



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'overdue_time': 'Time overdue',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Transfer Alert',
        'template_type': 'ticket_transfer_alert',
        'subject': 'Ticket #{{ticket_number}} Transferred to You',
        'body_text': '''Hi {{agent_name}},

A ticket has been transferred to you.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Customer: {{customer_name}}
Transferred From: {{transferred_from}}



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'customer_name': 'Customer name',
            'transferred_from': 'Previous assignee',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'New Task Alert',
        'template_type': 'new_task_alert',
        'subject': 'New Task Assigned: {{task_title}}',
        'body_text': '''Hi {{assignee_name}},

A new task has been assigned to you.

Task: {{task_title}}
Due Date: {{due_date}}
Priority: {{task_priority}}
Assigned By: {{assigned_by}}

View task: {{task_url}}

{{company_name}}''',
        'status': 'active',
        'available_variables': {
            'assignee_name': 'Assignee name',
            'task_title': 'Task title',
            'due_date': 'Due date',
            'task_priority': 'Task priority',
            'assigned_by': 'Person who assigned',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Overdue Task Alert',
        'template_type': 'overdue_task_alert',
        'subject': 'Task Overdue: {{task_title}}',
        'body_text': '''Hi {{assignee_name}},

A task assigned to you is now overdue.

Task: {{task_title}}
Due Date: {{due_date}}
Priority: {{task_priority}}
Overdue By: {{overdue_time}}

Please take immediate action.

View task: {{task_url}}

{{company_name}}''',
        'status': 'active',
        'available_variables': {
            'assignee_name': 'Assignee name',
            'task_title': 'Task title',
            'due_date': 'Due date',
            'task_priority': 'Task priority',
            'overdue_time': 'Time overdue',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Comment Added Notice',
        'template_type': 'comment_add_notice',
        'subject': 'New Comment on Ticket #{{ticket_number}}',
        'body_text': '''Hi {{recipient_name}},

A new comment has been added to a ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Comment By: {{comment_by}}

Comment:
{{comment_content}}



{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'recipient_name': 'Recipient name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'comment_by': 'Person who commented',
            'comment_content': 'Comment content',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'User Mentioned in Ticket',
        'template_type': 'user_mentioned',
        'subject': 'You were mentioned in Ticket #{{ticket_number}}',
        'body_text': '''Hi {{mentioned_user}},

You were mentioned in a ticket comment.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Mentioned By: {{mentioned_by}}

Message:
{{mention_context}}



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'mentioned_user': 'Mentioned user name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'mentioned_by': 'Person who mentioned',
            'mention_context': 'Mention context/message',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Survey Invitation',
        'template_type': 'survey_invitation',
        'subject': 'We value your feedback - Ticket #{{ticket_number}}',
        'body_text': '''Hi {{customer_name}},

Thank you for contacting our support team. We'd love to hear about your experience.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Please take a moment to share your feedback:
{{survey_url}}

Your feedback helps us improve our service.

Thank you,
{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'survey_url': 'Survey URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Survey Reminder',
        'template_type': 'survey_reminder',
        'subject': 'Reminder: Share your feedback - Ticket #{{ticket_number}}',
        'body_text': '''Hi {{customer_name}},

We noticed you haven't completed the feedback survey for your recent support ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Your feedback is important to us:
{{survey_url}}

Thank you,
{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'survey_url': 'Survey URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Status Changed',
        'template_type': 'ticket_status_changed',
        'subject': 'Ticket #{{ticket_number}} Status Updated to {{new_status}}',
        'body_text': '''Hi {{customer_name}},

The status of your ticket has been updated.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Changed to: {{new_status}}


{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'old_status': 'Previous status',
            'new_status': 'New status',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Priority Changed',
        'template_type': 'ticket_priority_changed',
        'subject': 'Ticket #{{ticket_number}} Priority Updated to {{new_priority}}',
        'body_text': '''Hi {{customer_name}},

The priority of your ticket has been updated.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Previous Priority: {{old_priority}}
New Priority: {{new_priority}}



{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'old_priority': 'Previous priority',
            'new_priority': 'New priority',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Merged',
        'template_type': 'ticket_merged',
        'subject': 'Ticket #{{ticket_number}} Has Been Merged',
        'body_text': '''Hi {{customer_name}},

Your ticket has been merged with another related ticket for better handling.

Original Ticket: #{{ticket_number}}
Merged Into: #{{merged_ticket_number}}
Subject: {{ticket_subject}}

All communication will now continue on ticket #{{merged_ticket_number}}.

View merged ticket: {{ticket_url}}

{{company_name}} Support Team''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Original ticket number',
            'merged_ticket_number': 'Merged ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'SLA Escalation Notice',
        'template_type': 'sla_escalation_notice',
        'subject': 'SLA Escalation - Ticket #{{ticket_number}}',
        'body_text': '''Hi {{escalation_contact}},

A ticket has been escalated due to SLA breach.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
SLA Policy: {{policy_name}}
Breach Type: {{breach_type}}
Overdue: {{overdue_time}}

This ticket requires immediate attention.



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'escalation_contact': 'Escalation contact name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'policy_name': 'SLA policy name',
            'breach_type': 'Type of SLA breach',
            'overdue_time': 'Time overdue',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Assigned to Group',
        'template_type': 'ticket_group_assigned',
        'subject': 'New Ticket Assigned to Your Group: #{{ticket_number}}',
        'body_text': '''Hi {{agent_name}},

A new ticket has been assigned to your group.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Customer: {{customer_name}}
Group: {{group_name}}



{{company_name}} Support System''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'customer_name': 'Customer name',
            'group_name': 'Assignment group name',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
]
