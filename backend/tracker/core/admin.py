from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Project, HourEntry, ProjectAssignment

class UserAdmin(BaseUserAdmin):
    # Fields to display in the user list
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_admin', 'is_active', 'date_joined')
    list_filter = ('is_admin', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    # Fields for the user detail/edit form
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_admin', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Fields for the add user form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'first_name', 'last_name', 'is_admin'),
        }),
    )
    
    # Make certain fields read-only
    readonly_fields = ('date_joined', 'last_login')

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'owner', 'start_date', 'end_date')
    list_filter = ('owner', 'start_date', 'end_date')
    search_fields = ('name', 'client')
    ordering = ('-id',)

class HourEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'date', 'hours', 'note')
    list_filter = ('date', 'project', 'user')
    search_fields = ('user__username', 'project__name', 'note')
    ordering = ('-date',)

class ProjectAssignmentAdmin(admin.ModelAdmin):
    list_display = ('project', 'user', 'assigned_by', 'assigned_date', 'is_active')
    list_filter = ('assigned_date', 'is_active', 'project')
    search_fields = ('project__name', 'user__username', 'assigned_by__username')
    ordering = ('-assigned_date',)

# Register models with their admin classes
admin.site.register(User, UserAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(HourEntry, HourEntryAdmin)
admin.site.register(ProjectAssignment, ProjectAssignmentAdmin)
