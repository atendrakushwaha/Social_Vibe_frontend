import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { tokenUtils, storage, STORAGE_KEYS } from '../../utils';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../../types';
import socketService from '../../services/socketService';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Helper to safely parse JSON
const safeParse = (jsonString: string | null) => {
    if (!jsonString || jsonString === 'undefined') return null;
    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
};

const initialState: AuthState = {
    user: safeParse(storage.get(STORAGE_KEYS.USER)),
    token: tokenUtils.get(),
    isAuthenticated: !!tokenUtils.get(),
    isLoading: false,
    error: null,
};

// Async Thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response: AuthResponse = await authService.login(credentials);
            const token = response.accessToken || response.token;
            if (token) {
                tokenUtils.set(token);
                storage.set(STORAGE_KEYS.USER, JSON.stringify(response.user));
                socketService.connect();
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (data: RegisterData, { rejectWithValue }) => {
        try {
            // 1. Register
            await authService.register(data);

            // 2. Login immediately to get token
            const loginResponse: AuthResponse = await authService.login({
                email: data.email,
                password: data.password
            });

            // 3. Save token and user
            const token = loginResponse.accessToken || loginResponse.token;
            if (token) {
                tokenUtils.set(token);
                storage.set(STORAGE_KEYS.USER, JSON.stringify(loginResponse.user));
                socketService.connect();
            }

            return loginResponse;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const user: User = await authService.getCurrentUser();
            storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
            return user;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch user');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
            tokenUtils.remove();
            storage.remove(STORAGE_KEYS.USER);
            socketService.disconnect();
        } catch (error: any) {
            // Even if API call fails, clear local data
            tokenUtils.remove();
            storage.remove(STORAGE_KEYS.USER);
            socketService.disconnect();
            return rejectWithValue(error.message || 'Logout failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                storage.set(STORAGE_KEYS.USER, JSON.stringify(state.user));
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.accessToken || action.payload.token || null;
            state.error = null;
        });

        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(register.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.accessToken || action.payload.token || null;
            state.error = null;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.error = action.payload as string;
        });

        // Get Current User
        builder.addCase(getCurrentUser.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getCurrentUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload;
        });
        builder.addCase(getCurrentUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = action.payload as string;
            tokenUtils.remove();
            storage.remove(STORAGE_KEYS.USER);
        });

        // Logout
        builder.addCase(logout.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(logout.fulfilled, (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = null;
        });
        builder.addCase(logout.rejected, (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
        });
    },
});

export const { updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
