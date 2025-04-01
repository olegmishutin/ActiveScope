from abc import abstractmethod
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import status
from groups.models import Group


class ManipulateMembersFromGroups:
    ADDED_TEXT = None
    NOT_FOUND_IN_GROUP = 'Пользователь в группе не найден.'
    USERS_NOT_FOUND = 'Пользователи не найдены.'
    USER_IN_OBJ_NOT_FOUND = None

    def handle_member_action(self, request, action):
        obj = self.get_object()

        if action == 'add':
            users_ids = request.data.get('users_ids')
            users = get_user_model().objects.filter(id__in=users_ids).only('id', 'email')

            if users:
                group = get_object_or_404(Group.objects.filter(founder=request.user), pk=request.data.get('group_id'))

                if group.members.filter(id__in=users.values_list('id', flat=True)).exists():
                    self.obj_add_members(obj, users)
                    return Response({'detail': self.ADDED_TEXT}, status=status.HTTP_200_OK)

                raise ValidationError({'detail': self.NOT_FOUND_IN_GROUP})
            raise ValidationError({'detail': self.USERS_NOT_FOUND})

        elif action in ('remove', 'leave'):
            if action == 'remove':
                user = get_object_or_404(
                    get_user_model().objects.all().only('id', 'email'), pk=request.data.get('user_id'))
            else:
                user = request.user

            if obj.members.filter(id=user.id).exists():
                if action == 'remove':
                    self.pre_remove(request, obj, user)
                    self.obj_remove_member(obj, user)

                    self.create_remove_message(obj, user)
                    return Response(status=status.HTTP_200_OK)
                else:
                    self.pre_leave(request, obj, request.user)
                    self.obj_leave_member(obj, request.user)

                    self.create_leave_message(obj, request.user)
                    return Response(status=status.HTTP_200_OK)
            raise ValidationError({'detail': self.USER_IN_OBJ_NOT_FOUND})

    def pre_remove(self, request, obj, user):
        pass

    def pre_leave(self, request, obj, user):
        pass

    @abstractmethod
    def obj_add_members(self, obj, users):
        pass

    @abstractmethod
    def obj_remove_member(self, obj, user):
        pass

    @abstractmethod
    def obj_leave_member(self, obj, user):
        pass

    @abstractmethod
    def create_remove_message(self, obj, user):
        pass

    @abstractmethod
    def create_leave_message(self, obj, user):
        pass
