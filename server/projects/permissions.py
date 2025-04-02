from rest_framework.permissions import BasePermission, SAFE_METHODS
from server.utils.classes.permissions_classes import UserIsMemberOfObject
from .utils import get_project_from_request


class IsProjectCanBeChangedOrDeleted(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.method in SAFE_METHODS or request.user == obj.owner


class UserIsOwnerOfTheProject(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS or get_project_from_request(request, view.kwargs).owner == request.user


class UserIsMemberOfProject(UserIsMemberOfObject):
    message = 'Вы не являетесь участником проекта.'

    kwargs_name = 'project_pk'
    spare_kwargs_name = 'pk'
    obj_related_name = 'projects'
