import api from './api';
import type { User, ProfileUpdateData, PaginatedResponse } from '../types';

export const userService = {
    // Get user profile
    getProfile: async (username: string): Promise<User> => {
        return api.get(`/users/${username}`);
    },

    // Update profile
    updateProfile: async (data: ProfileUpdateData): Promise<User> => {
        return api.patch('/users/profile', data);
    },

    // Upload avatar
    uploadAvatar: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('avatar', file);
        return api.upload('/users/avatar', formData);
    },

    // Upload cover image
    uploadCoverImage: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('cover', file);
        return api.upload('/users/cover', formData);
    },

    // Search users
    searchUsers: async (query: string, page: number = 1): Promise<PaginatedResponse<User>> => {
        return api.get(`/users/search/query?q=${encodeURIComponent(query)}&page=${page}`);
    },

    // Get suggested users
    getSuggestedUsers: async (limit: number = 5): Promise<User[]> => {
        return api.get(`/users/suggestions?limit=${limit}`);
    },
};


