import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config/env';

// Add this interface to define the structure of error responses
interface ApiErrorResponse {
    code?: string;
    detail?: string;
    message?: string;
}

// Extend the InternalAxiosRequestConfig interface to include _retry
declare module 'axios' {
    interface InternalAxiosRequestConfig {
        _retry?: boolean;
    }
}

const api = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

interface TokenResponse {
    access: string;
    refresh: string;
}

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Refresh token function
const refreshAccessToken = async (): Promise<string> => {
    try {
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) throw new Error('No refresh token available');

        const response = await axios.post<TokenResponse>(
            `${config.API_BASE_URL}/auth/token/refresh/`,
            { refresh }
        );

        localStorage.setItem('authToken', response.data.access);
        return response.data.access;
    } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        throw error;
    }
};

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh on 401 errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // If error is 401 and we haven't tried to refresh the token yet
        if (
            error.response?.status === 401 &&
            error.response?.data?.code === 'token_not_valid' &&
            !originalRequest._retry
        ) {
            if (isRefreshing) {
                // If token refresh is in progress, queue the request
                try {
                    const token = await new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                } catch (err) {
                    return Promise.reject(err);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const token = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${token}`;
                processQueue(null, token);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Redirect to login or handle authentication failure
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export interface ProjectStructure {
    files: { [key: string]: string };
    dependencies: { [key: string]: string };
    setup_instructions: string;
}

export interface CreateProjectRequest {
    name: string;
    description: string;
    programming_language: string;
    git_repo_url?: string;
    files: { [key: string]: string };
    dependencies: Array<{ name: string; version: string }>;
    setup_instructions: string;
}

export const generateProjectStructure = async (params: {
    prompt: string;
    language: string;
    aiModel: string;
    projectId: number;
}): Promise<ProjectStructure> => {
    const response = await api.post('/code-generation/generate-project/', params);
    return response.data;
};

export const createProject = async (data: CreateProjectRequest) => {
    const response = await api.post('/projects/', data);
    return response.data;
};

export const getProjects = async () => {
    const response = await api.get('/projects/');
    return response.data;
};

export const getProject = async (id: number) => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
};

export const deleteProject = async (id: number) => {
    await api.delete(`/projects/${id}/`);
};

export const updateProject = async (id: number, data: Partial<CreateProjectRequest>) => {
    const response = await api.patch(`/projects/${id}/`, data);
    return response.data;
};

export default api;
