// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// App Configuration
export const APP_NAME = 'SocialVibe';
export const APP_DESCRIPTION = 'Connect, Share, Inspire';

// Pagination
export const POSTS_PER_PAGE = 10;
export const STORIES_PER_PAGE = 20;
export const REELS_PER_PAGE = 15;
export const MESSAGES_PER_PAGE = 50;
export const NOTIFICATIONS_PER_PAGE = 20;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// Story Configuration
export const STORY_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const STORY_VIEW_DURATION = 5000; // 5 seconds

// Validation
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 50;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 30;
export const MAX_BIO_LENGTH = 150;
export const MAX_POST_CAPTION_LENGTH = 2200;
export const MAX_COMMENT_LENGTH = 500;

// Routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PROFILE: '/profile/:username',
    EDIT_PROFILE: '/profile/edit',
    POST: '/post/:id',
    EXPLORE: '/explore',
    MESSAGES: '/messages',
    MESSAGES_CHAT: '/messages/:conversationId',
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings',
    REELS: '/reels',
    SAVED: '/saved',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
    THEME: 'theme',
    LANGUAGE: 'language',
} as const;

// Theme
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
} as const;

// WebSocket Events
export const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    // Chat Events
    MESSAGE_NEW: 'message:new',
    MESSAGE_SEND: 'message:send',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    TYPING_UPDATE: 'typing:update',
    CONVERSATION_JOIN: 'conversation:join',
    CONVERSATION_LEAVE: 'conversation:leave',
    MESSAGE_READ: 'message:read',
    MESSAGE_READ_UPDATE: 'message:read:update',

    // Notifications & Others (Keep existing if backend supports them, or update later)
    // The backend chat gateway didn't show these explicitly, assuming they might cover them or be WTB
    ONLINE_STATUS: 'user:online', // backend emits user:online
    OFFLINE_STATUS: 'user:offline',
    NEW_NOTIFICATION: 'newNotification', // Backend doesn't show this in chat gateway. Keeping for now.
    POST_LIKED: 'postLiked',
    POST_COMMENTED: 'postCommented',
    NEW_FOLLOWER: 'newFollower',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please login to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    INVALID_FILE_TYPE: 'Invalid file type. Please upload a valid image or video.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Welcome back!',
    REGISTER_SUCCESS: 'Account created successfully!',
    POST_CREATED: 'Post created successfully!',
    POST_DELETED: 'Post deleted successfully!',
    COMMENT_ADDED: 'Comment added!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    FOLLOW_SUCCESS: 'Following user!',
    UNFOLLOW_SUCCESS: 'Unfollowed user!',
} as const;
