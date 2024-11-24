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

def scan_directory(path: Path, relative_to: Path = None) -> dict:
    """Recursively scan a directory and return its structure."""
    if relative_to is None:
        relative_to = path.parent

    result = {
        'name': path.name,
        'type': 'directory' if path.is_dir() else 'file',
        'path': str(path.relative_to(relative_to)),
    }

    if path.is_dir():
        try:
            children = []
            for item in path.iterdir():
                # Skip hidden files and directories
                if not item.name.startswith('.'):
                    children.append(scan_directory(item, relative_to))
            result['children'] = sorted(children, key=lambda x: (x['type'] == 'file', x['name'].lower()))
        except PermissionError:
            # Handle permission errors gracefully
            result['error'] = 'Permission denied'
    else:
        try:
            # Add file-specific information
            stats = path.stat()
            result.update({
                'size': stats.st_size,
                'lastModified': stats.st_mtime,
                'language': get_file_language(path)
            })
        except (PermissionError, FileNotFoundError):
            result['error'] = 'Unable to read file info'

    return result

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

@csrf_exempt
def load_local_folder(request):
    """Load the structure of a local folder."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        folder_path = data.get('path', '')
        
        if not folder_path:
            return JsonResponse({'error': 'Path is required'}, status=400)

        path = Path(folder_path)
        
        if not path.exists():
            return JsonResponse({'error': 'Path does not exist'}, status=404)
            
        if not path.is_dir():
            return JsonResponse({'error': 'Path is not a directory'}, status=400)

        # Scan the directory and get its structure
        structure = scan_directory(path)
        return JsonResponse(structure)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
