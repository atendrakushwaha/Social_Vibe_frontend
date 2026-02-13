import api from './api';
import type { Story, StoryGroup } from '../types';

export const storyService = {
    // Get stories from following
    getStories: async (): Promise<StoryGroup[]> => {
        try {
            const response = await api.get('/stories');
            return Array.isArray(response) ? response : (response?.data || []);
        } catch (error) {
            console.error('Failed to fetch stories:', error);
            return [];
        }
    },

    // Get user stories by username
    getUserStories: async (username: string): Promise<Story[]> => {
        try {
            const response = await api.get(`/stories/user/${username}`);
            return Array.isArray(response) ? response : (response?.data || []);
        } catch (error) {
            console.error('Failed to fetch user stories:', error);
            return [];
        }
    },

    // Create story - sends { mediaUrl, mediaType, caption } to backend
    createStory: async (mediaUrl: string, mediaType: 'image' | 'video', caption?: string): Promise<Story> => {
        return api.post('/stories', { mediaUrl, mediaType, caption });
    },

    // Delete story
    deleteStory: async (id: string): Promise<void> => {
        return api.delete(`/stories/${id}`);
    },

    // View story
    viewStory: async (id: string): Promise<void> => {
        return api.post(`/stories/${id}/view`);
    },

    // Get story views
    getStoryViews: async (id: string): Promise<any> => {
        return api.get(`/stories/${id}/views`);
    },

    // Upload story media
    uploadStoryMedia: async (file: File, onProgress?: (progress: number) => void): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('media', file);
        return api.upload('/stories/upload', formData, onProgress);
    },
};
