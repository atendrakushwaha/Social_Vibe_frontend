import api from './api';
import type { Message, Conversation, SendMessageData, PaginatedResponse } from '../types';

export const messageService = {
    // Get conversations
    getConversations: async (page: number = 1): Promise<PaginatedResponse<Conversation>> => {
        return api.get(`/messages/conversations?page=${page}`);
    },

    // Get conversation
    getConversation: async (conversationId: string): Promise<Conversation> => {
        return api.get(`/messages/conversations/${conversationId}`);
    },

    // Get messages
    getMessages: async (conversationId: string, page: number = 1): Promise<PaginatedResponse<Message>> => {
        return api.get(`/messages/conversations/${conversationId}/messages?page=${page}`);
    },

    // Send message (REST)
    sendMessage: async (data: SendMessageData): Promise<Message> => {
        const { conversationId, ...payload } = data;
        return api.post(`/messages/conversations/${conversationId}/messages`, payload);
    },

    // Delete message
    deleteMessage: async (messageId: string): Promise<void> => {
        return api.delete(`/messages/${messageId}`);
    },

    // Mark as read
    markAsRead: async (conversationId: string): Promise<void> => {
        return api.patch(`/messages/${conversationId}/read`);
    },

    // Upload media
    uploadMedia: async (file: File, onProgress?: (progress: number) => void): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('media', file);
        return api.upload('/messages/upload', formData, onProgress);
    },

    // Create conversation
    createConversation: async (userId: string): Promise<Conversation> => {
        // According to DTO, it expects param 'type' or others. 
        // Backend: createConversation(@Body() dto: CreateConversationDto)
        // CreateConversationDto: { participantIds: string[], type?: 'direct' | 'group', ... }
        return api.post('/messages/conversations', { participantIds: [userId], type: 'direct' });
    },

    // Delete conversation
    deleteConversation: async (conversationId: string): Promise<void> => {
        return api.delete(`/messages/conversations/${conversationId}`);
    },
};

export const notificationService = {
    // Get notifications
    getNotifications: async (page: number = 1): Promise<PaginatedResponse<any>> => {
        return api.get(`/notifications?page=${page}`);
    },

    // Mark notification as read
    markAsRead: async (notificationId: string): Promise<void> => {
        return api.patch(`/notifications/${notificationId}/read`);
    },

    // Mark all as read
    markAllAsRead: async (): Promise<void> => {
        return api.patch('/notifications/read-all');
    },

    // Delete notification
    deleteNotification: async (notificationId: string): Promise<void> => {
        return api.delete(`/notifications/${notificationId}`);
    },

    // Get unread count
    getUnreadCount: async (): Promise<{ count: number }> => {
        return api.get('/notifications/unread/count');
    },
};

export const searchService = {
    // General search
    search: async (query: string): Promise<any> => {
        return api.get(`/search?q=${encodeURIComponent(query)}`);
    },

    // Search users
    searchUsers: async (query: string, page: number = 1): Promise<PaginatedResponse<any>> => {
        return api.get(`/search/users?q=${encodeURIComponent(query)}&page=${page}`);
    },

    // Search posts
    searchPosts: async (query: string, page: number = 1): Promise<PaginatedResponse<any>> => {
        return api.get(`/search/posts?q=${encodeURIComponent(query)}&page=${page}`);
    },

    // Search hashtags
    searchHashtags: async (query: string): Promise<any[]> => {
        return api.get(`/search/hashtags?q=${encodeURIComponent(query)}`);
    },

    // Get trending hashtags
    getTrendingHashtags: async (limit: number = 10): Promise<any[]> => {
        return api.get(`/hashtags/trending?limit=${limit}`);
    },

    // Get posts by hashtag
    getPostsByHashtag: async (tag: string, page: number = 1): Promise<PaginatedResponse<any>> => {
        return api.get(`/hashtags/${tag}/posts?page=${page}`);
    },
};
