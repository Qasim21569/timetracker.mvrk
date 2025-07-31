#!/usr/bin/env python
"""
Test request handling to identify 500 error
"""

import os
import sys
import traceback

# Add tracker to path
sys.path.insert(0, 'tracker')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tracker.settings')

try:
    import django
    django.setup()
    print("✅ Django setup successful")
    
    # Test WSGI application
    from tracker.wsgi import application
    print("✅ WSGI application loaded")
    
    # Test URL patterns
    from django.urls import get_resolver
    resolver = get_resolver()
    print("✅ URL resolver loaded")
    
    # List all URL patterns
    url_patterns = []
    def collect_urls(patterns, prefix=''):
        for pattern in patterns:
            if hasattr(pattern, 'url_patterns'):
                collect_urls(pattern.url_patterns, prefix + str(pattern.pattern))
            else:
                url_patterns.append(f"{prefix}{pattern.pattern} -> {pattern.callback}")
    
    collect_urls(resolver.url_patterns)
    print(f"✅ Found {len(url_patterns)} URL patterns:")
    for url in url_patterns[:10]:  # Show first 10
        print(f"  {url}")
    
    # Test specific views
    try:
        from core.views import *
        print("✅ Core views imported successfully")
    except Exception as e:
        print(f"❌ Core views import failed: {e}")
    
    # Test serializers
    try:
        from core.serializers import *
        print("✅ Serializers imported successfully")
    except Exception as e:
        print(f"❌ Serializers import failed: {e}")
    
    print("\n✅ All basic tests passed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"❌ Full traceback: {traceback.format_exc()}") 