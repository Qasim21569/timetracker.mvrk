from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.

class User(AbstractUser):
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
