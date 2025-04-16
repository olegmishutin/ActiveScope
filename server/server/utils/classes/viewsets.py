from rest_framework import mixins
from rest_framework.viewsets import GenericViewSet
from rest_framework.pagination import LimitOffsetPagination
from django.shortcuts import get_object_or_404
from django.http import FileResponse


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


class MessageFileViewSet(mixins.DestroyModelMixin, mixins.RetrieveModelMixin, GenericViewSet):
    message_serializer = None

    def get_permissions(self):
        if self.action != 'retrieve':
            return super().get_permissions()
        return []

    def perform_destroy(self, instance):
        message = instance.message
        super().perform_destroy(instance)

        message.send_to_socket(self.message_serializer(message).data, 'update')

    def retrieve(self, request, *args, **kwargs):
        instance = get_object_or_404(self.serializer_class.Meta.model.objects.all(), pk=self.kwargs['pk'])
        return FileResponse(open(instance.file.path, 'rb'), as_attachment=True)
