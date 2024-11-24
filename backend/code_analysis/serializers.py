from rest_framework import serializers
from .models import CodeAnalysis, CodeMetrics

class CodeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeAnalysis
        fields = '__all__'

class CodeMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeMetrics
        fields = '__all__'
