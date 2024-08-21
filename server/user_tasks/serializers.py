from rest_framework import serializers
from server.utils.classes.serializers import TaskBaseSerializer, TaskFilesBaseSerializer
from .models import UserTaskList, UserTask, UserTaskListStatus, UserTaskListPriority, UserTaskFile


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = None
        exclude = ['task_list']

    def create(self, validated_data):
        task_list = self.context['request'].user.task_list
        return self.Meta.model.objects.create(task_list=task_list, **validated_data)


class TaskListSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTaskList
        fields = '__all__'
        extra_kwargs = {
            'user': {
                'read_only': True
            }
        }

    def update(self, instance, validated_data):
        header_image = validated_data.pop('header_image', None)
        instance.change_header_image(header_image)

        return super().update(instance, validated_data)


class StatusSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = UserTaskListStatus


class PrioritySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = UserTaskListPriority


class TaskSerializer(TaskBaseSerializer, BaseSerializer):
    status = StatusSerializer(read_only=True)
    priority = PrioritySerializer(read_only=True)

    class Meta(TaskBaseSerializer.Meta, BaseSerializer.Meta):
        model = UserTask
        file_model = UserTaskFile

    def check_states(self, validated_data):
        user = self.context['request'].user

        self.is_object_exists(validated_data, 'status_id', user.task_list.statuses.all())
        self.is_object_exists(validated_data, 'priority_id', user.task_list.priorities.all())


class FileSerializer(TaskFilesBaseSerializer):
    class Meta(TaskFilesBaseSerializer.Meta):
        model = UserTaskFile
