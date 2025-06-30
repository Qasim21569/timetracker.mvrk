from django.urls import path
from .views import SignupView, ObtainTokenView, ProjectListView, HourEntryListView

urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('login/', ObtainTokenView.as_view()),
    path('projects/', ProjectListView.as_view()),
    path('hours/', HourEntryListView.as_view()),
] 