# Generated by Django 5.0.7 on 2024-10-02 14:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('messages', '0003_message_sender_project_task_alter_message_topic'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='days_left',
            field=models.SmallIntegerField(blank=True, editable=False, null=True, verbose_name='остаточные дни'),
        ),
    ]
