from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.tasks, name='tasks'),
    path('tasks/new/', views.add_task, name='add_task'),
    path('tasks/bulk/mark-draft/', views.bulk_mark_draft, name='bulk_mark_draft_tasks'),
    path('tasks/<int:id>/', views.task_view, name='task_view'),
    path('tasks/<int:id>/comment/', views.task_add_comment, name='task_add_comment'),
    path('tasks/<int:id>/attachment/', views.task_upload_attachment, name='task_upload_attachment'),
    path('tasks/<int:id>/update/', views.task_update_fields, name='task_update_fields'),
    path('tickets/<int:ticket_id>/convert-to-task/', views.convert_ticket_to_task, name='convert_ticket_to_task'),
    path('tickets/<int:ticket_id>/create-task/', views.create_task_from_ticket, name='create_task_from_ticket'),
]

