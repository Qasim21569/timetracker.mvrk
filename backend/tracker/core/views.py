from django.shortcuts import render
from rest_framework import generics, permissions, status
from .models import Project, HourEntry, User
from .serializers import ProjectSerializer, HourEntrySerializer, UserSerializer
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from datetime import datetime
from .services import ProjectAssignmentService
from .serializers import ProjectAssignmentSerializer, ProjectAssignmentRequestSerializer
from django.core.exceptions import ValidationError, PermissionDenied

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
        queryset = HourEntry.objects.filter(user=user)
        
        if user.is_admin:
            queryset = HourEntry.objects.all()
            
        # Add date filtering
        date_param = self.request.query_params.get('date', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if date_param:
            queryset = queryset.filter(date=date_param)
        elif start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(date__gte=start_date)
        elif end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset.order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserProfileView(APIView):
    """Get current user profile information"""
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        return Response({
            'id': data.get('id'),
            'username': data.get('username'),
            'email': data.get('email'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'name': data.get('name'),
            'is_admin': data.get('is_admin'),
            'role': data.get('role'),
            'is_active': data.get('is_active'),
            'date_joined': data.get('date_joined')
        })

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific project"""
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Project.objects.all()
        return Project.objects.filter(owner=user)

class HourEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific hour entry"""
    serializer_class = HourEntrySerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return HourEntry.objects.all()
        return HourEntry.objects.filter(user=user)


# ===== USER MANAGEMENT VIEWS =====

class IsAdminPermission(permissions.BasePermission):
    """Custom permission to only allow admin users to access certain views."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class UserListView(generics.ListCreateAPIView):
    """List all users (admin only) or create new user (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminPermission]
    
    def get_queryset(self):
        """Allow filtering by role and status"""
        queryset = User.objects.all().order_by('-date_joined')
        
        # Filter by role
        role = self.request.query_params.get('role', None)
        if role == 'admin':
            queryset = queryset.filter(is_admin=True)
        elif role == 'user':
            queryset = queryset.filter(is_admin=False)
            
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific user (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminPermission]
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete user by setting is_active=False"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message': 'User deactivated successfully'}, status=status.HTTP_200_OK)


class UpdateUserProfileView(APIView):
    """Allow users to update their own profile"""
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ===== PROJECT ASSIGNMENT VIEWS =====


class ProjectAssignUsersView(APIView):
    """Assign multiple users to a project (admin only)"""
    permission_classes = [IsAdminPermission]
    
    def post(self, request, project_id):
        """Assign users to a project"""
        serializer = ProjectAssignmentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_ids = serializer.validated_data['user_ids']
            notes = serializer.validated_data.get('notes', '')
            
            result = ProjectAssignmentService.assign_users_to_project(
                project_id=project_id,
                user_ids=user_ids,
                assigned_by_user=request.user,
                notes=notes
            )
            
            return Response({
                'success': True,
                'message': f'Assignment operation completed for project "{result["project_name"]}"',
                'data': result
            }, status=status.HTTP_200_OK)
            
        except (ValidationError, PermissionDenied) as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': 'An unexpected error occurred'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProjectUnassignUsersView(APIView):
    """Remove users from a project (admin only)"""
    permission_classes = [IsAdminPermission]
    
    def post(self, request, project_id):
        """Unassign users from a project"""
        serializer = ProjectAssignmentRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_ids = serializer.validated_data['user_ids']
            
            result = ProjectAssignmentService.unassign_users_from_project(
                project_id=project_id,
                user_ids=user_ids,
                assigned_by_user=request.user
            )
            
            return Response({
                'success': True,
                'message': f'Unassignment operation completed for project "{result["project_name"]}"',
                'data': result
            }, status=status.HTTP_200_OK)
            
        except (ValidationError, PermissionDenied) as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': 'An unexpected error occurred'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProjectAssignmentsView(APIView):
    """Get all assignments for a project"""
    
    def get(self, request, project_id):
        """Get project assignments"""
        try:
            include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
            assignments = ProjectAssignmentService.get_project_assignments(
                project_id=project_id,
                include_inactive=include_inactive
            )
            
            return Response({
                'success': True,
                'data': assignments
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProjectsView(APIView):
    """Get all projects assigned to a user"""
    
    def get(self, request, user_id):
        """Get user's assigned projects"""
        try:
            # Users can only see their own projects unless they're admin
            if not request.user.is_admin and request.user.id != user_id:
                return Response({
                    'success': False,
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
            projects = ProjectAssignmentService.get_user_projects(
                user_id=user_id,
                include_inactive=include_inactive
            )
            
            return Response({
                'success': True,
                'data': projects
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class AssignmentStatsView(APIView):
    """Get assignment statistics (admin only)"""
    permission_classes = [IsAdminPermission]
    
    def get(self, request):
        """Get assignment statistics"""
        try:
            stats = ProjectAssignmentService.get_assignment_stats()
            return Response({
                'success': True,
                'data': stats
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
