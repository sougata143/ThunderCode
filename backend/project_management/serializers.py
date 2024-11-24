from rest_framework import serializers
from .models import Project, ProjectFile, ProjectSetting
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class ProjectSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSetting
        fields = '__all__'

class ProjectFileSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectFile
        fields = '__all__'
        read_only_fields = ('last_modified',)

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    files = ProjectFileSerializer(many=True, read_only=True, source='projectfile_set')
    settings = ProjectSettingSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
