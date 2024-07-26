from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Message
from .serializers import MessageSerializer


class MessagesView(generics.GenericAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.messages.all().select_related('sender_group')


class MessagesListView(MessagesView, generics.ListAPIView):
    pass


class UpdatedMessageView(MessagesView, generics.UpdateAPIView):
    pass
