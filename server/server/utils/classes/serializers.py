import re
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from profiles.serializers import ShortUserProfile
from django.core.exceptions import ObjectDoesNotExist
from messages.models import Message


class MessageFileSerializer(serializers.ModelSerializer):
    class Meta:
        exclude = ['message']


class MessageSimpleSerializer(serializers.ModelSerializer):
    files = None
    sender_profile = ShortUserProfile(source='sender', read_only=True)

    class Meta:
        messanger_model = None
        messanger_val_data_field = None
        extra_kwargs = {
            'timestamp': {
                'format': '%d.%m.%Y %H:%M'
            },
            'message': {
                'required': True
            }
        }

    def add_addition_val_data(self):
        pass

    def define_email_in_message(self, message_instance):
        pattern = r'@\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'

        if message_instance.message is not None:
            emails = re.findall(pattern, message_instance.message)
            emails = [email[1:] for email in emails]

            if emails:
                try:
                    messanger = self.Meta.messanger_model.objects.get(
                        id=self.validated_data[self.Meta.messanger_val_data_field]
                    )
                except ObjectDoesNotExist:
                    return None

                users = messanger.members.filter(email__in=emails)
                messanger_model_lower_name = self.Meta.messanger_model.__name__.lower()

                for user in users:
                    if message_instance.sender.email != user.email:
                        Message.objects.create_messanger_mentioned(
                            topic_key='GROUP_MESSAGE' if messanger_model_lower_name == 'groupmessanger' else 'PROJECT_MESSAGE',
                            messanger_id=self.validated_data[self.Meta.messanger_val_data_field],
                            message_id=message_instance.id, receiver=user
                        )

    def create(self, validated_data):
        message = super().create(validated_data)
        self.define_email_in_message(message)
        return message

    def save(self, **kwargs):
        self.add_addition_val_data()
        self.validated_data['sender'] = self.context['user']

        return super().save(**kwargs)


class MessageSerializer(MessageSimpleSerializer):
    uploaded_files = serializers.ListField(child=serializers.FileField(), write_only=True, required=False)

    class Meta(MessageSimpleSerializer.Meta):
        message_file_model = None
        extra_kwargs = {
            'timestamp': {
                'format': '%d.%m.%Y %H:%M'
            },
            'message': {
                'required': False
            }
        }

    def save(self, **kwargs):
        self.add_addition_val_data()

        self.validated_data['sender'] = self.context['request'].user
        files = self.validated_data.pop('uploaded_files', [])
        
        if not files and self.validated_data.get('message') is None:
            raise ValidationError({'detail': 'Необходимо написать сообщение либо прикрепить файлы.'})

        message = super(serializers.ModelSerializer, self).save(**kwargs)
        
        created_files = [
            self.Meta.message_file_model(
                message=message, file=file,
                file_name=file.name
            )
            for file in files
        ]
        self.Meta.message_file_model.objects.bulk_create(created_files)

        return message
