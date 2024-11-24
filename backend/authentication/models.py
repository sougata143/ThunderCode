from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Custom user model for ThunderCode."""
    email = models.EmailField(unique=True)
    avatar = models.URLField(blank=True, null=True)
    github_token = models.CharField(max_length=255, blank=True, null=True)
    last_active = models.DateTimeField(auto_now=True)
    preferences = models.JSONField(default=dict)

    def __str__(self):
        return self.email
