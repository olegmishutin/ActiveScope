from server.utils.classes.consumers import MessangerConsumer

from .models import GroupMessanger
from .serializers import GroupMessangerMessageSimpleSerializer


class GroupMessangerConsumer(MessangerConsumer):
    parent_model = GroupMessanger
    message_simple_serializer = GroupMessangerMessageSimpleSerializer
    parent_serializer_name = 'messanger'
    url_route_identifier_name = 'messanger_id'
    room_name_with_formating = 'group_messanger_{0}'
