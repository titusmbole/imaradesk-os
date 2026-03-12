# Generated migration for adding is_internal field to TicketAttachment

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0003_add_task_draft_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticketattachment',
            name='is_internal',
            field=models.BooleanField(default=False, help_text='Internal attachments are only visible to agents'),
        ),
    ]
