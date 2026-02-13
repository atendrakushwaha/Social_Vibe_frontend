import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import reelService from '../../services/reelService';

export interface Reel {
    _id: string;
    userId: {
        _id: string;
        username: string;
        fullName: string;
        avatar?: string;
        isVerified?: boolean;
    };
    videoUrl: string;
    thumbnail: string;
    caption: string;
    audioName?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    viewsCount: number;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: string;
}

interface ReelState {
    reels: Reel[];
    currentReelIndex: number;
    isLoading: boolean;
    hasMore: boolean;
    error: string | null;
}

const initialState: ReelState = {
    reels: [],
    currentReelIndex: 0,
    isLoading: false,
    hasMore: true,
    error: null,
};

// Fetch reels
export const fetchReels = createAsyncThunk(
    'reel/fetchReels',
    async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await reelService.getReels(page, limit);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reels');
        }
    }
);

// Create reel
export const createReel = createAsyncThunk(
    'reel/createReel',
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const response = await reelService.createReel(formData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create reel');
        }
    }
);

// Like reel
export const likeReel = createAsyncThunk(
    'reel/likeReel',
    async (reelId: string, { rejectWithValue }) => {
        try {
            await reelService.likeReel(reelId);
            return reelId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to like reel');
        }
    }
);

// Unlike reel
export const unlikeReel = createAsyncThunk(
    'reel/unlikeReel',
    async (reelId: string, { rejectWithValue }) => {
        try {
            await reelService.unlikeReel(reelId);
            return reelId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to unlike reel');
        }
    }
);

// Save reel
export const saveReel = createAsyncThunk(
    'reel/saveReel',
    async (reelId: string, { rejectWithValue }) => {
        try {
            await reelService.saveReel(reelId);
            return reelId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to save reel');
        }
    }
);

// Unsave reel
export const unsaveReel = createAsyncThunk(
    'reel/unsaveReel',
    async (reelId: string, { rejectWithValue }) => {
        try {
            await reelService.unsaveReel(reelId);
            return reelId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to unsave reel');
        }
    }
);

// Delete reel
export const deleteReel = createAsyncThunk(
    'reel/deleteReel',
    async (reelId: string, { rejectWithValue }) => {
        try {
            await reelService.deleteReel(reelId);
            return reelId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete reel');
        }
    }
);

const reelSlice = createSlice({
    name: 'reel',
    initialState,
    reducers: {
        setCurrentReelIndex: (state, action: PayloadAction<number>) => {
            state.currentReelIndex = action.payload;
        },
        clearReels: (state) => {
            state.reels = [];
            state.currentReelIndex = 0;
            state.hasMore = true;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch reels
            .addCase(fetchReels.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReels.fulfilled, (state, action) => {
                state.isLoading = false;
                const newReels = action.payload.data;
                state.reels = [...state.reels, ...newReels];
                state.hasMore = action.payload.hasMore;
            })
            .addCase(fetchReels.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create reel
            .addCase(createReel.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createReel.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reels.unshift(action.payload);
            })
            .addCase(createReel.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Like reel
            .addCase(likeReel.fulfilled, (state, action) => {
                const reel = state.reels.find((r) => r._id === action.payload);
                if (reel) {
                    reel.isLiked = true;
                    reel.likesCount += 1;
                }
            })
            // Unlike reel
            .addCase(unlikeReel.fulfilled, (state, action) => {
                const reel = state.reels.find((r) => r._id === action.payload);
                if (reel) {
                    reel.isLiked = false;
                    reel.likesCount -= 1;
                }
            })
            // Save reel
            .addCase(saveReel.fulfilled, (state, action) => {
                const reel = state.reels.find((r) => r._id === action.payload);
                if (reel) {
                    reel.isSaved = true;
                }
            })
            // Unsave reel
            .addCase(unsaveReel.fulfilled, (state, action) => {
                const reel = state.reels.find((r) => r._id === action.payload);
                if (reel) {
                    reel.isSaved = false;
                }
            })
            // Delete reel
            .addCase(deleteReel.fulfilled, (state, action) => {
                state.reels = state.reels.filter((r) => r._id !== action.payload);
            });
    },
});

export const { setCurrentReelIndex, clearReels } = reelSlice.actions;
export default reelSlice.reducer;
