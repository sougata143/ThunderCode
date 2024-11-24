import axios from 'axios';
import { config } from '../config/env';

const api = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
