#!/usr/bin/env python
"""
Backup script to export current SQLite data to JSON fixtures
Run this BEFORE migrating to PostgreSQL to save current data
"""

import os
import sys
import django
import json
from datetime import datetime

# Add the tracker directory to Python path
tracker_path = os.path.join(os.path.dirname(__file__), 'tracker')
sys.path.insert(0, tracker_path)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')
django.setup()

from django.core import serializers
from django.contrib.auth import get_user_model
from core.models import Project, HourEntry, ProjectAssignment

def backup_data():
    """Export all important data to JSON fixtures"""
    
    backup_dir = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(backup_dir, exist_ok=True)
    
    print(f"Creating backup in directory: {backup_dir}")
    
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
        print(f"Backing up {count} {name}...")
        
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
        'models_backed_up': {
            name: queryset.count() 
            for name, queryset in models_to_backup
        }
    }
    
    with open(f"{backup_dir}/backup_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n✅ Backup completed successfully!")
    print(f"📁 Backup location: {backup_dir}/")
    print(f"📊 Summary: {summary['models_backed_up']}")
    
    return backup_dir

if __name__ == "__main__":
    backup_data() 