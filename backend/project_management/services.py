import os
from typing import Dict, List
from django.conf import settings
from .models import Project, ProjectFile
from code_generation.services import code_generator
from asgiref.sync import async_to_sync
import git
import json

class ProjectService:
    @staticmethod
    async def create_project_with_ai(
        name: str,
        description: str,
        language: str,
        ai_prompt: str,
        git_repo_url: str = None
    ) -> Project:
        """Create a new project with AI-generated structure."""
        
        # Create project record
        project = Project.objects.create(
            name=name,
            description=description,
            language=language,
            git_repo_url=git_repo_url
        )
        
        try:
            # Generate project structure using AI
            files, dependencies, setup_instructions = await code_generator.generate_project_structure(
                ai_prompt, language
            )
            
            # Create project directory
            project_dir = os.path.join(settings.PROJECTS_ROOT, str(project.id))
            os.makedirs(project_dir, exist_ok=True)
            
            # Initialize git repository if URL provided
            if git_repo_url:
                repo = git.Repo.init(project_dir)
                if git_repo_url:
                    repo.create_remote('origin', git_repo_url)
            
            # Save project files
            for file_info in files:
                file_path = os.path.join(project_dir, file_info['path'])
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                with open(file_path, 'w') as f:
                    f.write(file_info['content'])
                
                ProjectFile.objects.create(
                    project=project,
                    path=file_info['path'],
                    content=file_info['content']
                )
            
            # Save dependencies and setup instructions
            project.metadata = {
                'dependencies': dependencies,
                'setup_instructions': setup_instructions
            }
            project.save()
            
            return project
            
        except Exception as e:
            # Cleanup on failure
            project.delete()
            if os.path.exists(project_dir):
                import shutil
                shutil.rmtree(project_dir)
            raise e

    @staticmethod
    def get_project_files(project: Project) -> List[Dict[str, str]]:
        """Get all files in a project."""
        return [
            {
                'path': file.path,
                'content': file.content
            }
            for file in project.files.all()
        ]

    @staticmethod
    def update_project_file(
        project: Project,
        file_path: str,
        content: str
    ) -> ProjectFile:
        """Update or create a project file."""
        file_obj, created = ProjectFile.objects.get_or_create(
            project=project,
            path=file_path,
            defaults={'content': content}
        )
        
        if not created:
            file_obj.content = content
            file_obj.save()
        
        # Update file on disk
        full_path = os.path.join(settings.PROJECTS_ROOT, str(project.id), file_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(content)
        
        return file_obj

    @staticmethod
    def delete_project_file(project: Project, file_path: str) -> None:
        """Delete a project file."""
        ProjectFile.objects.filter(project=project, path=file_path).delete()
        
        # Delete file from disk
        full_path = os.path.join(settings.PROJECTS_ROOT, str(project.id), file_path)
        if os.path.exists(full_path):
            os.remove(full_path)

project_service = ProjectService()
