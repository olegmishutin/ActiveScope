from django.db import models
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from server.utils.functions import files
from server.utils.functions.for_websockets import get_message
from server.utils.classes.models import AbstractModelWithMembers


class Group(AbstractModelWithMembers):
    founder = models.ForeignKey(
        get_user_model(), related_name='my_groups', verbose_name='основатель', on_delete=models.CASCADE)

    members = models.ManyToManyField(
        get_user_model(), db_table='UserGroup', related_name='groups', verbose_name='участники')

    icon = models.ImageField('иконка', upload_to=files.group_image_uploading_to, null=True, blank=True)
    name = models.CharField('название', max_length=128, db_index=True)
    created_date = models.DateField('дата создания', auto_now_add=True, editable=False)
    description = models.TextField('описание', null=True, blank=True)

    class Meta:
        db_table = 'Group'
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'

    def change_icon(self, file):
        files.set_new_file(self, 'icon', file)

    def delete(self, using=None, keep_parents=False):
        files.delete_folder(f'groups/{self.id}')
        return super().delete(using, keep_parents)

    def __str__(self):
        return self.name


class GroupMessanger(AbstractModelWithMembers):
    group = models.ForeignKey(
        Group, related_name='messangers', verbose_name='группа', on_delete=models.CASCADE)

    members = models.ManyToManyField(
        get_user_model(), db_table='GroupMessangerMembers', related_name='groups_messangers', verbose_name='участники')

    icon = models.ImageField(
        'иконка', upload_to=files.group_messanger_image_uploading_to, null=True, blank=True)

    name = models.CharField('название', max_length=128)
    description = models.TextField('описание', null=True, blank=True)
    members_count = models.IntegerField('количество участников', default=0, editable=False)

    class Meta:
        db_table = 'GroupMessanger'
        verbose_name = 'Мессенджер группы'
        verbose_name_plural = 'Мессенджеры группы'

    def delete(self, using=None, keep_parents=False):
        files.delete_folder(f'groups/{self.group.id}/messanger/{self.id}')
        return super().delete(using, keep_parents)


class GroupMessangerMessage(models.Model):
    messanger = models.ForeignKey(
        GroupMessanger, related_name='messages', verbose_name='мессенджер', on_delete=models.CASCADE)

    sender = models.ForeignKey(
        get_user_model(), related_name='groups_messangers_messages',
        verbose_name='отправитель', on_delete=models.CASCADE)

    message = models.TextField('сообщение')
    timestamp = models.DateTimeField('временная метка', auto_now_add=True, editable=False)

    class Meta:
        db_table = 'GroupMessangerMessage'
        verbose_name = 'Сообщение мессенджера группы'
        verbose_name_plural = 'Сообщения мессенджера группы'

    def delete(self, using=None, keep_parents=False):
        files.delete_files_by_related(
            self.files.all(), 'file'
        )
        return super().delete(using, keep_parents)

    def send_to_socket(self, content, action):
        channel_group = f'group_messanger_{self.messanger.id}'

        async_to_sync(get_channel_layer().group_send)(
            channel_group, get_message(content, action)
        )


class GroupMessangerMessageFile(models.Model):
    message = models.ForeignKey(
        GroupMessangerMessage, related_name='files', verbose_name='сообщение', on_delete=models.CASCADE)

    file = models.FileField('файл', upload_to=files.group_messanger_message_file_uploading_to)

    class Meta:
        db_table = 'GroupMessangerMessageFile'
        verbose_name = 'Файл сообщения мессенджера группы'
        verbose_name_plural = 'Файлы сообщения мессенджера группы'

    def delete(self, using=None, keep_parents=False):
        files.delete_old_files(self.file)
        return super().delete(using, keep_parents)
