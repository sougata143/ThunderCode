from django.db import models

# Create your models here.

class CodeAnalysis(models.Model):
    file_path = models.CharField(max_length=500)
    language = models.CharField(max_length=50)
    analysis_type = models.CharField(max_length=50)  # e.g., 'bug', 'security', 'performance'
    severity = models.CharField(max_length=20)  # e.g., 'high', 'medium', 'low'
    line_number = models.IntegerField()
    message = models.TextField()
    suggestion = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Code Analyses'

class CodeMetrics(models.Model):
    file_path = models.CharField(max_length=500)
    language = models.CharField(max_length=50)
    lines_of_code = models.IntegerField()
    cyclomatic_complexity = models.IntegerField()
    maintainability_index = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Code Metrics'
