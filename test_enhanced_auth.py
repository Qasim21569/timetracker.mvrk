#!/usr/bin/env python3
"""
Test script for enhanced authentication system
Tests the new password confirmation and user management features
"""

import requests
import json
from datetime import datetime

# Base URL for our API
BASE_URL = "http://localhost:8000/api"

def test_enhanced_signup():
    """Test enhanced signup with password confirmation"""
    print("🔐 Testing Enhanced Signup...")
    
    # Test 1: Valid signup with password confirmation
    signup_data = {
        "username": "testuser1",
        "email": "testuser1@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "password": "testpass123",
        "password_confirm": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/signup/", json=signup_data)
    print(f"✅ Valid signup: {response.status_code}")
    if response.status_code == 201:
        user_data = response.json()
        print(f"   Created user: {user_data.get('name')} ({user_data.get('email')})")
        print(f"   Role: {user_data.get('role')}")
    else:
        print(f"   Error: {response.text}")
    
    # Test 2: Signup with mismatched passwords
    signup_data_bad = {
        "username": "testuser2",
        "email": "testuser2@example.com",
        "first_name": "Jane",
        "last_name": "Smith",
        "password": "testpass123",
        "password_confirm": "differentpass"
    }
    
    response = requests.post(f"{BASE_URL}/signup/", json=signup_data_bad)
    print(f"❌ Mismatched passwords: {response.status_code}")
    if response.status_code == 400:
        print("   ✅ Correctly rejected mismatched passwords")
    else:
        print(f"   ❌ Unexpected response: {response.text}")
    
    return signup_data

def test_login_and_get_token(username, password):
    """Test login and get authentication token"""
    print(f"\n🔑 Testing Login for {username}...")
    
    login_data = {
        "username": username,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/login/", json=login_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        token = response.json().get('token')
        print(f"✅ Login successful, token: {token[:20]}...")
        return token
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_user_profile(token):
    """Test user profile endpoint"""
    print(f"\n👤 Testing User Profile...")
    
    headers = {"Authorization": f"Token {token}"}
    response = requests.get(f"{BASE_URL}/profile/", headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        profile = response.json()
        print(f"✅ Profile data:")
        print(f"   Name: {profile.get('name')}")
        print(f"   Email: {profile.get('email')}")
        print(f"   Role: {profile.get('role')}")
        print(f"   Is Admin: {profile.get('is_admin')}")
    else:
        print(f"❌ Profile failed: {response.text}")

def test_admin_user_management(admin_token):
    """Test admin-only user management endpoints"""
    print(f"\n👑 Testing Admin User Management...")
    
    headers = {"Authorization": f"Token {admin_token}"}
    
    # Test 1: List all users (admin only)
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    print(f"List users: {response.status_code}")
    
    if response.status_code == 200:
        users = response.json()
        print(f"✅ Found {len(users)} users")
        for user in users:
            print(f"   - {user.get('name')} ({user.get('role')})")
    else:
        print(f"❌ List users failed: {response.text}")
    
    # Test 2: Create new user via admin endpoint
    new_user_data = {
        "username": "adminuser1",
        "email": "adminuser1@example.com",
        "first_name": "Admin",
        "last_name": "User",
        "password": "adminpass123",
        "password_confirm": "adminpass123",
        "is_admin": True
    }
    
    response = requests.post(f"{BASE_URL}/users/", json=new_user_data, headers=headers)
    print(f"Create admin user: {response.status_code}")
    
    if response.status_code == 201:
        created_user = response.json()
        print(f"✅ Created admin user: {created_user.get('name')}")
        return created_user.get('id')
    else:
        print(f"❌ Create user failed: {response.text}")
        return None

def test_non_admin_access(user_token):
    """Test that non-admin users can't access admin endpoints"""
    print(f"\n🚫 Testing Non-Admin Access Restrictions...")
    
    headers = {"Authorization": f"Token {user_token}"}
    
    # Try to access admin-only users list
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    print(f"Non-admin accessing user list: {response.status_code}")
    
    if response.status_code == 403:
        print("✅ Correctly blocked non-admin access")
    else:
        print(f"❌ Security issue: {response.text}")

def main():
    """Run all authentication tests"""
    print("🧪 Enhanced Authentication Testing")
    print("=" * 50)
    
    # Test 1: Enhanced signup
    signup_data = test_enhanced_signup()
    
    # Test 2: Admin login
    admin_token = test_login_and_get_token("admin", "admin123")
    if not admin_token:
        print("❌ Admin login failed, stopping tests")
        return
    
    # Test 3: Regular user login
    user_token = test_login_and_get_token(signup_data["username"], signup_data["password"])
    
    # Test 4: Profile endpoints
    if admin_token:
        test_user_profile(admin_token)
    
    # Test 5: Admin user management
    if admin_token:
        test_admin_user_management(admin_token)
    
    # Test 6: Non-admin access restrictions
    if user_token:
        test_non_admin_access(user_token)
    
    print("\n🎉 Authentication testing complete!")

if __name__ == "__main__":
    main() 