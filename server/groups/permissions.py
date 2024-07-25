from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsGroupCanBeChangedOrDeleted(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        elif request.user == obj.founder:
            return True
        return False
