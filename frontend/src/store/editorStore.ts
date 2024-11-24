import { create } from 'zustand';

interface EditorTab {
  id: string;
  filename: string;
  language: string;
  content: string;
  isDirty: boolean;
}

interface EditorStore {
  tabs: EditorTab[];
  activeTabId: string | null;
  addTab: (tab: Omit<EditorTab, 'id'>) => void;
  closeTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  setActiveTab: (id: string) => void;
  markTabDirty: (id: string, isDirty: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  tabs: [],
  activeTabId: null,
  addTab: (tab) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      tabs: [...state.tabs, { ...tab, id, isDirty: false }],
      activeTabId: id,
    }));
  },
  closeTab: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.id !== id);
      const newActiveTabId = state.activeTabId === id
        ? newTabs[newTabs.length - 1]?.id || null
        : state.activeTabId;
      return { tabs: newTabs, activeTabId: newActiveTabId };
    });
  },
  updateTabContent: (id, content) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, content, isDirty: true } : tab
      ),
    }));
  },
  setActiveTab: (id) => {
    set({ activeTabId: id });
  },
  markTabDirty: (id, isDirty) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, isDirty } : tab
      ),
    }));
  },
}));
