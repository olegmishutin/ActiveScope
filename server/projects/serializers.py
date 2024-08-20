from rest_framework import serializers
from .models import Project, ProjectTaskStatus, ProjectTaskPriority


class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        exclude = ['project']

    def create(self, validated_data):
        project = self.context['project_pk']
        return self.Meta.model.objects.create(project_id=project, **validated_data)


class ProjectsSerializer(serializers.ModelSerializer):
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


class StatusesSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ProjectTaskStatus


class PrioritySerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = ProjectTaskPriority
