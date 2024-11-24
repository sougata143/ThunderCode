import api from './api';

export interface ChatMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatResponse {
    response: string;
}

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
    const response = await api.post('/ai/chat/', { message });
    return response.data;
};
