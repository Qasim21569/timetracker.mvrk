from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # Try to authenticate with either email or username
            # The 'username' parameter can contain either email or actual username
            user = None
            
            # First, try to find user by email
            if '@' in username:  # Likely an email
                users = UserModel.objects.filter(email=username, is_active=True)
                for user_obj in users:
                    if user_obj.check_password(password):
                        user = user_obj
                        break
            
            # If no user found by email, try by username
            if not user:
                try:
                    user_obj = UserModel.objects.get(username=username, is_active=True)
                    if user_obj.check_password(password):
                        user = user_obj
                except UserModel.DoesNotExist:
                    pass
            
            # If still no user found and the input doesn't contain @, try it as email too
            # (in case someone has an email without @ due to data issues)
            if not user and '@' not in username:
                users = UserModel.objects.filter(email=username, is_active=True)
                for user_obj in users:
                    if user_obj.check_password(password):
                        user = user_obj
                        break
            
            return user
            
        except Exception as e:
            return None
        
    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None 