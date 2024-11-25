from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.chat, name='ai_chat'),
    path('generate/', views.generate, name='ai_generate'),
]
