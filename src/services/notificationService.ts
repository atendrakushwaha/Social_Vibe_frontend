import api from './api';

export const notificationService = {
    // Get all notifications
    getNotifications: async (page = 1, limit = 20) => {
        return api.get(`/notifications?page=${page}&limit=${limit}`);
    },

    // Mark notification as read
    markAsRead: async (notificationId: string) => {
        return api.patch(`/notifications/${notificationId}/read`, {});
    },

    // Mark all as read
    markAllAsRead: async () => {
        return api.patch('/notifications/read-all', {});
    },

    // Delete notification
    deleteNotification: async (notificationId: string) => {
        return api.delete(`/notifications/${notificationId}`);
    },
};
