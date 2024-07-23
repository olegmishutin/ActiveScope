from rest_framework.generics import CreateAPIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import RegistrationSerializer, LoginSerializer


class RegistrationView(CreateAPIView):
    serializer_class = RegistrationSerializer


@api_view(['POST'])
def login_view(request):
    login_serializer = LoginSerializer(data=request.data)

    if login_serializer.is_valid(raise_exception=True):
        token_key = login_serializer.save()

        return Response({'token': token_key}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    request.user.auth_token.delete()
    return Response({'detail': 'Успешно вышли из системы'}, status=status.HTTP_200_OK)
