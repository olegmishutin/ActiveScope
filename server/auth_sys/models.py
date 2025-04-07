from django.utils import timezone
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from rest_framework.authtoken.models import Token as RestTokenModel
from server.utils.functions import files
from .validators import validate_password
from .managers import UserManager


class Token(RestTokenModel):
    class Meta(RestTokenModel.Meta):
        db_table = 'Token'
        abstract = False

    def is_not_valid(self, delete=False):
        result = self.created < timezone.now() - settings.EXPIRE_TOKEN_IN

        if result and delete:
            self.delete()

        return result


class User(AbstractBaseUser):
    last_login = None
    is_admin = models.BooleanField(default=False)

    email = models.EmailField('email', max_length=256, unique=True)
    password = models.CharField('пароль', max_length=128, validators=[validate_password])
    first_name = models.CharField('имя', max_length=128, db_index=True)
    last_name = models.CharField('фамилия', max_length=128, db_index=True)

    patronymic = models.CharField('отчество', max_length=128, null=True, blank=True)
    birth_date = models.DateField('дата рождения', null=True, blank=True)

    photo = models.ImageField('фото', upload_to=files.user_file_uploading_to, null=True, blank=True)
    header_image = models.ImageField('фоновая картинка', upload_to=files.user_file_uploading_to, null=True, blank=True)
    description = models.TextField('описание', null=True, blank=True)
    may_be_invited = models.BooleanField('может быть приглашен', default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['password', 'first_name', 'last_name']

    objects = UserManager()

    class Meta:
        db_table = 'User'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

        indexes = [
            models.Index(fields=['email'], name='email_index'),
            models.Index(fields=['first_name', 'last_name', 'patronymic'], name='full_name_index')
        ]

    def get_full_name(self):
        return f'{self.last_name} {self.first_name}{" " + self.patronymic if self.patronymic else ""}'

    def change_photo(self, file):
        files.set_new_file(self, 'photo', file)

    def change_header_image(self, file):
        files.set_new_file(self, 'header_image', file)

    def delete(self, using=None, keep_parents=False):
        files.delete_old_files(self.photo, self.header_image)

        for group in self.my_groups.all():
            files.delete_folder(f'groups/{group.id}')

        for message in self.groups_messangers_messages.all().prefetch_related('files'):
            files.delete_files_by_related(
                message.files.all(), 'file'
            )

        for project in self.my_projects.all():
            files.delete_folder(f'projects/{project.id}')

        super().delete(using, keep_parents)

    def __str__(self):
        return self.email
