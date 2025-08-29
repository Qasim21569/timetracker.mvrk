from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from core.models import User, Project, HourEntry, ProjectAssignment
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Create test data for dashboard testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Creating test data...'))
        
        # Create test users
        test_users = [
            {
                'username': 'john_doe',
                'email': 'john@test.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'password': 'testpass123',
                'role': 'user'
            },
            {
                'username': 'sarah_wilson', 
                'email': 'sarah@test.com',
                'first_name': 'Sarah',
                'last_name': 'Wilson',
                'password': 'testpass123',
                'role': 'user'
            }
        ]
        
        created_users = []
        for user_data in test_users:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'username': user_data['username'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'password': make_password(user_data['password']),
                    'role': user_data['role'],
                    'is_active': True
                }
            )
            created_users.append(user)
            self.stdout.write(f"✅ User: {user.email}")
        
        # Create test projects
        test_projects = [
            {
                'name': 'E-commerce Website',
                'client': 'TechCorp Inc.',
                'start_date': '2024-01-15',
                'end_date': '2024-12-31'
            },
            {
                'name': 'Mobile App',
                'client': 'StartupXYZ', 
                'start_date': '2024-02-01',
                'end_date': '2024-12-31'
            },
            {
                'name': 'Analytics Platform',
                'client': 'DataFlow Solutions',
                'start_date': '2024-03-01', 
                'end_date': '2024-12-31'
            }
        ]
        
        created_projects = []
        for project_data in test_projects:
            project, created = Project.objects.get_or_create(
                name=project_data['name'],
                defaults=project_data
            )
            created_projects.append(project)
            self.stdout.write(f"✅ Project: {project.name}")
        
        # Assign users to projects
        for user in created_users:
            for project in created_projects:
                assignment, created = ProjectAssignment.objects.get_or_create(
                    user=user,
                    project=project,
                    defaults={'notes': f'Assigned to {project.name}'}
                )
        
        # Create time entries for last 30 days
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)
        
        current_date = start_date
        total_entries = 0
        
        while current_date <= end_date:
            if current_date.weekday() < 5:  # Weekdays only
                for user in created_users:
                    if random.random() < 0.8:  # 80% chance of working
                        project = random.choice(created_projects)
                        hours = round(random.uniform(2.0, 8.0) * 4) / 4  # 0.25 increments
                        
                        entry, created = HourEntry.objects.get_or_create(
                            user=user,
                            project=project,
                            date=current_date,
                            defaults={
                                'hours': hours,
                                'note': f'Working on {project.name}'
                            }
                        )
                        
                        if created:
                            total_entries += 1
            
            current_date += timedelta(days=1)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {total_entries} time entries'))
        self.stdout.write(self.style.SUCCESS('🎉 Test data created successfully!'))
        self.stdout.write('')
        self.stdout.write('Test login credentials:')
        self.stdout.write('john@test.com / testpass123')
        self.stdout.write('sarah@test.com / testpass123')
