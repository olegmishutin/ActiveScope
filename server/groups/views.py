from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import mixins
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.pagination import LimitOffsetPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Prefetch, Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from asgiref.sync import sync_to_async
from server.utils.classes.permissions_classes import IsAdminUser
from server.utils.classes.mixins import ManipulateMembersFromGroups
from messages.models import Message
from .models import Group, GroupMessanger
from .serializers import GroupSerializer, ShortGroupsSerializer, GroupMessangerSerializer, \
    GroupMessangerMessageSerializer
from .permissions import IsGroupCanBeChangedOrDeleted, IsGroupMessangerCanBeChangedOrDeleted, UserIsMemberOfMessanger
from .filters import MembersCountFilter


class GroupsViewSet(ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, IsGroupCanBeChangedOrDeleted]
    filter_backends = [OrderingFilter, DjangoFilterBackend]
    filterset_class = MembersCountFilter
    ordering_fields = ['created_date', 'members_count']
    ordering = ['-created_date', '-members_count']

    def get_queryset(self):
        return self.request.user.groups.all().annotate(
            can_be_change_by_user=Q(founder=self.request.user)).select_related('founder').prefetch_related(
            Prefetch('members', queryset=get_user_model().objects.all().annotate(
                projects_count=Count('projects'))), 'messangers')

    def handle_member_action(self, request, action):
        group = self.get_object()
        user = get_object_or_404(get_user_model().objects.filter(may_be_invited=True).only('id', 'email'),
                                 pk=request.data.get('user_id'))

        if action == 'invite':
            if group.members.filter(id=user.id).exists():
                raise ValidationError({'detail': 'Пользователь уже является участником этой группы.'})

            Message.objects.create_invite_in_group_message(group, user)
            return Response(
                {'detail': f'Пользователю {user.email} отправлено приглашение.'},
                status=status.HTTP_200_OK)

        if action == 'remove':
            group.remove_member(user, 'Пользователь в группе не найден.')
            Message.objects.create_remove_from_group_message(group, user)

            return Response(status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def invite_member(self, request, pk=None):
        return self.handle_member_action(request, 'invite')

    @action(methods=['POST'], detail=True)
    def remove_member(self, request, pk=None):
        return self.handle_member_action(request, 'remove')

    @action(methods=['POST'], detail=True, permission_classes=[])
    def leave_group(self, request, pk=None):
        group = self.get_object()

        group.remove_member(request.user, 'Вы не являетесь участником этой группы.')
        Message.objects.create_leave_from_group_message(group, request.user)

        return Response(status=status.HTTP_200_OK)


class GroupMessangerViewSet(ManipulateMembersFromGroups, mixins.CreateModelMixin, mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin, mixins.DestroyModelMixin, GenericViewSet):
    serializer_class = GroupMessangerSerializer
    permission_classes = [IsAuthenticated, IsGroupMessangerCanBeChangedOrDeleted]

    ADDED_TEXT = 'Пользователи добавлены в мессенджер.'
    USER_IN_OBJ_NOT_FOUND = 'Пользователь в мессенджере не найден.'

    need_check_before_remove = False

    def get_queryset(self):
        return self.request.user.groups_messangers.all().select_related('group')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['group_pk'] = self.kwargs.get('group_pk')
        return context

    def obj_add_members(self, obj, users):
        obj.add_member(users)

    def obj_remove_member(self, obj, user):
        obj.remove_member(user, 'Пользователь в мессенджере не найден.')

    def obj_leave_member(self, obj, user):
        obj.remove_member(user, 'Вы не являетесь участником этого мессенджера.')

    def create_remove_message(self, obj, user):
        Message.objects.create_remove_from_group_messanger_message(obj, user)

    def create_leave_message(self, obj, user):
        Message.objects.create_leave_from_group_messanger_message(obj, user)

    @action(methods=['POST'], detail=True)
    def add_member(self, request, group_pk=None, pk=None):
        return self.handle_member_action(request, 'add')

    @action(methods=['POST'], detail=True)
    def remove_member(self, request, group_pk=None, pk=None):
        return self.handle_member_action(request, 'remove')

    @action(methods=['POST'], detail=True, permission_classes=[])
    def leave_messanger(self, request, group_pk=None, pk=None):
        return self.handle_member_action(request, 'leave')


class GroupMessangerMessageViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                                   mixins.UpdateModelMixin, mixins.DestroyModelMixin, GenericViewSet):
    serializer_class = GroupMessangerMessageSerializer
    permission_classes = [IsAuthenticated, UserIsMemberOfMessanger]
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        return get_object_or_404(
            self.request.user.groups_messangers.all(),
            pk=self.kwargs.get('messanger_pk')
        ).messages.all().select_related('sender').prefetch_related('files').order_by('timestamp')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['messanger_pk'] = self.kwargs.get('messanger_pk')
        return context


class AdminGroupsView(generics.ListAPIView):
    queryset = Group.objects.all().select_related('founder').prefetch_related(
        Prefetch('members', queryset=get_user_model().objects.all().annotate(
            projects_count=Count('projects'))))

    serializer_class = GroupsViewSet.serializer_class
    permission_classes = [IsAdminUser]
    filter_backends = [SearchFilter] + GroupsViewSet.filter_backends
    filterset_class = GroupsViewSet.filterset_class
    ordering_fields = GroupsViewSet.ordering_fields
    ordering = GroupsViewSet.ordering
    search_fields = ['name', 'founder__email']


class AdminGroupDestroyView(generics.DestroyAPIView):
    queryset = AdminGroupsView.queryset
    serializer_class = AdminGroupsView.serializer_class
    permission_classes = AdminGroupsView.permission_classes


@sync_to_async()
@api_view(['GET'])
def get_user_own_groups(request):
    groups = request.user.groups.only('id', 'name').filter(founder=request.user)
    groups_serialzier = ShortGroupsSerializer(groups, many=True)
    return Response(groups_serialzier.data, status=status.HTTP_200_OK)
