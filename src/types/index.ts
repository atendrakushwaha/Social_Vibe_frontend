// User Types
export interface User {
    _id: string;
    username: string;
    email: string;
    fullName?: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    isPrivate: boolean;
    isVerified: boolean;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    role: 'user' | 'admin' | 'moderator';
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
    token?: string;
    accessToken?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    fullName?: string;
}

// Post Types
export interface Post {
    _id: string;
    userId: User;
    caption?: string;
    media: {
        url: string;
        type: 'image' | 'video';
        thumbnail?: string;
        width?: number;
        height?: number;
        duration?: number;
        altText?: string;
    }[];
    location?: {
        name: string;
        lat?: number;
        lng?: number;
        placeId?: string;
    };
    hashtags: string[];
    mentions: string[];
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePostData {
    caption?: string;
    media: {
        url: string;
        type: 'image' | 'video';
        thumbnail?: string;
        altText?: string;
    }[];
    location?: {
        name: string;
        lat?: number;
        lng?: number;
        placeId?: string;
    };
    commentsDisabled?: boolean;
    likesHidden?: boolean;
    visibility?: 'public' | 'followers' | 'close_friends';
}

// Comment Types
export interface Comment {
    _id: string;
    postId: string;
    userId: User;
    content: string;
    likesCount: number;
    isLiked: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentData {
    postId: string;
    content: string;
}

// Story Types
export interface Story {
    _id: string;
    userId: {
        _id: string;
        username: string;
        fullName: string;
        avatar?: string;
    };
    type: 'image' | 'video' | 'text';
    mediaUrl?: string;
    text?: string;
    backgroundColor?: string;
    viewsCount: number;
    hasViewed: boolean;
    createdAt: string;
    expiresAt: string;
}

export interface StoryGroup {
    userId: {
        _id: string;
        username: string;
        fullName: string;
        avatar?: string;
    };
    stories: Story[];
    hasUnviewed: boolean;
}

// Reel Types
export interface Reel {
    _id: string;
    userId: User;
    videoUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    musicName?: string;
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: string;
}

// Message Types
export interface Message {
    _id: string;
    conversationId: string;
    senderId: string | User; // Can be populated
    content: string;
    type: 'text' | 'image' | 'video' | 'voice';
    attachments?: any[];
    readBy?: Array<{ userId: string; readAt: string }>;
    createdAt: string;
    updatedAt: string;
    reactions?: Map<string, string> | any;
}

export interface Conversation {
    _id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
}

export interface SendMessageData {
    conversationId: string;
    type: string;
    content?: string;
    attachments?: any[];
    receiverId?: string; // Optional/Legacy
}

// Call Types
export interface Call {
    _id: string;
    callerId: User;
    receiverId: User;
    callType: 'voice' | 'video';
    status: 'pending' | 'ongoing' | 'ended' | 'missed';
    duration?: number;
    startedAt?: string;
    endedAt?: string;
    createdAt: string;
}

// Notification Types
export type NotificationType =
    | 'like'
    | 'comment'
    | 'follow'
    | 'mention'
    | 'follow_request';

export interface Notification {
    _id: string;
    userId: string;
    actorId: User;
    type: NotificationType;
    postId?: string;
    commentId?: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

// Follow Types
export interface Follow {
    _id: string;
    followerId: string;
    followingId: string;
    status: 'accepted' | 'pending';
    createdAt: string;
}

// Search Types
export interface SearchResult {
    users: User[];
    posts: Post[];
    hashtags: { tag: string; count: number }[];
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

// UI State Types
export interface ThemeState {
    mode: 'light' | 'dark';
}

export interface UIState {
    isSidebarOpen: boolean;
    isSearchOpen: boolean;
    isNotificationsOpen: boolean;
    isCreatePostModalOpen: boolean;
    isStoryViewerOpen: boolean;
    activeStoryIndex: number;
}

// Form Types
export interface ProfileUpdateData {
    fullName?: string;
    username?: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    isPrivate?: boolean;
}

export interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Feed Types
export interface FeedOptions {
    page?: number;
    limit?: number;
    type?: 'following' | 'explore';
}

// Hashtag Types
export interface Hashtag {
    _id: string;
    tag: string;
    postsCount: number;
}
