#!/usr/bin/env python
"""
Extract exact data from SQLite and generate Python shell code for production
"""

import os
import sys
import django
from pathlib import Path

# Add the backend/tracker directory to Python path
backend_path = Path(__file__).parent / 'backend'
tracker_path = backend_path / 'tracker'
sys.path.insert(0, str(tracker_path))

# Set Django settings to use SQLite temporarily
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')

# Temporarily override database settings to use SQLite
import django.conf
django.conf.settings.DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'db.sqlite3',
    }
}

django.setup()

from core.models import User, Project, HourEntry, ProjectAssignment
from django.core import serializers
import json

print("🔍 Extracting exact data from SQLite file...")

# Extract users
users = User.objects.all()
print(f"✅ Found {users.count()} users")

# Extract projects
projects = Project.objects.all()
print(f"✅ Found {projects.count()} projects")

# Extract project assignments
assignments = ProjectAssignment.objects.all()
print(f"✅ Found {assignments.count()} project assignments")

# Extract hour entries
entries = HourEntry.objects.all()
print(f"✅ Found {entries.count()} hour entries")

# Generate Python shell code
print("\n" + "="*80)
print("📋 COPY THIS CODE TO YOUR PRODUCTION DJANGO SHELL:")
print("="*80)

print("""
from core.models import User, Project, HourEntry, ProjectAssignment
from django.contrib.auth.hashers import make_password
from datetime import datetime

print("🔄 Adding exact production data from SQLite...")

# Clear existing data first
HourEntry.objects.all().delete()
ProjectAssignment.objects.all().delete()
Project.objects.all().delete()
User.objects.all().delete()

print("🧹 Cleared existing data")
""")

# Generate user creation code with plain text passwords
user_passwords = {
    'admin': 'Vuk@1234',
    'Qasim': 'P0Qr&HaRXZ^6',
    'Luciano': '8lFKP&dlhj7O',
    'Diego': 'hln0#dPcYO^I',
    'Ian': 'jsybMDH3HH'
}

for user in users:
    password = user_passwords.get(user.username, 'password123')
    print(f"""
# Create user: {user.username}
{user.username}_user = User.objects.create_user(
    username='{user.username}',
    email='{user.email}',
    password='{password}',
    first_name='{user.first_name}',
    last_name='{user.last_name}',
    is_staff={user.is_staff},
    is_superuser={user.is_superuser},
    is_active={user.is_active}
)""")

print("\nprint('✅ Created users')")

# Generate project creation code
for i, project in enumerate(projects):
    owner_var = f"{project.owner.username}_user"
    print(f"""
# Create project: {project.name}
project_{i+1} = Project.objects.create(
    name='{project.name}',
    client='{project.client}',
    owner={owner_var},
    start_date='{project.start_date}' if project.start_date else None,
    end_date='{project.end_date}' if project.end_date else None
)""")

print("\nprint('✅ Created projects')")

# Generate assignment creation code
for i, assignment in enumerate(assignments):
    user_var = f"{assignment.user.username}_user"
    project_var = f"project_{list(projects).index(assignment.project) + 1}"
    assigned_by_var = f"{assignment.assigned_by.username}_user"
    
    print(f"""
# Create assignment {i+1}
ProjectAssignment.objects.create(
    project={project_var},
    user={user_var},
    assigned_by={assigned_by_var},
    is_active={assignment.is_active},
    notes='{assignment.notes}'
)""")

print("\nprint('✅ Created project assignments')")

# Generate hour entry creation code
for i, entry in enumerate(entries):
    user_var = f"{entry.user.username}_user"
    project_var = f"project_{list(projects).index(entry.project) + 1}"
    
    print(f"""
# Create hour entry {i+1}
HourEntry.objects.create(
    user={user_var},
    project={project_var},
    date='{entry.date}',
    hours={entry.hours},
    note='{entry.note}'
)""")

print("\nprint('✅ Created hour entries')")

# Generate verification code
print("""
# Verify restoration
print("\\n✅ Data restoration complete!")
print(f"  Users: {User.objects.count()}")
print(f"  Projects: {Project.objects.count()}")
print(f"  Project Assignments: {ProjectAssignment.objects.count()}")
print(f"  Hour Entries: {HourEntry.objects.count()}")

print("\\n🎉 Your production data has been restored!")
print("🔑 You can now use your original admin credentials to log in.")
print("\\n📋 Login Credentials:")
print("  Admin: username='admin', password='Vuk@1234'")
print("  Ian: username='Ian', password='jsybMDH3HH'")
print("  Diego: username='Diego', password='hln0#dPcYO^I'")
print("  Luciano: username='Luciano', password='8lFKP&dlhj7O'")
print("  Qasim: username='Qasim', password='P0Qr&HaRXZ^6'")
""")

print("\n" + "="*80)
print("📋 END OF CODE - PASTE THIS INTO YOUR PRODUCTION DJANGO SHELL")
print("="*80) 