from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import UserTaskSerializer, UserTaskListStatusSerializer


class TasksViewSet(viewsets.ModelViewSet):
    serializer_class = UserTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.task_list.tasks.all().select_related('status')


class StatusesViewSet(viewsets.ModelViewSet):
    serializer_class = UserTaskListStatusSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.task_list.statuses.all()
