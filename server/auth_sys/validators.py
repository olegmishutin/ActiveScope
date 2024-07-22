from rest_framework.serializers import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_password(value):
    if len(value) < 6:
        raise ValidationError(_('Password must be longer than 5 characters'))

    if not any(char.isdigit() for char in value):
        raise ValidationError(_('The password must contain at least one number'))

    if not any(char.isupper() for char in value):
        raise ValidationError(_('The password must contain at least one capital letter'))
