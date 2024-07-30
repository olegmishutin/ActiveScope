from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Message
from .serializers import MessageSerializer


class MessagesView(generics.GenericAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.messages.all().select_related('sender_group')


class MessagesListView(MessagesView, generics.ListAPIView):
    filter_backends = [OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['is_readed', 'topic']
    ordering_fields = ['date']
    ordering = ['-date']


class UpdatedMessageView(MessagesView, generics.UpdateAPIView):
    pass


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def new_messages_count_view(request):
    messages_count = request.user.messages.filter(is_readed=False).count()
    return Response({'count': messages_count}, status=status.HTTP_200_OK)
