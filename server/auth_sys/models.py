from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractBaseUser
from .validators import validate_password
from .managers import UserManager


class User(AbstractBaseUser):
    last_login = None

    is_admin = models.BooleanField(default=False)

    email = models.EmailField(_('email'), max_length=256, unique=True)
    password = models.CharField(_('password'), max_length=128, validators=[validate_password])

    first_name = models.CharField(_('first name'), max_length=128)
    last_name = models.CharField(_('last name'), max_length=128)
    patronymic = models.CharField(_('patronymic'), max_length=128, null=True, blank=True)

    birth_date = models.DateField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [
        'password',
        'first_name',
        'last_name'
    ]

    objects = UserManager()

    class Meta:
        db_table = 'User'
        verbose_name = _('User')
        verbose_name_plural = _('Users')

        indexes = [
            models.Index(fields=['email'], name='email_index'),
            models.Index(fields=['first_name', 'last_name', 'patronymic'], name='full_name_index')
        ]

    def get_full_name(self):
        return f'{self.last_name} {self.first_name} {self.patronymic}'

    def __str__(self):
        return self.email
