# Knowledge Base

Create and manage self-service documentation to help customers find answers without submitting tickets.

## Overview

The Knowledge Base module allows you to:
- Create searchable articles
- Organize content by categories
- Track article performance
- Enable customer self-service

---

## Getting Started

### Accessing the Knowledge Base

**For Agents:**
Navigate to **Knowledge Base** in the main sidebar to access the management interface.

**For Customers:**
The public knowledge base is available at your portal URL `/kb` or `/help`.

---

## Categories

### Creating Categories

Categories help organize articles by topic:

1. Go to **Knowledge Base > Categories**
2. Click **+ New Category**
3. Fill in details:

| Field | Description |
|-------|-------------|
| **Name** | Category title |
| **Description** | Brief explanation |
| **Icon** | Emoji or icon identifier |
| **Parent** | Optional parent category |

### Category Structure

```
📚 Knowledge Base
├── 🚀 Getting Started
│   ├── Quick Start Guide
│   ├── Account Setup
│   └── First Steps
├── 💳 Billing & Payments
│   ├── Payment Methods
│   ├── Invoices
│   └── Refund Policy
├── 🔧 Technical Support
│   ├── Troubleshooting
│   ├── Error Messages
│   └── System Requirements
└── ❓ FAQ
    ├── General Questions
    └── Account FAQ
```

### Category Settings

| Setting | Description |
|---------|-------------|
| **Visibility** | Public or internal only |
| **Order** | Display sequence |
| **Featured** | Show on homepage |

---

## Articles

### Creating Articles

1. Go to **Knowledge Base > Articles**
2. Click **+ New Article**
3. Fill in the article form

### Article Fields

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | Yes | Article headline |
| **Category** | Yes | Parent category |
| **Summary** | No | Brief description for search results |
| **Content** | Yes | Full article content (Markdown supported) |
| **Tags** | No | Keywords for search |
| **Status** | Yes | Draft, Pending, or Published |

### Rich Content Editor

The editor supports:

```markdown
# Headings
## Subheadings
### Sub-subheadings

**Bold** and *italic* text

- Bullet lists
- More items

1. Numbered lists
2. Second item

> Blockquotes for important notes

`inline code`

\`\`\`python
# Code blocks with syntax highlighting
def hello():
    print("Hello, World!")
\`\`\`

[Links](https://example.com)

![Images](/path/to/image.png)

| Tables | Are | Supported |
|--------|-----|-----------|
| Data   | More| Content   |
```

### Article Status

| Status | Description |
|--------|-------------|
| **Draft** | Work in progress, not visible |
| **Pending Review** | Ready for approval |
| **Published** | Live and visible to customers |

---

## Content Management

### Article Workflow

```
┌───────┐    ┌─────────────┐    ┌───────────┐
│ Draft │───▶│ Pending     │───▶│ Published │
└───────┘    │ Review      │    └───────────┘
     │       └─────────────┘          │
     │              │                 │
     └──────────────┴─────────────────┘
              (can revert)
```

### Versioning

Track article changes over time:

- Automatic version history
- Compare versions
- Restore previous versions
- Track editors

### Featured Articles

Highlight important articles:

1. Open article
2. Toggle **Featured** option
3. Featured articles appear prominently

---

## Search & Discovery

### How Search Works

The knowledge base search indexes:
- Article titles
- Content text
- Tags
- Category names

### Search Optimization Tips

1. **Use descriptive titles**: "How to Reset Password" vs "Password"
2. **Add relevant tags**: Include synonyms and related terms
3. **Write clear summaries**: Help search results display useful previews
4. **Structure content**: Use headings for better indexing

### SEO Settings

For public knowledge bases:

| Setting | Purpose |
|---------|---------|
| **Meta Title** | Custom title for search engines |
| **Meta Description** | Search result description |
| **Canonical URL** | Preferred URL version |
| **No Index** | Exclude from search engines |

---

## Analytics

### Article Metrics

Track performance in **Knowledge Base > Analytics**:

| Metric | Description |
|--------|-------------|
| **Views** | Total article views |
| **Unique Views** | Distinct visitors |
| **Avg. Time on Page** | Engagement indicator |
| **Search Appearances** | Times shown in search |
| **Click-through Rate** | Searches → Article views |

### Feedback Tracking

Enable article feedback:

```
┌─────────────────────────────────────────┐
│ Was this article helpful?               │
│                                         │
│   👍 Yes (helpful)    👎 No (not useful) │
│                                         │
│ [Optional feedback comment]             │
└─────────────────────────────────────────┘
```

### Reports

Generate reports for:
- Most viewed articles
- Articles needing updates
- Search terms with no results
- Category performance

---

## Ticket Integration

### Linking Articles

From a ticket:

1. Click **Link Article** in reply toolbar
2. Search knowledge base
3. Insert link or embed preview

### Suggested Articles

When creating tickets, customers see relevant articles:

```
┌─────────────────────────────────────────┐
│ Before submitting, try these articles:  │
├─────────────────────────────────────────┤
│ 📄 How to Reset Your Password           │
│ 📄 Account Login Troubleshooting        │
│ 📄 Two-Factor Authentication Guide      │
└─────────────────────────────────────────┘
```

### Article from Ticket

Convert ticket solutions to articles:

1. Open resolved ticket
2. Click **Convert to Article**
3. Edit and format content
4. Publish to knowledge base

---

## Access Control

### Visibility Options

| Level | Access |
|-------|--------|
| **Public** | Anyone can view |
| **Customers Only** | Logged-in portal users |
| **Internal** | Agents and admins only |

### Customer-Specific Content

Create content for specific customers:

1. Create internal category
2. Tag articles with customer name
3. Share direct links

---

## Multi-Language Support

### Enabling Translations

1. Go to **Settings > Knowledge Base**
2. Enable multi-language mode
3. Add supported languages

### Managing Translations

| Field | Description |
|-------|-------------|
| **Primary Language** | Default content language |
| **Translations** | Article versions per language |
| **Auto-Translate** | Optional AI translation |

---

## Best Practices

### Writing Effective Articles

✅ **Do:**
- Start with the problem/question
- Use clear, simple language
- Include step-by-step instructions
- Add screenshots for complex steps
- Keep articles focused (one topic)

❌ **Avoid:**
- Jargon without explanation
- Walls of text
- Outdated information
- Broken links/images

### Content Organization

```
Good Article Structure:

1. ❓ Problem Statement (what this solves)
2. 📋 Prerequisites (what you need)
3. 📝 Steps (how to do it)
4. 💡 Tips (helpful extras)
5. ❓ FAQ (common questions)
6. 🔗 Related Articles
```

### Maintenance Schedule

| Task | Frequency |
|------|-----------|
| Review analytics | Weekly |
| Update outdated content | Monthly |
| Check broken links | Monthly |
| Remove obsolete articles | Quarterly |
| Survey customer needs | Quarterly |

---

## API Access

### List Articles

```bash
GET /api/v1/kb/articles
```

### Get Article

```bash
GET /api/v1/kb/articles/{slug}
```

### Search

```bash
GET /api/v1/kb/search?q=password+reset
```

---

**Next:** [SLA Configuration](/docs/features/sla-configuration) | [Customer Portal](/docs/features/customer-portal)
