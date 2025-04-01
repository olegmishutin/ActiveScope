from django.db import models
from django.contrib.auth import get_user_model
from groups.models import Group, GroupMessanger
from projects.models import Project, ProjectTask
from .managers import MessagesManager


class Message(models.Model):
    topics = {
        'INV_GROUP': 'Приглашение в группу',
        'JOINED_GROUP': 'Пополнение в группе',
        'EXC_GROUP': 'Исключен из группы',
        'LEAVE_GROUP': 'Убавление в группе',

        'EXC_PROJECT': 'Исключение из проекта',
        'LEAVE_PROJECT': 'Убавление в проекте',

        'EXC_GROUP_MESSANGER': 'Исключен из мессенджера группы',
        'LEAVE_GROUP_MESSANGER': 'Убавление в месенджере группы',

        'TASKS': 'Уведомление о задаче'
    }

    receiver = models.ForeignKey(
        get_user_model(), related_name='messages', verbose_name='получатель', on_delete=models.CASCADE)

    sender_group = models.ForeignKey(
        Group, related_name='messages', verbose_name='группа-отправитель', on_delete=models.CASCADE, null=True,
        blank=True)

    sender_project = models.ForeignKey(
        Project, related_name='messages', verbose_name='проект-отправитель', on_delete=models.CASCADE, null=True,
        blank=True)

    sender_project_task = models.ForeignKey(
        ProjectTask, related_name='messages', verbose_name='проектная-задача-отправитель', on_delete=models.CASCADE,
        null=True, blank=True)

    days_left = models.PositiveSmallIntegerField('остаточные дни', null=True, blank=True, editable=False)

    topic = models.CharField('тема', max_length=56, choices=topics, editable=False)
    date = models.DateTimeField('дата', auto_now_add=True, editable=False)
    text = models.TextField('текст', editable=False)
    is_readed = models.BooleanField('прочитано ли', default=False, editable=False)

    objects = MessagesManager()

    class Meta:
        db_table = 'Message'
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    def __str__(self):
        return f'message_id {self.id}'
