from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from user_tasks.models import UserTaskList
from .models import Token


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        exclude = ['is_admin', 'photo', 'header_image', 'description']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
            'birth_date': {
                'input_formats': ['%d.%m.%Y'],
            }
        }

    def create(self, validated_data):
        user = get_user_model().objects.create_user(**validated_data)
        UserTaskList.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=256)
    password = serializers.CharField(max_length=128)

    def authenticate_user(self, **kwargs):
        user = authenticate(**self.validated_data)

        if user is not None:
            token, created_token = Token.objects.get_or_create(user=user)
            return token.key

        raise serializers.ValidationError({'detail': 'Пользователь не найден.'})


class UserShortInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['id', 'is_admin', 'photo', 'get_full_name']
