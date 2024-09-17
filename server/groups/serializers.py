from rest_framework import serializers
from django.contrib.auth import get_user_model
from profiles.serializers import ShortUserProfile
from .models import Group


class GroupSerializer(serializers.ModelSerializer):
    members = ShortUserProfile(many=True, read_only=True)
    founder_email = serializers.ReadOnlyField(source='founder.email')
    founder_id = serializers.ReadOnlyField(source='founder.id')

    class Meta:
        model = Group
        exclude = ['founder']
        extra_kwargs = {
            'created_date': {
                'format': '%d.%m.%Y'
            }
        }

    def update(self, instance, validated_data):
        file = validated_data.pop('icon', None)
        instance.change_icon(file)

        return super().update(instance, validated_data)

    def create(self, validated_data):
        user = self.context['request'].user

        group = Group.objects.create(founder=user, **validated_data)
        group.add_member(user)
        return group


class ShortGroupsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']
