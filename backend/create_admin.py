#!/usr/bin/env python
"""
Quick script to create an admin user for Time Tracker production
Run this after deploying to production
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin_user():
    print("🚀 Time Tracker - Admin User Creation")
    print("=" * 40)
    
    # Get user input
    email = input("Enter admin email (e.g., admin@mvrk.com): ").strip()
    first_name = input("Enter first name: ").strip()
    last_name = input("Enter last name: ").strip()
    
    # Generate username from email
    username = email.split('@')[0]
    
    # Check if user already exists
    if User.objects.filter(email=email).exists():
        print(f"❌ User with email {email} already exists!")
        return
    
    if User.objects.filter(username=username).exists():
        print(f"❌ User with username {username} already exists!")
        return
    
    # Get password
    import getpass
    password = getpass.getpass("Enter password: ")
    password_confirm = getpass.getpass("Confirm password: ")
    
    if password != password_confirm:
        print("❌ Passwords don't match!")
        return
    
    # Create the user
    try:
        admin_user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_admin=True,
            is_superuser=True,
            is_staff=True,
            is_active=True
        )
        
        print(f"✅ Admin user created successfully!")
        print(f"📧 Email: {admin_user.email}")
        print(f"👤 Name: {admin_user.first_name} {admin_user.last_name}")
        print(f"🔐 Username: {admin_user.username}")
        print(f"🔗 Login at: https://timetrackermvrk.vercel.app/")
        print(f"🛠️  Django Admin: https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/admin/")
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")

if __name__ == "__main__":
    create_admin_user() 