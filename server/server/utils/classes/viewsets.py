from rest_framework import mixins, viewsets, status
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404


class TaskFilesBaseViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.RetrieveModelMixin,
                           mixins.DestroyModelMixin, viewsets.GenericViewSet):
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['task_id'] = self.kwargs.get('task_pk')
        return context

    def create(self, request, *args, **kwargs):
        file_serializer = self.get_serializer(data=request.data)
        file_serializer.is_valid(raise_exception=True)
        created_files = file_serializer.save()

        ret_data = self.get_serializer(created_files, many=True).data
        headers = self.get_success_headers(ret_data)

        return Response(ret_data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        insctance = get_object_or_404(self.serializer_class.Meta.model.objects.all(), pk=self.kwargs['pk'])
        return FileResponse(open(insctance.file.path, 'rb'), as_attachment=True)
