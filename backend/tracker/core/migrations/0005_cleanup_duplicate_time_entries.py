# Generated manually to clean up duplicate time entries before adding unique constraint

from django.db import migrations
from decimal import Decimal


def cleanup_duplicate_time_entries(apps, schema_editor):
    """
    Clean up duplicate time entries by consolidating them.
    For each (user, project, date) combination with duplicates:
    1. Sum the hours from all duplicates
    2. Keep the most recent entry with the consolidated hours
    3. Delete the other duplicates
    """
    HourEntry = apps.get_model('core', 'HourEntry')
    
    # Find all duplicates grouped by (user, project, date)
    from collections import defaultdict
    
    # Group entries by (user_id, project_id, date)
    grouped_entries = defaultdict(list)
    
    for entry in HourEntry.objects.all():
        key = (entry.user_id, entry.project_id, entry.date)
        grouped_entries[key].append(entry)
    
    # Process groups with more than one entry (duplicates)
    cleaned_count = 0
    for key, entries in grouped_entries.items():
        if len(entries) > 1:
            # Sort by id (or creation order) - keep the most recent
            entries.sort(key=lambda x: x.id)
            
            # Calculate total hours from all duplicates
            total_hours = sum(Decimal(str(entry.hours)) for entry in entries)
            
            # Keep the last entry (most recent) and update its hours
            keeper = entries[-1]
            keeper.hours = total_hours
            keeper.save()
            
            # Delete the duplicates (all except the keeper)
            for entry in entries[:-1]:
                entry.delete()
                cleaned_count += 1
    
    print(f"Cleaned up {cleaned_count} duplicate time entries")


def reverse_cleanup(apps, schema_editor):
    """
    This migration is not reversible as we've consolidated data.
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_alter_user_email'),
    ]

    operations = [
        migrations.RunPython(cleanup_duplicate_time_entries, reverse_cleanup),
    ]