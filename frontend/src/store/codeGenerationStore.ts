import { create } from 'zustand';
import apiService from '../services/api';

interface GeneratedCode {
  id: number;
  prompt: string;
  language: string;
  generated_code: string;
  model_used: string;
  created_at: string;
  feedback_rating?: number;
  feedback_comment?: string;
}

interface CodeTemplate {
  id: number;
  name: string;
  description: string;
  language: string;
  template_code: string;
  variables: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ProjectStructure {
  files: { [key: string]: string };
  dependencies: { [key: string]: string };
  setup_instructions: string;
}

interface CodeGenerationState {
  generations: GeneratedCode[];
  templates: CodeTemplate[];
  isLoading: boolean;
  error: string | null;
  generateCode: (prompt: string, language: string, aiModel: string) => Promise<GeneratedCode>;
  generateProjectStructure: (params: {
    projectId: number;
    prompt: string;
    language: string;
    aiModel: string;
  }) => Promise<ProjectStructure>;
  provideFeedback: (id: number, rating: number, comment?: string) => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Partial<CodeTemplate>) => Promise<void>;
  generateFromTemplate: (
    templateId: number,
    variables: Record<string, any>,
    aiModel: string
  ) => Promise<GeneratedCode>;
}

export const useCodeGenerationStore = create<CodeGenerationState>((set, get) => ({
  generations: [],
  templates: [],
  isLoading: false,
  error: null,

  generateCode: async (prompt: string, language: string, aiModel: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/code-generation/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, language, aiModel }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const generation = await response.json();
      set((state) => ({
        generations: [...state.generations, generation],
      }));

      return generation;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to generate code' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  generateProjectStructure: async ({ projectId, prompt, language, aiModel }) => {
    set({ isLoading: true, error: null });
    try {
      const projectStructure = await apiService.generateProjectStructure({
        prompt,
        language,
        aiModel,
        projectId,
      });
      return projectStructure;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to generate project structure' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  provideFeedback: async (id: number, rating: number, comment?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/code-generation/${id}/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to provide feedback');
      }

      const updatedGeneration = await response.json();
      set((state) => ({
        generations: state.generations.map((g) =>
          g.id === id ? updatedGeneration : g
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to provide feedback' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/code-templates/');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const templates = await response.json();
      set({ templates });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch templates' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createTemplate: async (template: Partial<CodeTemplate>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/code-templates/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const newTemplate = await response.json();
      set((state) => ({
        templates: [...state.templates, newTemplate],
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create template' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  generateFromTemplate: async (
    templateId: number,
    variables: Record<string, any>,
    aiModel: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/code-templates/${templateId}/generate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variables, aiModel }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate from template');
      }

      const generation = await response.json();
      set((state) => ({
        generations: [...state.generations, generation],
      }));

      return generation;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to generate from template' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
