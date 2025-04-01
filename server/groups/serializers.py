from rest_framework import serializers
from django.contrib.auth import get_user_model
from profiles.serializers import ShortUserProfile
from .models import Group, GroupMessanger


class GroupMessangerSerializer(serializers.ModelSerializer):
    members = ShortUserProfile(many=True, read_only=True)

    class Meta:
        model = GroupMessanger
        exclude = ['group']

    def create(self, validated_data):
        group_messanger = GroupMessanger.objects.create(
            **validated_data, group_id=self.context['group_pk']
        )

        group_messanger.add_member(self.context['request'].user)
        return group_messanger


class ShortGroupMessangerSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMessanger
        fields = ['id', 'name', 'icon']


class GroupSerializer(serializers.ModelSerializer):
    messangers = ShortGroupMessangerSerializer(many=True, read_only=True)
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
