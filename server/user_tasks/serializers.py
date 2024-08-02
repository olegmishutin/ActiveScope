import os
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from .models import UserTaskList, UserTask, UserTaskListStatus, UserTaskListPriority, UserTaskFile


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
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


class TaskSerializer(BaseSerializer):
    status = StatusSerializer(read_only=True)
    priority = PrioritySerializer(read_only=True)

    status_id = serializers.IntegerField(write_only=True, required=False)
    priority_id = serializers.IntegerField(write_only=True, required=False)
    uploaded_files = serializers.ListField(child=serializers.FileField(), write_only=True, required=False)

    class Meta(BaseSerializer.Meta):
        model = UserTask
        extra_kwargs = {
            'start_date': {
                'format': '%d.%m.%Y',
                'input_formats': ['%d.%m.%Y']
            },
            'end_date': {
                'format': '%d.%m.%Y',
                'input_formats': ['%d.%m.%Y']
            },
        }

    def is_object_exists(self, validated_data, field, model):
        field_id = validated_data.get(field)

        if field_id is not None:
            get_object_or_404(model, pk=field_id)

    def check_states(self, validated_data):
        self.is_object_exists(validated_data, 'status_id', UserTaskListStatus)
        self.is_object_exists(validated_data, 'priority_id', UserTaskListPriority)

    def update(self, instance, validated_data):
        self.check_states(validated_data)
        return super().update(instance, validated_data)

    def create(self, validated_data):
        self.check_states(validated_data)

        files = validated_data.pop('uploaded_files', [])
        task = super().create(validated_data)

        for file in files:
            UserTaskFile.objects.create(task=task, file=file)

        return task


class FileSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField('get_file_name')
    uploaded_files = serializers.ListField(child=serializers.FileField(), write_only=True)

    class Meta:
        model = UserTaskFile
        exclude = ['task']
        extra_kwargs = {
            'file': {
                'read_only': True
            },
            'upload_date': {
                'format': '%d.%m.%Y %H:%M'
            }
        }

    def get_file_name(self, instance):
        return os.path.basename(instance.file.name)

    def create(self, validated_data):
        files = validated_data.pop('uploaded_files', [])
        task_id = self.context.get('task_id')

        return [UserTaskFile.objects.create(task_id=task_id, file=file) for file in files]
