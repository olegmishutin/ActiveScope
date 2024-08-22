from django.shortcuts import get_object_or_404


def get_project_from_request(request, kwargs):
    return get_object_or_404(request.user.projects.all(), pk=kwargs.get('project_pk'))


def get_project_task_from_request(request, kwargs):
    project = get_project_from_request(request, kwargs)
    return get_object_or_404(project.tasks.all(), pk=kwargs.get('task_pk'))
