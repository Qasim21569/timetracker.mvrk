#!/usr/bin/env python
"""
Extract production data from SQLite file
This script temporarily configures Django to use the production SQLite file
and exports all data to JSON fixtures
"""

import os
import sys
import django
import json
from pathlib import Path
from datetime import datetime

# Add the tracker directory to Python path
tracker_path = os.path.join(os.path.dirname(__file__), 'tracker')
sys.path.insert(0, tracker_path)

# Point to the production SQLite file
production_db_path = os.path.join(os.path.dirname(__file__), '..', 'db.sqlite3')
production_db_path = os.path.abspath(production_db_path)

print(f"🔍 Looking for production SQLite file at: {production_db_path}")

if not os.path.exists(production_db_path):
    print(f"❌ Production SQLite file not found at: {production_db_path}")
    print("Please make sure the db.sqlite3 file is in the Time Tracker directory")
    exit(1)

print(f"✅ Found production SQLite file ({os.path.getsize(production_db_path)} bytes)")

# Temporarily override database settings
os.environ['PRODUCTION_DB_PATH'] = production_db_path

# Setup Django with production database
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings_production_extract')

# Create temporary settings file for production data extraction
settings_content = f'''
# Temporary settings for extracting production data
from tracker.settings import *

# Override database to use production SQLite file
DATABASES = {{
    'default': {{
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': r'{production_db_path}',
    }}
}}

# Ensure we can read the database
DEBUG = True
'''

settings_file = os.path.join(tracker_path, 'tracker', 'settings_production_extract.py')
with open(settings_file, 'w') as f:
    f.write(settings_content)

print(f"📝 Created temporary settings file: {settings_file}")

# Initialize Django
django.setup()

from django.core import serializers
from django.contrib.auth import get_user_model
from core.models import Project, HourEntry, ProjectAssignment

def extract_production_data():
    """Extract all production data to JSON fixtures"""
    
    backup_dir = f"production_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_dir, exist_ok=True)
    
    print(f"📦 Creating production backup in directory: {backup_dir}")
    
    # Models to backup
    models_to_backup = [
        ('users', get_user_model().objects.all()),
        ('projects', Project.objects.all()),
        ('hour_entries', HourEntry.objects.all()),
        ('project_assignments', ProjectAssignment.objects.all()),
    ]
    
    for name, queryset in models_to_backup:
        filename = f"{backup_dir}/{name}.json"
        
        # Count records
        count = queryset.count()
        print(f"📊 Backing up {count} {name}...")
        
        # Serialize to JSON
        data = serializers.serialize('json', queryset, indent=2)
        
        # Write to file
        with open(filename, 'w') as f:
            f.write(data)
        
        print(f"✅ {name} backed up to {filename}")
    
    # Create a summary file
    summary = {
        'backup_date': datetime.now().isoformat(),
        'backup_directory': backup_dir,
        'source': 'Production SQLite Database',
        'database_file': production_db_path,
        'models_backed_up': {
            name: queryset.count() 
            for name, queryset in models_to_backup
        }
    }
    
    with open(f"{backup_dir}/backup_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n🎉 Production data extraction completed successfully!")
    print(f"📁 Backup location: {backup_dir}/")
    print(f"📊 Summary: {summary['models_backed_up']}")
    
    # Clean up temporary settings file
    if os.path.exists(settings_file):
        os.remove(settings_file)
        print(f"🧹 Cleaned up temporary settings file")
    
    return backup_dir

if __name__ == "__main__":
    try:
        backup_dir = extract_production_data()
        print(f"\n✅ Your production data is now ready for PostgreSQL migration!")
        print(f"📁 Data saved in: {backup_dir}/")
    except Exception as e:
        print(f"❌ Error extracting production data: {e}")
        # Clean up temporary settings file on error
        if 'settings_file' in locals() and os.path.exists(settings_file):
            os.remove(settings_file) 