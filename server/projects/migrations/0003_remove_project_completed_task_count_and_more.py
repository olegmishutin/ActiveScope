# Generated by Django 5.0.7 on 2024-08-21 12:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_alter_project_completed_task_count_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='completed_task_count',
        ),
        migrations.RemoveField(
            model_name='project',
            name='task_count',
        ),
    ]
