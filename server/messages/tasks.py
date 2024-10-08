from django.utils import timezone
from django.contrib.auth import get_user_model
from celery import shared_task
from .models import Message


@shared_task
def check_projects_tasks():
    data = []

    for user in get_user_model().objects.all().prefetch_related(
            'projects_tasks', 'projects_tasks__project', 'projects_tasks__status'):
        for task in user.projects_tasks.all():
            if (not task.status or not task.status.is_means_completeness) and task.end_date:
                data.append({
                    'user': user,
                    'project': task.project,
                    'task': task,
                    'days_left': (task.end_date - timezone.now().date()).days
                })

    Message.objects.bulk_create(Message.objects.get_project_task_messages_objects(data))
