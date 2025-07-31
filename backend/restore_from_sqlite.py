#!/usr/bin/env python
"""
Restore data from SQLite extraction to PostgreSQL production database
"""

import os
import sys
import django
from pathlib import Path

# Add the tracker directory to Python path
tracker_path = Path(__file__).parent / 'tracker'
sys.path.insert(0, str(tracker_path))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')

django.setup()

from django.core.management import call_command
from core.models import User, Project, HourEntry, ProjectAssignment

print("🔄 Restoring production data to PostgreSQL...")

# Clear existing data first
print("🧹 Clearing existing data...")
HourEntry.objects.all().delete()
ProjectAssignment.objects.all().delete()
Project.objects.all().delete()
User.objects.all().delete()

# Load data in correct order
print("📥 Loading users...")
call_command('loaddata', 'users_from_sqlite.json')

print("📥 Loading projects...")
call_command('loaddata', 'projects_from_sqlite.json')

print("📥 Loading project assignments...")
call_command('loaddata', 'project_assignments_from_sqlite.json')

print("📥 Loading hour entries...")
call_command('loaddata', 'hour_entries_from_sqlite.json')

# Verify restoration
print("\n✅ Data restoration complete!")
print(f"  Users: {User.objects.count()}")
print(f"  Projects: {Project.objects.count()}")
print(f"  Project Assignments: {ProjectAssignment.objects.count()}")
print(f"  Hour Entries: {HourEntry.objects.count()}")

print("\n🎉 Your production data has been restored!")
print("🔑 You can now use your original admin credentials to log in.") 