from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from server.utils.classes.serializers import TaskBaseSerializer
from .models import Project, ProjectTask, ProjectTaskFile, ProjectTaskStatus, ProjectTaskPriority


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        exclude = ['project']

    def create(self, validated_data):
        project = self.context['project_pk']
        return self.Meta.model.objects.create(project_id=project, **validated_data)


class ProjectSerializer(serializers.ModelSerializer):
    completed_tasks = serializers.IntegerField(read_only=True)
    total_tasks = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        exclude = ['members']

    def validate(self, attrs):
        ret_attrs = super().validate(attrs)
        self.icon = ret_attrs.pop('icon', None)
        self.header_image = ret_attrs.pop('header_image', None)
        return ret_attrs

    def update(self, instance, validated_data):
        instance.change_icon(self.icon)
        instance.change_header_image(self.header_image)

        super().update(instance, validated_data)
        return instance

    def create(self, validated_data):
        user = self.context['request'].user
        project = Project.objects.create(owner=user, **validated_data)
        project.members.add(user)

        project.icon, project.header_image = self.icon, self.header_image
        project.save(update_fields=['icon', 'header_image'])
        return project


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['photo', 'get_full_name', 'email']


class StatusSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ProjectTaskStatus


class PrioritySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ProjectTaskPriority


class TaskSerializer(TaskBaseSerializer, BaseSerializer):
    status = StatusSerializer(read_only=True)
    priority = PrioritySerializer(read_only=True)

    executor = serializers.ReadOnlyField(source='executor.email')
    executor_id = serializers.IntegerField(write_only=True, required=False)

    class Meta(TaskBaseSerializer.Meta, BaseSerializer.Meta):
        model = ProjectTask
        file_model = ProjectTaskFile

    def check_states(self, validated_data):
        project = get_object_or_404(Project.objects.all(), pk=self.context['project_pk'])

        self.is_object_exists(validated_data, 'status_id', project.statuses.all())
        self.is_object_exists(validated_data, 'priority_id', project.priorities.all())
        self.is_object_exists(validated_data, 'executor_id', project.members.all())
