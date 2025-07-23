from rest_framework import serializers
from .models import Project, HourEntry, User, ProjectAssignment
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True, required=False)
    role = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'password', 'password_confirm', 'is_admin', 'role', 'name',
            'is_active', 'date_joined'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def get_role(self, obj):
        """Return user role for frontend compatibility"""
        return 'admin' if obj.is_admin else 'user'
    
    def get_name(self, obj):
        """Return full name for frontend compatibility"""
        return f"{obj.first_name} {obj.last_name}".strip()

    def validate(self, attrs):
        """Validate password confirmation and other fields"""
        # Only validate password confirmation for creation
        if self.instance is None:  # Creating new user
            password = attrs.get('password')
            password_confirm = attrs.get('password_confirm')
            
            if not password_confirm:
                raise serializers.ValidationError({
                    'password_confirm': 'Password confirmation is required.'
                })
            
            if password != password_confirm:
                raise serializers.ValidationError({
                    'password_confirm': 'Passwords do not match.'
                })
            
            # Validate password strength
            try:
                validate_password(password)
            except ValidationError as e:
                raise serializers.ValidationError({
                    'password': e.messages
                })
        
        return attrs

    def create(self, validated_data):
        # Remove password_confirm before creating user
        validated_data.pop('password_confirm', None)
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        # Handle password updates separately
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)  # Remove if present
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance

class ProjectSerializer(serializers.ModelSerializer):
    """Enhanced ProjectSerializer with assignment support"""
    assigned_user_ids = serializers.SerializerMethodField()
    assigned_users = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'client', 'owner', 'owner_name', 
            'start_date', 'end_date', 'assigned_user_ids', 'assigned_users'
        ]
        read_only_fields = ['owner', 'assigned_user_ids', 'assigned_users', 'owner_name']
    
    def get_assigned_user_ids(self, obj):
        """Return list of assigned user IDs for frontend compatibility"""
        return list(obj.assignments.filter(is_active=True).values_list('user_id', flat=True))
    
    def get_assigned_users(self, obj):
        """Return detailed assigned user information"""
        assignments = obj.assignments.filter(is_active=True).select_related('user')
        return [
            {
                'id': assignment.user.id,
                'username': assignment.user.username,
                'name': f"{assignment.user.first_name} {assignment.user.last_name}".strip(),
                'email': assignment.user.email
            }
            for assignment in assignments
        ]
    
    def get_owner_name(self, obj):
        """Return owner's full name"""
        return f"{obj.owner.first_name} {obj.owner.last_name}".strip()


class ProjectAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for project assignments with full details"""
    user_details = serializers.SerializerMethodField()
    project_details = serializers.SerializerMethodField()
    assigned_by_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectAssignment
        fields = [
            'id', 'project', 'user', 'assigned_by', 'assigned_date', 
            'is_active', 'notes', 'user_details', 'project_details', 
            'assigned_by_details'
        ]
        read_only_fields = ['id', 'assigned_date']
    
    def get_user_details(self, obj):
        """Return detailed user information"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'name': f"{obj.user.first_name} {obj.user.last_name}".strip(),
            'email': obj.user.email,
            'is_admin': obj.user.is_admin
        }
    
    def get_project_details(self, obj):
        """Return detailed project information"""
        return {
            'id': obj.project.id,
            'name': obj.project.name,
            'client': obj.project.client
        }
    
    def get_assigned_by_details(self, obj):
        """Return details of user who made the assignment"""
        return {
            'id': obj.assigned_by.id,
            'username': obj.assigned_by.username,
            'name': f"{obj.assigned_by.first_name} {obj.assigned_by.last_name}".strip()
        }


class ProjectAssignmentRequestSerializer(serializers.Serializer):
    """Serializer for bulk assignment requests"""
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text="List of user IDs to assign/unassign"
    )
    notes = serializers.CharField(
        max_length=500, 
        required=False, 
        allow_blank=True,
        help_text="Optional notes about the assignment"
    )
    
    def validate_user_ids(self, value):
        """Validate that all user IDs exist"""
        existing_ids = User.objects.filter(id__in=value).values_list('id', flat=True)
        invalid_ids = set(value) - set(existing_ids)
        if invalid_ids:
            raise serializers.ValidationError(f"Invalid user IDs: {list(invalid_ids)}")
        return value


class HourEntrySerializer(serializers.ModelSerializer):
    hours = serializers.DecimalField(max_digits=5, decimal_places=2, coerce_to_string=False)
    
    class Meta:
        model = HourEntry
        fields = ['id', 'user', 'project', 'date', 'hours', 'note']
        read_only_fields = ['user'] 