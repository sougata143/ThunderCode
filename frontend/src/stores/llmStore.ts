import { create } from 'zustand';

export interface LLMModel {
  id: string;
  name: string;
  size: string;
  status: 'not_downloaded' | 'downloading' | 'downloaded' | 'error';
  downloadProgress?: number;
  error?: string;
  lastUsed?: Date;
}

interface LLMStore {
  models: LLMModel[];
  activeModelId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setModels: (models: LLMModel[]) => void;
  updateModel: (modelId: string, updates: Partial<LLMModel>) => void;
  setActiveModel: (modelId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLLMStore = create<LLMStore>((set) => ({
  models: [
    {
      id: 'codellama-7b',
      name: 'CodeLlama 7B',
      size: '7GB',
      status: 'not_downloaded',
    },
    {
      id: 'starcoder-7b',
      name: 'StarCoder 7B',
      size: '7GB',
      status: 'not_downloaded',
    },
    {
      id: 'codellama-13b',
      name: 'CodeLlama 13B',
      size: '13GB',
      status: 'not_downloaded',
    },
  ],
  activeModelId: null,
  isLoading: false,
  error: null,

  setModels: (models) => set({ models }),
  updateModel: (modelId, updates) =>
    set((state) => ({
      models: state.models.map((model) =>
        model.id === modelId ? { ...model, ...updates } : model
      ),
    })),
  setActiveModel: (modelId) => set({ activeModelId: modelId }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
