from django.db import models
from django.utils.translation import gettext_lazy as _
from auth_sys.models import User
from server.utils import delete_existing_file


def profile_file_uploading_to(instance, file):
    return f'{instance.user.email}/profile/{file}'


class Profile(models.Model):
    user = models.OneToOneField(User, verbose_name=_('user'), related_name='profile', on_delete=models.CASCADE)
    photo = models.ImageField(_('photo'), upload_to=profile_file_uploading_to, null=True, blank=True)
    header_image = models.ImageField(_('image of header'), upload_to=profile_file_uploading_to, null=True, blank=True)
    description = models.TextField(_('description'), null=True, blank=True)

    class Meta:
        db_table = 'Profile'
        verbose_name = _('profile')
        verbose_name_plural = _('profiles')

    def change_photo(self, file):
        delete_existing_file(self.photo)
        self.photo = file

    def change_header_image(self, file):
        delete_existing_file(self.header_image)
        self.header_image = file

    def __str__(self):
        return f'{self.user.email} profile'
