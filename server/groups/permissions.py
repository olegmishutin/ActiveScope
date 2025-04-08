from rest_framework.permissions import BasePermission, SAFE_METHODS
from server.utils.classes.permissions_classes import UserIsMemberOfObject
from .models import Group


class IsGroupCanBeChangedOrDeleted(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (request.method in SAFE_METHODS) or (request.user == obj.founder)


class IsGroupMessangerCanBeChangedOrDeleted(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST':
            return Group.objects.filter(pk=view.kwargs.get('group_pk'), founder=request.user).exists()
        return True

    def has_object_permission(self, request, view, obj):
        return (request.method in SAFE_METHODS) or (request.user == obj.group.founder)


class UserIsMemberOfMessanger(UserIsMemberOfObject):
    message = 'Вы не являетесь участником мессенджера.'

    kwargs_name = 'messanger_pk'
    obj_related_name = 'groups_messangers'
