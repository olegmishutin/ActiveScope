from rest_framework import viewsets, generics
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .filters import TasksFilter
from .serializers import TaskListSerializer, TaskSerializer, StatusSerializer, PrioritySerializer


class TaskListView(generics.RetrieveUpdateAPIView):
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.task_list


class TasksViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = TasksFilter

    def get_queryset(self):
        return self.request.user.task_list.tasks.all().defer(
            'task_list').select_related('status', 'priority').order_by('end_date')


class StatusesViewSet(viewsets.ModelViewSet):
    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.task_list.statuses.all().defer('task_list')


class PrioritiesViewSet(viewsets.ModelViewSet):
    serializer_class = PrioritySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.task_list.priorities.all().defer('task_list')
