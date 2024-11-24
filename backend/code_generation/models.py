from django.db import models

# Create your models here.

class CodeGeneration(models.Model):
    prompt = models.TextField()
    language = models.CharField(max_length=50)
    generated_code = models.TextField()
    model_used = models.CharField(max_length=100)  # e.g., 'gpt-4', 'codex'
    created_at = models.DateTimeField(auto_now_add=True)
    feedback_rating = models.IntegerField(null=True, blank=True)  # 1-5 rating
    feedback_comment = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.language} code generation - {self.created_at}"

class CodeTemplate(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    language = models.CharField(max_length=50)
    template_code = models.TextField()
    variables = models.JSONField()  # Store template variables
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
