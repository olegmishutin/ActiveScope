from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from profiles.models import Profile
from .models import Token


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        exclude = ['is_admin']

    def create(self, validated_data):
        user = get_user_model().objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=256)
    password = serializers.CharField(max_length=128)

    def authenticate_user(self, **kwargs):
        user = authenticate(**self.validated_data)

        if user is not None:
            token = Token.objects.create(user=user)
            return token.key

        raise serializers.ValidationError({'detail': 'Пользователь не найден.'})
