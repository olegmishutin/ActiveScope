from rest_framework import viewsets, generics, mixins, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.http import FileResponse
from django.db.models import Count, Q
from asgiref.sync import sync_to_async
from messages.models import Message
from groups.models import Group
from server.utils.classes.permissions_classes import IsAdminUser
from .permissions import IsProjectCanBeChangedOrDeleted, UserIsMemberOfProject, UserIsOwnerOfTheProject
from .utils import get_project_from_request, get_project_task_from_request
from .filters import TaskFilter, TasksCountFilter
from .models import Project, ProjectTask, ProjectTaskFile
from . import serializers


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, UserIsMemberOfProject]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['project_pk'] = self.kwargs.get('project_pk')
        return context


class ProjectsViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ProjectSerializer
    permission_classes = [IsAuthenticated, IsProjectCanBeChangedOrDeleted]

    def get_queryset(self):
        return self.request.user.projects.all().annotate(
            completed_tasks=Count('tasks', filter=Q(tasks__status__is_means_completeness=True)),
            total_tasks=Count('tasks')).select_related('owner')

    def handle_member_action(self, request, action):
        project = self.get_object()

        if action == 'add':
            users_ids = request.data.get('users_ids')
            users = get_user_model().objects.filter(id__in=users_ids).only('id', 'email')

            if users:
                group = get_object_or_404(Group.objects.filter(founder=request.user), pk=request.data.get('group_id'))

                if group.members.filter(id__in=users.values_list('id', flat=True)).exists():
                    project.members.add(*users)
                    return Response({'detail': 'Пользователи добавлены в проект.'}, status=status.HTTP_200_OK)

                raise ValidationError({'detail': 'Пользователь в группе не найден.'})
            raise ValidationError({'detail': 'Пользователи не найдены.'})

        elif action == 'remove':
            user = get_object_or_404(get_user_model().objects.all().only('id', 'email'), pk=request.data.get('user_id'))

            if project.members.filter(id=user.id).exists():
                user.projects_tasks.filter(project=project).update(executor=None)

                project.members.remove(user)
                Message.objects.create_remove_from_project_message(project, user)

                return Response(status=status.HTTP_200_OK)
            return ValidationError({'detail': 'Пользователь в проекте не найден.'})

        elif action == 'leave':
            request.user.projects_tasks.filter(project=project).update(executor=None)
            project.members.remove(request.user)

            Message.objects.create_leave_from_project_message(project, request.user)
            return Response(status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def add_member(self, request, pk=None):
        return self.handle_member_action(request, 'add')

    @action(methods=['POST'], detail=True)
    def remove_member(self, request, pk=None):
        return self.handle_member_action(request, 'remove')

    @action(methods=['POST'], detail=True, permission_classes=[UserIsMemberOfProject])
    def leave_project(self, request, pk=None):
        return self.handle_member_action(request, 'leave')


class TasksViewSet(BaseViewSet):
    serializer_class = serializers.TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TaskFilter

    def get_queryset(self):
        return get_project_from_request(self.request, self.kwargs).tasks.all().order_by('name').select_related(
            'executor', 'status', 'priority')


class MembersView(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.MemberSerializer
    permission_classes = [IsAuthenticated, UserIsOwnerOfTheProject]
    filter_backends = [SearchFilter]
    search_fields = ['email', 'first_name', 'last_name', 'patronymic']

    def get_queryset(self):
        return get_project_from_request(self.request, self.kwargs).members.all().annotate(
            tasks_count=Count(
                'projects_tasks', filter=Q(projects_tasks__project_id=self.kwargs.get('project_pk'))))


class StatusesViewSet(BaseViewSet):
    serializer_class = serializers.StatusSerializer

    def get_queryset(self):
        return get_project_from_request(self.request, self.kwargs).statuses.all().order_by('name')


class PrioritiesViewSet(BaseViewSet):
    serializer_class = serializers.PrioritySerializer

    def get_queryset(self):
        return get_project_from_request(self.request, self.kwargs).priorities.all().order_by('name')


class TaskFilesViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin,
                       mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.TaskFilesSerializer

    def get_queryset(self):
        return get_project_task_from_request(self.request, self.kwargs).files.all()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['task_id'] = self.kwargs.get('task_pk')
        return context

    def get_permissions(self):
        if self.action != 'retrieve':
            return [IsAuthenticated(), UserIsMemberOfProject()]
        return []

    def create(self, request, *args, **kwargs):
        file_serializer = self.get_serializer(data=request.data)
        file_serializer.is_valid(raise_exception=True)
        created_files = file_serializer.save()

        ret_data = self.get_serializer(created_files, many=True).data
        headers = self.get_success_headers(ret_data)

        return Response(ret_data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        instance = get_object_or_404(self.serializer_class.Meta.model.objects.all(), pk=self.kwargs['pk'])
        return FileResponse(open(instance.file.path, 'rb'), as_attachment=True)


class UserProjectsView(generics.ListAPIView):
    serializer_class = serializers.ProjectBaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [OrderingFilter, DjangoFilterBackend]
    ordering_fields = ['total_tasks']
    filterset_class = TasksCountFilter

    def get_queryset(self):
        user = get_object_or_404(get_user_model().objects.all(), pk=self.kwargs.get('user_id'))
        return user.projects.all().annotate(
            completed_tasks=Count('tasks', filter=Q(tasks__status__is_means_completeness=True)),
            total_tasks=Count('tasks')).select_related('owner')


class AdminProjectsViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.AdminProjectsSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    ordering_fields = ['total_tasks']
    search_fields = ['name']
    filterset_class = TasksCountFilter

    def get_queryset(self):
        return Project.objects.all().annotate(
            completed_tasks=Count('tasks', filter=Q(tasks__status__is_means_completeness=True)),
            total_tasks=Count('tasks')).select_related('owner').prefetch_related('tasks', 'tasks__executor')


class AdminTasksFilesListView(generics.ListAPIView):
    serializer_class = serializers.TaskFilesSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        task = get_object_or_404(ProjectTask.objects.all(), pk=self.kwargs.get('task_pk'))
        return task.files.all()


class AdminFileView(generics.RetrieveAPIView):
    queryset = ProjectTaskFile.objects.all()
    serializer_class = serializers.TaskFilesSerializer
    permission_classes = [IsAdminUser]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return FileResponse(open(instance.file.path, 'rb'), as_attachment=True)


@sync_to_async()
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_projects(request):
    projects = request.user.projects.all()
    projects_serializer = serializers.ShortProjectsSerializer(projects, many=True)
    return Response(projects_serializer.data, status=status.HTTP_200_OK)
