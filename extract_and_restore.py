#!/usr/bin/env python
"""
Extract data from SQLite file and prepare for PostgreSQL restoration
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

print("🔍 Extracting data from SQLite file...")

# Extract users
users = User.objects.all()
users_data = serializers.serialize('json', users)
with open('backend/users_from_sqlite.json', 'w') as f:
    f.write(users_data)
print(f"✅ Extracted {users.count()} users")

# Extract projects
projects = Project.objects.all()
projects_data = serializers.serialize('json', projects)
with open('backend/projects_from_sqlite.json', 'w') as f:
    f.write(projects_data)
print(f"✅ Extracted {projects.count()} projects")

# Extract project assignments
assignments = ProjectAssignment.objects.all()
assignments_data = serializers.serialize('json', assignments)
with open('backend/project_assignments_from_sqlite.json', 'w') as f:
    f.write(assignments_data)
print(f"✅ Extracted {assignments.count()} project assignments")

# Extract hour entries
entries = HourEntry.objects.all()
entries_data = serializers.serialize('json', entries)
with open('backend/hour_entries_from_sqlite.json', 'w') as f:
    f.write(entries_data)
print(f"✅ Extracted {entries.count()} hour entries")

print("\n✅ Data extraction complete!")
print("📁 Files created:")
print("  - backend/users_from_sqlite.json")
print("  - backend/projects_from_sqlite.json") 
print("  - backend/project_assignments_from_sqlite.json")
print("  - backend/hour_entries_from_sqlite.json")

print("\n🚀 Next steps:")
print("1. Commit and push these files")
print("2. Run restore script in production") 