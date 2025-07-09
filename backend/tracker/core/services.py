"""
Service layer for Time Tracker application
Implements business logic following separation of concerns principle
"""

from typing import List, Dict, Any, Optional
from django.db import transaction
from django.core.exceptions import ValidationError, PermissionDenied
from django.contrib.auth import get_user_model
from .models import Project, ProjectAssignment, HourEntry

User = get_user_model()


class ProjectAssignmentService:
    """
    Service class for managing project assignments
    Encapsulates business logic and provides clean API for views
    """
    
    @staticmethod
    def assign_users_to_project(
        project_id: int, 
        user_ids: List[int], 
        assigned_by_user: User,
        notes: str = ""
    ) -> Dict[str, Any]:
        """
        Assign multiple users to a project
        
        Args:
            project_id: ID of the project
            user_ids: List of user IDs to assign
            assigned_by_user: User making the assignment (must be admin)
            notes: Optional notes about the assignment
            
        Returns:
            Dict with assignment results and statistics
            
        Raises:
            PermissionDenied: If user is not admin
            ValidationError: If validation fails
        """
        # Permission check
        if not assigned_by_user.is_admin:
            raise PermissionDenied("Only admin users can assign projects")
        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise ValidationError(f"Project with ID {project_id} does not exist")
        
        # Validate user IDs exist
        users = User.objects.filter(id__in=user_ids)
        if len(users) != len(user_ids):
            invalid_ids = set(user_ids) - set(users.values_list('id', flat=True))
            raise ValidationError(f"Invalid user IDs: {list(invalid_ids)}")
        
        results = {
            'project_id': project_id,
            'project_name': project.name,
            'assigned': [],
            'already_assigned': [],
            'errors': []
        }
        
        with transaction.atomic():
            for user in users:
                try:
                    assignment, created = ProjectAssignment.objects.get_or_create(
                        project=project,
                        user=user,
                        defaults={
                            'assigned_by': assigned_by_user,
                            'notes': notes,
                            'is_active': True
                        }
                    )
                    
                    if created:
                        results['assigned'].append({
                            'user_id': user.id,
                            'username': user.username,
                            'name': f"{user.first_name} {user.last_name}".strip()
                        })
                    else:
                        # Reactivate if previously deactivated
                        if not assignment.is_active:
                            assignment.is_active = True
                            assignment.assigned_by = assigned_by_user
                            assignment.notes = notes
                            assignment.save()
                            results['assigned'].append({
                                'user_id': user.id,
                                'username': user.username,
                                'name': f"{user.first_name} {user.last_name}".strip(),
                                'reactivated': True
                            })
                        else:
                            results['already_assigned'].append({
                                'user_id': user.id,
                                'username': user.username,
                                'name': f"{user.first_name} {user.last_name}".strip()
                            })
                            
                except Exception as e:
                    results['errors'].append({
                        'user_id': user.id,
                        'username': user.username,
                        'error': str(e)
                    })
        
        return results
    
    @staticmethod
    def unassign_users_from_project(
        project_id: int, 
        user_ids: List[int], 
        assigned_by_user: User
    ) -> Dict[str, Any]:
        """
        Remove users from a project (soft delete)
        
        Args:
            project_id: ID of the project
            user_ids: List of user IDs to unassign
            assigned_by_user: User making the change (must be admin)
            
        Returns:
            Dict with unassignment results
        """
        # Permission check
        if not assigned_by_user.is_admin:
            raise PermissionDenied("Only admin users can unassign projects")
        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise ValidationError(f"Project with ID {project_id} does not exist")
        
        results = {
            'project_id': project_id,
            'project_name': project.name,
            'unassigned': [],
            'not_assigned': [],
            'errors': []
        }
        
        with transaction.atomic():
            assignments = ProjectAssignment.objects.filter(
                project_id=project_id,
                user_id__in=user_ids,
                is_active=True
            ).select_related('user')
            
            for assignment in assignments:
                try:
                    assignment.is_active = False
                    assignment.save()
                    results['unassigned'].append({
                        'user_id': assignment.user.id,
                        'username': assignment.user.username,
                        'name': f"{assignment.user.first_name} {assignment.user.last_name}".strip()
                    })
                except Exception as e:
                    results['errors'].append({
                        'user_id': assignment.user.id,
                        'username': assignment.user.username,
                        'error': str(e)
                    })
            
            # Find users that weren't assigned to begin with
            assigned_user_ids = set(assignments.values_list('user_id', flat=True))
            not_assigned_ids = set(user_ids) - assigned_user_ids
            
            if not_assigned_ids:
                not_assigned_users = User.objects.filter(id__in=not_assigned_ids)
                for user in not_assigned_users:
                    results['not_assigned'].append({
                        'user_id': user.id,
                        'username': user.username,
                        'name': f"{user.first_name} {user.last_name}".strip()
                    })
        
        return results
    
    @staticmethod
    def get_project_assignments(project_id: int, include_inactive: bool = False) -> List[Dict[str, Any]]:
        """
        Get all assignments for a project
        
        Args:
            project_id: ID of the project
            include_inactive: Whether to include inactive assignments
            
        Returns:
            List of assignment dictionaries
        """
        assignments = ProjectAssignment.objects.filter(project_id=project_id)
        
        if not include_inactive:
            assignments = assignments.filter(is_active=True)
        
        assignments = assignments.select_related('user', 'assigned_by').order_by('-assigned_date')
        
        return [{
            'id': assignment.id,
            'user': {
                'id': assignment.user.id,
                'username': assignment.user.username,
                'name': f"{assignment.user.first_name} {assignment.user.last_name}".strip(),
                'email': assignment.user.email,
                'is_admin': assignment.user.is_admin
            },
            'assigned_by': {
                'id': assignment.assigned_by.id,
                'username': assignment.assigned_by.username,
                'name': f"{assignment.assigned_by.first_name} {assignment.assigned_by.last_name}".strip()
            },
            'assigned_date': assignment.assigned_date.isoformat(),
            'is_active': assignment.is_active,
            'notes': assignment.notes
        } for assignment in assignments]
    
    @staticmethod
    def get_user_projects(user_id: int, include_inactive: bool = False) -> List[Dict[str, Any]]:
        """
        Get all projects assigned to a user
        
        Args:
            user_id: ID of the user
            include_inactive: Whether to include inactive assignments
            
        Returns:
            List of project dictionaries with assignment info
        """
        assignments = ProjectAssignment.objects.filter(user_id=user_id)
        
        if not include_inactive:
            assignments = assignments.filter(is_active=True)
        
        assignments = assignments.select_related('project', 'project__owner').order_by('-assigned_date')
        
        return [{
            'project': {
                'id': assignment.project.id,
                'name': assignment.project.name,
                'client': assignment.project.client,
                'owner': {
                    'id': assignment.project.owner.id,
                    'username': assignment.project.owner.username,
                    'name': f"{assignment.project.owner.first_name} {assignment.project.owner.last_name}".strip()
                }
            },
            'assignment': {
                'id': assignment.id,
                'assigned_date': assignment.assigned_date.isoformat(),
                'assigned_by': {
                    'id': assignment.assigned_by.id,
                    'username': assignment.assigned_by.username,
                    'name': f"{assignment.assigned_by.first_name} {assignment.assigned_by.last_name}".strip()
                },
                'is_active': assignment.is_active,
                'notes': assignment.notes
            }
        } for assignment in assignments]
    
    @staticmethod
    def get_assignment_stats() -> Dict[str, Any]:
        """
        Get overall assignment statistics
        
        Returns:
            Dictionary with assignment statistics
        """
        total_assignments = ProjectAssignment.objects.filter(is_active=True).count()
        total_projects = Project.objects.count()
        total_users = User.objects.filter(is_admin=False).count()
        
        # Projects with no assignments
        unassigned_projects = Project.objects.filter(
            assignments__isnull=True
        ).distinct().count()
        
        # Users with no assignments
        unassigned_users = User.objects.filter(
            is_admin=False,
            project_assignments__isnull=True
        ).distinct().count()
        
        return {
            'total_assignments': total_assignments,
            'total_projects': total_projects,
            'total_users': total_users,
            'unassigned_projects': unassigned_projects,
            'unassigned_users': unassigned_users,
            'assignment_coverage': {
                'projects': round((total_projects - unassigned_projects) / total_projects * 100, 1) if total_projects > 0 else 0,
                'users': round((total_users - unassigned_users) / total_users * 100, 1) if total_users > 0 else 0
            }
        } 