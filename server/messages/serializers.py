from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    agreement = serializers.BooleanField(write_only=True, required=False)
    topic_code = serializers.ReadOnlyField(source='topic')

    class Meta:
        model = Message
        exclude = ['receiver', 'sender_group', 'sender_project', 'sender_project_task', 'days_left']
        extra_kwargs = {
            'topic': {
                'source': 'get_topic_display'
            },
            'date': {
                'format': '%d.%m.%Y %H:%M'
            }
        }

    def update(self, instance, validated_data):
        agreement_data = validated_data.pop('agreement', False)

        if agreement_data and instance.topic == 'INV_GROUP':
            instance.sender_group.add_member([instance.receiver])
            Message.objects.create_joined_group_message(instance.sender_group, instance.receiver)

        instance.is_readed = True
        instance.save(update_fields=['is_readed'])
        return instance
