from rest_framework.permissions import BasePermission


class IsAnonymousUser(BasePermission):
    message = 'Вы уже являетесь аутентифицированнным пользователем.'

    def has_permission(self, request, view):
        return request.user.is_anonymous
