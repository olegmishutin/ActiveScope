from rest_framework import status
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import ListModelMixin, UpdateModelMixin
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from asgiref.sync import sync_to_async
from .models import Message
from .serializers import MessageSerializer


class MessagesViewSet(ListModelMixin, UpdateModelMixin, GenericViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['is_readed', 'topic']
    ordering_fields = ['date']
    ordering = ['-date']

    def get_queryset(self):
        return self.request.user.messages.all()


@sync_to_async()
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def new_messages_count_view(request):
    messages_count = request.user.messages.filter(is_readed=False).count()
    return Response({'count': messages_count}, status=status.HTTP_200_OK)


@sync_to_async()
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def messages_topics(request):
    topics_list = list(Message.topics.items())
    topics_list.insert(0, ('', 'Все'))
    return Response(topics_list, status=status.HTTP_200_OK)
