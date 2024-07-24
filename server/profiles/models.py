from django.db import models
from django.contrib.auth import get_user_model
from server.utils.functions import set_new_file, delete_old_files


def profile_file_uploading_to(instance, file):
    return f'{instance.user.email}/profile/{file}'


class Profile(models.Model):
    user = models.OneToOneField(get_user_model(), verbose_name='пользователь', on_delete=models.CASCADE)
    photo = models.ImageField('фото', upload_to=profile_file_uploading_to, null=True, blank=True)
    header_image = models.ImageField('фоновая картинка', upload_to=profile_file_uploading_to, null=True, blank=True)
    description = models.TextField('описание', null=True, blank=True)

    class Meta:
        db_table = 'Profile'
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'

    def change_photo(self, file):
        self.photo = set_new_file(self.photo, file)

    def change_header_image(self, file):
        self.header_image = set_new_file(self.header_image, file)

    def delete(self, using=None, keep_parents=False):
        delete_old_files(self.photo, self.header_image)
        return super().delete(using, keep_parents)

    def __str__(self):
        return f'{self.user.email} profile'
