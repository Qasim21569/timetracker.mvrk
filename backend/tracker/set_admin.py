#!/usr/bin/env python
"""
Script to set a user as admin
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')
django.setup()

from core.models import User

def set_user_admin(email):
    """Set user as admin by email"""
    try:
        user = User.objects.get(email=email)
        user.is_admin = True
        user.is_staff = True  # Also ensure staff status for Django admin
        user.is_superuser = True  # Ensure superuser status
        user.save()
        
        print(f"✅ User '{user.username}' ({user.email}) is now set as admin:")
        print(f"   - is_admin: {user.is_admin}")
        print(f"   - is_staff: {user.is_staff}")
        print(f"   - is_superuser: {user.is_superuser}")
        return True
        
    except User.DoesNotExist:
        print(f"❌ User with email '{email}' not found")
        return False
    except Exception as e:
        print(f"❌ Error updating user: {e}")
        return False

if __name__ == "__main__":
    # Set the newly created user as admin
    email = "qasim.k@somaiya.edu"
    set_user_admin(email)