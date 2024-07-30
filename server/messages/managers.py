from django.db.models import Manager
from rest_framework.exceptions import ValidationError


class MessagesManager(Manager):
    def create_invite_in_group_message(self, group, user):
        if self.filter(receiver=user, sender_group=group, is_readed=False).exists():
            raise ValidationError({'detail': 'Вы уже отправляли приглашение этому пользователю.'})

        return self.create(
            receiver=user, sender_group=group, topic='INV_GROUP',
            text=f'Мы приглашаем тебя в нашу группу {group.name}. Немного о нас: {group.description}')

    def create_joined_group_message(self, group, user):
        self.create(
            receiver=group.founder, topic='JOINED_GROUP',
            text=f'Пользователь {user.email} присоединился к вашей группе {group.name}')

    def create_remove_from_group_message(self, group, user):
        self.create(receiver=user, topic='EXC_GROUP', text=f'Вы были исключены из группы {group.name}')

    def create_leave_from_group_message(self, group, user):
        self.create(
            receiver=group.founder, topic='LEAVE_GROUP',
            text=f'Пользователь {user.email} покинул вашу группу {group.name}')
