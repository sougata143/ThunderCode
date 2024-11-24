import { create } from 'zustand';
import { authService } from '../services/AuthService';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  last_active: string;
  preferences: Record<string, any>;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    password2: string
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login({ username, password });
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (username: string, email: string, password: string, password2: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register({ username, email, password, password2 });
      await get().login(username, password);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Registration failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await authService.updateProfile(data);
      set({ user: updatedProfile });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.changePassword(oldPassword, newPassword);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to change password' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loadProfile: async () => {
    if (!authService.isAuthenticated()) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load profile' });
      if (err instanceof Error && err.message.includes('401')) {
        get().logout();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
