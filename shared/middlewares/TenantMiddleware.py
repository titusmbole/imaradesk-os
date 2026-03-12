from django.shortcuts import redirect
from django.http import Http404
from django.template.response import TemplateResponse
from django_tenants.middleware.main import TenantMainMiddleware
from django_tenants.utils import get_public_schema_name


class CustomTenantMiddleware(TenantMainMiddleware):
    """
    Custom tenant middleware that redirects to primary domain
    when tenant is not found instead of showing 404 error.
    Also shows an inactive page when the tenant is deactivated.
    """
    
    def get_tenant(self, domain_model, hostname):
        """
        Override to handle missing tenant gracefully.
        If no tenant found, redirect to the public schema (localhost).
        """
        try:
            return super().get_tenant(domain_model, hostname)
        except Http404:
            # Tenant not found - this happens when accessing a non-existent subdomain
            # Redirect to the public domain instead of showing 404
            public_schema = get_public_schema_name()
            return domain_model.objects.get(schema_name=public_schema)
    
    def process_request(self, request):
        """
        Override to add redirect logic when tenant domain doesn't exist
        and show inactive page when tenant is deactivated.
        """
        from django.conf import settings
        
        hostname = self.hostname_from_request(request)
        
        # Remove port from hostname for checking
        hostname_no_port = hostname.split(':')[0] if ':' in hostname else hostname
        
        # Check if this is a subdomain
        if '.' in hostname_no_port:
            # Check if tenant exists for the full hostname (with port)
            from shared.models import Domain
            if not Domain.objects.filter(domain=hostname).exists():
                # Redirect to primary domain from settings
                from urllib.parse import urlparse
                parsed = urlparse(settings.PRIMARY_DOMAIN)
                
                if parsed.scheme:
                    redirect_url = f"{settings.PRIMARY_DOMAIN}{request.path}"
                else:
                    # Assume http for localhost, https for others
                    if 'localhost' in settings.PRIMARY_DOMAIN or '127.0.0.1' in settings.PRIMARY_DOMAIN:
                        redirect_url = f"http://{settings.PRIMARY_DOMAIN}{request.path}"
                    else:
                        redirect_url = f"https://{settings.PRIMARY_DOMAIN}{request.path}"
                
                # IMPORTANT: Preserve query string (e.g., OAuth callback params)
                if request.META.get('QUERY_STRING'):
                    redirect_url = f"{redirect_url}?{request.META['QUERY_STRING']}"
                
                return redirect(redirect_url)
        
        # Continue with normal tenant processing
        response = super().process_request(request)
        
        # After tenant is set, check if it's active
        if hasattr(request, 'tenant') and request.tenant:
            tenant = request.tenant
            public_schema = get_public_schema_name()
            
            # Skip check for public schema
            if tenant.schema_name != public_schema:
                # Check if tenant is active
                if not getattr(tenant, 'is_active', True):
                    # Return inactive page - must render before returning from middleware
                    response = TemplateResponse(
                        request,
                        'inactive.html',
                        {'business_name': tenant.name or tenant.schema_name},
                        status=403
                    )
                    response.render()
                    return response
        
        return response
