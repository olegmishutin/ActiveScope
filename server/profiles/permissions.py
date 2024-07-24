from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsUserProfileCanBeChangedOrDeleted(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        elif request.method in ('PUT', 'PATCH') and request.user == obj:
            return True

        elif request.method == 'DELETE' and request.user.is_admin:
            return True
        return False
