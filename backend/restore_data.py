#!/usr/bin/env python
"""
Restore script to import JSON fixtures into PostgreSQL database
Run this AFTER migrating to PostgreSQL to restore backed up data
"""

import os
import django
import json
import sys
from pathlib import Path

# Add the tracker directory to Python path
tracker_path = os.path.join(os.path.dirname(__file__), 'tracker')
sys.path.insert(0, tracker_path)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')
django.setup()

from django.core.management import call_command
from django.core import serializers
from django.db import transaction

def restore_data(backup_dir):
    """Import data from JSON fixtures"""
    
    backup_path = Path(backup_dir)
    if not backup_path.exists():
        print(f"❌ Backup directory {backup_dir} does not exist!")
        return False
    
    print(f"Restoring data from: {backup_dir}")
    
    # Check summary
    summary_file = backup_path / "backup_summary.json"
    if summary_file.exists():
        with open(summary_file, 'r') as f:
            summary = json.load(f)
        print(f"📊 Backup summary: {summary['models_backed_up']}")
    
    # Order matters for foreign key dependencies
    restore_order = ['users', 'projects', 'project_assignments', 'hour_entries']
    
    try:
        with transaction.atomic():
            for model_name in restore_order:
                fixture_file = backup_path / f"{model_name}.json"
                
                if fixture_file.exists():
                    print(f"Restoring {model_name}...")
                    call_command('loaddata', str(fixture_file), verbosity=1)
                    print(f"✅ {model_name} restored successfully")
                else:
                    print(f"⚠️  {model_name}.json not found, skipping...")
        
        print(f"\n✅ Data restoration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during restoration: {e}")
        return False
    
    return True

def list_backups():
    """List available backup directories"""
    current_dir = Path('.')
    backup_dirs = [d for d in current_dir.iterdir() if d.is_dir() and d.name.startswith('backup_')]
    
    if not backup_dirs:
        print("No backup directories found.")
        return []
    
    print("Available backups:")
    for i, backup_dir in enumerate(backup_dirs, 1):
        summary_file = backup_dir / "backup_summary.json"
        if summary_file.exists():
            with open(summary_file, 'r') as f:
                summary = json.load(f)
            print(f"{i}. {backup_dir.name} - {summary['backup_date']} - {sum(summary['models_backed_up'].values())} records")
        else:
            print(f"{i}. {backup_dir.name}")
    
    return backup_dirs

if __name__ == "__main__":
    if len(sys.argv) > 1:
        backup_dir = sys.argv[1]
        restore_data(backup_dir)
    else:
        print("Usage: python restore_data.py <backup_directory>")
        print("\nOr list available backups:")
        list_backups() 