from django.db import models
from rest_framework.exceptions import ValidationError


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