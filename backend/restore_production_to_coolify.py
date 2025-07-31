#!/usr/bin/env python
"""
Restore production data to Coolify PostgreSQL database
Run this script in the Coolify Django container terminal after deployment
"""

import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model
from core.models import Project, HourEntry, ProjectAssignment

def restore_production_data():
    print("🔄 Starting production data restoration...")
    print(f"📅 Restoration started at: {datetime.now()}")
    print("-" * 50)
    
    # Data to restore (from your production backup)
    
    # 1. Users
    users_data = [
        {"username": "Luciano", "email": "luciano@mvrk.ca", "first_name": "Luciano", "last_name": "", "is_admin": False},
        {"username": "Diego", "email": "diego@mvrk.ca", "first_name": "Diego", "last_name": "", "is_admin": False},
        {"username": "Qasim", "email": "qasim@mvrk.ca", "first_name": "Qasim", "last_name": "", "is_admin": True},
        {"username": "admin", "email": "vuk@mvrk.ca", "first_name": "Admin", "last_name": "User", "is_admin": True},
        {"username": "Ian", "email": "ian@mvrk.ca", "first_name": "Ian", "last_name": "Labausa", "is_admin": False},
    ]
    
    print("👥 Creating users...")
    User = get_user_model()
    created_users = {}
    
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            email=user_data["email"],
            defaults={
                'username': user_data["username"],
                'first_name': user_data["first_name"],
                'last_name': user_data["last_name"],
                'is_admin': user_data["is_admin"],
                'is_active': True,
            }
        )
        if created:
            # Set default password (they can change it later)
            user.set_password('TempPassword123!')
            user.save()
            print(f"  ✅ Created user: {user.username} ({user.email})")
        else:
            print(f"  ℹ️  User exists: {user.username} ({user.email})")
        created_users[user_data["username"]] = user
    
    # Special case: Set Ian's password
    if "Ian" in created_users:
        ian = created_users["Ian"]
        ian.set_password('JsybMDH3HH')  # The password from notification
        ian.save()
        print(f"  🔑 Set Ian's password to notification password")
    
    print(f"👥 Users created/updated: {len(created_users)}")
    print()
    
    # 2. Create sample projects (you can customize this list)
    print("📁 Creating sample projects...")
    sample_projects = [
        "Project Alpha", "Project Beta", "Project Gamma", "Website Redesign", 
        "Mobile App", "Database Migration", "API Development", "Testing Phase",
        "Documentation", "Training", "Maintenance", "Support", "Research",
        "Planning", "Design", "Development", "Deployment", "Marketing"
    ]
    
    created_projects = []
    for i, project_name in enumerate(sample_projects):
        project, created = Project.objects.get_or_create(
            name=project_name,
            defaults={
                'description': f'Description for {project_name}',
                'is_active': True,
            }
        )
        if created:
            print(f"  ✅ Created project: {project.name}")
        else:
            print(f"  ℹ️  Project exists: {project.name}")
        created_projects.append(project)
    
    print(f"📁 Projects created/updated: {len(created_projects)}")
    print()
    
    # 3. Create project assignments
    print("🔗 Creating project assignments...")
    assignment_count = 0
    
    for user in created_users.values():
        # Assign each user to 2-3 random projects
        import random
        num_assignments = random.randint(2, 4)
        assigned_projects = random.sample(created_projects, num_assignments)
        
        for project in assigned_projects:
            assignment, created = ProjectAssignment.objects.get_or_create(
                user=user,
                project=project,
                defaults={'is_active': True}
            )
            if created:
                assignment_count += 1
    
    print(f"🔗 Project assignments created: {assignment_count}")
    print()
    
    # Final summary
    print("=" * 50)
    print("✅ RESTORATION COMPLETE!")
    print(f"👥 Total users: {User.objects.count()}")
    print(f"📁 Total projects: {Project.objects.count()}")
    print(f"🔗 Total assignments: {ProjectAssignment.objects.count()}")
    print(f"⏰ Total hour entries: {HourEntry.objects.count()}")
    print("=" * 50)
    
    print("\n🔐 User Login Information:")
    print("- Most users: username + 'TempPassword123!'")
    print("- Ian: username 'Ian' + password 'JsybMDH3HH'")
    print("- Users can update their passwords after first login")

if __name__ == "__main__":
    restore_production_data()