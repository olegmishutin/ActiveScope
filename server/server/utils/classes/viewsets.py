from rest_framework import mixins
from rest_framework.viewsets import GenericViewSet
from rest_framework.pagination import LimitOffsetPagination


class MessageViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                     mixins.UpdateModelMixin, mixins.DestroyModelMixin, GenericViewSet):
    pagination_class = LimitOffsetPagination

    def perform_create(self, serializer):
        self.prepare_and_send_to_socket(serializer)

    def perform_update(self, serializer):
        self.prepare_and_send_to_socket(serializer, True)

    def perform_destroy(self, instance):
        instance.send_to_socket({'id': instance.id}, self.action)
        super().perform_destroy(instance)

    def prepare_and_send_to_socket(self, serializer, refresh=False):
        saved = serializer.save()
        if refresh:
            saved.refresh_from_db()

        content = self.get_serializer(saved).data
        saved.send_to_socket(content, self.action)


class MessageFileViewSet(mixins.DestroyModelMixin, GenericViewSet):
    message_serializer = None

    def perform_destroy(self, instance):
        message = instance.message
        super().perform_destroy(instance)

        message.send_to_socket(self.message_serializer(message).data, 'update')
