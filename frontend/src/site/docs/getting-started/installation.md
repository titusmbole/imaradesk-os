# Installation Guide

This guide covers the various deployment options for ImaraDesk, including cloud and self-hosted installations.

## Cloud Deployment (Recommended)

The fastest way to get started is with our cloud-hosted solution.

### Getting Started

1. Visit [coredesk.pro/register](https://imaradesk.com/register)
2. Create your organization account
3. Choose your plan (Free tier available)
4. Complete the onboarding wizard

### Benefits of Cloud
- **Zero maintenance** - We handle updates and backups
- **Automatic scaling** - Handle traffic spikes effortlessly
- **99.9% uptime SLA** - Enterprise-grade reliability
- **Daily backups** - Your data is always safe

---

## Self-Hosted Installation

For organizations requiring on-premise deployment.

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 20 GB SSD | 50+ GB SSD |
| Python | 3.10+ | 3.12 |
| Database | PostgreSQL 13+ | PostgreSQL 15+ |

### Docker Installation

The recommended method for self-hosted deployments.

```bash
# Clone the repository
git clone https://github.com/coredesk/coredesk.git
cd coredesk

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start with Docker Compose
docker-compose up -d
```

### Environment Configuration

Configure the following variables in your `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/coredesk

# Application
SECRET_KEY=your-secure-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-password

# Storage
MEDIA_ROOT=/app/media
STATIC_ROOT=/app/static
```

### Manual Installation

For advanced users who prefer manual setup.

#### 1. Create Virtual Environment

```bash
python -m venv env
source env/bin/activate  # Linux/Mac
# or
.\env\Scripts\activate  # Windows
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Database Setup

```bash
# Create PostgreSQL database
createdb coredesk

# Run migrations
python manage.py migrate_schemas --shared
python manage.py migrate_schemas
```

#### 4. Create Superuser

```bash
python manage.py createsuperuser
```

#### 5. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

#### 6. Run the Server

```bash
# Development
python manage.py runserver

# Production (with Gunicorn)
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

---

## Post-Installation

After installation, complete these steps:

### 1. Initial Configuration
- Log in with your admin account
- Navigate to **Settings > General**
- Configure your organization name and branding

### 2. Email Setup
- Go to **Settings > Email**
- Configure your SMTP settings
- Test email delivery

### 3. Security Checklist
- [ ] Change default passwords
- [ ] Enable two-factor authentication
- [ ] Configure SSL/TLS
- [ ] Set up regular backups
- [ ] Review user permissions

---

## Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h localhost -U your_user -d coredesk
```

**Static Files Not Loading**
```bash
# Ensure static files are collected
python manage.py collectstatic --noinput

# Check STATIC_ROOT configuration
```

**Permission Denied**
```bash
# Fix media directory permissions
chmod -R 755 media/
chown -R www-data:www-data media/
```

---

## Upgrading

### Cloud Users
Upgrades are automatic. Check release notes at [coredesk.pro/changelog](https://imaradesk.com/changelog).

### Self-Hosted

```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate_schemas --shared
python manage.py migrate_schemas

# Restart services
sudo systemctl restart coredesk
```

---

**Next:** [Quick Start Guide](/docs/getting-started/quick-start) | [System Requirements](/docs/getting-started/system-requirements)
