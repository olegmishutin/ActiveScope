from rest_framework.exceptions import ValidationError


def validate_password(value):
    if len(value) < 6:
        raise ValidationError('Пароль должен быть длиннее пяти символов')

    if not any(char.isdigit() for char in value):
        raise ValidationError('Пароль должен содержать хотябы одну цифру')

    if not any(char.isupper() for char in value):
        raise ValidationError('Пароль должен содержать хотябы одну заглавную букву')
