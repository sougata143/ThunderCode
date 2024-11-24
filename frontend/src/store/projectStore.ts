import create from 'zustand';
import apiService from '../services/api';

interface ProjectCreationData {
  name: string;
  description: string;
  programming_language: string;
  git_repo_url?: string;
  files: { [key: string]: string };
  dependencies: Array<{ name: string; version: string }>;
  setup_instructions: string;
  version: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  programming_language: string;
  git_repo_url?: string;
  created_at: string;
  updated_at: string;
  owner: {
    id: number;
    username: string;
    email: string;
  };
}

interface ProjectSettings {
  theme: string;
  auto_save: boolean;
  tab_size: number;
  font_size: number;
  line_numbers: boolean;
  ai_suggestions_enabled: boolean;
}

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  projectSettings: ProjectSettings | null;
  currentFile: { path: string; content: string } | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: ProjectCreationData) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  fetchProjectSettings: (projectId: number) => Promise<void>;
  updateProjectSettings: (projectId: number, settings: Partial<ProjectSettings>) => Promise<void>;
  loadProjectFiles: (projectId: number) => Promise<FileNode[]>;
  loadLocalFolder: (path: string) => Promise<FileNode[]>;
  createFile: (projectId: number, path: string, content?: string) => Promise<void>;
  createDirectory: (projectId: number, path: string) => Promise<void>;
  openFile: (projectId: number, path: string) => Promise<void>;
  saveFile: (projectId: number, path: string, content: string) => Promise<void>;
  deleteFile: (projectId: number, path: string) => Promise<void>;
  deleteDirectory: (projectId: number, path: string) => Promise<void>;
  moveFile: (projectId: number, oldPath: string, newPath: string) => Promise<void>;
  moveDirectory: (projectId: number, oldPath: string, newPath: string) => Promise<void>;
  getFilePreview: (projectId: number, path: string) => Promise<string>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  projectSettings: null,
  currentFile: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await apiService.getProjects();
      set({ projects });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch projects' });
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const project = await apiService.createProject(data);
      set((state) => ({
        projects: [...state.projects, project],
      }));
      return project;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create project' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProject = await apiService.updateProject(id, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update project' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete project' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  fetchProjectSettings: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/projects/${projectId}/settings/`);
      if (!response.ok) {
        throw new Error('Failed to fetch project settings');
      }
      const settings = await response.json();
      set({ projectSettings: settings });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch project settings' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProjectSettings: async (projectId, settings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/projects/${projectId}/settings/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update project settings');
      }

      const updatedSettings = await response.json();
      set({ projectSettings: updatedSettings });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update project settings' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadProjectFiles: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const files = await apiService.getProjectFiles(projectId);
      return files;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load project files' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loadLocalFolder: async (path: string) => {
    try {
      const response = await apiService.loadLocalFolder(path);
      return response;
    } catch (error) {
      console.error('Failed to load local folder:', error);
      throw error;
    }
  },

  createFile: async (projectId: number, path: string, content: string = '') => {
    set({ isLoading: true, error: null });
    try {
      await apiService.createProjectFile(projectId, path, content);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create file' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createDirectory: async (projectId: number, path: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.createProjectDirectory(projectId, path);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create directory' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  openFile: async (projectId: number, path: string) => {
    set({ isLoading: true, error: null });
    try {
      const content = await apiService.getFileContent(projectId, path);
      set({ currentFile: { path, content } });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to open file' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  saveFile: async (projectId: number, path: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.updateFileContent(projectId, path, content);
      set(state => ({
        currentFile: state.currentFile?.path === path
          ? { ...state.currentFile, content }
          : state.currentFile
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to save file' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteFile: async (projectId: number, path: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteFile(projectId, path);
      set(state => ({
        currentFile: state.currentFile?.path === path ? null : state.currentFile
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete file' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDirectory: async (projectId: number, path: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteDirectory(projectId, path);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete directory' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  moveFile: async (projectId: number, oldPath: string, newPath: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.moveFile(projectId, oldPath, newPath);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to move file' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  moveDirectory: async (projectId: number, oldPath: string, newPath: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.moveDirectory(projectId, oldPath, newPath);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to move directory' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getFilePreview: async (projectId: number, path: string) => {
    set({ isLoading: true, error: null });
    try {
      const content = await apiService.getFilePreview(projectId, path);
      return content;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to get file preview' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
