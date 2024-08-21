import os
from rest_framework import serializers
from django.shortcuts import get_object_or_404


class TaskBaseSerializer(serializers.ModelSerializer):
    status_id = serializers.IntegerField(write_only=True, required=False)
    priority_id = serializers.IntegerField(write_only=True, required=False)
    uploaded_files = serializers.ListField(child=serializers.FileField(), write_only=True, required=False)

    class Meta:
        file_model = None
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

    def is_object_exists(self, validated_data, field, queryset):
        field_id = validated_data.get(field)

        if field_id is not None:
            get_object_or_404(queryset, pk=field_id)

    def check_states(self, validated_data):
        pass

    def update(self, instance, validated_data):
        self.check_states(validated_data)
        return super().update(instance, validated_data)

    def create(self, validated_data):
        self.check_states(validated_data)

        files = validated_data.pop('uploaded_files', [])
        task = super().create(validated_data)

        for file in files:
            self.Meta.file_model.objects.create(task=task, file=file)

        return task


class TaskFilesBaseSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField('get_file_name')
    uploaded_files = serializers.ListField(child=serializers.FileField(), write_only=True)

    class Meta:
        model = None
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

        files_to_create = [self.Meta.model(task_id=task_id, file=file) for file in files]
        return self.Meta.model.objects.bulk_create(files_to_create)
