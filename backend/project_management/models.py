from django.db import models
from django.conf import settings

# Create your models here.

class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    git_repo_url = models.URLField(blank=True, null=True)
    programming_language = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class ProjectFile(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    file_path = models.CharField(max_length=500)
    content = models.TextField()
    language = models.CharField(max_length=50)
    last_modified = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.project.name} - {self.file_path}"

class ProjectSetting(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE)
    theme = models.CharField(max_length=50, default='default')
    auto_save = models.BooleanField(default=True)
    tab_size = models.IntegerField(default=4)
    font_size = models.IntegerField(default=14)
    line_numbers = models.BooleanField(default=True)
    ai_suggestions_enabled = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Settings for {self.project.name}"
