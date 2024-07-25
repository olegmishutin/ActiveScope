from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Group


class GroupMemberSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField(source='get_full_name')

    class Meta:
        model = get_user_model()
        fields = ['id', 'photo', 'full_name', 'email']


class GroupSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(many=True, read_only=True)
    founder = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Group
        fields = '__all__'

    def update(self, instance, validated_data):
        file = validated_data.pop('icon', None)
        instance.change_icon(file)

        return super().update(instance, validated_data)

    def create(self, validated_data):
        user = self.context['request'].user

        group = Group.objects.create(founder=user, **validated_data)
        group.add_members(user)
        return group
