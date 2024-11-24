import { create } from 'zustand';

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

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  projectSettings: ProjectSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  fetchProjectSettings: (projectId: number) => Promise<void>;
  updateProjectSettings: (projectId: number, settings: Partial<ProjectSettings>) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  projectSettings: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/projects/');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const projects = await response.json();
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
      const response = await fetch('/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const project = await response.json();
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
      const response = await fetch(`/api/projects/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === id ? updatedProject : state.currentProject,
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
      const response = await fetch(`/api/projects/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

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
      throw error;
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
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
