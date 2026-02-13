import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { storyService } from '../../services/storyService';
import type { Story, StoryGroup } from '../../types';

export type { Story, StoryGroup };

interface StoryState {
    stories: StoryGroup[];
    currentStory: Story | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: StoryState = {
    stories: [],
    currentStory: null,
    isLoading: false,
    error: null,
};

// Fetch all stories
export const fetchStories = createAsyncThunk(
    'story/fetchStories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await storyService.getStories();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stories');
        }
    }
);

// Create story
export const createStory = createAsyncThunk(
    'story/createStory',
    async (data: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }, { rejectWithValue }) => {
        try {
            const response = await storyService.createStory(data.mediaUrl, data.mediaType, data.caption);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create story');
        }
    }
);

// View story
export const viewStory = createAsyncThunk(
    'story/viewStory',
    async (storyId: string, { rejectWithValue }) => {
        try {
            await storyService.viewStory(storyId);
            return storyId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to view story');
        }
    }
);

// Delete story
export const deleteStory = createAsyncThunk(
    'story/deleteStory',
    async (storyId: string, { rejectWithValue }) => {
        try {
            await storyService.deleteStory(storyId);
            return storyId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete story');
        }
    }
);

const storySlice = createSlice({
    name: 'story',
    initialState,
    reducers: {
        setCurrentStory: (state, action: PayloadAction<Story | null>) => {
            state.currentStory = action.payload;
        },
        clearStories: (state) => {
            state.stories = [];
            state.currentStory = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch stories
            .addCase(fetchStories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchStories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stories = action.payload;
            })
            .addCase(fetchStories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create story
            .addCase(createStory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createStory.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add new story to the beginning
                const newStory = action.payload;
                const existingGroup = state.stories.find(
                    (group) => group.userId._id === newStory.userId._id
                );
                if (existingGroup) {
                    existingGroup.stories.unshift(newStory);
                    existingGroup.hasUnviewed = true;
                } else {
                    state.stories.unshift({
                        userId: newStory.userId,
                        stories: [newStory],
                        hasUnviewed: true,
                    });
                }
            })
            .addCase(createStory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // View story
            .addCase(viewStory.fulfilled, (state, action) => {
                const storyId = action.payload;
                state.stories.forEach((group) => {
                    const story = group.stories.find((s) => s._id === storyId);
                    if (story) {
                        story.hasViewed = true;
                        story.viewsCount += 1;
                    }
                    // Update hasUnviewed flag
                    group.hasUnviewed = group.stories.some((s) => !s.hasViewed);
                });
            })
            // Delete story
            .addCase(deleteStory.fulfilled, (state, action) => {
                const storyId = action.payload;
                state.stories = state.stories
                    .map((group) => ({
                        ...group,
                        stories: group.stories.filter((s) => s._id !== storyId),
                    }))
                    .filter((group) => group.stories.length > 0);
            });
    },
});

export const { setCurrentStory, clearStories } = storySlice.actions;
export default storySlice.reducer;
