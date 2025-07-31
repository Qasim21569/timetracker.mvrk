#!/usr/bin/env python
"""
Quick test script to verify database connection and configuration
"""

import os
import sys
import django
from datetime import datetime

# Add the tracker directory to Python path
tracker_path = os.path.join(os.path.dirname(__file__), 'tracker')
sys.path.insert(0, tracker_path)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')
django.setup()

from django.db import connection
from django.conf import settings

def test_database_connection():
    """Test database connection and show current configuration"""
    
    print("🔍 Testing Database Configuration...")
    print(f"📅 Test run at: {datetime.now()}")
    print("-" * 50)
    
    # Show current database configuration
    db_config = settings.DATABASES['default']
    print(f"Database Engine: {db_config['ENGINE']}")
    
    if 'sqlite3' in db_config['ENGINE']:
        print(f"Database File: {db_config['NAME']}")
        print("📝 Currently using SQLite (Development)")
    else:
        print(f"Database Name: {db_config['NAME']}")
        print(f"Database Host: {db_config['HOST']}")
        print(f"Database Port: {db_config['PORT']}")
        print("🐘 Currently using PostgreSQL (Production)")
    
    print("-" * 50)
    
    # Test connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        print("✅ Database connection successful!")
        
        # Show tables
        with connection.cursor() as cursor:
            if 'sqlite3' in db_config['ENGINE']:
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            else:
                cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname='public';")
            
            tables = cursor.fetchall()
            print(f"📊 Found {len(tables)} tables:")
            for table in tables[:5]:  # Show first 5 tables
                print(f"   - {table[0]}")
            if len(tables) > 5:
                print(f"   ... and {len(tables) - 5} more")
    
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    print("-" * 50)
    
    # Check environment variables
    print("🔧 Environment Configuration:")
    print(f"DEBUG: {settings.DEBUG}")
    print(f"DATABASE_URL: {'Set' if os.getenv('DATABASE_URL') else 'Not set'}")
    print(f"SECRET_KEY: {'Set' if settings.SECRET_KEY else 'Not set'}")
    
    return True

if __name__ == "__main__":
    test_database_connection() 