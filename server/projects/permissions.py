from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsProjectCanBeChangedOrDeleted(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (request.method in SAFE_METHODS) or (request.user == obj.owner)


class UserIsMemberOfProject(BasePermission):
    def has_permission(self, request, view):
        return request.user.projects.filter(id=view.kwargs['project_pk']).exists()
