from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from server.utils.classes.permissions_classes import IsAdminUser
from .serializers import UserProfileSerializer, ShortUserProfile
from .permissions import IsUserProfileCanBeChangedOrDeleted
from .filters import ProjectsCountFilter


class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    queryset = get_user_model().objects.all().defer('is_admin', 'password')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsUserProfileCanBeChangedOrDeleted]


class SearchUsersView(generics.ListAPIView):
    serializer_class = ShortUserProfile
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter, DjangoFilterBackend]
    search_fields = ['email', 'first_name', 'last_name', 'patronymic']
    ordering_fields = ['projects_count']
    filterset_class = ProjectsCountFilter

    def get_queryset(self):
        return get_user_model().objects.filter(may_be_invited=True).exclude(id=self.request.user.id).annotate(
            projects_count=Count('projects')).only('id', 'photo', 'email', 'first_name', 'last_name', 'patronymic',
                                                   'description')


class AdminSearchUsersView(SearchUsersView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        return get_user_model().objects.exclude(id=self.request.user.id).annotate(
            projects_count=Count('projects')).only('id', 'photo', 'email', 'first_name', 'last_name', 'patronymic',
                                                   'description')
