from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from auth_sys.validators import validate_password


class ShortUserProfile(serializers.ModelSerializer):
    projects_count = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField(source='get_full_name')

    class Meta:
        model = get_user_model()
        fields = ['id', 'photo', 'full_name', 'email', 'projects_count', 'description']


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField(source='get_full_name')

    old_password = serializers.CharField(max_length=128, write_only=True, required=False)
    new_password = serializers.CharField(
        max_length=128, write_only=True, required=False, validators=[validate_password])

    class Meta:
        model = get_user_model()
        exclude = ['is_admin', 'password']
        extra_kwargs = {
            'birth_date': {
                'format': '%d.%m.%Y',
                'input_formats': ['%d.%m.%Y'],
            },
            'first_name': {
                'write_only': True
            },
            'last_name': {
                'write_only': True
            },
            'patronymic': {
                'write_only': True
            }
        }

    def get_field(self, field):
        return self.validated_data.pop(field, None)

    def update(self, instance, validated_data):
        instance.change_photo(self.get_field('photo'))
        instance.change_header_image(self.get_field('header_image'))

        old_password = self.get_field('old_password')
        new_password = self.get_field('new_password')

        if None not in (old_password, new_password):
            if not check_password(old_password, instance.password):
                raise serializers.ValidationError({'detail': 'Старый пароль указан неверно.'})

            instance.set_password(new_password)
        return super().update(instance, self.validated_data)
