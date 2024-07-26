from django.db import models
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from groups.models import Group


class Message(models.Model):
    topics = {
        'INV_GROUP': 'Приглашение в группу',
        'JOINED_GROUP': 'Пополнение в группе',
        'EXC_GROUP': 'Исключен из группы',
        'LEAVE_GROUP': 'Убавление в группе'
    }

    receiver = models.ForeignKey(
        get_user_model(), related_name='messages', verbose_name='получатель', on_delete=models.CASCADE)

    sender_group = models.ForeignKey(
        Group, related_name='messages', verbose_name='группа-отправитель', on_delete=models.CASCADE, null=True,
        blank=True)

    topic = models.CharField('тема', max_length=56, choices=topics, editable=False)
    date = models.DateTimeField('дата', auto_now_add=True, editable=False)
    text = models.TextField('текст', editable=False)
    is_readed = models.BooleanField('прочитано ли', default=False, editable=False)

    class Meta:
        db_table = 'Message'
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'

    @classmethod
    def create_invite_group_message(cls, group, user):
        if not cls.objects.filter(receiver=user, sender_group=group, is_readed=False).exists():
            return cls.objects.create(
                receiver=user, sender_group=group, topic='INV_GROUP',
                text=f'Мы приглашаем тебя в нашу группу {group.name}. Немного о нас: {group.description}')

        raise ValidationError({'detail': 'Вы уже отправляли приглашение этому пользователю.'})

    @classmethod
    def create_joined_group_message(cls, group, user):
        cls.objects.create(
            receiver=group.founder, topic='JOINED_GROUP',
            text=f'Пользователь {user.email} присоединился к вашей группе {group.name}')

    @classmethod
    def create_exclude_from_group_message(cls, group, user):
        cls.objects.create(receiver=user, topic='EXC_GROUP', text=f'Вы были исключены из группы {group.name}')

    @classmethod
    def create_leave_from_group_message(cls, group, user):
        cls.objects.create(
            receiver=group.founder, topic='LEAVE_GROUP',
            text=f'Пользователь {user.email} покинул вашу группу {group.name}')

    def __str__(self):
        return f'message_id {self.id}'
