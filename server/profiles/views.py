from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserProfileSerializer
from .permissions import IsUserProfileCanBeChangedOrDeleted


class UserProfileView(RetrieveUpdateDestroyAPIView):
    queryset = get_user_model().objects.all().defer('is_admin', 'password')
    serializer_class = UserProfileSerializer
    lookup_field = 'email'
    permission_classes = [IsAuthenticated, IsUserProfileCanBeChangedOrDeleted]

    def get_object(self):
        user_email = self.kwargs.get(self.lookup_field)

        if user_email == 'me':
            return self.request.user
        return super().get_object()
