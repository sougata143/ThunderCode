import { config } from '../config/env';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  last_active: string;
  preferences: Record<string, any>;
}

class AuthService {
  private baseUrl = `${config.API_BASE_URL}/auth`;
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const authHeader = this.getAuthHeader();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(authHeader && { Authorization: authHeader }),
      ...(options.headers || {}),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  private getAuthHeader(): string | undefined {
    const token = this.getToken();
    return token ? `Bearer ${token}` : undefined;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  setTokens(access: string, refresh: string) {
    localStorage.setItem(this.tokenKey, access);
    localStorage.setItem(this.refreshTokenKey, refresh);
  }

  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  async login(credentials: LoginCredentials) {
    const response = await this.request('/token/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setTokens(response.access, response.refresh);
    return response;
  }

  async register(data: RegisterData) {
    return this.request('/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken() {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.request('/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });

      this.setTokens(response.access, refresh);
      return response;
    } catch (error) {
      this.clearTokens(); // Clear tokens on refresh failure
      throw error;
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      return await this.request('/profile/');
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        // Try to refresh the token if we get a 401
        await this.refreshToken();
        // Retry the request with the new token
        return this.request('/profile/');
      }
      throw error;
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request('/change-password/', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  }

  logout() {
    this.clearTokens();
  }
}

export const authService = new AuthService();
