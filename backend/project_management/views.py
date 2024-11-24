from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, ProjectFile, ProjectSetting
from .serializers import ProjectSerializer, ProjectFileSerializer, ProjectSettingSerializer
from .services import project_service
from asgiref.sync import async_to_sync
import git
import os

# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def create(self, request):
        name = request.data.get('name')
        description = request.data.get('description')
        language = request.data.get('language')
        ai_prompt = request.data.get('ai_prompt')
        git_repo_url = request.data.get('git_repo_url')

        if not all([name, description, language]):
            return Response(
                {'error': 'Name, description, and language are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create project with AI-generated structure if prompt provided
            if ai_prompt:
                project = async_to_sync(project_service.create_project_with_ai)(
                    name=name,
                    description=description,
                    language=language,
                    ai_prompt=ai_prompt,
                    git_repo_url=git_repo_url
                )
            else:
                project = Project.objects.create(
                    name=name,
                    description=description,
                    language=language,
                    git_repo_url=git_repo_url
                )

            serializer = self.get_serializer(project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        project = self.get_object()
        files = project_service.get_project_files(project)
        return Response(files)

    @action(detail=True, methods=['post'])
    def init_git(self, request, pk=None):
        project = self.get_object()
        if not project.git_repo_url:
            return Response(
                {"error": "Git repository URL not set"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Initialize git repository
            repo = git.Repo.init(project.name)
            # Add remote origin
            origin = repo.create_remote('origin', project.git_repo_url)
            return Response({"status": "Git repository initialized"})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProjectFileViewSet(viewsets.ModelViewSet):
    queryset = ProjectFile.objects.all()
    serializer_class = ProjectFileSerializer

    def create(self, request):
        project_id = request.data.get('project')
        path = request.data.get('path')
        content = request.data.get('content')

        if not all([project_id, path, content]):
            return Response(
                {'error': 'Project ID, path, and content are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project = Project.objects.get(id=project_id)
            file_obj = project_service.update_project_file(project, path, content)
            serializer = self.get_serializer(file_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        file_obj = self.get_object()
        project_service.delete_project_file(file_obj.project, file_obj.path)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def track_changes(self, request, pk=None):
        project_file = self.get_object()
        project = project_file.project
        
        try:
            repo = git.Repo(project.name)
            file_path = os.path.join(project.name, project_file.file_path)
            
            # Stage the file
            repo.index.add([file_path])
            
            # Commit the changes
            commit_message = request.data.get('commit_message', f'Updated {project_file.file_path}')
            repo.index.commit(commit_message)
            
            return Response({"status": "Changes tracked successfully"})
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ProjectSettingViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSettingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProjectSetting.objects.filter(project__owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.project.owner != self.request.user:
            raise permissions.PermissionDenied()
        serializer.save()
