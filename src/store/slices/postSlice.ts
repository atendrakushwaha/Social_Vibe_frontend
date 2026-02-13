import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { postService, bookmarkService } from '../../services/postService';
import type { Post, CreatePostData } from '../../types';

interface PostState {
    feed: Post[];
    explorePosts: Post[];
    savedPosts: Post[];
    currentPost: Post | null;
    feedPage: number;
    hasMoreFeed: boolean;
    isLoading: boolean;
    isCreatingPost: boolean;
    error: string | null;
}

const initialState: PostState = {
    feed: [],
    explorePosts: [],
    savedPosts: [],
    currentPost: null,
    feedPage: 1,
    hasMoreFeed: true,
    isLoading: false,
    isCreatingPost: false,
    error: null,
};

// Async Thunks
export const fetchFeed = createAsyncThunk(
    'post/fetchFeed',
    async ({ page = 1, type = 'following' }: { page?: number; type?: 'following' | 'explore' }, { rejectWithValue }) => {
        try {
            // Backend returns { posts: Post[], total: number }
            const response: any = await postService.getFeed({ page, type });

            // Handle different response structures gracefully
            const posts = response.posts || response.data || [];
            const total = response.total || 0;
            const limit = 10; // Default limit
            const hasMore = posts.length === limit; // Simple check if we got full page

            return { posts, page, hasMore, total };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch feed');
        }
    }
);

export const createPost = createAsyncThunk(
    'post/createPost',
    async (data: CreatePostData, { rejectWithValue }) => {
        try {
            const post: Post = await postService.createPost(data);
            return post;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create post');
        }
    }
);

export const deletePost = createAsyncThunk(
    'post/deletePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            await postService.deletePost(postId);
            return postId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete post');
        }
    }
);

export const likePost = createAsyncThunk(
    'post/likePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            await postService.likePost(postId);
            return postId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to like post');
        }
    }
);

export const unlikePost = createAsyncThunk(
    'post/unlikePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            await postService.unlikePost(postId);
            return postId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to unlike post');
        }
    }
);

export const savePost = createAsyncThunk(
    'post/savePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            await bookmarkService.savePost(postId);
            return postId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to save post');
        }
    }
);

export const unsavePost = createAsyncThunk(
    'post/unsavePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            await bookmarkService.unsavePost(postId);
            return postId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to unsave post');
        }
    }
);

const postSlice = createSlice({
    name: 'post',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updatePostInFeed: (state, action: PayloadAction<Post>) => {
            const index = state.feed.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.feed[index] = action.payload;
            }
        },
        incrementCommentCount: (state, action: PayloadAction<string>) => {
            const post = state.feed.find(p => p._id === action.payload);
            if (post) {
                post.commentsCount += 1;
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch Feed
        builder.addCase(fetchFeed.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchFeed.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload.page === 1) {
                state.feed = action.payload.posts;
            } else {
                state.feed = [...state.feed, ...action.payload.posts];
            }
            state.feedPage = action.payload.page;
            state.hasMoreFeed = action.payload.hasMore;
        });
        builder.addCase(fetchFeed.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Create Post
        builder.addCase(createPost.pending, (state) => {
            state.isCreatingPost = true;
            state.error = null;
        });
        builder.addCase(createPost.fulfilled, (state, action) => {
            state.isCreatingPost = false;
            state.feed.unshift(action.payload);
        });
        builder.addCase(createPost.rejected, (state, action) => {
            state.isCreatingPost = false;
            state.error = action.payload as string;
        });

        // Delete Post
        builder.addCase(deletePost.fulfilled, (state, action) => {
            state.feed = state.feed.filter(p => p._id !== action.payload);
            state.explorePosts = state.explorePosts.filter(p => p._id !== action.payload);
        });

        // Like Post
        builder.addCase(likePost.fulfilled, (state, action) => {
            const post = state.feed.find(p => p._id === action.payload);
            if (post) {
                post.isLiked = true;
                post.likesCount += 1;
            }
        });

        // Unlike Post
        builder.addCase(unlikePost.fulfilled, (state, action) => {
            const post = state.feed.find(p => p._id === action.payload);
            if (post) {
                post.isLiked = false;
                post.likesCount -= 1;
            }
        });

        // Save Post
        builder.addCase(savePost.fulfilled, (state, action) => {
            const post = state.feed.find(p => p._id === action.payload);
            if (post) {
                post.isSaved = true;
            }
        });

        // Unsave Post
        builder.addCase(unsavePost.fulfilled, (state, action) => {
            const post = state.feed.find(p => p._id === action.payload);
            if (post) {
                post.isSaved = false;
            }
        });
    },
});

export const { clearError, updatePostInFeed, incrementCommentCount } = postSlice.actions;
export default postSlice.reducer;
