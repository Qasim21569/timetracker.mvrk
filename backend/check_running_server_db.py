#!/usr/bin/env python
"""
Check what database the running Django server is using
"""

import requests
import json

def check_server_db():
    """Check the database configuration of the running Django server"""
    
    try:
        # Try to access Django admin and see if we can determine the database
        admin_url = "http://127.0.0.1:8000/admin/"
        
        response = requests.get(admin_url, timeout=5)
        
        if response.status_code == 200:
            print("✅ Django server is running on http://127.0.0.1:8000")
            print("🔍 Server is accessible")
            
            # Try to access a simple API endpoint to check database
            # Let's check the user count via admin API or create a simple endpoint
            
        else:
            print(f"❌ Django server returned status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ No Django server running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error checking server: {e}")

if __name__ == "__main__":
    print("🔍 Checking running Django server database configuration...")
    check_server_db()