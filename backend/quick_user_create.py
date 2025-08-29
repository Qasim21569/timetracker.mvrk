#!/usr/bin/env python3
"""
Quick script to create a test user for dashboard testing
"""
import os
import sys
import django

# Setup Django environment
sys.path.append('tracker')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')

# Set required environment variables
os.environ['SECRET_KEY'] = 'django-insecure-dfd@%i4g=of57mg6p78o9#^w=t2n1wb6)t^i77n$q&irklo+9c'
os.environ['DEBUG'] = 'True'
os.environ['DATABASE_URL'] = 'postgresql://timetracker_user:timetracker_pass@localhost:5432/timetracker'

django.setup()

from core.models import User
from django.contrib.auth.hashers import make_password

def create_test_user():
    print("🚀 Creating test user...")
    
    # Check if test user already exists
    try:
        user = User.objects.get(email='test@test.com')
        print(f"✅ Test user already exists: {user.email}")
        
        # Update password to make sure it's correct
        user.password = make_password('testpass123')
        user.save()
        print("✅ Password updated!")
        
    except User.DoesNotExist:
        # Create new test user
        user = User.objects.create(
            username='testuser',
            email='test@test.com',
            first_name='Test',
            last_name='User',
            password=make_password('testpass123'),
            role='user',
            is_active=True
        )
        print(f"✅ Created new test user: {user.email}")
    
    print("\n🔑 Login Credentials:")
    print("Email: test@test.com")
    print("Password: testpass123")
    print("\n🎉 You can now login and test the dashboard!")

if __name__ == '__main__':
    create_test_user()
