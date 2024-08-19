from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import ProjectsSerializer
from .permissions import IsProjectCanBeChangedOrDeleted


class Projects(viewsets.ModelViewSet):
    serializer_class = ProjectsSerializer
    permission_classes = [IsAuthenticated, IsProjectCanBeChangedOrDeleted]

    def get_queryset(self):
        return self.request.user.projects.all()
