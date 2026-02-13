import api from './api';
import type { PaginatedResponse, User } from '../types';

export const followService = {
    // Follow user
    followUser: async (userId: string): Promise<{ message: string; status: string }> => {
        return api.post(`/follows/${userId}`);
    },

    // Unfollow user
    unfollowUser: async (userId: string): Promise<void> => {
        return api.delete(`/follows/${userId}`);
    },

    // Get followers
    getFollowers: async (userId: string, page: number = 1): Promise<PaginatedResponse<User>> => {
        return api.get(`/follows/followers/${userId}?page=${page}`);
    },

    // Get following
    getFollowing: async (userId: string, page: number = 1): Promise<PaginatedResponse<User>> => {
        return api.get(`/follows/following/${userId}?page=${page}`);
    },

    // Get follow status
    getFollowStatus: async (userId: string): Promise<{ isFollowing: boolean; isFollower: boolean; isPending: boolean }> => {
        const response: any = await api.get(`/follows/status/${userId}`);
        // Backend returns: { following: boolean, followedBy: boolean, requestSent: boolean }
        return {
            isFollowing: response.following,
            isFollower: response.followedBy,
            isPending: response.requestSent
        };
    },

    // Get follow requests
    getFollowRequests: async (page: number = 1): Promise<PaginatedResponse<any>> => {
        return api.get(`/follows/requests?page=${page}`);
    },

    // Accept follow request
    acceptRequest: async (requestId: string): Promise<void> => {
        return api.patch(`/follows/requests/${requestId}/accept`);
    },

    // Reject follow request
    rejectRequest: async (requestId: string): Promise<void> => {
        return api.delete(`/follows/requests/${requestId}/reject`);
    },

    // Get suggested users
    getSuggestions: async (limit: number = 5): Promise<PaginatedResponse<User>> => {
        return api.get(`/users/suggestions?limit=${limit}`);
    },
};
