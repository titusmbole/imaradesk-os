"""
Default email templates for initial seeding
"""

DEFAULT_EMAIL_TEMPLATES = [
    {
        'name': 'Ticket Created',
        'template_type': 'ticket_created',
        'subject': 'New Ticket Created #{{ticket_number}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Ticket Created</h2>
        <p>Hi {{customer_name}},</p>
        <p>Your support ticket has been created successfully.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> {{ticket_status}}</p>
        </div>
        
        <p>We will respond to your ticket as soon as possible.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Thank you,<br>
             Imara Desk Support Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

Your support ticket has been created successfully.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Status: {{ticket_status}}

We will respond to your ticket as soon as possible.

Thank you,
 Imara Desk Support Team
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Ticket Assigned</h2>
        <p>Hi {{agent_name}},</p>
        <p>A new ticket has been assigned to you.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> {{customer_name}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{agent_name}},

A new ticket has been assigned to you.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Customer: {{customer_name}}

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Ticket Resolved</h2>
        <p>Hi {{customer_name}},</p>
        <p>Great news! Your support ticket has been resolved.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            </div>
        
        <p>If you have any further questions or if the issue persists, please reopen the ticket or create a new one.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Thank you,<br>
             Imara Desk Support Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

Great news! Your support ticket has been resolved.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
 

If you have any further questions or if the issue persists, please reopen the ticket or create a new one.

Thank you,
 Imara Desk Support Team
        ''',
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
        'subject': 'Welcome to  Imara Desk',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Welcome to  Imara Desk!</h2>
        <p>Hi {{user_name}},</p>
        <p>Welcome! Your account has been created successfully.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> {{user_email}}</p>
            <p style="margin: 5px 0;"><strong>Username:</strong> {{username}}</p>
        </div>
        
        <p>
            <a href="{{login_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login to Your Account
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Best regards,<br>
             Imara Desk Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{user_name}},

Welcome! Your account has been created successfully.

Email: {{user_email}}
Username: {{username}}

Login: {{login_url}}

Best regards,
 Imara Desk Team
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Password Reset Request</h2>
        <p>Hi {{user_name}},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <p style="margin: 30px 0;">
            <a href="{{reset_url}}" style="background-color: #4a154b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
            </a>
        </p>
        
        <p style="color: #666;">This link will expire in {{expiry_hours}} hours.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            If you didn't request this, please ignore this email.<br>
             Imara Desk
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{user_name}},

We received a request to reset your password. Use the link below to create a new password:

{{reset_url}}

This link will expire in {{expiry_hours}} hours.

If you didn't request this, please ignore this email.

 Imara Desk
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">SLA Breach Warning</h2>
        <p>Hi {{agent_name}},</p>
        <p style="color: #dc2626; font-weight: bold;">A ticket is approaching SLA breach!</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>Time Remaining:</strong> {{time_remaining}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket Now
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''SLA BREACH WARNING

Hi {{agent_name}},

A ticket is approaching SLA breach!

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Time Remaining: {{time_remaining}}

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">⚠️ SLA Breached</h2>
        <p>Hi {{agent_name}},</p>
        <p style="color: #dc2626; font-weight: bold;">A ticket has breached its SLA!</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>SLA Policy:</strong> {{policy_name}}</p>
            <p style="margin: 5px 0;"><strong>Overdue:</strong> {{overdue_time}}</p>
        </div>
        
        <p>Please take immediate action to resolve this ticket.</p>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket Now
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''SLA BREACHED

Hi {{agent_name}},

A ticket has breached its SLA!

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
SLA Policy: {{policy_name}}
Overdue: {{overdue_time}}

Please take immediate action to resolve this ticket.

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">New Activity on Your Ticket</h2>
        <p>Hi {{customer_name}},</p>
        <p>There has been new activity on your ticket.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Activity:</strong> {{activity_type}}</p>
            <p style="margin: 5px 0;"><strong>By:</strong> {{updated_by}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

There has been new activity on your ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Activity: {{activity_type}}
By: {{updated_by}}

View ticket: {{ticket_url}}

 Imara Desk Support Team
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Message Received</h2>
        <p>Hi {{customer_name}},</p>
        <p>Thank you for your message. We have received your update on ticket #{{ticket_number}}.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
        </div>
        
        <p>Our team will review your message and respond as soon as possible.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

Thank you for your message. We have received your update on ticket #{{ticket_number}}.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Our team will review your message and respond as soon as possible.

 Imara Desk Support Team
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">New Ticket Created</h2>
        <p>Hi Team,</p>
        <p>A new ticket has been created in the system.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> {{customer_name}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> {{ticket_status}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi Team,

A new ticket has been created in the system.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Customer: {{customer_name}}
Priority: {{ticket_priority}}
Status: {{ticket_status}}

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">New Response on Your Ticket</h2>
        <p>Hi {{customer_name}},</p>
        <p>{{agent_name}} has responded to your ticket.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
            <p style="margin: 10px 0;"><strong>Response:</strong></p>
            <p style="margin: 5px 0;">{{response_message}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

{{agent_name}} has responded to your ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Response:
{{response_message}}

View ticket: {{ticket_url}}

 Imara Desk Support Team
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Internal Activity</h2>
        <p>Hi {{agent_name}},</p>
        <p>An internal note or activity has been added to a ticket.</p>
        
        <div style="background-color: #fff8dc; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Added By:</strong> {{added_by}}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
            <p style="margin: 5px 0;"><strong>Note:</strong></p>
            <p style="margin: 5px 0;">{{internal_note}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{agent_name}},

An internal note or activity has been added to a ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Added By: {{added_by}}

Note:
{{internal_note}}

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
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
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">New Message Received</h2>
        <p>Hi {{agent_name}},</p>
        <p>{{customer_name}} has sent a new message on a ticket.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> {{customer_name}}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
            <p style="margin: 5px 0;"><strong>Message:</strong></p>
            <p style="margin: 5px 0;">{{message_content}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View & Respond
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{agent_name}},

{{customer_name}} has sent a new message on a ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Customer: {{customer_name}}

Message:
{{message_content}}

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
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
        'subject': 'Overdue Ticket Alert: #{{ticket_number}} - {{ticket_subject}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Ticket Overdue</h2>
        <p>Hi {{agent_name}},</p>
        <p style="color: #dc2626; font-weight: bold;">A ticket has become overdue and requires immediate attention!</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> {{due_date}}</p>
            <p style="margin: 5px 0;"><strong>Overdue By:</strong> {{overdue_duration}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket Now
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''TICKET OVERDUE

Hi {{agent_name}},

A ticket has become overdue and requires immediate attention!

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Due Date: {{due_date}}
Overdue By: {{overdue_duration}}

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'due_date': 'Due date',
            'overdue_duration': 'How long overdue',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Transfer Alert',
        'template_type': 'ticket_transfer_alert',
        'subject': 'Ticket #{{ticket_number}} has been transferred to you',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Ticket Transferred</h2>
        <p>Hi {{agent_name}},</p>
        <p>A ticket has been transferred to you by {{transferred_by}}.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> {{customer_name}}</p>
            <p style="margin: 5px 0;"><strong>Transferred By:</strong> {{transferred_by}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{agent_name}},

A ticket has been transferred to you by {{transferred_by}}.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Customer: {{customer_name}}
Transferred By: {{transferred_by}}

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'customer_name': 'Customer name',
            'transferred_by': 'Person who transferred the ticket',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Task Activity Alert (Agent)',
        'template_type': 'task_new_activity_alert',
        'subject': 'New Activity on Task #{{task_number}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">New Activity on Task</h2>
        <p>Hi {{agent_name}},</p>
        <p>There has been new activity on a task.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Task Number:</strong> #{{task_number}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{task_title}}</p>
            <p style="margin: 5px 0;"><strong>Activity:</strong> {{activity_type}}</p>
            <p style="margin: 5px 0;"><strong>Updated By:</strong> {{updated_by}}</p>
        </div>
        
        <p>
            <a href="{{task_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Task
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Task System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{agent_name}},

There has been new activity on a task.

Task Number: #{{task_number}}
Title: {{task_title}}
Activity: {{activity_type}}
Updated By: {{updated_by}}

View task: {{task_url}}

 Imara Desk Task System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'task_number': 'Task number',
            'task_title': 'Task title',
            'activity_type': 'Type of activity',
            'updated_by': 'Person who made the update',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Task Activity Notice (User)',
        'template_type': 'task_new_activity_notice',
        'subject': 'Update on Task #{{task_number}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Task Update</h2>
        <p>Hi {{user_name}},</p>
        <p>There has been an update on your task.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Task Number:</strong> #{{task_number}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{task_title}}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> {{task_status}}</p>
            <p style="margin: 5px 0;"><strong>Updated By:</strong> {{updated_by}}</p>
        </div>
        
        <p>
            <a href="{{task_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Task
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{user_name}},

There has been an update on your task.

Task Number: #{{task_number}}
Title: {{task_title}}
Status: {{task_status}}
Updated By: {{updated_by}}

View task: {{task_url}}

 Imara Desk Team
        ''',
        'status': 'active',
        'available_variables': {
            'user_name': 'User name',
            'task_number': 'Task number',
            'task_title': 'Task title',
            'task_status': 'Task status',
            'updated_by': 'Person who made the update',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'New Task Alert',
        'template_type': 'new_task_alert',
        'subject': 'New Task Created: #{{task_number}} - {{task_title}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">New Task Created</h2>
        <p>Hi {{agent_name}},</p>
        <p>A new task has been created in the system.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Task Number:</strong> #{{task_number}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{task_title}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{task_priority}}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> {{due_date}}</p>
            <p style="margin: 5px 0;"><strong>Created By:</strong> {{created_by}}</p>
        </div>
        
        <p>
            <a href="{{task_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Task
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Task System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{agent_name}},

A new task has been created in the system.

Task Number: #{{task_number}}
Title: {{task_title}}
Priority: {{task_priority}}
Due Date: {{due_date}}
Created By: {{created_by}}

View task: {{task_url}}

 Imara Desk Task System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'task_number': 'Task number',
            'task_title': 'Task title',
            'task_priority': 'Task priority',
            'due_date': 'Due date',
            'created_by': 'Person who created the task',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Overdue Task Alert',
        'template_type': 'overdue_task_alert',
        'subject': 'Overdue Task Alert: #{{task_number}} - {{task_title}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Task Overdue</h2>
        <p>Hi {{agent_name}},</p>
        <p style="color: #dc2626; font-weight: bold;">A task has become overdue and needs immediate attention!</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Task Number:</strong> #{{task_number}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{task_title}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{task_priority}}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> {{due_date}}</p>
            <p style="margin: 5px 0;"><strong>Overdue By:</strong> {{overdue_duration}}</p>
        </div>
        
        <p>
            <a href="{{task_url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Task Now
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Task System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''TASK OVERDUE

Hi {{agent_name}},

A task has become overdue and needs immediate attention!

Task Number: #{{task_number}}
Title: {{task_title}}
Priority: {{task_priority}}
Due Date: {{due_date}}
Overdue By: {{overdue_duration}}

View task: {{task_url}}

 Imara Desk Task System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'task_number': 'Task number',
            'task_title': 'Task title',
            'task_priority': 'Task priority',
            'due_date': 'Due date',
            'overdue_duration': 'How long overdue',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Task Assignment Alert',
        'template_type': 'task_assignment_alert',
        'subject': 'You have been assigned to Task #{{task_number}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Task Assigned</h2>
        <p>Hi {{agent_name}},</p>
        <p>A new task has been assigned to you.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Task Number:</strong> #{{task_number}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{task_title}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{task_priority}}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> {{due_date}}</p>
            <p style="margin: 5px 0;"><strong>Assigned By:</strong> {{assigned_by}}</p>
        </div>
        
        <p>
            <a href="{{task_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Task
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Task System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{agent_name}},

A new task has been assigned to you.

Task Number: #{{task_number}}
Title: {{task_title}}
Priority: {{task_priority}}
Due Date: {{due_date}}
Assigned By: {{assigned_by}}

View task: {{task_url}}

 Imara Desk Task System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'task_number': 'Task number',
            'task_title': 'Task title',
            'task_priority': 'Task priority',
            'due_date': 'Due date',
            'assigned_by': 'Person who assigned the task',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Task Transfer Alert',
        'template_type': 'task_transfer_alert',
        'subject': 'Task #{{task_number}} has been transferred to you',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Task Transferred</h2>
        <p>Hi {{agent_name}},</p>
        <p>A task has been transferred to you by {{transferred_by}}.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Task Number:</strong> #{{task_number}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{task_title}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{task_priority}}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> {{due_date}}</p>
            <p style="margin: 5px 0;"><strong>Transferred By:</strong> {{transferred_by}}</p>
        </div>
        
        <p>
            <a href="{{task_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Task
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Task System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{agent_name}},

A task has been transferred to you by {{transferred_by}}.

Task Number: #{{task_number}}
Title: {{task_title}}
Priority: {{task_priority}}
Due Date: {{due_date}}
Transferred By: {{transferred_by}}

View task: {{task_url}}

 Imara Desk Task System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'task_number': 'Task number',
            'task_title': 'Task title',
            'task_priority': 'Task priority',
            'due_date': 'Due date',
            'transferred_by': 'Person who transferred the task',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'SLA Reminder',
        'template_type': 'sla_reminder',
        'subject': 'SLA Reminder for Task #{{task_number}}: {{task_title}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">⏰ SLA Reminder</h2>
        <p>Hi {{agent_name}},</p>
        <p>This is a reminder that a task's SLA deadline is approaching.</p>
        
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Task Number:</strong> #{{task_number}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{task_title}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{task_priority}}</p>
            <p style="margin: 5px 0;"><strong>Time Remaining:</strong> {{time_remaining}}</p>
            <p style="margin: 5px 0;"><strong>SLA Deadline:</strong> {{sla_deadline}}</p>
        </div>
        
        <p>
            <a href="{{task_url}}" style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Task
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Task System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''⏰ SLA REMINDER

Hi {{agent_name}},

This is a reminder that a task's SLA deadline is approaching.

Task Number: #{{task_number}}
Title: {{task_title}}
Priority: {{task_priority}}
Time Remaining: {{time_remaining}}
SLA Deadline: {{sla_deadline}}

View task: {{task_url}}

 Imara Desk Task System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'task_number': 'Task number',
            'task_title': 'Task title',
            'task_priority': 'Task priority',
            'time_remaining': 'Time remaining before SLA breach',
            'sla_deadline': 'SLA deadline',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'SLA Escalation Notice (Task)',
        'template_type': 'sla_escalation_notice_task',
        'subject': 'SLA Escalation Notice for Task #{{task_number}}: {{task_title}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">🔴 SLA Escalation</h2>
        <p>Hi {{manager_name}},</p>
        <p style="color: #dc2626; font-weight: bold;">A task has been escalated due to SLA breach.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Task Number:</strong> #{{task_number}}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {{task_title}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{task_priority}}</p>
            <p style="margin: 5px 0;"><strong>Assigned To:</strong> {{assigned_to}}</p>
            <p style="margin: 5px 0;"><strong>Breached By:</strong> {{breached_duration}}</p>
        </div>
        
        <p>
            <a href="{{task_url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Review Task
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Task System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''🔴 SLA ESCALATION

Hi {{manager_name}},

A task has been escalated due to SLA breach.

Task Number: #{{task_number}}
Title: {{task_title}}
Priority: {{task_priority}}
Assigned To: {{assigned_to}}
Breached By: {{breached_duration}}

Review task: {{task_url}}

 Imara Desk Task System
        ''',
        'status': 'active',
        'available_variables': {
            'manager_name': 'Manager name',
            'task_number': 'Task number',
            'task_title': 'Task title',
            'task_priority': 'Task priority',
            'assigned_to': 'Person assigned to the task',
            'breached_duration': 'How long SLA has been breached',
            'task_url': 'Task URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'SLA Escalation Notice (Ticket)',
        'template_type': 'sla_escalation_notice',
        'subject': 'SLA Escalation Notice for Ticket #{{ticket_number}}: {{ticket_subject}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">🔴 SLA Escalation</h2>
        <p>Hi {{admin_name}},</p>
        <p style="color: #dc2626; font-weight: bold;">A ticket has been escalated due to SLA breach.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>Assigned To:</strong> {{assigned_to}}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> {{customer_name}}</p>
            <p style="margin: 5px 0;"><strong>Breached By:</strong> {{breached_duration}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Review Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''🔴 SLA ESCALATION

Hi {{admin_name}},

A ticket has been escalated due to SLA breach.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Assigned To: {{assigned_to}}
Customer: {{customer_name}}
Breached By: {{breached_duration}}

Review ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
        'status': 'active',
        'available_variables': {
            'admin_name': 'Admin name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'assigned_to': 'Person assigned to the ticket',
            'customer_name': 'Customer name',
            'breached_duration': 'How long SLA has been breached',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'First Response SLA Breach',
        'template_type': 'sla_first_response_breach',
        'subject': 'First Response SLA Breach on Ticket #{{ticket_number}}: {{ticket_subject}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">First Response SLA Breach</h2>
        <p>Hi {{agent_name}},</p>
        <p style="color: #dc2626; font-weight: bold;">A ticket has breached the first response SLA!</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> {{customer_name}}</p>
            <p style="margin: 5px 0;"><strong>First Response Target:</strong> {{target_time}}</p>
            <p style="margin: 5px 0;"><strong>Time Elapsed:</strong> {{elapsed_time}}</p>
        </div>
        
        <p>Please respond to this ticket immediately.</p>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Respond Now
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''FIRST RESPONSE SLA BREACH

Hi {{agent_name}},

A ticket has breached the first response SLA!

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Customer: {{customer_name}}
First Response Target: {{target_time}}
Time Elapsed: {{elapsed_time}}

Please respond to this ticket immediately.

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'customer_name': 'Customer name',
            'target_time': 'First response target time',
            'elapsed_time': 'Time elapsed since creation',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Resolution SLA Breach',
        'template_type': 'sla_resolution_breach',
        'subject': 'Resolution SLA Breach on Ticket #{{ticket_number}}: {{ticket_subject}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Resolution SLA Breach</h2>
        <p>Hi {{agent_name}},</p>
        <p style="color: #dc2626; font-weight: bold;">A ticket has breached the resolution SLA!</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Priority:</strong> {{ticket_priority}}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> {{customer_name}}</p>
            <p style="margin: 5px 0;"><strong>Resolution Target:</strong> {{target_time}}</p>
            <p style="margin: 5px 0;"><strong>Time Elapsed:</strong> {{elapsed_time}}</p>
        </div>
        
        <p>This ticket requires immediate resolution.</p>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Resolve Now
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''RESOLUTION SLA BREACH

Hi {{agent_name}},

A ticket has breached the resolution SLA!

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Priority: {{ticket_priority}}
Customer: {{customer_name}}
Resolution Target: {{target_time}}
Time Elapsed: {{elapsed_time}}

This ticket requires immediate resolution.

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
        'status': 'active',
        'available_variables': {
            'agent_name': 'Agent name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'ticket_priority': 'Ticket priority',
            'customer_name': 'Customer name',
            'target_time': 'Resolution target time',
            'elapsed_time': 'Time elapsed since creation',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Resolved Within SLA',
        'template_type': 'sla_resolved_notice',
        'subject': 'Ticket #{{ticket_number}} Resolved within SLA',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">Ticket Resolved</h2>
        <p>Hi {{customer_name}},</p>
        <p>Great news! Your ticket has been resolved within our service level agreement.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Resolved By:</strong> {{agent_name}}</p>
            <p style="margin: 5px 0;"><strong>Resolution Time:</strong> {{resolution_time}}</p>
        </div>
        
        <p>If you have any further questions or concerns, please don't hesitate to reach out.</p>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Thank you,<br>
             Imara Desk Support Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

Great news! Your ticket has been resolved within our service level agreement.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
 
Resolution Time: {{resolution_time}}

If you have any further questions or concerns, please don't hesitate to reach out.

View ticket: {{ticket_url}}

Thank you,
 Imara Desk Support Team
        ''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'agent_name': 'Agent who resolved the ticket',
            'resolution_time': 'Time taken to resolve',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Comment Added Notice',
        'template_type': 'comment_add_notice',
        'subject': 'Your comment was added on Ticket #{{ticket_number}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Comment Added</h2>
        <p>Hi {{user_name}},</p>
        <p>Your comment has been successfully added to the ticket.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
            <p style="margin: 5px 0;"><strong>Your Comment:</strong></p>
            <p style="margin: 5px 0;">{{comment_text}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{user_name}},

Your comment has been successfully added to the ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Your Comment:
{{comment_text}}

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
        'status': 'active',
        'available_variables': {
            'user_name': 'User name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'comment_text': 'Comment text',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Comment Reply Notice',
        'template_type': 'comment_reply_notice',
        'subject': 'New reply on Ticket #{{ticket_number}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">New Reply to Your Comment</h2>
        <p>Hi {{user_name}},</p>
        <p>{{replier_name}} has replied to your comment on a ticket.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
            <p style="margin: 5px 0;"><strong>Reply from {{replier_name}}:</strong></p>
            <p style="margin: 5px 0;">{{reply_text}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Conversation
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{user_name}},

{{replier_name}} has replied to your comment on a ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Reply from {{replier_name}}:
{{reply_text}}

View conversation: {{ticket_url}}

 Imara Desk Support System
        ''',
        'status': 'active',
        'available_variables': {
            'user_name': 'User name',
            'replier_name': 'Name of person who replied',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'reply_text': 'Reply text',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'User Mentioned in Ticket',
        'template_type': 'user_mentioned',
        'subject': 'You were mentioned in Ticket #{{ticket_number}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">You Were Mentioned</h2>
        <p>Hi {{user_name}},</p>
        <p><strong>{{mentioned_by}}</strong> mentioned you in a ticket.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
            <p style="margin: 5px 0;"><strong>Comment:</strong></p>
            <p style="margin: 5px 0; color: #555; font-style: italic;">{{comment_preview}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{user_name}},

{{mentioned_by}} mentioned you in a ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Comment:
{{comment_preview}}

View ticket: {{ticket_url}}

 Imara Desk Support System
        ''',
        'status': 'active',
        'available_variables': {
            'user_name': 'Mentioned user name',
            'mentioned_by': 'Name of person who mentioned',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'comment_preview': 'Preview of comment text',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Account Created - Credentials',
        'template_type': 'account_created',
        'subject': 'Your  Imara Desk Account Has Been Created',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;  ">
        <!-- Header -->
        <div style="padding: 30px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="color: #333; margin: 0; font-size: 24px;">Welcome to  Imara Desk!</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 30px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #555;">
                Your account has been successfully created! Below are your login credentials to access the system.
            </p>
            
            <!-- Credentials Box -->
            <div style="background-color: #f8f9fa; border-left: 4px solid #4a154b; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
                    <strong style="color: #4a154b;">Login URL:</strong><br>
                    <a href="{{login_url}}" style="color: #4a154b; text-decoration: none; font-size: 15px;">{{login_url}}</a>
                </p>
                <p style="margin: 10px 0; font-size: 14px; color: #666;">
                    <strong style="color: #4a154b;">Username:</strong><br>
                    <span style="font-family: 'Courier New', monospace; background: #fff; padding: 4px 8px; border-radius: 3px; display: inline-block; margin-top: 4px;">{{username}}</span>
                </p>
                <p style="margin: 10px 0; font-size: 14px; color: #666;">
                    <strong style="color: #4a154b;">Email:</strong><br>
                    <span style="font-family: 'Courier New', monospace; background: #fff; padding: 4px 8px; border-radius: 3px; display: inline-block; margin-top: 4px;">{{user_email}}</span>
                </p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                    <strong style="color: #4a154b;">Temporary Password:</strong><br>
                    <span style="font-family: 'Courier New', monospace; background: #fff; padding: 4px 8px; border-radius: 3px; display: inline-block; margin-top: 4px; color: #d9534f; font-weight: bold;">{{password}}</span>
                </p>
            </div>
            
            <!-- Security Notice -->
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #856404;">
                    <strong>Important Security Notice:</strong> Please change your password immediately after your first login to ensure your account security.
                </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{login_url}}" style="background-color: #4a154b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 15px;">
                    Login to Your Account
                </a>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #555; margin-top: 25px;">
                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; color: #666; font-size: 12px;">
                Best regards,<br>
                <strong style="color: #4a154b;"> Imara Desk Team</strong>
            </p>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{user_name}},

Your account has been successfully created! Below are your login credentials to access the system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Login URL: {{login_url}}
Username: {{username}}
Email: {{user_email}}
Temporary Password: {{password}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT SECURITY NOTICE:
Please change your password immediately after your first login to ensure your account security.

Click here to login: {{login_url}}

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
 Imara Desk Team

This is an automated message, please do not reply to this email.
        ''',
        'status': 'active',
        'available_variables': {
            'user_name': 'User full name',
            'user_email': 'User email address',
            'username': 'Username',
            'password': 'Temporary password',
            'login_url': 'Login URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Welcome to ImaraDesk',
        'template_type': 'welcome_business',
        'subject': 'Welcome to ImaraDesk - Your Helpdesk Journey Begins!',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff;  ">
        <!-- Hero Header -->
        <div style="padding: 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="color: #333; margin: 0 0 10px 0; font-size: 28px;">Welcome to ImaraDesk!</h1>
            <p style="color: #e0f2f1; margin: 0; font-size: 16px;">Hi {{user_name}}, we're thrilled to have you on board!</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 35px 25px;">
            <p style="font-size: 16px; margin-bottom: 20px; color: #444;">
                Congratulations on taking the first step towards better customer support! 🎊
            </p>
            
            <p style="font-size: 14px; line-height: 1.8; color: #555; margin-bottom: 25px;">
                Your workspace <strong style="color: #4a154b;">{{workspace_name}}</strong> is now ready, and you have access to a powerful suite of tools designed to streamline your support operations.
            </p>
            
            <!-- What You Can Do Section -->
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; margin: 25px 0;">
                <h2 style="color: #4a154b; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #4a154b; padding-bottom: 10px;">
                    What You Can Do Next
                </h2>
                
                <div style="margin-bottom: 18px;">
                    <strong style="color: #4a154b; font-size: 15px;">✓ Manage Tickets Efficiently</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #666; line-height: 1.6;">
                        Create, assign, and track customer support tickets with our intuitive ticket management system. Set priorities, add tags, and never miss a customer request.
                    </p>
                </div>
                
                <div style="margin-bottom: 18px;">
                    <strong style="color: #4a154b; font-size: 15px;">✓ Build Your Knowledge Base</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #666; line-height: 1.6;">
                        Empower your customers with self-service options. Create articles, FAQs, and guides that reduce support volume and improve satisfaction.
                    </p>
                </div>
                
                <div style="margin-bottom: 18px;">
                    <strong style="color: #4a154b; font-size: 15px;">✓ Track SLAs & Performance</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #666; line-height: 1.6;">
                        Set service level agreements and monitor response times. Get real-time alerts to ensure you never breach your commitments.
                    </p>
                </div>
                
                <div style="margin-bottom: 18px;">
                    <strong style="color: #4a154b; font-size: 15px;">✓ Collaborate with Your Team</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #666; line-height: 1.6;">
                        Invite team members, assign roles, and work together seamlessly. Internal notes and task assignments keep everyone synchronized.
                    </p>
                </div>
                
                <div style="margin-bottom: 0;">
                    <strong style="color: #4a154b; font-size: 15px;">✓ Gain Insights with Analytics</strong>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #666; line-height: 1.6;">
                        Make data-driven decisions with comprehensive reports on ticket volume, response times, team performance, and customer satisfaction.
                    </p>
                </div>
            </div>
            
            <!-- Quick Start Guide -->
            <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h3 style="color: #1976d2; margin: 0 0 12px 0; font-size: 16px;">Quick Start Checklist</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #555; line-height: 1.8;">
                    <li>Complete your profile settings</li>
                    <li>Invite your team members</li>
                    <li>Set up your first SLA policy</li>
                    <li>Create knowledge base categories</li>
                    <li>Customize your email templates</li>
                </ul>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0 25px 0;">
                <a href="{{dashboard_url}}" style="background-color: #4a154b; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px; ">
                    Go to Dashboard
                </a>
            </div>
            
            <!-- Support Section -->
            <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 1px solid #e9ecef;">
                <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">
                    Need help getting started? We're here for you!
                </p>
                <p style="font-size: 13px; color: #999; margin: 0;">
                    Email us: support@coredesk.com | 📖 Visit our <a href="{{help_center_url}}" style="color: #4a154b; text-decoration: none;">Help Center</a>
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                Welcome aboard!<br>
                <strong style="color: #4a154b;">The ImaraDesk Team</strong>
            </p>
            <p style="margin: 0; color: #999; font-size: 11px;">
                  ImaraDesk. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        ''',
        'body_text': '''WELCOME TO COREDESK!

Hi {{user_name}}, we're thrilled to have you on board!

Congratulations on taking the first step towards better customer support! 🎊

Your workspace "{{workspace_name}}" is now ready, and you have access to a powerful suite of tools designed to streamline your support operations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU CAN DO NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Manage Tickets Efficiently
Create, assign, and track customer support tickets with our intuitive ticket management system. Set priorities, add tags, and never miss a customer request.

✓ Build Your Knowledge Base
Empower your customers with self-service options. Create articles, FAQs, and guides that reduce support volume and improve satisfaction.

✓ Track SLAs & Performance
Set service level agreements and monitor response times. Get real-time alerts to ensure you never breach your commitments.

✓ Collaborate with Your Team
Invite team members, assign roles, and work together seamlessly. Internal notes and task assignments keep everyone synchronized.

✓ Gain Insights with Analytics
Make data-driven decisions with comprehensive reports on ticket volume, response times, team performance, and customer satisfaction.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK START CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Complete your profile settings
□ Invite your team members
□ Set up your first SLA policy
□ Create knowledge base categories
□ Customize your email templates

Access your dashboard: {{dashboard_url}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need help getting started? We're here for you!

Email: support@coredesk.com
📖 Help Center: {{help_center_url}}

Welcome aboard!
The ImaraDesk Team

  ImaraDesk. All rights reserved.
        ''',
        'status': 'active',
        'available_variables': {
            'user_name': 'User full name',
            'workspace_name': 'Workspace/company name',
            'dashboard_url': 'Dashboard URL',
            'help_center_url': 'Help center URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Forgot Password Request',
        'template_type': 'forgot_password',
        'subject': 'Reset Your  Imara Desk Password',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;  ">
        <!-- Header -->
        <div style="padding: 30px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
            <h1 style="color: #333; margin: 0; font-size: 24px;">Password Reset Request</h1>
        </div>
        
        <!-- Body -->
        <div style="padding: 30px 25px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi {{user_name}},</p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #555;">
                We received a request to reset your password for your  Imara Desk account. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <!-- Reset Instructions -->
            <div style="background-color: #f8f9fa; padding: 20px; margin: 25px 0; border-radius: 6px; border-left: 4px solid #4a154b;">
                <p style="margin: 0 0 15px 0; font-size: 14px; color: #555;">
                    To reset your password, click the button below:
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 20px 0;">
                    <a href="{{reset_url}}" style="background-color: #4a154b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 15px;">
                        Reset My Password
                    </a>
                </div>
                
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #666; line-height: 1.6;">
                    Or copy and paste this link into your browser:<br>
                    <a href="{{reset_url}}" style="color: #4a154b; word-break: break-all;">{{reset_url}}</a>
                </p>
            </div>
            
            <!-- Expiry Notice -->
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #856404;">
                    ⏰ <strong>Note:</strong> This password reset link will expire in <strong>{{expiry_hours}} hours</strong>. If you need a new link after it expires, please request another password reset.
                </p>
            </div>
            
            <!-- Security Notice -->
            <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #721c24; line-height: 1.6;">
                    <strong>Security Tip:</strong> If you didn't request this password reset, someone may be trying to access your account. Please contact our support team immediately and ensure your email account is secure.
                </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #555; margin-top: 25px;">
                If you have any questions or concerns, please don't hesitate to contact our support team.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; color: #666; font-size: 12px;">
                Best regards,<br>
                <strong style="color: #4a154b;"> Imara Desk Team</strong>
            </p>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
        ''',
        'body_text': '''PASSWORD RESET REQUEST

Hi {{user_name}},

We received a request to reset your password for your  Imara Desk account. If you didn't make this request, you can safely ignore this email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESET YOUR PASSWORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To reset your password, click the link below or copy and paste it into your browser:

{{reset_url}}

⏰ NOTE: This password reset link will expire in {{expiry_hours}} hours. If you need a new link after it expires, please request another password reset.

SECURITY TIP: If you didn't request this password reset, someone may be trying to access your account. Please contact our support team immediately and ensure your email account is secure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you have any questions or concerns, please don't hesitate to contact our support team.

Best regards,
 Imara Desk Team

This is an automated message, please do not reply to this email.
        ''',
        'status': 'active',
        'available_variables': {
            'user_name': 'User full name',
            'reset_url': 'Password reset URL',
            'expiry_hours': 'Link expiry hours',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Comment Reply Notice',
        'template_type': 'comment_reply_notice',
        'subject': '{{replier_name}} Replied to Your Comment',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">New Reply to Your Comment</h2>
        <p>Hi {{user_name}},</p>
        <p>{{replier_name}} has replied to your comment on a ticket.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
        </div>
        
        <div style="background-color: #fff; border-left: 3px solid #4a154b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">{{replier_name}} replied:</p>
            <p style="margin: 0; color: #333;">{{reply_text}}</p>
        </div>
        
        <p>
            <a href="{{ticket_url}}" style="background-color: #4a154b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Conversation
            </a>
        </p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
             Imara Desk Support System
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{user_name}},

{{replier_name}} has replied to your comment on a ticket.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}

Reply from {{replier_name}}:
{{reply_text}}

View conversation: {{ticket_url}}

 Imara Desk Support System
        ''',
        'status': 'active',
        'available_variables': {
            'user_name': 'User name',
            'replier_name': 'Name of person who replied',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'reply_text': 'Reply text',
            'ticket_url': 'Ticket URL',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Status Changed',
        'template_type': 'ticket_status_changed',
        'subject': 'Ticket #{{ticket_number}} Status Updated',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Ticket Status Updated</h2>
        <p>Hi {{customer_name}},</p>
        <p>The status of your support ticket has been updated.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Changed status to:</strong> {{new_status}}</p>
        </div>
        
        <p>If you have any questions about this update, please reply to this email or contact us.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Thank you,<br>
             Imara Desk Support Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

The status of your support ticket has been updated.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
   {{old_status}}
  Changed status to:  {{new_status}}

If you have any questions about this update, please reply to this email or contact us.

Thank you,
 Imara Desk Support Team
        ''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'old_status': 'Previous status',
            'new_status': 'New status',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Priority Changed',
        'template_type': 'ticket_priority_changed',
        'subject': 'Ticket #{{ticket_number}} Priority Updated',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Ticket Priority Updated</h2>
        <p>Hi {{customer_name}},</p>
        <p>The priority of your support ticket has been updated.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket Number:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
            <p style="margin: 5px 0;"><strong>Previous Priority:</strong> {{old_priority}}</p>
            <p style="margin: 5px 0;"><strong>New Priority:</strong> {{new_priority}}</p>
        </div>
        
        <p>We will address your ticket accordingly.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Thank you,<br>
             Imara Desk Support Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

The priority of your support ticket has been updated.

Ticket Number: #{{ticket_number}}
Subject: {{ticket_subject}}
Previous Priority: {{old_priority}}
New Priority: {{new_priority}}

We will address your ticket accordingly.

Thank you,
 Imara Desk Support Team
        ''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'old_priority': 'Previous priority',
            'new_priority': 'New priority',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Ticket Merged',
        'template_type': 'ticket_merged',
        'subject': 'Your Ticket Has Been Merged - #{{primary_ticket_number}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Ticket Merged</h2>
        <p>Hi {{customer_name}},</p>
        <p>Your ticket #{{merged_ticket_number}} has been merged with ticket #{{primary_ticket_number}} for better tracking.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Original Ticket:</strong> #{{merged_ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Merged Into:</strong> #{{primary_ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
        </div>
        
        <p>All updates will now be tracked on ticket #{{primary_ticket_number}}.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Thank you,<br>
             Imara Desk Support Team
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

Your ticket #{{merged_ticket_number}} has been merged with ticket #{{primary_ticket_number}} for better tracking.

Original Ticket: #{{merged_ticket_number}}
Merged Into: #{{primary_ticket_number}}
Subject: {{ticket_subject}}

All updates will now be tracked on ticket #{{primary_ticket_number}}.

Thank you,
 Imara Desk Support Team
        ''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'merged_ticket_number': 'Original ticket number',
            'primary_ticket_number': 'New ticket number',
            'ticket_subject': 'Ticket subject',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Survey Invitation',
        'template_type': 'survey_invitation',
        'subject': 'We value your feedback - {{survey_name}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">We'd Love Your Feedback!</h2>
        <p>Hi {{customer_name}},</p>
        <p>Thank you for contacting us regarding your recent support request. We hope your issue was resolved to your satisfaction.</p>
        
        <p>We're always looking to improve our service, and your feedback is invaluable to us. Would you please take a moment to share your experience?</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{survey_url}}" style="background-color: #4a154b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Take Our Quick Survey
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">This survey takes only a few minutes to complete and will help us serve you better.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            This survey link expires in {{expiry_days}} days.<br><br>
            Thank you,<br>
            {{company_name}}
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

Thank you for contacting us regarding your recent support request. We hope your issue was resolved to your satisfaction.

We're always looking to improve our service, and your feedback is invaluable to us. Would you please take a moment to share your experience?

Ticket: #{{ticket_number}}
Subject: {{ticket_subject}}

Take our quick survey: {{survey_url}}

This survey takes only a few minutes to complete and will help us serve you better.

This survey link expires in {{expiry_days}} days.

Thank you,
{{company_name}}
        ''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'survey_name': 'Survey name',
            'survey_url': 'Survey URL',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'expiry_days': 'Days until survey expires',
            'agent_name': 'Agent name (if applicable)',
            'company_name': 'Company name',
        }
    },
    {
        'name': 'Survey Reminder',
        'template_type': 'survey_reminder',
        'subject': 'Reminder: We still want to hear from you - {{survey_name}}',
        'body_html': '''
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a154b;">Your Feedback Still Matters!</h2>
        <p>Hi {{customer_name}},</p>
        <p>We noticed you haven't had a chance to complete our survey yet. We'd really appreciate hearing about your experience with our support team.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Ticket:</strong> #{{ticket_number}}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> {{ticket_subject}}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{survey_url}}" style="background-color: #4a154b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Complete Survey Now
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">It only takes a few minutes and helps us improve our service.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Thank you,<br>
            {{company_name}}
        </p>
    </div>
</body>
</html>
        ''',
        'body_text': '''Hi {{customer_name}},

We noticed you haven't had a chance to complete our survey yet. We'd really appreciate hearing about your experience with our support team.

Ticket: #{{ticket_number}}
Subject: {{ticket_subject}}

Complete survey now: {{survey_url}}

It only takes a few minutes and helps us improve our service.

Thank you,
{{company_name}}
        ''',
        'status': 'active',
        'available_variables': {
            'customer_name': 'Customer name',
            'survey_name': 'Survey name',
            'survey_url': 'Survey URL',
            'ticket_number': 'Ticket number',
            'ticket_subject': 'Ticket subject',
            'company_name': 'Company name',
        }
    },
]


# Dictionary mapping for faster lookups
# Usage: DEFAULT_EMAIL_TEMPLATES_DICT['NEW_ACTIVITY_NOTICE'] or DEFAULT_EMAIL_TEMPLATES_DICT['new_activity_notice']
DEFAULT_EMAIL_TEMPLATES_DICT = {
    template['template_type'].upper(): template 
    for template in DEFAULT_EMAIL_TEMPLATES
}
# Also add lowercase keys for convenience
DEFAULT_EMAIL_TEMPLATES_DICT.update({
    template['template_type']: template 
    for template in DEFAULT_EMAIL_TEMPLATES
})


def get_template(template_name):
    """
    Get a template by name (case-insensitive).
    Usage: 
        get_template('NEW_ACTIVITY_NOTICE')
        get_template('new_activity_notice')
    
    Returns:
        dict: Template dictionary or None if not found
    """
    return DEFAULT_EMAIL_TEMPLATES_DICT.get(template_name) or DEFAULT_EMAIL_TEMPLATES_DICT.get(template_name.lower())
