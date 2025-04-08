from django.db import models
from rest_framework.exceptions import ValidationError
from server.utils.functions.files import delete_files_by_related


class AbstractModelWithMembers(models.Model):
    members_count = models.IntegerField('количество участников', default=0, editable=False)

    class Meta:
        abstract = True

    def update_members_count(self):
        self.members_count = self.members.count()
        self.save(update_fields=['members_count'])

    def add_member(self, users):
        self.members.add(*users)
        self.update_members_count()

    def remove_member(self, user, validation_error_message=None):
        if not self.members.filter(id=user.id).exists():
            if validation_error_message:
                raise ValidationError({'detail': validation_error_message})
            return None

        self.members.remove(user)
        self.update_members_count()


class AbstractMessangerMessage(models.Model):
    message = models.TextField('сообщение')
    timestamp = models.DateTimeField('временная метка', auto_now_add=True, editable=False)

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        delete_files_by_related(
            self.files.all(), 'file'
        )
        return super().delete(using, keep_parents)
