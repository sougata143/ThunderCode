from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class CodeGeneration(models.Model):
    AI_MODEL_CHOICES = [
        ('gpt-4', 'GPT-4'),
        ('gpt-3.5-turbo', 'GPT-3.5 Turbo'),
        ('codellama-34b', 'CodeLlama 34B'),
        ('anthropic-claude-2', 'Claude 2'),
        ('qwen-72b', 'Qwen 72B'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    prompt = models.TextField()
    language = models.CharField(max_length=50)
    generated_code = models.TextField()
    ai_model = models.CharField(max_length=50, choices=AI_MODEL_CHOICES, default='gpt-4')
    created_at = models.DateTimeField(auto_now_add=True)
    rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    feedback = models.TextField(blank=True)
    template = models.ForeignKey(
        'CodeTemplate',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.language} code generation - {self.created_at}"


class CodeTemplate(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    language = models.CharField(max_length=50)
    code = models.TextField()
    variables = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
