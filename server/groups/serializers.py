import os
from rest_framework import serializers
from profiles.serializers import ShortUserProfile
from .models import Group, GroupMessanger, GroupMessangerMessage, GroupMessangerMessageFile


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


class GroupMessangerMessageFileSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField('get_file_name')

    class Meta:
        model = GroupMessangerMessageFile
        exclude = ['message']

    def get_file_name(self, instance):
        return os.path.basename(instance.file.name)


class GroupMessangerMessageSimpleSerializer(serializers.ModelSerializer):
    files = GroupMessangerMessageFileSerializer(many=True, read_only=True)
    sender_profile = ShortUserProfile(source='sender', read_only=True)

    class Meta:
        model = GroupMessangerMessage
        exclude = ['messanger', 'sender']
        extra_kwargs = {
            'timestamp': {
                'format': '%d.%m.%Y %H:%M'
            },
        }


class GroupMessangerMessageSerializer(GroupMessangerMessageSimpleSerializer):
    uploaded_files = serializers.ListField(child=serializers.FileField(), write_only=True, required=False)

    class Meta:
        model = GroupMessangerMessage
        exclude = ['messanger', 'sender']
        extra_kwargs = {
            'timestamp': {
                'format': '%d.%m.%Y %H:%M'
            },
        }

    def save(self, **kwargs):
        self.validated_data['messanger_id'] = self.context['messanger_pk']
        self.validated_data['sender'] = self.context['request'].user

        files = self.validated_data.pop('uploaded_files', [])
        message = super().save(**kwargs)

        created_files = [GroupMessangerMessageFile(message=message, file=file) for file in files]
        GroupMessangerMessageFile.objects.bulk_create(created_files)

        return message
