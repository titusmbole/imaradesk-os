from django.urls import path, re_path
from . import views


urlpatterns = [
    # Website/Public Schema URLs
    path('', views.landing, name='landing'),
    path('pricing/', views.pricing, name='pricing'),
    path('features/', views.features, name='features'),
    path('blog/', views.blog, name='blog'),
    path('blog/<str:slug>/', views.blog_post, name='blog_post'),
    path('docs/', views.docs, name='docs'),
    re_path(r'^docs/(?P<slug>[\w/-]+)/$', views.docs_page, name='docs_page'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('register/', views.register, name='register'),
    path('registration-success/', views.registration_success, name='registration_success'),
]
