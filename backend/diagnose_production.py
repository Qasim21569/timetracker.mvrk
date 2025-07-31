#!/usr/bin/env python
"""
Diagnostic script for production environment
Run this in Coolify terminal to identify 500 error causes
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

try:
    django.setup()
    print("✅ Django setup successful")
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    sys.exit(1)

# Test database connection
try:
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print(f"✅ Database connection successful: {result}")
except Exception as e:
    print(f"❌ Database connection failed: {e}")

# Test environment variables
print("\n🔍 Environment Variables:")
env_vars = [
    'DATABASE_URL', 'SECRET_KEY', 'DEBUG', 'ALLOWED_HOSTS', 
    'CORS_ALLOWED_ORIGINS', 'CSRF_TRUSTED_ORIGINS'
]

for var in env_vars:
    value = os.environ.get(var, 'NOT SET')
    if var == 'DATABASE_URL' and value != 'NOT SET':
        # Mask the password in DATABASE_URL
        if '@' in value:
            parts = value.split('@')
            if ':' in parts[0]:
                user_pass = parts[0].split(':')
                if len(user_pass) > 2:
                    masked_url = f"{user_pass[0]}:***@{parts[1]}"
                    print(f"  {var}: {masked_url}")
                else:
                    print(f"  {var}: {value}")
            else:
                print(f"  {var}: {value}")
        else:
            print(f"  {var}: {value}")
    else:
        print(f"  {var}: {value}")

# Test Django settings
try:
    from django.conf import settings
    print(f"\n✅ Django settings loaded successfully")
    print(f"  DEBUG: {settings.DEBUG}")
    print(f"  DATABASES: {list(settings.DATABASES.keys())}")
    print(f"  INSTALLED_APPS: {len(settings.INSTALLED_APPS)} apps")
    print(f"  MIDDLEWARE: {len(settings.MIDDLEWARE)} middleware")
except Exception as e:
    print(f"❌ Django settings failed: {e}")

# Test model imports
try:
    from core.models import User, Project, HourEntry, ProjectAssignment
    print("✅ Model imports successful")
except Exception as e:
    print(f"❌ Model imports failed: {e}")

# Test URL configuration
try:
    from django.urls import get_resolver
    resolver = get_resolver()
    print("✅ URL configuration successful")
except Exception as e:
    print(f"❌ URL configuration failed: {e}")

# Test static files
try:
    from django.contrib.staticfiles.finders import find
    static_files = find('admin/css/base.css')
    print(f"✅ Static files configuration: {len(static_files) if static_files else 0} files found")
except Exception as e:
    print(f"❌ Static files configuration failed: {e}")

print("\n🔍 File System Check:")
import os
print(f"  Current directory: {os.getcwd()}")
print(f"  Files in current directory: {len(os.listdir('.'))}")
if os.path.exists('tracker'):
    print(f"  Files in tracker: {len(os.listdir('tracker'))}")
    if os.path.exists('tracker/tracker'):
        print(f"  Files in tracker/tracker: {len(os.listdir('tracker/tracker'))}")

print("\n✅ Diagnostic complete!") 