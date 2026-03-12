from django.urls import path
from . import views

urlpatterns = [
    path('people/', views.people, name='people'),
    path('people/add/', views.user_create, name='user_create'),
    path('people/<int:id>/edit/', views.user_edit, name='user_edit'),
    path('people/<int:id>/delete/', views.user_delete, name='user_delete'),
    path('organizations/', views.organizations, name='organizations'),
    path('organizations/new/', views.organization_create, name='organization_create'),
    path('organizations/<int:id>/edit/', views.organization_edit, name='organization_edit'),
    path('organizations/<int:id>/delete/', views.organization_delete, name='organization_delete'),
]

