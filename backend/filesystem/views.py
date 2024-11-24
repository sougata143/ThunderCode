import os
import json
from pathlib import Path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import shutil

def get_file_stats(path):
    """Get file or directory statistics."""
    stats = path.stat()
    return {
        'name': path.name,
        'path': str(path),
        'type': 'directory' if path.is_dir() else 'file',
        'size': stats.st_size,
        'lastModified': stats.st_mtime,
    }

def get_file_language(file_path):
    """Determine the language of a file based on its extension."""
    extension_map = {
        '.py': 'python',
        '.js': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.html': 'html',
        '.css': 'css',
        '.json': 'json',
        '.md': 'markdown',
    }
    return extension_map.get(file_path.suffix.lower(), 'plaintext')

@csrf_exempt
def list_directory(request):
    """List contents of a directory."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        path = data.get('path', '')
        
        # Ensure the path is within the project directory
        target_path = Path(settings.BASE_DIR).parent / path
        if not str(target_path).startswith(str(Path(settings.BASE_DIR).parent)):
            return JsonResponse({'error': 'Invalid path'}, status=400)

        if not target_path.exists():
            return JsonResponse({'error': 'Path does not exist'}, status=404)

        if not target_path.is_dir():
            return JsonResponse({'error': 'Path is not a directory'}, status=400)

        files = []
        for item in target_path.iterdir():
            if not item.name.startswith('.'):  # Skip hidden files
                files.append(get_file_stats(item))

        return JsonResponse(files, safe=False)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def read_file(request):
    """Read contents of a file."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        path = data.get('path', '')
        
        target_path = Path(settings.BASE_DIR).parent / path
        if not str(target_path).startswith(str(Path(settings.BASE_DIR).parent)):
            return JsonResponse({'error': 'Invalid path'}, status=400)

        if not target_path.exists():
            return JsonResponse({'error': 'File does not exist'}, status=404)

        if not target_path.is_file():
            return JsonResponse({'error': 'Path is not a file'}, status=400)

        with open(target_path, 'r') as f:
            content = f.read()

        return JsonResponse({
            'content': content,
            'language': get_file_language(target_path)
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def write_file(request):
    """Write contents to a file."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        path = data.get('path', '')
        content = data.get('content', '')
        
        target_path = Path(settings.BASE_DIR).parent / path
        if not str(target_path).startswith(str(Path(settings.BASE_DIR).parent)):
            return JsonResponse({'error': 'Invalid path'}, status=400)

        # Create parent directories if they don't exist
        target_path.parent.mkdir(parents=True, exist_ok=True)

        with open(target_path, 'w') as f:
            f.write(content)

        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def create_directory(request):
    """Create a new directory."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        path = data.get('path', '')
        
        target_path = Path(settings.BASE_DIR).parent / path
        if not str(target_path).startswith(str(Path(settings.BASE_DIR).parent)):
            return JsonResponse({'error': 'Invalid path'}, status=400)

        target_path.mkdir(parents=True, exist_ok=True)
        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def delete_path(request):
    """Delete a file or directory."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        path = data.get('path', '')
        
        target_path = Path(settings.BASE_DIR).parent / path
        if not str(target_path).startswith(str(Path(settings.BASE_DIR).parent)):
            return JsonResponse({'error': 'Invalid path'}, status=400)

        if not target_path.exists():
            return JsonResponse({'error': 'Path does not exist'}, status=404)

        if target_path.is_file():
            target_path.unlink()
        else:
            shutil.rmtree(target_path)

        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def rename_path(request):
    """Rename a file or directory."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        old_path = data.get('oldPath', '')
        new_path = data.get('newPath', '')
        
        old_target = Path(settings.BASE_DIR).parent / old_path
        new_target = Path(settings.BASE_DIR).parent / new_path

        if not str(old_target).startswith(str(Path(settings.BASE_DIR).parent)) or \
           not str(new_target).startswith(str(Path(settings.BASE_DIR).parent)):
            return JsonResponse({'error': 'Invalid path'}, status=400)

        if not old_target.exists():
            return JsonResponse({'error': 'Path does not exist'}, status=404)

        old_target.rename(new_target)
        return JsonResponse({'success': True})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
