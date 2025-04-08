import axios from 'axios';
import { API_URL } from '../config';
import { Conversation, Message } from '../features/chat/types';

export const chatService = {
    async getConversations(): Promise<Conversation[]> {
        const response = await axios.get(`${API_URL}/conversations`);
        return response.data;
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        const response = await axios.get(`${API_URL}/conversations/${conversationId}/messages`);
        return response.data;
    },

    async sendMessage(conversationId: string, content: string, type: 'text' | 'image' | 'file' | 'audio'): Promise<Message> {
        const response = await axios.post(`${API_URL}/conversations/${conversationId}/messages`, {
            content,
            type,
        });
        return response.data;
    },

    async createConversation(participantIds: string[]): Promise<Conversation> {
        const response = await axios.post(`${API_URL}/conversations`, {
            participantIds,
        });
        return response.data;
    },

    async markAsRead(conversationId: string): Promise<void> {
        await axios.post(`${API_URL}/conversations/${conversationId}/read`);
    },

    async uploadFile(file: File): Promise<{ fileUrl: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
}; 