from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from messages.models import Message
from groups.models import Group
from server.utils.classes.viewsets import TaskFilesBaseViewSet
from .permissions import IsProjectCanBeChangedOrDeleted, UserIsMemberOfProject, UserIsOwnerOfTheProject
from .utils import get_project_from_request
from .filters import TaskFilter
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
            total_tasks=Count('tasks'))


class TasksViewSet(BaseViewSet):
    serializer_class = serializers.TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TaskFilter

    def get_queryset(self):
        return get_project_from_request(self.request, self.kwargs).tasks.all()


class MembersView(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.MemberSerializer
    permission_classes = [IsAuthenticated, UserIsOwnerOfTheProject]
    filter_backends = [SearchFilter]
    search_fields = ['email', 'first_name', 'last_name', 'patronymic']

    def get_queryset(self):
        return get_project_from_request(self.request, self.kwargs).members.all()

    def handle_member_action(self, request, action):
        project = get_project_from_request(request, self.kwargs)
        user = get_object_or_404(get_user_model().objects.all().only('id', 'email'), pk=request.data.get('user_id'))

        if action == 'invite':
            if project.members.filter(id=user.id).exists():
                raise ValidationError({'detail': 'Пользователь уже является участником проекта.'})

            group = get_object_or_404(Group.objects.filter(founder=request.user), pk=request.data.get('group_id'))
            if group.members.filter(id=user.id).exists():
                Message.objects.create_invite_in_project_message(project, user)

                return Response(
                    {'detail': f'Пользователю {user.email} отправлено приглашение.'}, status=status.HTTP_200_OK)
            raise ValidationError({'detail': 'Пользователь в группе не найден.'})

        if action == 'remove':
            if project.members.filter(id=user.id).exists():
                project.members.remove(user)
                Message.objects.create_remove_from_project_message(project, user)

                members_serializer = serializers.MemberSerializer(self.get_queryset(), many=True)
                return Response(members_serializer.data, status=status.HTTP_200_OK)
            return ValidationError({'detail': 'Пользователь в проекте не найден.'})

    @action(methods=['POST'], detail=False)
    def invite_member(self, request, project_pk=None):
        return self.handle_member_action(request, 'invite')

    @action(methods=['POST'], detail=False)
    def remove_member(self, request, project_pk=None):
        return self.handle_member_action(request, 'remove')


class StatusesViewSet(BaseViewSet):
    serializer_class = serializers.StatusSerializer

    def get_queryset(self):
        return get_project_from_request(self.request, self.kwargs).statuses.all()


class PrioritiesViewSet(BaseViewSet):
    serializer_class = serializers.PrioritySerializer

    def get_queryset(self):
        return get_project_from_request(self.request, self.kwargs).priorities.all()


class TaskFilesViewSet(TaskFilesBaseViewSet):
    serializer_class = serializers.TaskFilesSerializer
    permission_classes = [IsAuthenticated, UserIsMemberOfProject]

    def get_queryset(self):
        project = get_project_from_request(self.request, self.kwargs)
        task = get_object_or_404(project.tasks.all(), pk=self.kwargs.get('task_pk'))
        return task.files.all()
