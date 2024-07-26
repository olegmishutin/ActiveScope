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
from server.utils.classes.permissions_classes import IsAdminUser
from messages.models import Message
from .models import Group
from .serializers import GroupSerializer
from .permissions import IsGroupCanBeChangedOrDeleted
from .filters import filter_queryset_by_members_count


class GroupsViewSet(ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated, IsGroupCanBeChangedOrDeleted]
    filter_backends = [OrderingFilter]
    ordering = ['created_date', 'members_count']

    def get_queryset(self):
        return self.request.user.groups.all().select_related('founder').prefetch_related('members')

    def filter_queryset(self, queryset):
        new_queryset = filter_queryset_by_members_count(queryset, self.request)
        return super().filter_queryset(new_queryset)

    def get_group_and_user(self, request):
        user_id = request.data.get('user_id')
        user = get_object_or_404(get_user_model().objects.all().only('id', 'email'), pk=user_id)

        return self.get_object(), user

    @action(methods=['POST'], detail=True)
    def invite_member(self, request, pk=None):
        group, user = self.get_group_and_user(request)

        if group.members.filter(id=user.id).exists():
            raise ValidationError({'detail': 'Этот пользователь уже является участником этой группы.'})

        Message.create_invite_group_message(group, user)
        return Response({'detail': f'Пользователю {user.email} отправлено приглашение.'}, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True)
    def remove_member(self, request, pk=None):
        group, user = self.get_group_and_user(request)

        if group.members.filter(id=user.id).exists():
            group.remove_members(user)
            Message.create_exclude_from_group_message(group, user)

            group_serializer = GroupSerializer(group)
            return Response(group_serializer.data, status=status.HTTP_200_OK)
        raise ValidationError({'detail': 'Пользователь в группе не найден.'})

    @action(methods=['POST'], detail=True, permission_classes=[])
    def leave_group(self, request, pk=None):
        group = self.get_object()

        if group.members.filter(id=request.user.id).exists():
            group.remove_members(request.user)
            Message.create_leave_from_group_message(group, request.user)

            groups = self.get_queryset()
            groups_serializer = GroupSerializer(groups, many=True)

            return Response(groups_serializer.data, status=status.HTTP_200_OK)
        raise ValidationError({'detail': 'Вы не являетесь участникос этой группы.'})


class AdminGroupsView(generics.ListAPIView):
    queryset = Group.objects.all().select_related('founder').prefetch_related('members')
    serializer_class = GroupsViewSet.serializer_class
    permission_classes = [IsAdminUser]
    filter_backends = [SearchFilter] + GroupsViewSet.filter_backends
    ordering = GroupsViewSet.ordering
    search_fields = ['$name', '$founder__email']

    def filter_queryset(self, queryset):
        new_queryset = filter_queryset_by_members_count(queryset, self.request)
        return super().filter_queryset(new_queryset)


class AdminGroupDestroyView(generics.DestroyAPIView):
    queryset = AdminGroupsView.queryset
    serializer_class = AdminGroupsView.serializer_class
    permission_classes = AdminGroupsView.permission_classes
