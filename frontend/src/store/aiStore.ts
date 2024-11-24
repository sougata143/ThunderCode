import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  addMessage: (message) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id, timestamp: new Date() },
      ],
    }));
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [] }),
}));
