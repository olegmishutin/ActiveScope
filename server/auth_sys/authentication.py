from rest_framework.exceptions import ValidationError
from rest_framework.authentication import TokenAuthentication as RestTokenAuthentication
from .models import Token


class TokenAuthentication(RestTokenAuthentication):
    keyword = 'Bearer'
    model = Token

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)

        if token.is_not_valid(delete=True):
            raise ValidationError({'detail': 'Токен не действителен.'})

        return user, token
