from rest_framework import serializers
from .models import CodeGeneration, CodeTemplate

class CodeGenerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeGeneration
        fields = '__all__'
        read_only_fields = ('created_at',)

class CodeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeTemplate
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
