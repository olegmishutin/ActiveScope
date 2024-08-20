from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .permissions import IsProjectCanBeChangedOrDeleted, UserIsMemberOfProject
from . import serializers


class BaseViewSet(viewsets.ModelViewSet):
    permission_classes = [UserIsMemberOfProject]

    def get_project(self):
        return get_object_or_404(self.request.user.projects.all(), pk=self.kwargs['project_pk'])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['project_pk'] = self.kwargs['project_pk']
        return context


class ProjectsViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ProjectsSerializer
    permission_classes = [IsAuthenticated, IsProjectCanBeChangedOrDeleted]

    def get_queryset(self):
        return self.request.user.projects.all()


class StatusesViewSet(BaseViewSet):
    serializer_class = serializers.StatusesSerializer

    def get_queryset(self):
        return self.get_project().statuses.all()


class PrioritiesViewSet(BaseViewSet):
    serializer_class = serializers.PrioritySerializer

    def get_queryset(self):
        return self.get_project().priorities.all()
