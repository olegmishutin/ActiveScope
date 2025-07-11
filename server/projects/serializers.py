from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from server.utils.classes.serializers import MessageSimpleSerializer, MessageSerializer, MessageFileSerializer
from .models import Project, ProjectTask, ProjectTaskFile, ProjectTaskStatus, ProjectTaskPriority, ProjectMessage, \
    ProjectMessageFile


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = None
        exclude = ['project']

    def create(self, validated_data):
        project = self.context['project_pk']
        return self.Meta.model.objects.create(project_id=project, **validated_data)


class ProjectBaseSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.email')
    owner_id = serializers.ReadOnlyField(source='owner.id')
    completed_tasks = serializers.ReadOnlyField()
    total_tasks = serializers.ReadOnlyField()

    class Meta:
        model = Project
        exclude = ['members']
        extra_kwargs = {
            'start_date': {
                'format': '%d.%m.%Y'
            },
            'end_date': {
                'format': '%d.%m.%Y'
            }
        }


class ProjectSerializer(ProjectBaseSerializer):
    def validate(self, attrs):
        ret_attrs = super().validate(attrs)
        self.icon = ret_attrs.pop('icon', None)
        self.header_image = ret_attrs.pop('header_image', None)
        return ret_attrs

    def update(self, instance, validated_data):
        instance.change_icon(self.icon)
        instance.change_header_image(self.header_image)

        return super().update(instance, validated_data)

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
        fields = ['id', 'photo', 'get_full_name', 'email', 'description', 'tasks_count']


class StatusSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ProjectTaskStatus


class PrioritySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ProjectTaskPriority


class ProjectMessageFileSerializer(MessageFileSerializer):
    class Meta(MessageFileSerializer.Meta):
        model = ProjectMessageFile


class ProjectMessageSimpleSerializer(MessageSimpleSerializer):
    files = ProjectMessageFileSerializer(many=True, read_only=True)

    class Meta(MessageSimpleSerializer.Meta):
        model = ProjectMessage
        messanger_model = Project
        messanger_val_data_field = 'project_id'
        exclude = ['project', 'sender']

    def add_addition_val_data(self):
        self.validated_data['project_id'] = self.context['project_pk']


class ProjectMessageSerializer(ProjectMessageSimpleSerializer, MessageSerializer):
    class Meta(MessageSerializer.Meta, ProjectMessageSimpleSerializer.Meta):
        message_file_model = ProjectMessageFile


class TaskSerializer(BaseSerializer):
    status = StatusSerializer(read_only=True)
    priority = PrioritySerializer(read_only=True)

    status_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    priority_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    uploaded_files = serializers.ListField(child=serializers.FileField(), write_only=True, required=False)

    executor = serializers.ReadOnlyField(source='executor.email')
    executor_read_id = serializers.ReadOnlyField(source='executor.id')
    executor_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta(BaseSerializer.Meta):
        model = ProjectTask
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
        project = get_object_or_404(Project.objects.all(), pk=self.context['project_pk'])

        self.is_object_exists(validated_data, 'status_id', project.statuses.all())
        self.is_object_exists(validated_data, 'priority_id', project.priorities.all())
        self.is_object_exists(validated_data, 'executor_id', project.members.all())

    def update(self, instance, validated_data):
        self.check_states(validated_data)

        old_status = None if instance.status is None else instance.status.id
        updated = super().update(instance, validated_data)

        if updated.status is not None and old_status != updated.status.id and updated.status.is_means_completeness \
                and updated.executor != updated.project.owner:
            data = {
                'message': f'@{updated.project.owner.email}\n\nЗадаче: "{updated.name}" ' + \
                           f'был присвоен статус: {"Пусто" if updated.status is None else updated.status.name}.' + \
                           f'\nИсполнитель: {"Пусто" if updated.executor is None else updated.executor.email}.' + \
                           f'\n\nОписание задачи: {"Пусто" if updated.description is None else updated.description}'
            }

            message_serializer = ProjectMessageSimpleSerializer(
                data=data, context={
                    'project_pk': self.context['project_pk'],
                    'user': self.context['request'].user
                }
            )

            if message_serializer.is_valid():
                saved = message_serializer.save()
                message_serializer_data = ProjectMessageSimpleSerializer(saved).data

                saved.send_to_socket(message_serializer_data, 'create')

        return updated

    def create(self, validated_data):
        self.check_states(validated_data)

        files = validated_data.pop('uploaded_files', [])
        task = super().create(validated_data)

        created_files = [
            ProjectTaskFile(
                task=task, file=file,
                file_name=file.name
            )
            for file in files
        ]
        ProjectTaskFile.objects.bulk_create(created_files)
        return task


class TaskFilesSerializer(serializers.ModelSerializer):
    uploaded_files = serializers.ListField(child=serializers.FileField(), write_only=True)

    class Meta:
        model = ProjectTaskFile
        fields = '__all__'
        extra_kwargs = {
            'file': {
                'read_only': True
            },
            'upload_date': {
                'format': '%d.%m.%Y %H:%M'
            },
            'task': {
                'read_only': True
            }
        }

    def create(self, validated_data):
        files = validated_data.pop('uploaded_files', [])
        task_id = self.context.get('task_id')

        files_to_create = [
            self.Meta.model(
                task_id=task_id, file=file,
                file_name=file.name
            )
            for file in files
        ]
        return self.Meta.model.objects.bulk_create(files_to_create)


class AdminProjectsTasksSerializer(serializers.ModelSerializer):
    executor = serializers.ReadOnlyField(source='executor.email')
    executor_id = serializers.ReadOnlyField(source='executor.id')

    class Meta(TaskSerializer.Meta, BaseSerializer.Meta):
        pass


class AdminProjectsSerializer(ProjectBaseSerializer):
    tasks = AdminProjectsTasksSerializer(many=True)


class ShortProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'icon', 'name', 'owner']
