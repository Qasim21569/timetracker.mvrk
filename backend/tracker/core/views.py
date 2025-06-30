from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Project, HourEntry, User
from .serializers import ProjectSerializer, HourEntrySerializer, UserSerializer
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

# Create your views here.

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class ObtainTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.contrib.auth import authenticate
        user = authenticate(username=request.data['username'], password=request.data['password'])
        if not user:
            return Response({'error': 'Invalid Credentials'}, status=400)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})

class ProjectListView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Project.objects.all()
        return Project.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class HourEntryListView(generics.ListCreateAPIView):
    serializer_class = HourEntrySerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return HourEntry.objects.all()
        return HourEntry.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
