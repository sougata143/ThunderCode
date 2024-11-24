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

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors, particularly 401s
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refresh = localStorage.getItem('refreshToken');
                if (!refresh) {
                    throw new Error('No refresh token available');
                }

                // Get new access token
                const response = await axios.post<TokenResponse>(
                    `${config.API_BASE_URL}/auth/token/refresh/`,
                    { refresh }
                );

                // Store new access token
                localStorage.setItem('authToken', response.data.access);

                // Update the failed request with new token and retry
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear tokens and redirect to login
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
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

export interface CodeGenerationRequest {
    prompt: string;
    maxLength?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
    numReturnSequences?: number;
}

export interface CodeGenerationResponse {
    generated_code: string;
}

interface FileNode {
    name: string;
    type: 'file' | 'directory';
    path: string;
    children?: FileNode[];
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

export const generateCode = async (request: CodeGenerationRequest): Promise<string> => {
    try {
        const response = await api.post<CodeGenerationResponse>(
            '/generate',
            {
                prompt: request.prompt,
                max_length: request.maxLength,
                temperature: request.temperature,
                top_p: request.topP,
                top_k: request.topK,
                num_return_sequences: request.numReturnSequences,
            }
        );
        return response.data.generated_code;
    } catch (error) {
        console.error('Error generating code:', error);
        throw error;
    }
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

// File Operations
export const getProjectFiles = async (projectId: number): Promise<FileNode[]> => {
    const response = await api.get(`/projects/${projectId}/files`);
    return response.data;
};

export const createProjectFile = async (projectId: number, path: string, content: string = '') => {
    const response = await api.post(`/projects/${projectId}/files`, {
        path,
        content,
    });
    return response.data;
};

export const createProjectDirectory = async (projectId: number, path: string) => {
    const response = await api.post(`/projects/${projectId}/directories`, {
        path,
    });
    return response.data;
};

export const getFileContent = async (projectId: number, path: string): Promise<string> => {
    const response = await api.get(`/projects/${projectId}/files/${encodeURIComponent(path)}/content`);
    return response.data.content;
};

export const updateFileContent = async (projectId: number, path: string, content: string) => {
    const response = await api.put(`/projects/${projectId}/files/${encodeURIComponent(path)}/content`, {
        content,
    });
    return response.data;
};

export const deleteFile = async (projectId: number, path: string) => {
    await api.delete(`/projects/${projectId}/files/${encodeURIComponent(path)}`);
};

export const deleteDirectory = async (projectId: number, path: string) => {
    await api.delete(`/projects/${projectId}/directories/${encodeURIComponent(path)}`);
};

export const moveFile = async (projectId: number, oldPath: string, newPath: string) => {
    const response = await api.post(`${config.API_BASE_URL}/projects/${projectId}/files/move`, {
        oldPath,
        newPath,
    });
    return response.data;
};

export const moveDirectory = async (projectId: number, oldPath: string, newPath: string) => {
    const response = await api.post(`${config.API_BASE_URL}/projects/${projectId}/directories/move`, {
        oldPath,
        newPath,
    });
    return response.data;
};

export const getFilePreview = async (projectId: number, path: string) => {
    const response = await api.get(`${config.API_BASE_URL}/projects/${projectId}/files/preview`, {
        params: { path },
    });
    return response.data.content;
};

async function loadLocalFolder(path: string): Promise<FileNode[]> {
  const response = await api.post('/filesystem/load-local-folder/', { path });
  return response.data;
}

const apiService = {
  generateProjectStructure,
  generateCode,
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateProject,
  getProjectFiles,
  createProjectFile,
  createProjectDirectory,
  getFileContent,
  updateFileContent,
  deleteFile,
  deleteDirectory,
  moveFile,
  moveDirectory,
  getFilePreview,
  loadLocalFolder,
};

export default apiService;
