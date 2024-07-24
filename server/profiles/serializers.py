from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from auth_sys.validators import validate_password
from server.utils.classes.field_classes import WriteOnlyImageField, WriteOnlyCharField
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        exclude = ['user']


class UserProfileSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    photo = WriteOnlyImageField()
    header_image = WriteOnlyImageField()
    description = WriteOnlyCharField()

    old_password = WriteOnlyCharField(max_length=128)
    new_password = WriteOnlyCharField(max_length=128, validators=[validate_password])

    class Meta:
        model = get_user_model()
        exclude = ['is_admin', 'password']
        extra_kwargs = {
            'birth_date': {
                'format': '%d.%m.%Y',
                'input_formats': ['%d.%m.%Y'],
                'required': False
            }
        }

    def get_field(self, field):
        return self.validated_data.pop(field, None)

    def update(self, instance, validated_data):
        profile = instance.profile

        photo = self.get_field('photo')
        header_image = self.get_field('header_image')
        description = self.get_field('description')

        profile.change_photo(photo)
        profile.change_header_image(header_image)
        profile.description = description
        profile.save(update_fields=['photo', 'header_image', 'description'])

        old_password = self.get_field('old_password')
        new_password = self.get_field('new_password')

        if old_password is not None and new_password is not None:
            if not check_password(old_password, instance.password):
                raise serializers.ValidationError({'detail': 'Старый пароль указан неверно.'})

            instance.set_password(new_password)
        return super().update(instance, self.validated_data)
