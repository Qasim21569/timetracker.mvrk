from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # Try to fetch the user by email (username parameter actually contains email)
            # Handle multiple users with same email by checking password for each
            users = UserModel.objects.filter(email=username, is_active=True)
            
            for user in users:
                if user.check_password(password):
                    return user
            
            # If no active user found, return None
            return None
            
        except UserModel.DoesNotExist:
            return None
        
    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None 