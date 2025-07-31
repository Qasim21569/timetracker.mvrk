#!/usr/bin/env python
"""
Setup production database in Coolify
Run this script in the Coolify Django container terminal after deployment
"""

import os
import django
import subprocess
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')
django.setup()

def run_command(command, description):
    """Run a command and print the result"""
    print(f"\n🔄 {description}...")
    print(f"Running: {command}")
    print("-" * 50)
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        if result.returncode != 0:
            print(f"❌ Command failed with return code {result.returncode}")
            return False
        else:
            print(f"✅ {description} completed successfully!")
            return True
    except Exception as e:
        print(f"❌ Error running command: {e}")
        return False

def setup_production_database():
    """Setup the production database"""
    print("🚀 Setting up production database...")
    print("=" * 60)
    
    # Step 1: Run migrations
    if not run_command("python manage.py migrate", "Database migrations"):
        print("❌ Migration failed! Check database connection.")
        return False
    
    # Step 2: Check if we have any users
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user_count = User.objects.count()
    
    print(f"\n📊 Current database status:")
    print(f"Users: {user_count}")
    
    if user_count == 0:
        print("\n🔄 Database is empty. You need to restore production data.")
        print("💡 Run: python restore_real_production_to_coolify.py")
    else:
        print("\n✅ Database already has data!")
        
        # Show some sample data
        from core.models import Project, ProjectAssignment
        project_count = Project.objects.count()
        assignment_count = ProjectAssignment.objects.count()
        
        print(f"Projects: {project_count}")
        print(f"Assignments: {assignment_count}")
        
        print("\n👥 Sample users:")
        for user in User.objects.all()[:5]:
            print(f"  - {user.username} ({user.email})")
    
    return True

if __name__ == "__main__":
    setup_production_database()