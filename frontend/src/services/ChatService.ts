import api from './api';

export interface ChatMessage {
  message: string;
  response?: string;
  error?: string;
  timestamp?: Date;
}

class ChatService {
  async sendMessage(message: string): Promise<ChatMessage> {
    try {
      const response = await api.post('/ai/chat/', { message });
      return {
        message,
        response: response.data.response,
        timestamp: new Date(),
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Please login to use the chat feature');
      }
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  }
}

export const chatService = new ChatService();
