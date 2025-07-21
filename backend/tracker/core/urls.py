from django.urls import path
from .views import (
    SignupView, 
    ObtainTokenView, 
    ProjectListView, 
    ProjectDetailView,
    HourEntryListView,
    HourEntryDetailView,
    UserProfileView,
    UserListView,
    UserDetailView,
    UpdateUserProfileView,
    # Assignment views
    ProjectAssignUsersView,
    ProjectUnassignUsersView,
    ProjectAssignmentsView,
    UserProjectsView,
    AssignmentStatsView,
    # Cycle 3: Advanced Time Tracking & Reporting views
    DailySummaryView,
    WeeklySummaryView,
    MonthlySummaryView,
    ProjectTimeReportView
)

urlpatterns = [
    # Authentication endpoints
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', ObtainTokenView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', UpdateUserProfileView.as_view(), name='update-profile'),
    
    # User management endpoints (admin only)
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    # Project endpoints
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    
    # Time tracking endpoints
    path('hours/', HourEntryListView.as_view(), name='hour-entry-list'),
    path('hours/<int:pk>/', HourEntryDetailView.as_view(), name='hour-entry-detail'),
    
    # Project assignment endpoints (admin only)
    path('projects/<int:project_id>/assign/', ProjectAssignUsersView.as_view(), name='project-assign-users'),
    path('projects/<int:project_id>/unassign/', ProjectUnassignUsersView.as_view(), name='project-unassign-users'),
    path('projects/<int:project_id>/assignments/', ProjectAssignmentsView.as_view(), name='project-assignments'),
    
    # User project endpoints
    path('users/<int:user_id>/projects/', UserProjectsView.as_view(), name='user-projects'),
    
    # Assignment statistics (admin only)
    path('assignments/stats/', AssignmentStatsView.as_view(), name='assignment-stats'),
    
    # Cycle 3: Advanced Time Tracking & Reporting endpoints
    path('time/daily/', DailySummaryView.as_view(), name='daily-summary'),
    path('time/weekly/', WeeklySummaryView.as_view(), name='weekly-summary'),
    path('time/monthly/', MonthlySummaryView.as_view(), name='monthly-summary'),
    path('projects/<int:project_id>/time-report/', ProjectTimeReportView.as_view(), name='project-time-report'),
] 