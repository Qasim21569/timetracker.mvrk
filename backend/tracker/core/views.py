from django.shortcuts import render
from rest_framework import generics, permissions, status
from .models import Project, HourEntry, User
from .serializers import ProjectSerializer, HourEntrySerializer, UserSerializer
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from datetime import datetime, timedelta
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
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, status=400)
        
        user = authenticate(request, username=email, password=password)  # username param is used for email
        if not user:
            return Response({'error': 'Invalid email or password'}, status=400)
        
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})

class ProjectListView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Project.objects.all()
        
        # For regular users, show projects they own OR are assigned to
        from django.db.models import Q
        return Project.objects.filter(
            Q(owner=user) | Q(assignments__user=user, assignments__is_active=True)
        ).distinct()

    def perform_create(self, serializer):
        start_date = serializer.validated_data.get('start_date')
        end_date = serializer.validated_data.get('end_date')
        
        # Validate that both start_date and end_date are provided
        if not start_date or not end_date:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Both start_date and end_date are required for project creation.")
        
        # Validate that start_date is not after end_date
        if start_date > end_date:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Start date cannot be after end date.")
        
        serializer.save(owner=self.request.user)

class HourEntryListView(generics.ListCreateAPIView):
    serializer_class = HourEntrySerializer

    def get_queryset(self):
        user = self.request.user
        queryset = HourEntry.objects.filter(user=user)
        
        if user.is_admin:
            queryset = HourEntry.objects.all()
            
            # Admin can filter by user
            user_param = self.request.query_params.get('user', None)
            if user_param:
                queryset = queryset.filter(user_id=user_param)
        
        # Project filtering (for both admin and regular users)
        project_param = self.request.query_params.get('project', None)
        if project_param:
            queryset = queryset.filter(project_id=project_param)
            
        # Date filtering
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
        user = self.request.user
        project = serializer.validated_data.get('project')
        entry_date = serializer.validated_data.get('date')
        hours = serializer.validated_data.get('hours')
        note = serializer.validated_data.get('note', '')
        
        # Validate that user can log time for this project
        from django.db.models import Q
        accessible_projects = Project.objects.filter(
            Q(owner=user) | Q(assignments__user=user, assignments__is_active=True)
        ).distinct()
        
        if project not in accessible_projects:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only log time for projects you own or are assigned to.")
        
        # Validate that project was active on the entry date
        if not project.was_active_on_date(entry_date):
            from rest_framework.exceptions import ValidationError
            if not project.start_date or not project.end_date:
                raise ValidationError("Cannot log time for projects without start and end dates. Please contact admin to set project dates.")
            else:
                raise ValidationError(f"Cannot log time for this date. Project '{project.name}' was only active from {project.start_date} to {project.end_date}.")
        
        # UPDATE or CREATE in a single call
        entry, created = HourEntry.objects.update_or_create(
            user=user,
            project=project,
            date=entry_date,
            defaults={
                "hours": hours,
                "note": note
            }
        )
    
        # Make sure DRF serializer knows about the instance
        serializer.instance = entry

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
    
    def perform_update(self, serializer):
        start_date = serializer.validated_data.get('start_date', serializer.instance.start_date)
        end_date = serializer.validated_data.get('end_date', serializer.instance.end_date)
        
        # Validate that both start_date and end_date are provided
        if not start_date or not end_date:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Both start_date and end_date are required. Projects must have defined active periods.")
        
        # Validate that start_date is not after end_date
        if start_date > end_date:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Start date cannot be after end date.")
        
        serializer.save()

class HourEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a specific hour entry"""
    serializer_class = HourEntrySerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return HourEntry.objects.all()
        return HourEntry.objects.filter(user=user)

    def perform_update(self, serializer):
        user = self.request.user
        project = serializer.validated_data.get('project', serializer.instance.project)
        entry_date = serializer.validated_data.get('date', serializer.instance.date)
        
        # Validate that user can log time for this project
        from django.db.models import Q
        accessible_projects = Project.objects.filter(
            Q(owner=user) | Q(assignments__user=user, assignments__is_active=True)
        ).distinct()
        
        if project not in accessible_projects:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only log time for projects you own or are assigned to.")
        
        # Validate that project was active on the entry date
        if not project.was_active_on_date(entry_date):
            from rest_framework.exceptions import ValidationError
            if not project.start_date or not project.end_date:
                raise ValidationError("Cannot log time for projects without start and end dates. Please contact admin to set project dates.")
            else:
                raise ValidationError(f"Cannot log time for this date. Project '{project.name}' was only active from {project.start_date} to {project.end_date}.")
        
        serializer.save()


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


# ===== CYCLE 3: ADVANCED TIME TRACKING & REPORTING VIEWS =====

class DailySummaryView(APIView):
    """Get daily summary of hours worked"""
    
    def get(self, request):
        """Get daily time summary"""
        try:
            from django.db.models import Sum
            from datetime import datetime, timedelta
            
            user = request.user
            date_param = request.query_params.get('date')
            user_param = request.query_params.get('user')
            
            # Default to today if no date provided
            if date_param:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            else:
                target_date = datetime.now().date()
            
            # Base queryset
            queryset = HourEntry.objects.filter(date=target_date)
            
            # Apply user filtering
            if user.is_admin and user_param:
                queryset = queryset.filter(user_id=user_param)
            elif not user.is_admin:
                queryset = queryset.filter(user=user)
            
            # Get total hours for the day
            total_hours = queryset.aggregate(total=Sum('hours'))['total'] or 0
            
            # Get breakdown by project
            project_breakdown = list(queryset.values(
                'project__id', 
                'project__name'
            ).annotate(
                total_hours=Sum('hours')
            ).order_by('-total_hours'))
            
            return Response({
                'success': True,
                'data': {
                    'date': target_date.isoformat(),
                    'total_hours': float(total_hours),
                    'project_breakdown': project_breakdown
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class WeeklySummaryView(APIView):
    """Get weekly summary of hours worked"""
    
    def get(self, request):
        """Get weekly time summary"""
        try:
            from django.db.models import Sum
            from datetime import datetime, timedelta
            import calendar
            
            user = request.user
            week_param = request.query_params.get('week')  # Expected format: YYYY-MM-DD (Monday of the week)
            user_param = request.query_params.get('user')
            
            # Default to current week if no week provided
            if week_param:
                week_start = datetime.strptime(week_param, '%Y-%m-%d').date()
            else:
                today = datetime.now().date()
                week_start = today - timedelta(days=today.weekday())  # Monday of current week
            
            week_end = week_start + timedelta(days=6)  # Sunday
            
            # Base queryset
            queryset = HourEntry.objects.filter(date__range=[week_start, week_end])
            
            # Apply user filtering
            if user.is_admin and user_param:
                queryset = queryset.filter(user_id=user_param)
            elif not user.is_admin:
                queryset = queryset.filter(user=user)
            
            # Get total hours for the week
            total_hours = queryset.aggregate(total=Sum('hours'))['total'] or 0
            
            # Get daily breakdown
            daily_breakdown = []
            for i in range(7):
                day = week_start + timedelta(days=i)
                day_hours = queryset.filter(date=day).aggregate(total=Sum('hours'))['total'] or 0
                daily_breakdown.append({
                    'date': day.isoformat(),
                    'day_name': calendar.day_name[day.weekday()],
                    'hours': float(day_hours)
                })
            
            # Get project breakdown
            project_breakdown = list(queryset.values(
                'project__id', 
                'project__name'
            ).annotate(
                total_hours=Sum('hours')
            ).order_by('-total_hours'))
            
            return Response({
                'success': True,
                'data': {
                    'week_start': week_start.isoformat(),
                    'week_end': week_end.isoformat(),
                    'total_hours': float(total_hours),
                    'daily_breakdown': daily_breakdown,
                    'project_breakdown': project_breakdown
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class MonthlySummaryView(APIView):
    """Get monthly summary of hours worked"""
    
    def get(self, request):
        """Get monthly time summary"""
        try:
            from django.db.models import Sum
            from datetime import datetime
            import calendar
            
            user = request.user
            month_param = request.query_params.get('month')  # Expected format: YYYY-MM
            user_param = request.query_params.get('user')
            
            # Default to current month if no month provided
            if month_param:
                year, month = map(int, month_param.split('-'))
            else:
                today = datetime.now()
                year, month = today.year, today.month
            
            # Get month range
            month_start = datetime(year, month, 1).date()
            if month == 12:
                month_end = datetime(year + 1, 1, 1).date() - timedelta(days=1)
            else:
                month_end = datetime(year, month + 1, 1).date() - timedelta(days=1)
            
            # Base queryset
            queryset = HourEntry.objects.filter(date__range=[month_start, month_end])
            
            # Apply user filtering
            if user.is_admin and user_param:
                queryset = queryset.filter(user_id=user_param)
            elif not user.is_admin:
                queryset = queryset.filter(user=user)
            
            # Get total hours for the month
            total_hours = queryset.aggregate(total=Sum('hours'))['total'] or 0
            
            # Get daily breakdown
            daily_breakdown = []
            current_date = month_start
            while current_date <= month_end:
                day_hours = queryset.filter(date=current_date).aggregate(total=Sum('hours'))['total'] or 0
                daily_breakdown.append({
                    'date': current_date.isoformat(),
                    'day_name': calendar.day_name[current_date.weekday()],
                    'hours': float(day_hours)
                })
                current_date += timedelta(days=1)
            
            # Get project breakdown
            project_breakdown = list(queryset.values(
                'project__id', 
                'project__name'
            ).annotate(
                total_hours=Sum('hours')
            ).order_by('-total_hours'))
            
            return Response({
                'success': True,
                'data': {
                    'month': f"{year}-{month:02d}",
                    'month_name': calendar.month_name[month],
                    'year': year,
                    'total_hours': float(total_hours),
                    'daily_breakdown': daily_breakdown,
                    'project_breakdown': project_breakdown
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ProjectTimeReportView(APIView):
    """Get time reports for specific projects"""
    
    def get(self, request, project_id):
        """Get project time report"""
        try:
            from django.db.models import Sum
            from datetime import datetime
            
            user = request.user
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            # Check if user can access this project
            if not user.is_admin:
                from django.db.models import Q
                accessible_projects = Project.objects.filter(
                    Q(owner=user) | Q(assignments__user=user, assignments__is_active=True)
                ).distinct()
                
                if not accessible_projects.filter(id=project_id).exists():
                    return Response({
                        'success': False,
                        'error': 'You do not have access to this project'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            # Get project
            try:
                project = Project.objects.get(id=project_id)
            except Project.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'Project not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Base queryset for this project
            queryset = HourEntry.objects.filter(project_id=project_id)
            
            # Apply date filtering if provided
            if start_date and end_date:
                queryset = queryset.filter(date__range=[start_date, end_date])
            elif start_date:
                queryset = queryset.filter(date__gte=start_date)
            elif end_date:
                queryset = queryset.filter(date__lte=end_date)
            
            # Apply user filtering for non-admin users
            if not user.is_admin:
                queryset = queryset.filter(user=user)
            
            # Get total hours
            total_hours = queryset.aggregate(total=Sum('hours'))['total'] or 0
            
            # Get user breakdown (who worked on this project)
            user_breakdown = list(queryset.values(
                'user__id',
                'user__first_name',
                'user__last_name',
                'user__username'
            ).annotate(
                total_hours=Sum('hours')
            ).order_by('-total_hours'))
            
            # Get recent entries
            recent_entries = list(queryset.select_related('user').order_by('-date')[:10].values(
                'id', 'date', 'hours', 'note',
                'user__first_name', 'user__last_name', 'user__username'
            ))
            
            return Response({
                'success': True,
                'data': {
                    'project': {
                        'id': project.id,
                        'name': project.name,
                        'client': project.client
                    },
                    'total_hours': float(total_hours),
                    'user_breakdown': user_breakdown,
                    'recent_entries': recent_entries,
                    'date_range': {
                        'start_date': start_date,
                        'end_date': end_date
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
