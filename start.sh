#!/bin/bash
set -e

echo "Starting ImaraDesk Application..."

# Create logs directory (will be mounted to host)
mkdir -p /app/logs
echo "✓ Logs directory ready at /app/logs"

# Set default environment variables if not set
export GUNICORN_WORKERS=${GUNICORN_WORKERS:-4}
export CELERY_CONCURRENCY=${CELERY_CONCURRENCY:-2}

# Run migrations for shared apps (public)
echo "Running migrations for public schema..."
python manage.py migrate_schemas --shared --noinput

# Run migrations for all tenant schemas
echo "Running migrations for all tenant schemas..."
python manage.py migrate_schemas --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Load admin data
# echo "Loading admin data..."
# python3 manage.py admin --all
# python manage.py admin --seed-email-templates
# python manage.py admin --reinit-templates

# Load initial data (creates public tenant)
echo "Loading initial data..."
python manage.py coredesk 

# echo "Sending verification links"
# python3 manage.py coredesk --reverify-businesses


# echo "Seeding marketplace apps for all tenants.."
# python manage.py coredesk --seed-apps

# echo "Seeding email templates for all tenants..."
# python manage.py coredesk --seed-email-templates
python manage.py coredesk --reseed-email-templates

# echo "Seeding views for all tenants..."
# python manage.py coredesk --init-views

# echo "Seeding integrations for all tenants..."
# python manage.py coredesk --seed-integrations

# python manage.py coredesk --update-integration-icons

# echo "Seeding assets for all tenants.. "
# python manage.py coredesk --seed-assets

# echo "Seeding support emails..."
# python manage.py coredesk --seed-help-emails

# echo "Seeding ssls for existing tenants .... "
# python manage.py coredesk --set-ssl



echo "Starting services with Supervisor..."
echo "  - Gunicorn (Django web server) on port 8000"
echo "  - Celery Worker (background tasks)"
echo "  - Celery Beat (scheduled tasks - email polling every 10s)"

exec supervisord -c /app/supervisord.conf

