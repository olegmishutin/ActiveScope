from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from server.utils.classes.serializers import TaskBaseSerializer, TaskFilesBaseSerializer
from .models import Project, ProjectTask, ProjectTaskFile, ProjectTaskStatus, ProjectTaskPriority, Comment


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = None
        exclude = ['project']

    def create(self, validated_data):
        project = self.context['project_pk']
        return self.Meta.model.objects.create(project_id=project, **validated_data)


class ProjectBaseSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.email')
    completed_tasks = serializers.ReadOnlyField()
    total_tasks = serializers.ReadOnlyField()

    class Meta:
        model = Project
        exclude = ['members']


class ProjectSerializer(ProjectBaseSerializer):
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
    tasks_count = serializers.ReadOnlyField()

    class Meta:
        model = get_user_model()
        fields = ['photo', 'get_full_name', 'email', 'tasks_count']


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


class TaskFilesSerializer(TaskFilesBaseSerializer):
    class Meta(TaskFilesBaseSerializer.Meta):
        model = ProjectTaskFile


class TaskCommentSerializer(serializers.ModelSerializer):
    author = MemberSerializer(read_only=True)
    likes_count = serializers.ReadOnlyField()

    class Meta:
        model = Comment
        exclude = ['task', 'likes']
        extra_kwargs = {
            'date': {
                'format': '%d.%m.%Y'
            }
        }

    def create(self, validated_data):
        user = self.context['request'].user
        task_id = self.context['task_id']

        return Comment.objects.create(author=user, task_id=task_id, **validated_data)


class AdminProjectsTasksSerializer(serializers.ModelSerializer):
    executor = serializers.ReadOnlyField(source='executor.email')

    class Meta(TaskBaseSerializer.Meta, BaseSerializer.Meta):
        model = ProjectTask


class AdminProjectsSerializer(ProjectBaseSerializer):
    tasks = AdminProjectsTasksSerializer(many=True)


class ShortProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'icon', 'name']
