from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_admin


class UserIsMemberOfObject(BasePermission):
    kwargs_name = None
    spare_kwargs_name = None
    obj_related_name = None

    def has_permission(self, request, view):
        obj_id = view.kwargs.get(self.kwargs_name)

        if obj_id is None and self.spare_kwargs_name is not None:
            obj_id = view.kwargs[self.spare_kwargs_name]

        return getattr(request.user, self.obj_related_name).filter(id=obj_id).exists()


class IsMessageCanBeChanged(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in ('PUT', 'PATCH') and not obj.sender == request.user:
            return False
        return True
