from django.db.models import Manager
from rest_framework.exceptions import ValidationError
from server.utils.for_websockets import send_signal_to_socket


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
        self.create(receiver=group.founder, topic='LEAVE_GROUP',
                    text=f'Пользователь {user.email} покинул вашу группу {group.name}')

    def create_remove_from_project_message(self, project, user):
        self.create(receiver=user, topic='EXC_PROJECT', text=f'Вы были исключены из проекта {project.name}')

    def create_leave_from_project_message(self, project, user):
        self.create(receiver=project.owner, topic='LEAVE_PROJECT',
                    text=f'Пользователь {user.email} покинул проект {project.name}')

    def create_remove_from_group_messanger_message(self, messanger, user):
        self.create(receiver=user, topic='EXC_GROUP_MESSANGER',
                    text=f'Вы были исключены из мессенджера {messanger.name} группы {messanger.group.name}')

    def create_leave_from_group_messanger_message(self, messanger, user):
        self.create(receiver=messanger.group.founder, topic='LEAVE_GROUP_MESSANGER',
                    text=f'Пользователь {user.email} покинул мессенджер {messanger.name} группы {messanger.group.name}')

    def get_project_task_messages_objects(self, data):
        ret_data = []
        users_data, projects_data, tasks_data, days_data = [], [], [], []

        for info in data:
            users_data.append(info['user'])
            projects_data.append(info['project'])
            tasks_data.append(info['task'])
            days_data.append(info['days_left'])

        finded_existed_messages = self.filter(
            topic='TASKS', receiver__in=users_data, sender_project__in=projects_data, days_left__in=days_data,
            sender_project_task__in=tasks_data).select_related('receiver', 'sender_project', 'sender_project_task')

        for messages in finded_existed_messages:
            data.remove(
                {
                    'user': messages.receiver,
                    'project': messages.sender_project,
                    'task': messages.sender_project_task,
                    'days_left': messages.days_left
                }
            )

        for info in data:
            days_left = info['days_left']

            if days_left in (14, 7, 3, 2, 1):
                user = info['user']
                project = info['project']
                task = info['task']

                if days_left < 2:
                    days_left_text = f'{days_left} день'
                elif days_left > 1 and days_left < 5:
                    days_left_text = f'{days_left} дня'
                else:
                    days_left_text = f'{days_left} дней'

                ret_data.append(self.model(
                    receiver=user, topic='TASKS', sender_project=project, sender_project_task=task, days_left=days_left,
                    text=f'Задача "{task.name}" проекта "{project.name}" должна быть выполнена через {days_left_text}'))

        return ret_data

    def create(self, **kwargs):
        instance = super().create(**kwargs)
        send_signal_to_socket('Messages', instance.receiver.id)
        return instance
