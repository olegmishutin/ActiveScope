from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsGroupCanBeChangedOrDeleted(BasePermission):
    def has_object_permission(self, request, view, obj):
        if (request.method in SAFE_METHODS) or (request.user == obj.founder):
            return True
        return False
