from rest_framework.viewsets import ModelViewSet
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from server.utils.classes.permissions_classes import IsAdminUser
from messages.models import Message
from .models import Group
from .serializers import GroupSerializer
from .permissions import IsGroupCanBeChangedOrDeleted
from .filters import MembersCountFilter


class GroupsViewSet(ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, IsGroupCanBeChangedOrDeleted]
    filter_backends = [OrderingFilter, DjangoFilterBackend]
    filterset_class = MembersCountFilter
    ordering_fields = ['created_date', 'members_count']
    ordering = ['-created_date', '-members_count']

    def get_queryset(self):
        return self.request.user.groups.all().select_related('founder').prefetch_related('members')

    def handle_member_action(self, request, action):
        group = self.get_object()
        user = get_object_or_404(get_user_model().objects.all().only('id', 'email'), pk=request.data.get('user_id'))

        if action == 'invite':
            if group.members.filter(id=user.id).exists():
                raise ValidationError({'detail': 'Пользователь уже является участником этой группы.'})

            Message.objects.create_invite_in_group_message(group, user)
            return Response({'detail': f'Пользователю {user.email} отправлено приглашение.'}, status=status.HTTP_200_OK)

        if action == 'remove':
            group.remove_member(user, 'Пользователь в группе не найден.')
            Message.objects.create_remove_from_group_message(group, user)

            group_serializer = GroupSerializer(group)
            return Response(group_serializer.data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def invite_member(self, request, pk=None):
        return self.handle_member_action(request, 'invite')

    @action(methods=['POST'], detail=True)
    def remove_member(self, request, pk=None):
        return self.handle_member_action(request, 'remove')

    @action(methods=['POST'], detail=True, permission_classes=[])
    def leave_group(self, request, pk=None):
        group = self.get_object()

        group.remove_member(request.user, 'Вы не являетесь участникос этой группы.')
        Message.objects.create_leave_from_group_message(group, request.user)

        groups_serializer = GroupSerializer(self.get_queryset(), many=True)
        return Response(groups_serializer.data, status=status.HTTP_200_OK)


class AdminGroupsView(generics.ListAPIView):
    queryset = Group.objects.all().select_related('founder').prefetch_related('members')
    serializer_class = GroupsViewSet.serializer_class
    permission_classes = [IsAdminUser]
    filter_backends = [SearchFilter] + GroupsViewSet.filter_backends
    filterset_class = GroupsViewSet.filterset_class
    ordering_fields = GroupsViewSet.ordering_fields
    ordering = GroupsViewSet.ordering
    search_fields = ['$name', '$founder__email']


class AdminGroupDestroyView(generics.DestroyAPIView):
    queryset = AdminGroupsView.queryset
    serializer_class = AdminGroupsView.serializer_class
    permission_classes = AdminGroupsView.permission_classes
