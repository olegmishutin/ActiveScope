from rest_framework import serializers
from django.shortcuts import get_object_or_404
from .models import UserTask, UserTaskListStatus


class UserTaskListBaseSerializer(serializers.ModelSerializer):
    class Meta:
        exclude = ['task_list']

    def create(self, validated_data):
        task_list = self.context['request'].user.task_list
        return self.Meta.model.objects.create(task_list=task_list, **validated_data)


class UserTaskListStatusSerializer(UserTaskListBaseSerializer):
    class Meta(UserTaskListBaseSerializer.Meta):
        model = UserTaskListStatus


class UserTaskSerializer(UserTaskListBaseSerializer):
    status = UserTaskListStatusSerializer(read_only=True)
    status_id = serializers.IntegerField(write_only=True, required=False)

    class Meta(UserTaskListBaseSerializer.Meta):
        model = UserTask
        extra_kwargs = {
            'start_date': {
                'input_formats': ['%d.%m.%Y']
            },
            'end_date': {
                'input_formats': ['%d.%m.%Y']
            },
        }

    def check_state_id(self, validated_data, field, model):
        field_id = validated_data.get(field)

        if field_id is not None:
            get_object_or_404(model, pk=field_id)

    def update(self, instance, validated_data):
        self.check_state_id(validated_data, 'status_id', UserTaskListStatus)
        return super().update(instance, validated_data)

    def create(self, validated_data):
        self.check_state_id(validated_data, 'status_id', UserTaskListStatus)
        return super(UserTaskListBaseSerializer, self).create(validated_data)
