interface FileStats {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  lastModified: Date;
}

interface FileContent {
  content: string;
  language: string;
}

class FileSystemService {
  private baseUrl = '/api/filesystem';

  async listDirectory(path: string): Promise<FileStats[]> {
    const response = await fetch(`${this.baseUrl}/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      throw new Error('Failed to list directory');
    }

    return response.json();
  }

  async readFile(path: string): Promise<FileContent> {
    const response = await fetch(`${this.baseUrl}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      throw new Error('Failed to read file');
    }

    return response.json();
  }

  async writeFile(path: string, content: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path, content }),
    });

    if (!response.ok) {
      throw new Error('Failed to write file');
    }
  }

  async createDirectory(path: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/create-dir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      throw new Error('Failed to create directory');
    }
  }

  async delete(path: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete path');
    }
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPath, newPath }),
    });

    if (!response.ok) {
      throw new Error('Failed to rename path');
    }
  }
}

export const fileSystemService = new FileSystemService();
