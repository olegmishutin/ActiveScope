from rest_framework.generics import CreateAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from asgiref.sync import sync_to_async
from .serializers import RegistrationSerializer, LoginSerializer, UserShortInfoSerializer
from .permissions import IsAnonymousUser


class RegistrationView(CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAnonymousUser]


@sync_to_async()
@api_view(['POST'])
@permission_classes([IsAnonymousUser])
def login_view(request):
    login_serializer = LoginSerializer(data=request.data)

    if login_serializer.is_valid(raise_exception=True):
        token_key = login_serializer.authenticate_user()

        return Response({'token': token_key}, status=status.HTTP_200_OK)


@sync_to_async()
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'detail': 'Успешно вышли из системы.'}, status=status.HTTP_200_OK)


@sync_to_async()
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def short_user_info_view(request):
    user_serializer = UserShortInfoSerializer(request.user, context={'request': request})
    return Response(user_serializer.data, status=status.HTTP_200_OK)
