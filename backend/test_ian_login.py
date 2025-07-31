#!/usr/bin/env python
"""
Test Ian's login credentials
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

from django.contrib.auth import authenticate
from core.models import User

def test_ian_login():
    """Test Ian's login with various credentials"""
    
    print("🔐 Testing Ian's login credentials...")
    print("-" * 50)
    
    # Get Ian's user object
    try:
        ian = User.objects.get(email='ian@mvrk.ca')
        print(f"✅ Found Ian: {ian.username} ({ian.email})")
    except User.DoesNotExist:
        print("❌ Ian user not found!")
        return
    
    # Test different authentication scenarios
    test_password = "JsybMDH3HH"  # From notification
    
    print(f"\n🧪 Testing password: {test_password}")
    
    # Test 1: Username + password
    result1 = authenticate(username='Ian', password=test_password)
    print(f"Username 'Ian' + password: {'✅ SUCCESS' if result1 else '❌ FAILED'}")
    
    # Test 2: Email + password  
    result2 = authenticate(username='ian@mvrk.ca', password=test_password)
    print(f"Email 'ian@mvrk.ca' + password: {'✅ SUCCESS' if result2 else '❌ FAILED'}")
    
    # Test 3: Check if password is set at all
    print(f"\nPassword status: {'Set' if ian.has_usable_password() else 'Not set'}")
    
    if not result1 and not result2:
        print("\n🔧 DIAGNOSIS: Password doesn't match!")
        print("💡 SOLUTION: Need to reset Ian's password")
        
        # Reset password
        print(f"\n🔄 Resetting Ian's password to: {test_password}")
        ian.set_password(test_password)
        ian.save()
        print("✅ Password reset complete!")
        
        # Test again
        result3 = authenticate(username='Ian', password=test_password)
        result4 = authenticate(username='ian@mvrk.ca', password=test_password)
        
        print(f"\n🧪 Testing after reset:")
        print(f"Username 'Ian' + password: {'✅ SUCCESS' if result3 else '❌ FAILED'}")
        print(f"Email 'ian@mvrk.ca' + password: {'✅ SUCCESS' if result4 else '❌ FAILED'}")

if __name__ == "__main__":
    test_ian_login()