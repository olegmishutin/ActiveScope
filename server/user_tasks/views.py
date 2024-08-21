from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from server.utils.classes.filters import TasksFilter
from server.utils.classes.viewsets import TaskFilesBaseViewSet
from . import serializers


class TaskListView(generics.RetrieveUpdateAPIView):
    serializer_class = serializers.TaskListSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.task_list


class TasksViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = TasksFilter

    def get_queryset(self):
        return self.request.user.task_list.tasks.all().defer(
            'task_list').select_related('status', 'priority').order_by('end_date')


class StatusesViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.StatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.task_list.statuses.all().defer('task_list')


class PrioritiesViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PrioritySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.task_list.priorities.all().defer('task_list')


class TaskFilesViewSet(TaskFilesBaseViewSet):
    serializer_class = serializers.FileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_object_or_404(
            self.request.user.task_list.tasks.all(), pk=self.kwargs.get('task_pk')).files.all().defer('task')
