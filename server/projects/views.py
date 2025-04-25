from rest_framework import viewsets, generics, mixins, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.http import FileResponse
from django.db.models import Count, Q
from asgiref.sync import sync_to_async
from messages.models import Message
from server.utils.classes.permissions_classes import IsAdminUser, IsMessageCanBeChanged
from server.utils.classes.mixins import ManipulateMembersFromGroups
from server.utils.classes.viewsets import MessageViewSet, MessageFileViewSet
from server.utils.functions.websockets import send_signal_to_socket
from .permissions import IsProjectCanBeChangedOrDeleted, UserIsMemberOfProject, UserIsOwnerOfTheProject
from .utils import get_project_from_request, get_project_task_from_request
from .filters import TaskFilter, TasksCountFilter
from .models import Project, ProjectTask, ProjectTaskFile
from . import serializers


class BaseViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, UserIsMemberOfProject]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['project_pk'] = self.kwargs.get('project_pk')
        return context


class ProjectsViewSet(ManipulateMembersFromGroups, viewsets.ModelViewSet):
    serializer_class = serializers.ProjectSerializer
    permission_classes = [IsAuthenticated, IsProjectCanBeChangedOrDeleted]

    ADDED_TEXT = 'Пользователи добавлены в проект.'
    USER_IN_OBJ_NOT_FOUND = 'Пользователь в проекте не найден.'

    def get_queryset(self):
        return self.request.user.projects.all().annotate(
            completed_tasks=Count('tasks', filter=Q(tasks__status__is_means_completeness=True)),
            total_tasks=Count('tasks')).select_related('owner')

    def pre_remove(self, request, obj, user):
        user.projects_tasks.filter(project=obj).update(executor=None)

    def pre_leave(self, request, obj, user):
        request.user.projects_tasks.filter(project=obj).update(executor=None)

    def obj_add_members(self, obj, users):
        obj.members.add(*users)

        for user in users:
            send_signal_to_socket('Projects', user.id)

    def obj_remove_member(self, obj, user):
        obj.members.remove(user)
        send_signal_to_socket('Projects', user.id, {
            'project_id': obj.id
        })

    def obj_leave_member(self, obj, user):
        obj.members.remove(user)

    def create_remove_message(self, obj, user):
        Message.objects.create_remove_from_project_message(obj, user)

    def create_leave_message(self, obj, user):
        Message.objects.create_leave_from_project_message(obj, user)

    @action(methods=['POST'], detail=True)
    def add_member(self, request, pk=None):
        return self.handle_member_action(request, 'add')

    @action(methods=['POST'], detail=True)
    def remove_member(self, request, pk=None):
        return self.handle_member_action(request, 'remove')

    @action(methods=['POST'], detail=True, permission_classes=[UserIsMemberOfProject])
    def leave_project(self, request, pk=None):
        return self.handle_member_action(request, 'leave')

    def perform_destroy(self, instance):
        instance_id = instance.id
        members = list(instance.members.all())

        super().perform_destroy(instance)

        for member in members:
            send_signal_to_socket('Projects', member.id, {
                'project_id': instance_id
            })


class TasksViewSet(BaseViewSet, viewsets.ModelViewSet):
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


class StatusesViewSet(BaseViewSet, viewsets.ModelViewSet):
    serializer_class = serializers.StatusSerializer

    def get_queryset(self):
        return get_project_from_request(self.request, self.kwargs).statuses.all().order_by('name')


class PrioritiesViewSet(BaseViewSet, viewsets.ModelViewSet):
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


class ProjectMessageViewSet(BaseViewSet, MessageViewSet):
    serializer_class = serializers.ProjectMessageSerializer
    permission_classes = [IsAuthenticated, IsMessageCanBeChanged]

    def get_queryset(self):
        return get_object_or_404(
            self.request.user.projects.all(),
            pk=self.kwargs.get('project_pk')
        ).project_messages.all().select_related('sender').prefetch_related('files').order_by('-timestamp')


class ProjectMessageFileViewSet(MessageFileViewSet):
    message_serializer = serializers.ProjectMessageSerializer
    serializer_class = serializers.ProjectMessageFileSerializer
    permission_classes = [IsAuthenticated, UserIsMemberOfProject]

    def get_queryset(self):
        return get_object_or_404(self.request.user.project_messages, pk=self.kwargs.get('message_pk')).files


@sync_to_async()
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_projects(request):
    projects = request.user.projects.all()
    projects_serializer = serializers.ShortProjectsSerializer(projects, many=True)
    return Response(projects_serializer.data, status=status.HTTP_200_OK)
