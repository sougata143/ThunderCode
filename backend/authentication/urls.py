from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/update/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
]
