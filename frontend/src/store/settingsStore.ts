import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  theme: 'light' | 'dark';
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  aiSuggestions: boolean;
}

interface SettingsStore extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 14,
  tabSize: 2,
  minimap: true,
  wordWrap: false,
  lineNumbers: true,
  autoSave: true,
  aiSuggestions: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({ ...state, ...newSettings })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'thundercode-settings',
    }
  )
);
