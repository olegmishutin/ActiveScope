from rest_framework import serializers


class WriteOnlyField(serializers.Field):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.write_only = True
        self.required = False


class WriteOnlyImageField(WriteOnlyField, serializers.ImageField):
    pass


class WriteOnlyCharField(WriteOnlyField, serializers.CharField):
    pass
