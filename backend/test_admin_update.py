#!/usr/bin/env python
"""
Test Django admin user update functionality
"""

import os
import sys
import django

# Add the tracker directory to Python path
tracker_path = os.path.join(os.path.dirname(__file__), 'tracker')
sys.path.insert(0, tracker_path)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')
django.setup()

from django.contrib.admin.sites import site
from core.models import User
from core.admin import UserAdmin

def test_admin_form():
    """Test the Django admin form for User updates"""
    
    print("🔍 Testing Django Admin User Form...")
    print("-" * 50)
    
    # Get Ian's user
    try:
        ian = User.objects.get(email='ian@mvrk.ca')
        print(f"✅ Found Ian: {ian.username} ({ian.email})")
    except User.DoesNotExist:
        print("❌ Ian user not found!")
        return
    
    # Get the admin form class
    user_admin = UserAdmin(User, site)
    
    # Test form initialization
    form_class = user_admin.get_form(None)
    
    print(f"\n📝 Form fields: {list(form_class.base_fields.keys())}")
    
    # Test with current data
    form_data = {
        'username': ian.username,
        'email': ian.email,
        'first_name': ian.first_name,
        'last_name': ian.last_name,
        'is_active': ian.is_active,
        'is_admin': ian.is_admin,
        'is_staff': ian.is_staff,
        'is_superuser': ian.is_superuser,
        'date_joined_0': ian.date_joined.date(),
        'date_joined_1': ian.date_joined.time(),
        'last_login_0': ian.last_login.date() if ian.last_login else '',
        'last_login_1': ian.last_login.time() if ian.last_login else '',
    }
    
    print(f"\n🧪 Testing form with current data...")
    form = form_class(data=form_data, instance=ian)
    
    print(f"Form is valid: {form.is_valid()}")
    
    if not form.is_valid():
        print(f"❌ Form errors: {form.errors}")
        
        # Check specifically for username error
        if 'username' in form.errors:
            print(f"🔍 Username error: {form.errors['username']}")
            print(f"🔍 Username field required: {form.fields['username'].required}")
            print(f"🔍 Current username value: '{ian.username}'")
    else:
        print("✅ Form is valid!")
    
    # Test with empty username (simulate the error)
    print(f"\n🧪 Testing form with empty username...")
    form_data_empty_username = form_data.copy()
    form_data_empty_username['username'] = ''
    
    form2 = form_class(data=form_data_empty_username, instance=ian)
    print(f"Form is valid: {form2.is_valid()}")
    
    if not form2.is_valid():
        print(f"❌ Form errors: {form2.errors}")

if __name__ == "__main__":
    test_admin_form()