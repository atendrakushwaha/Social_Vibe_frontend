import api from './api';
import type { Post, CreatePostData, PaginatedResponse, FeedOptions } from '../types';

export const postService = {
    // Get feed
    getFeed: async (options: FeedOptions = {}): Promise<PaginatedResponse<Post>> => {
        const { page = 1, limit = 10, type = 'following' } = options;

        let endpoint = '/feed';
        if (type === 'following') endpoint = '/feed/following';
        if (type === 'explore') endpoint = '/feed/explore';

        return api.get(`${endpoint}?page=${page}&limit=${limit}`);
    },

    // Get user posts
    getUserPosts: async (username: string, page: number = 1): Promise<PaginatedResponse<Post>> => {
        return api.get(`/posts/username/${username}?page=${page}`);
    },

    // Get single post
    getPost: async (id: string): Promise<Post> => {
        return api.get(`/posts/${id}`);
    },

    // Create post
    createPost: async (data: CreatePostData): Promise<Post> => {
        return api.post('/posts', data);
    },

    // Update post
    updatePost: async (id: string, data: Partial<CreatePostData>): Promise<Post> => {
        return api.patch(`/posts/${id}`, data);
    },

    // Delete post
    deletePost: async (id: string): Promise<void> => {
        return api.delete(`/posts/${id}`);
    },

    // Like post
    likePost: async (postId: string): Promise<void> => {
        return api.post(`/posts/${postId}/like`);
    },

    // Unlike post
    unlikePost: async (postId: string): Promise<void> => {
        return api.delete(`/posts/${postId}/like`);
    },

    // Get post likes
    getPostLikes: async (postId: string, page: number = 1): Promise<PaginatedResponse<any>> => {
        return api.get(`/posts/${postId}/likes?page=${page}`);
    },

    // Get explore posts
    getExplorePosts: async (page: number = 1): Promise<PaginatedResponse<Post>> => {
        return api.get(`/posts/explore?page=${page}`);
    },
};

export const commentService = {
    // Get post comments
    getComments: async (postId: string, page: number = 1): Promise<PaginatedResponse<any>> => {
        return api.get(`/posts/${postId}/comments?page=${page}`);
    },

    // Create comment
    createComment: async (postId: string, content: string): Promise<any> => {
        return api.post(`/posts/${postId}/comments`, { content });
    },

    // Delete comment
    deleteComment: async (commentId: string): Promise<void> => {
        return api.delete(`/comments/${commentId}`);
    },

    // Like comment
    likeComment: async (commentId: string): Promise<void> => {
        return api.post(`/comments/${commentId}/like`);
    },

    // Unlike comment
    unlikeComment: async (commentId: string): Promise<void> => {
        return api.delete(`/comments/${commentId}/like`);
    },
};

export const bookmarkService = {
    // Get saved posts
    getSavedPosts: async (page: number = 1): Promise<PaginatedResponse<Post>> => {
        return api.get(`/bookmarks?page=${page}`);
    },

    // Save post
    savePost: async (postId: string): Promise<void> => {
        return api.post(`/bookmarks/${postId}`);
    },

    // Unsave post
    unsavePost: async (postId: string): Promise<void> => {
        return api.delete(`/bookmarks/${postId}`);
    },
};
