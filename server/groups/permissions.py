from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsGroupCanBeChangedOrDeleted(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (request.method in SAFE_METHODS) or (request.user == obj.founder)


class IsGroupMessangerCanBeChangedOrDeleted(BasePermission):
    def has_object_permission(self, request, view, obj):
        return (request.method in SAFE_METHODS) or (request.user == obj.group.founder)
