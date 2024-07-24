from django.utils import timezone
from django.conf import settings
from rest_framework.exceptions import ValidationError
from rest_framework.authentication import TokenAuthentication as RestTokenAuthentication
from .models import Token


class TokenAuthentication(RestTokenAuthentication):
    keyword = 'Bearer'
    model = Token

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)

        present_time = timezone.now()
        time_delta = settings.EXPIRE_TOKEN_IN

        if token.created < present_time - time_delta:
            token.delete()
            raise ValidationError({'detail': 'Токен не действителен.'})

        return user, token
