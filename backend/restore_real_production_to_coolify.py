#!/usr/bin/env python
"""
Restore REAL production data to Coolify PostgreSQL database
This script uses the actual production data that was backed up from local PostgreSQL
Run this script in the Coolify Django container terminal after deployment
"""

import os
import sys
import django
import json
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')
django.setup()

from django.core import serializers
from django.contrib.auth import get_user_model
from core.models import Project, HourEntry, ProjectAssignment

def restore_real_production_data():
    print("🔄 Starting REAL production data restoration...")
    print(f"📅 Restoration started at: {datetime.now()}")
    print("-" * 50)
    
    # Get the latest backup directory
    backup_dir = "backup_20250731_185441"  # Latest backup with real data
    
    print(f"📁 Using backup directory: {backup_dir}")
    
    User = get_user_model()
    
    # 1. Restore Users
    users_file = f"{backup_dir}/users.json"
    if os.path.exists(users_file):
        print("👥 Restoring users...")
        with open(users_file, 'r') as f:
            users_data = json.load(f)
        
        for user_data in users_data:
            fields = user_data['fields']
            user, created = User.objects.get_or_create(
                email=fields['email'],
                defaults={
                    'username': fields['username'],
                    'first_name': fields['first_name'],
                    'last_name': fields['last_name'],
                    'is_admin': fields.get('is_admin', False),
                    'is_active': fields.get('is_active', True),
                    'is_staff': fields.get('is_staff', False),
                    'is_superuser': fields.get('is_superuser', False),
                    'date_joined': fields.get('date_joined', datetime.now().isoformat()),
                }
            )
            if created:
                # Set default password (they can change it later)
                if fields['username'] == 'Ian':
                    user.set_password('JsybMDH3HH')  # Ian's notification password
                else:
                    user.set_password('TempPassword123!')
                user.save()
                print(f"  ✅ Created user: {user.username} ({user.email})")
            else:
                print(f"  ℹ️  User exists: {user.username} ({user.email})")
        
        print(f"👥 Users restored: {len(users_data)}")
    else:
        print(f"❌ Users file not found: {users_file}")
    
    print()
    
    # 2. Restore Projects
    projects_file = f"{backup_dir}/projects.json"
    if os.path.exists(projects_file):
        print("📁 Restoring projects...")
        with open(projects_file, 'r') as f:
            projects_data = json.load(f)
        
        for project_data in projects_data:
            fields = project_data['fields']
            project, created = Project.objects.get_or_create(
                name=fields['name'],
                defaults={
                    'description': fields.get('description', ''),
                    'is_active': fields.get('is_active', True),
                    'start_date': fields.get('start_date'),
                    'end_date': fields.get('end_date'),
                }
            )
            if created:
                print(f"  ✅ Created project: {project.name}")
            else:
                print(f"  ℹ️  Project exists: {project.name}")
        
        print(f"📁 Projects restored: {len(projects_data)}")
    else:
        print(f"❌ Projects file not found: {projects_file}")
    
    print()
    
    # 3. Restore Project Assignments
    assignments_file = f"{backup_dir}/project_assignments.json"
    if os.path.exists(assignments_file):
        print("🔗 Restoring project assignments...")
        with open(assignments_file, 'r') as f:
            assignments_data = json.load(f)
        
        created_count = 0
        for assignment_data in assignments_data:
            fields = assignment_data['fields']
            try:
                user = User.objects.get(pk=fields['user'])
                project = Project.objects.get(pk=fields['project'])
                
                assignment, created = ProjectAssignment.objects.get_or_create(
                    user=user,
                    project=project,
                    defaults={
                        'is_active': fields.get('is_active', True),
                        'assigned_date': fields.get('assigned_date'),
                    }
                )
                if created:
                    created_count += 1
            except (User.DoesNotExist, Project.DoesNotExist) as e:
                print(f"  ⚠️  Skipping assignment due to missing reference: {e}")
        
        print(f"🔗 Project assignments restored: {created_count}")
    else:
        print(f"❌ Assignments file not found: {assignments_file}")
    
    print()
    
    # 4. Restore Hour Entries
    hours_file = f"{backup_dir}/hour_entries.json"
    if os.path.exists(hours_file):
        print("⏰ Restoring hour entries...")
        with open(hours_file, 'r') as f:
            hours_data = json.load(f)
        
        created_count = 0
        for hour_data in hours_data:
            fields = hour_data['fields']
            try:
                user = User.objects.get(pk=fields['user'])  
                project = Project.objects.get(pk=fields['project'])
                
                hour_entry, created = HourEntry.objects.get_or_create(
                    user=user,
                    project=project,
                    date=fields['date'],
                    defaults={
                        'hours': fields['hours'],
                        'description': fields.get('description', ''),
                    }
                )
                if created:
                    created_count += 1
            except (User.DoesNotExist, Project.DoesNotExist) as e:
                print(f"  ⚠️  Skipping hour entry due to missing reference: {e}")
        
        print(f"⏰ Hour entries restored: {created_count}")
    else:
        print(f"❌ Hour entries file not found: {hours_file}")
    
    print()
    
    # Final summary
    print("=" * 50)
    print("✅ REAL PRODUCTION DATA RESTORATION COMPLETE!")
    print(f"👥 Total users: {User.objects.count()}")
    print(f"📁 Total projects: {Project.objects.count()}")
    print(f"🔗 Total assignments: {ProjectAssignment.objects.count()}")
    print(f"⏰ Total hour entries: {HourEntry.objects.count()}")
    print("=" * 50)
    
    print("\n🔐 User Login Information:")
    print("- Most users: username + 'TempPassword123!'")
    print("- Ian: username 'Ian' + password 'JsybMDH3HH'")
    print("- Users can update their passwords after first login")
    print(f"\n📁 Backup used: {backup_dir}")

if __name__ == "__main__":
    restore_real_production_data()