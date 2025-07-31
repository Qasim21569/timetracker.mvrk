#!/usr/bin/env python
"""
Test static files configuration
"""

import os
import sys
from pathlib import Path

# Add the tracker directory to Python path
tracker_path = Path(__file__).parent / 'tracker'
sys.path.insert(0, str(tracker_path))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')

import django
django.setup()

from django.conf import settings

print("🔍 Static Files Configuration:")
print(f"  STATIC_URL: {settings.STATIC_URL}")
print(f"  STATIC_ROOT: {settings.STATIC_ROOT}")
print(f"  STATICFILES_DIRS: {settings.STATICFILES_DIRS}")
print(f"  STATICFILES_STORAGE: {settings.STATICFILES_STORAGE}")

print("\n🔍 Middleware Check:")
for i, middleware in enumerate(settings.MIDDLEWARE):
    print(f"  {i+1}. {middleware}")

print("\n✅ Static files test complete!") 