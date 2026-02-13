import api from './api';

const reelService = {
    // Get reels feed
    getReels: async (page: number = 1, limit: number = 10) => {
        return api.get(`/reels?page=${page}&limit=${limit}`);
    },

    // Get reel by ID
    getReelById: async (reelId: string) => {
        return api.get(`/reels/${reelId}`);
    },

    // Get user's reels
    getUserReels: async (username: string, page: number = 1, limit: number = 12) => {
        return api.get(`/reels/user/${username}?page=${page}&limit=${limit}`);
    },

    // Create reel
    createReel: async (formData: FormData) => {
        return api.post('/reels', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Update reel
    updateReel: async (reelId: string, data: { caption?: string; audioName?: string }) => {
        return api.patch(`/reels/${reelId}`, data);
    },

    // Delete reel
    deleteReel: async (reelId: string) => {
        return api.delete(`/reels/${reelId}`);
    },

    // Like reel
    likeReel: async (reelId: string) => {
        return api.post(`/reels/${reelId}/like`);
    },

    // Unlike reel (Toggle in backend)
    unlikeReel: async (reelId: string) => {
        return api.post(`/reels/${reelId}/like`);
    },

    // Share reel
    shareReel: async (reelId: string) => {
        return api.post(`/reels/${reelId}/share`);
    },

    // Save reel
    saveReel: async (reelId: string) => {
        return api.post(`/reels/${reelId}/save`);
    },

    // Unsave reel
    unsaveReel: async (reelId: string) => {
        return api.delete(`/reels/${reelId}/save`);
    },

    // Get reel comments
    getReelComments: async (reelId: string, page: number = 1, limit: number = 20) => {
        return api.get(`/reels/${reelId}/comments?page=${page}&limit=${limit}`);
    },

    // Add comment to reel
    addReelComment: async (reelId: string, content: string) => {
        return api.post(`/reels/${reelId}/comments`, { content });
    },

    // Increment view count
    incrementViewCount: async (reelId: string) => {
        return api.post(`/reels/${reelId}/view`);
    },
};

export default reelService;
