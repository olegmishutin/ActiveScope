from rest_framework.exceptions import ValidationError
from rest_framework.authentication import TokenAuthentication as RestTokenAuthentication
from asgiref.sync import sync_to_async
from .models import Token


class TokenAuthentication(RestTokenAuthentication):
    keyword = 'Bearer'
    model = Token

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)

        if token.is_not_valid(delete=True):
            raise ValidationError({'detail': 'Токен не действителен.'})

        return user, token


class SocketAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        scope['user'] = await self.get_user(scope['query_string'])
        return await self.app(scope, receive, send)

    async def get_user(self, query_string):
        data_str = query_string.decode('utf-8')

        if data_str:
            try:
                data_dict = dict([data_str.split('=')])

                toke_auth = TokenAuthentication()
                user, token = await sync_to_async(toke_auth.authenticate_credentials)(data_dict.get('token'))

                return user
            except BaseException:
                return None
        return None
