from server.utils.classes.consumers import MessangerConsumer
from .models import Project
from .serializers import ProjectMessageSimpleSerializer


class ProjectMessageConsumer(MessangerConsumer):
    parent_model = Project
    message_simple_serializer = ProjectMessageSimpleSerializer
    parent_serializer_name = 'project_pk'
    url_route_identifier_name = 'project_id'
    room_name_with_formating = 'project_{0}_messages'