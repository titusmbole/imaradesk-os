"""
Default email templates for backoffice marketing and communications.
These templates are used for email campaigns sent to businesses.

Template Types:
- general: Broadcast emails without personalization (marketing, announcements)
- business: Personalized emails with owner name (Dear {{owner_name}})

Available placeholders for business-specific templates:
- {{owner_name}} - Business owner's name
- {{business_name}} - Business/company name
- {{business_email}} - Business email address
"""

# Theme colors - matches frontend/src/constants/theme.js
PRIMARY_COLOR = '#4a154b'  # Deep purple/magenta
PRIMARY_HOVER = '#5a235c'
PRIMARY_ACTIVE = '#6e3770'
PRIMARY_LIGHT = '#825084'
PRIMARY_DARK = '#320a32'
TEXT_DARK = '#1F2937'
TEXT_LIGHT = '#6B7280'
BG_LIGHT = '#F9FAFB'


def get_base_styles():
    """Return common CSS styles for email templates."""
    return f'''
    body {{
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: {TEXT_DARK};
        background-color: #f4f4f5;
    }}
    .container {{
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }}
    .email-wrapper {{
        background-color: #ffffff;
    }}
    .header {{
        background-color: {PRIMARY_COLOR};
        padding: 20px 30px;
    }}
    .header img {{
        height: 32px;
        width: auto;
    }}
    .content {{
        padding: 30px;
    }}
    .content h2 {{
        color: {TEXT_DARK};
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
    }}
    .content p {{
        color: {TEXT_DARK};
        margin: 0 0 16px 0;
    }}
    .code {{
        font-size: 24px;
        font-weight: 700;
        color: {TEXT_DARK};
        margin: 16px 0;
    }}
    .info-text {{
        color: {PRIMARY_COLOR};
        font-style: italic;
        margin: 16px 0;
    }}
    .btn {{
        display: inline-block;
        background-color: {PRIMARY_COLOR};
        color: #ffffff !important;
        text-decoration: none;
        padding: 12px 24px;
        font-weight: 500;
        font-size: 14px;
        margin: 16px 0;
    }}
    .feature-list {{
        list-style: disc;
        padding-left: 20px;
        margin: 16px 0;
    }}
    .feature-list li {{
        padding: 4px 0;
        color: {TEXT_DARK};
    }}
    .highlight-box {{
        background-color: {BG_LIGHT};
        padding: 16px;
        margin: 16px 0;
    }}
    .footer {{
        padding: 20px 30px;
        text-align: center;
        border-top: 1px solid #e5e5e5;
    }}
    .footer p {{
        color: {TEXT_LIGHT};
        font-size: 12px;
        margin: 0 0 4px 0;
    }}
    .footer a {{
        color: {PRIMARY_COLOR};
        text-decoration: underline;
    }}
    '''


# Default email templates for marketing
DEFAULT_BACKOFFICE_EMAIL_TEMPLATES = [
    # ===========================================
    # GENERAL TEMPLATES (Broadcast - No personalization)
    # ===========================================
    {
        'name': 'Product Update Announcement',
        'slug': 'product-update-announcement',
        'template_type': 'general',
        'category': 'announcement',
        'subject': 'New Features Just Released!',
        'preview_text': 'See what\'s new in ImaraDesk this month',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Update</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>What's New</h2>
                <p>We've shipped some updates we think you'll love. Here's what's new:</p>
                
                <ul class="feature-list">
                    <li><strong>Feature 1</strong> — A brief description of what it does</li>
                    <li><strong>Feature 2</strong> — A brief description of what it does</li>
                    <li><strong>Feature 3</strong> — A brief description of what it does</li>
                </ul>
                
                <div class="highlight-box">
                    <strong>Good news:</strong> These features are already live in your account. Just log in to try them out.
                </div>
                
                <p style="text-align: center;">
                    <a href="https://imaradesk.com/login" class="btn">See What's New</a>
                </p>
                
                <p>As always, we'd love to hear what you think. Just reply to this email with your feedback.</p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>You're receiving this because you have a ImaraDesk account.</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    {
        'name': 'Monthly Newsletter',
        'slug': 'monthly-newsletter',
        'template_type': 'general',
        'category': 'newsletter',
        'subject': 'Your Monthly ImaraDesk Roundup',
        'preview_text': 'Tips, updates, and what\'s coming next',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Newsletter</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>Monthly Roundup</h2>
                <p>Here's a quick look at what we've been up to and what's coming next.</p>
                
                <div class="highlight-box">
                    <strong>This Month's Highlights</strong>
                    <p>ImaraDesk users resolved over <strong>50,000 tickets</strong> this month with an average response time of <strong>under 2 hours</strong>. Nice work!</p>
                </div>
                
                <h2>Quick Tips</h2>
                <ul class="feature-list">
                    <li><strong>Canned responses</strong> — Save your common replies and use them with a click</li>
                    <li><strong>SLA rules</strong> — Set response time targets to keep your team on track</li>
                    <li><strong>Knowledge base</strong> — Help customers help themselves</li>
                </ul>
                
                <h2>Coming Soon</h2>
                <p>We're working on some exciting improvements that should be ready next month. Stay tuned!</p>
                
                <p style="text-align: center;">
                    <a href="https://imaradesk.com/login" class="btn">Open Dashboard</a>
                </p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>You're receiving this because you have a ImaraDesk account.</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    {
        'name': 'Marketing - Special Offer',
        'slug': 'marketing-special-offer',
        'template_type': 'general',
        'category': 'marketing',
        'subject': 'A little something for you — 20% off upgrades',
        'preview_text': 'Limited time offer for ImaraDesk customers',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Special Offer</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>Special Offer</h2>
                <p>We wanted to say thanks for being a ImaraDesk customer. Here's <strong>20% off</strong> any plan upgrade — just use the code below.</p>
                
                <p class="code">UPGRADE20</p>
                <p class="info-text">Enter this code at checkout</p>
                
                <h2>What you get with an upgrade</h2>
                <ul class="feature-list">
                    <li>More agent seats for your growing team</li>
                    <li>Advanced automation and workflows</li>
                    <li>Priority support</li>
                    <li>Advanced analytics and reporting</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="https://imaradesk.com/login" class="btn">Upgrade Now</a>
                </p>
                
                <p style="font-size: 12px;">
                    Offer valid for 7 days.
                </p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>You're receiving this because you have a ImaraDesk account.</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    {
        'name': 'Security Update Notice',
        'slug': 'security-update-notice',
        'template_type': 'general',
        'category': 'security',
        'subject': 'Security Update — Please Read',
        'preview_text': 'Important information about your account security',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Update</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>Security Update</h2>
                <p>We wanted to let you know about some security improvements we've made to keep your data protected.</p>
                
                <div class="highlight-box">
                    <strong>What's changed:</strong>
                    <p>We've added enhanced encryption and improved our authentication system. Your data is safer than ever.</p>
                </div>
                
                <h2>A few things you can do</h2>
                <ul class="feature-list">
                    <li>Enable two-factor authentication if you haven't already</li>
                    <li>Review who has access to your account</li>
                    <li>Update your password if it's been a while</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="https://imaradesk.com/login" class="btn">Review Security Settings</a>
                </p>
                
                <p>Questions? Just reply to this email and we'll help you out.</p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>security@coredesk.pro</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    {
        'name': 'Scheduled Maintenance',
        'slug': 'scheduled-maintenance',
        'template_type': 'general',
        'category': 'maintenance',
        'subject': 'Heads up: Scheduled maintenance this weekend',
        'preview_text': 'Brief downtime scheduled for maintenance',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maintenance Notice</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>Scheduled Maintenance</h2>
                <p>We'll be doing some maintenance to keep things running smoothly. Here's what you need to know:</p>
                
                <div class="highlight-box">
                    <p><strong>When:</strong> [DATE] at [TIME] UTC</p>
                    <p><strong>How long:</strong> About 30 minutes</p>
                </div>
                
                <h2>What to expect</h2>
                <ul class="feature-list">
                    <li>ImaraDesk may be temporarily unavailable during this window</li>
                    <li>Your data is safe — nothing will be lost</li>
                    <li>Any scheduled emails or automations will resume afterward</li>
                </ul>
                
                <p>We've picked a low-traffic time to minimize disruption. Thanks for your patience!</p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>Questions? Reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    {
        'name': 'Tips & Tricks',
        'slug': 'tips-and-tricks',
        'template_type': 'general',
        'category': 'tips',
        'subject': '3 tips to get more out of ImaraDesk',
        'preview_text': 'Work smarter with these quick tips',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tips & Tricks</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>Quick Tips</h2>
                <p>Here are a few tips that can save you time every day:</p>
                
                <div class="highlight-box">
                    <strong>Tip #1: Keyboard shortcuts</strong>
                    <p>Press <strong>Ctrl/Cmd + K</strong> to quickly search for anything. Use <strong>Ctrl/Cmd + Enter</strong> to send replies faster.</p>
                </div>
                
                <div class="highlight-box">
                    <strong>Tip #2: Canned responses</strong>
                    <p>Create templates for your common replies. You can even use placeholders like {{'{{'}}customer_name{{'}}'}} for personalization.</p>
                </div>
                
                <div class="highlight-box">
                    <strong>Tip #3: Tags and filters</strong>
                    <p>Organize tickets with tags, then create saved filters to quickly find what you need.</p>
                </div>
                
                <p style="text-align: center;">
                    <a href="https://imaradesk.com/help" class="btn">More Tips</a>
                </p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>You're receiving this because you have a ImaraDesk account.</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    
    # ===========================================
    # BUSINESS-SPECIFIC TEMPLATES (Personalized)
    # ===========================================
    {
        'name': 'Welcome New Business',
        'slug': 'welcome-new-business',
        'template_type': 'business',
        'category': 'announcement',
        'subject': 'Welcome aboard, {{owner_name}}!',
        'preview_text': 'Everything you need to get started',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ImaraDesk</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>Welcome, {{{{owner_name}}}}!</h2>
                <p>Thanks for signing up for ImaraDesk! We're excited to help you deliver great customer support at <strong>{{{{business_name}}}}</strong>.</p>
                
                <h2>Here's how to get started</h2>
                <ul class="feature-list">
                    <li><strong>Invite your team</strong> — Add agents and set their permissions</li>
                    <li><strong>Connect your email</strong> — Start receiving support tickets</li>
                    <li><strong>Set up your portal</strong> — Customize it with your brand</li>
                    <li><strong>Create canned responses</strong> — Speed up your replies</li>
                </ul>
                
                <p style="text-align: center;">
                    <a href="https://imaradesk.com/login" class="btn">Get Started</a>
                </p>
                
                <div class="highlight-box">
                    <strong>Need help?</strong> Just reply to this email. We're here for you.
                </div>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>We're excited to have you!</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    {
        'name': 'Trial Ending Reminder',
        'slug': 'trial-ending-reminder',
        'template_type': 'business',
        'category': 'announcement',
        'subject': '{{owner_name}}, your trial ends in 3 days',
        'preview_text': 'Don\'t lose your data — upgrade today',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trial Ending</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>Trial Ending Soon</h2>
                <p>Hey {{{{owner_name}}}}, just a heads up — your free trial for <strong>{{{{business_name}}}}</strong> ends in 3 days.</p>
                
                <div class="highlight-box">
                    <strong>What happens next?</strong>
                    <ul class="feature-list">
                        <li>Your data stays safe for 30 days after the trial ends</li>
                        <li>You can upgrade anytime to restore full access</li>
                        <li>All your settings and customizations will be waiting for you</li>
                    </ul>
                </div>
                
                <p style="text-align: center;">
                    <a href="https://imaradesk.com/login" class="btn">Upgrade Now</a>
                </p>
                
                <p>Not sure which plan is right for you? Reply to this email and we'll help you figure it out.</p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>We're here if you have questions.</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    {
        'name': 'Personalized Feature Update',
        'slug': 'personalized-feature-update',
        'template_type': 'business',
        'category': 'new_release',
        'subject': 'New features ready for {{business_name}}',
        'preview_text': 'We just shipped something you\'ll like',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Features</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>New Features</h2>
                <p>Hey {{{{owner_name}}}}, we just released some new features and wanted to make sure you knew about them.</p>
                
                <p><strong>What's new:</strong></p>
                <ul class="feature-list">
                    <li><strong>Feature 1</strong> — What it does and why you'll love it</li>
                    <li><strong>Feature 2</strong> — What it does and why you'll love it</li>
                    <li><strong>Feature 3</strong> — What it does and why you'll love it</li>
                </ul>
                
                <div class="highlight-box">
                    <strong>Already available:</strong> These features are live in your <strong>{{{{business_name}}}}</strong> account right now.
                </div>
                
                <p style="text-align: center;">
                    <a href="https://imaradesk.com/login" class="btn">Try Them Out</a>
                </p>
                
                <p>Let us know what you think!</p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>Your feedback shapes what we build next.</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    {
        'name': 'Account Review Invitation',
        'slug': 'account-review-invitation',
        'template_type': 'business',
        'category': 'tips',
        'subject': '{{owner_name}}, want a free account review?',
        'preview_text': '15 minutes that could save you hours',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Review</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>Free Account Review</h2>
                <p>Hey {{{{owner_name}}}}, you've been using ImaraDesk for a while now, and I wanted to offer you something: a free 15-minute account review.</p>
                
                <div class="highlight-box">
                    <strong>What's included:</strong>
                    <ul class="feature-list">
                        <li>A quick look at how {{{{business_name}}}} is using ImaraDesk</li>
                        <li>Tips specific to your setup</li>
                        <li>Answers to any questions you have</li>
                        <li>Best practices from similar teams</li>
                    </ul>
                </div>
                
                <p>No sales pitch, just help. If you're interested, just reply to this email with a couple times that work for you.</p>
                
                <p style="text-align: center;">
                    <a href="mailto:support@coredesk.pro?subject=Account%20Review%20Request" class="btn">Request a Review</a>
                </p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>Here to help you succeed.</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
    {
        'name': 'Re-engagement Email',
        'slug': 're-engagement-email',
        'template_type': 'business',
        'category': 'marketing',
        'subject': 'We miss you, {{owner_name}}',
        'preview_text': 'A lot has changed since you were last here',
        'html_content': f'''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We Miss You</title>
    <style>{get_base_styles()}</style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <img src="https://imaradesk.com/static/assets/imaradesk-logo.png" alt="ImaraDesk">
            </div>
            <div class="content">
                <h2>We miss you!</h2>
                <p>Hey {{{{owner_name}}}}, we noticed it's been a while since you logged into <strong>{{{{business_name}}}}</strong>'s ImaraDesk account. Just wanted to let you know we've added a bunch of new stuff:</p>
                
                <ul class="feature-list">
                    <li>New automations to save your team time</li>
                    <li>Better reporting with actionable insights</li>
                    <li>Faster, cleaner interface</li>
                    <li>New integrations with tools you use</li>
                </ul>
                
                <div class="highlight-box">
                    <strong>Welcome back offer:</strong> Come back today and get <strong>1 month free</strong> on any plan upgrade.
                </div>
                
                <p style="text-align: center;">
                    <a href="https://imaradesk.com/login" class="btn">See What's New</a>
                </p>
                
                <p>If there's anything stopping you from using ImaraDesk, I'd genuinely love to hear about it. Just reply to this email.</p>
            </div>
            <div class="footer">
                <p>ImaraDesk</p>
                <p>We're always improving.</p>
            </div>
        </div>
    </div>
</body>
</html>
        ''',
    },
]
