from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter
from django.contrib.auth import get_user_model
from server.utils.classes.permissions_classes import IsAdminUser
from .serializers import UserProfileSerializer, ShortUserProfile
from .permissions import IsUserProfileCanBeChangedOrDeleted


class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    queryset = get_user_model().objects.all().defer('is_admin', 'password')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsUserProfileCanBeChangedOrDeleted]


class SearchUsersView(generics.ListAPIView):
    queryset = get_user_model().objects.all().only(
        'id', 'photo', 'email', 'first_name', 'last_name', 'patronymic', 'description')

    serializer_class = ShortUserProfile
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['email', 'first_name', 'last_name', 'patronymic']


class AdminSearchUsersView(SearchUsersView):
    permission_classes = [IsAdminUser]
