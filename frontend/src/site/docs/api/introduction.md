# REST API Reference

Integrate ImaraDesk with your applications using our comprehensive REST API.

## Overview

The ImaraDesk API provides programmatic access to manage tickets, users, knowledge base articles, and more.

### Base URL

```
https://api.coredesk.pro/v1
```

For self-hosted installations:
```
https://your-domain.com/api/v1
```

---

## Authentication

### API Keys

Generate API keys in **Settings > API > API Keys**.

Include your API key in the request header:

```bash
Authorization: Bearer YOUR_API_KEY
```

### OAuth 2.0

For user-specific operations:

```bash
# Step 1: Redirect user to authorize
GET /oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT&response_type=code

# Step 2: Exchange code for token
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=AUTH_CODE&redirect_uri=YOUR_REDIRECT&client_id=YOUR_CLIENT_ID&client_secret=YOUR_SECRET
```

---

## Rate Limits

| Plan | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | 1,000 | Unlimited |

Rate limit headers in response:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1609459200
```

---

## Tickets

### List Tickets

```bash
GET /v1/tickets
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| priority | string | Filter by priority |
| assignee | int | Filter by assignee ID |
| page | int | Page number |
| per_page | int | Results per page (max 100) |

**Response:**

```json
{
  "data": [
    {
      "id": 1234,
      "ticket_number": "INC04E5B",
      "subject": "Cannot login to account",
      "description": "Getting error when trying to login...",
      "status": "open",
      "priority": "high",
      "type": "incident",
      "requester": {
        "id": 56,
        "name": "John Smith",
        "email": "john@example.com"
      },
      "assignee": {
        "id": 12,
        "name": "Jane Agent"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:45:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 10,
    "total_count": 245,
    "per_page": 25
  }
}
```

### Get Ticket

```bash
GET /v1/tickets/{ticket_id}
```

**Response:**

```json
{
  "id": 1234,
  "ticket_number": "INC04E5B",
  "subject": "Cannot login to account",
  "description": "Getting error when trying to login...",
  "status": "open",
  "priority": "high",
  "type": "incident",
  "source": "email",
  "requester": {
    "id": 56,
    "name": "John Smith",
    "email": "john@example.com"
  },
  "assignee": {
    "id": 12,
    "name": "Jane Agent"
  },
  "department": {
    "id": 3,
    "name": "Technical Support"
  },
  "tags": ["login", "urgent"],
  "comments": [
    {
      "id": 1,
      "message": "Original ticket description...",
      "author": {"id": 56, "name": "John Smith"},
      "is_internal": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "attachments": [],
  "sla": {
    "first_response_due": "2024-01-15T11:30:00Z",
    "resolution_due": "2024-01-15T14:30:00Z",
    "first_response_met": true,
    "resolution_met": null
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:45:00Z"
}
```

### Create Ticket

```bash
POST /v1/tickets
Content-Type: application/json
```

**Request Body:**

```json
{
  "subject": "Need help with billing",
  "description": "I have a question about my latest invoice...",
  "priority": "normal",
  "type": "question",
  "requester_email": "customer@example.com",
  "assignee_id": 12,
  "department_id": 2,
  "tags": ["billing", "invoice"]
}
```

**Response:** `201 Created`

```json
{
  "id": 1235,
  "ticket_number": "INC09F2A",
  "subject": "Need help with billing",
  "status": "new",
  "created_at": "2024-01-15T12:00:00Z"
}
```

### Update Ticket

```bash
PATCH /v1/tickets/{ticket_id}
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "in_progress",
  "priority": "high",
  "assignee_id": 15
}
```

### Delete Ticket

```bash
DELETE /v1/tickets/{ticket_id}
```

**Response:** `204 No Content`

---

## Comments

### Add Comment

```bash
POST /v1/tickets/{ticket_id}/comments
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "Thank you for reaching out. Let me help you with this.",
  "is_internal": false
}
```

### List Comments

```bash
GET /v1/tickets/{ticket_id}/comments
```

---

## Users

### List Users

```bash
GET /v1/users
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | Filter by role (admin, agent, viewer) |
| status | string | active, inactive |
| search | string | Search by name/email |

### Get User

```bash
GET /v1/users/{user_id}
```

### Create User

```bash
POST /v1/users
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "new.agent@company.com",
  "first_name": "New",
  "last_name": "Agent",
  "role": "agent",
  "group_ids": [1, 2]
}
```

---

## Knowledge Base

### List Articles

```bash
GET /v1/kb/articles
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| category_id | int | Filter by category |
| status | string | draft, published |
| search | string | Full-text search |

### Get Article

```bash
GET /v1/kb/articles/{slug}
```

### Create Article

```bash
POST /v1/kb/articles
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "How to Reset Your Password",
  "content": "# Password Reset\n\nFollow these steps...",
  "category_id": 5,
  "status": "draft",
  "tags": "password, account, security"
}
```

### List Categories

```bash
GET /v1/kb/categories
```

---

## Customers

### List Customers

```bash
GET /v1/customers
```

### Get Customer

```bash
GET /v1/customers/{customer_id}
```

### Create Customer

```bash
POST /v1/customers
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+1-555-123-4567",
  "tier": "professional",
  "portal_enabled": true
}
```

---

## Webhooks

### Create Webhook

```bash
POST /v1/webhooks
Content-Type: application/json
```

**Request Body:**

```json
{
  "url": "https://your-server.com/webhook",
  "events": ["ticket.created", "ticket.updated", "ticket.resolved"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `ticket.created` | New ticket created |
| `ticket.updated` | Ticket modified |
| `ticket.resolved` | Ticket marked resolved |
| `ticket.assigned` | Ticket assigned |
| `comment.added` | New comment on ticket |
| `user.created` | New user added |

### Webhook Payload

```json
{
  "event": "ticket.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "ticket": {
      "id": 1234,
      "ticket_number": "INC04E5B",
      "subject": "New ticket",
      "status": "new"
    }
  }
}
```

### Verifying Webhooks

Verify webhook signature using HMAC-SHA256:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Server Error |

---

## Pagination

All list endpoints support pagination:

```bash
GET /v1/tickets?page=2&per_page=50
```

**Response includes:**

```json
{
  "data": [...],
  "meta": {
    "current_page": 2,
    "total_pages": 10,
    "total_count": 500,
    "per_page": 50
  },
  "links": {
    "first": "/v1/tickets?page=1&per_page=50",
    "prev": "/v1/tickets?page=1&per_page=50",
    "next": "/v1/tickets?page=3&per_page=50",
    "last": "/v1/tickets?page=10&per_page=50"
  }
}
```

---

## SDKs & Libraries

### Official SDKs

| Language | Package |
|----------|---------|
| Python | `pip install coredesk` |
| Node.js | `npm install @coredesk/api` |
| Ruby | `gem install coredesk` |
| PHP | `composer require coredesk/api` |

### Python Example

```python
from coredesk import ImaraDesk

client = ImaraDesk(api_key="YOUR_API_KEY")

# Create ticket
ticket = client.tickets.create(
    subject="API Created Ticket",
    description="Testing the API",
    priority="high"
)

print(f"Created ticket: {ticket.ticket_number}")
```

### Node.js Example

```javascript
const ImaraDesk = require('@coredesk/api');

const client = new ImaraDesk({ apiKey: 'YOUR_API_KEY' });

// List tickets
const tickets = await client.tickets.list({
  status: 'open',
  page: 1
});

console.log(`Found ${tickets.meta.total_count} tickets`);
```

---

**Next:** [Webhooks](/docs/api/webhooks) | [Authentication](/docs/api/authentication)
