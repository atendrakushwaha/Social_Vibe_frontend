
import api from './api';

export const adminService = {
    getDashboardStats: async () => {
        return api.get('/admin/dashboard');
    },

    getAllUsers: async (page = 1, limit = 10) => {
        return api.get(`/admin/users?page=${page}&limit=${limit}`);
    },

    banUser: async (userId: string) => {
        return api.put(`/admin/users/${userId}/ban`, {});
    },

    unbanUser: async (userId: string) => {
        return api.put(`/admin/users/${userId}/unban`, {});
    },

    getAllPosts: async (page = 1, limit = 10) => {
        return api.get(`/admin/posts?page=${page}&limit=${limit}`);
    },

    deletePost: async (postId: string) => {
        return api.delete(`/admin/posts/${postId}`);
    }
};
