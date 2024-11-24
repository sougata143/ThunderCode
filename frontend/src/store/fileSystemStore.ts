import { create } from 'zustand';
import { fileSystemService } from '../services/FileSystemService';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  lastModified: Date;
  children?: FileNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

interface FileSystemStore {
  currentPath: string;
  fileTree: FileNode[];
  selectedPath: string | null;
  isLoading: boolean;
  error: string | null;
  setCurrentPath: (path: string) => void;
  setSelectedPath: (path: string | null) => void;
  loadDirectory: (path: string) => Promise<void>;
  createFile: (path: string, content: string) => Promise<void>;
  createDirectory: (path: string) => Promise<void>;
  deleteItem: (path: string) => Promise<void>;
  renameItem: (oldPath: string, newPath: string) => Promise<void>;
  toggleDirectory: (path: string) => Promise<void>;
}

export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  currentPath: '',
  fileTree: [],
  selectedPath: null,
  isLoading: false,
  error: null,

  setCurrentPath: (path) => set({ currentPath: path }),
  
  setSelectedPath: (path) => set({ selectedPath: path }),

  loadDirectory: async (path) => {
    set({ isLoading: true, error: null });
    try {
      const files = await fileSystemService.listDirectory(path);
      const fileTree = files.map((file) => ({
        ...file,
        children: file.type === 'directory' ? [] : undefined,
        isExpanded: false,
        isLoading: false,
      }));
      set({ fileTree, currentPath: path });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load directory' });
    } finally {
      set({ isLoading: false });
    }
  },

  createFile: async (path, content) => {
    set({ isLoading: true, error: null });
    try {
      await fileSystemService.writeFile(path, content);
      await get().loadDirectory(get().currentPath);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create file' });
    } finally {
      set({ isLoading: false });
    }
  },

  createDirectory: async (path) => {
    set({ isLoading: true, error: null });
    try {
      await fileSystemService.createDirectory(path);
      await get().loadDirectory(get().currentPath);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create directory' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteItem: async (path) => {
    set({ isLoading: true, error: null });
    try {
      await fileSystemService.delete(path);
      await get().loadDirectory(get().currentPath);
      if (get().selectedPath === path) {
        set({ selectedPath: null });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete item' });
    } finally {
      set({ isLoading: false });
    }
  },

  renameItem: async (oldPath, newPath) => {
    set({ isLoading: true, error: null });
    try {
      await fileSystemService.rename(oldPath, newPath);
      await get().loadDirectory(get().currentPath);
      if (get().selectedPath === oldPath) {
        set({ selectedPath: newPath });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to rename item' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleDirectory: async (path) => {
    const updateNode = (nodes: FileNode[], targetPath: string): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === targetPath) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children, targetPath) };
        }
        return node;
      });
    };

    set((state) => ({
      fileTree: updateNode(state.fileTree, path),
    }));

    const node = get().fileTree.find((n) => n.path === path);
    if (node?.type === 'directory' && !node.children?.length) {
      set({ isLoading: true, error: null });
      try {
        const files = await fileSystemService.listDirectory(path);
        const children = files.map((file) => ({
          ...file,
          children: file.type === 'directory' ? [] : undefined,
          isExpanded: false,
          isLoading: false,
        }));

        set((state) => ({
          fileTree: updateNode(state.fileTree, path).map((node) =>
            node.path === path ? { ...node, children } : node
          ),
        }));
      } catch (err) {
        set({ error: err instanceof Error ? err.message : 'Failed to load directory' });
      } finally {
        set({ isLoading: false });
      }
    }
  },
}));
