from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserProfileSerializer
from .permissions import IsUserProfileCanBeChangedOrDeleted


class UserProfileView(RetrieveUpdateDestroyAPIView):
    queryset = get_user_model().objects.all().defer('is_admin', 'password').select_related('profile')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsUserProfileCanBeChangedOrDeleted]
