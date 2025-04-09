import os
from rest_framework import serializers
from profiles.serializers import ShortUserProfile


class MessageFileSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField('get_file_name')

    class Meta:
        exclude = ['message']

    def get_file_name(self, instance):
        return os.path.basename(instance.file.name)


class MessageSimpleSerializer(serializers.ModelSerializer):
    sender_profile = ShortUserProfile(source='sender', read_only=True)

    class Meta:
        extra_kwargs = {
            'timestamp': {
                'format': '%d.%m.%Y %H:%M'
            },
        }

    def add_addition_val_data(self):
        pass

    def save(self, **kwargs):
        self.add_addition_val_data()
        self.validated_data['sender'] = self.context['user']

        return super().save(**kwargs)


class MessageSerializer(MessageSimpleSerializer):
    uploaded_files = serializers.ListField(child=serializers.FileField(), write_only=True, required=False)

    class Meta:
        message_file_model = None
        extra_kwargs = {
            'timestamp': {
                'format': '%d.%m.%Y %H:%M'
            },
        }

    def save(self, **kwargs):
        self.add_addition_val_data()
        self.validated_data['sender'] = self.context['request'].user

        files = self.validated_data.pop('uploaded_files', [])
        message = super(serializers.ModelSerializer, self).save(**kwargs)

        created_files = [self.Meta.message_file_model(message=message, file=file) for file in files]
        self.Meta.message_file_model.objects.bulk_create(created_files)

        return message
