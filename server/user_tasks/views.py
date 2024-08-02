from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django_filters.rest_framework import DjangoFilterBackend
from .filters import TasksFilter
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


class TaskFilesBase(generics.GenericAPIView):
    serializer_class = serializers.FileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return get_object_or_404(self.request.user.task_list.tasks, pk=self.kwargs.get('task_id')).files.all()


class TaskFilesView(TaskFilesBase, generics.ListCreateAPIView):
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['task_id'] = self.kwargs.get('task_id')
        return context

    def create(self, request, *args, **kwargs):
        file_serializer = self.get_serializer(data=request.data)
        file_serializer.is_valid(raise_exception=True)
        created_files = file_serializer.save()

        ret_data = self.get_serializer(created_files, many=True).data
        headers = self.get_success_headers(ret_data)

        return Response(ret_data, status=status.HTTP_201_CREATED, headers=headers)


class TaskFilesDetailView(TaskFilesBase, generics.RetrieveDestroyAPIView):
    def retrieve(self, request, *args, **kwargs):
        insctance = self.get_object()
        return FileResponse(open(insctance.file.path, 'rb'), as_attachment=True)
