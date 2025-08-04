from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from datetime import date

# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True, help_text="Email address - must be unique")
    is_admin = models.BooleanField(default=False)

class Project(models.Model):
    name = models.CharField(max_length=100)
    client = models.CharField(max_length=100, default="Default Client", blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    start_date = models.DateField(null=True, blank=True, help_text="Project start date")
    end_date = models.DateField(null=True, blank=True, help_text="Project end date")

    def clean(self):
        """Validate project dates"""
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError('End date must be after start date')

    @property
    def is_active(self):
        """
        Check if project is currently active based on start and end dates.
        Returns True if current date is between start_date and end_date (inclusive).
        Returns False if dates are not set or project is outside date range.
        """
        if not self.start_date or not self.end_date:
            return False
        today = date.today()
        return self.start_date <= today <= self.end_date

    @property
    def status(self):
        """
        Get project status: 'not_started', 'active', or 'inactive'
        """
        if not self.start_date or not self.end_date:
            return 'no_dates'
        
        today = date.today()
        if today < self.start_date:
            return 'not_started'
        elif today > self.end_date:
            return 'inactive'
        else:
            return 'active'

    def was_active_on_date(self, check_date):
        """
        Check if project was active on a specific date.
        Args:
            check_date (date): The date to check
        Returns:
            bool: True if project was active on the given date
        """
        if not self.start_date or not self.end_date:
            return False
        return self.start_date <= check_date <= self.end_date

    def __str__(self):
        return self.name

class HourEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.project.name} - {self.date}"

class ProjectAssignment(models.Model):
    """
    Through model for Project-User many-to-many relationship
    Provides audit trail and assignment management capabilities
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='assignments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments_made')
    assigned_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['project', 'user']  # Prevent duplicate assignments
        ordering = ['-assigned_date']
    
    def __str__(self):
        return f"{self.user.username} → {self.project.name}"
