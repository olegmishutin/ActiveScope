from django.db import models
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from server.utils.functions.files import set_new_file, delete_old_files


class Group(models.Model):
    founder = models.ForeignKey(
        get_user_model(), related_name='my_groups', verbose_name='основатель', on_delete=models.CASCADE)

    members = models.ManyToManyField(
        get_user_model(), db_table='UserGroup', related_name='groups', verbose_name='участники')

    icon = models.ImageField('иконка', upload_to='groups/', null=True, blank=True)
    name = models.CharField('название', max_length=128, db_index=True, unique=True)
    created_date = models.DateField('дата создания', auto_now_add=True, editable=False)
    members_count = models.IntegerField('количество участников', default=0, editable=False)
    description = models.TextField('описание', null=True, blank=True)

    class Meta:
        db_table = 'Group'
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'

    def update_members_count(self, factor):
        self.members_count += factor
        self.save(update_fields=['members_count'])

    def add_member(self, user):
        self.members.add(user)
        self.update_members_count(1)

    def remove_member(self, user, validation_error_message):
        if self.members.filter(id=user.id).exists():
            self.members.remove(user)

            self.update_members_count(-1)
        raise ValidationError({'detail': validation_error_message})

    def change_icon(self, file):
        set_new_file(self, 'icon', file)

    def delete(self, using=None, keep_parents=False):
        delete_old_files(self.icon)
        return super().delete(using, keep_parents)

    def __str__(self):
        return self.name
