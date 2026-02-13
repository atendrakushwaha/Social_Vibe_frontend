import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isSidebarOpen: boolean;
    isSearchOpen: boolean;
    isNotificationsOpen: boolean;
    isCreatePostModalOpen: boolean;
    isStoryViewerOpen: boolean;
    activeStoryIndex: number;
    isMobileMenuOpen: boolean;
}

const initialState: UIState = {
    isSidebarOpen: true,
    isSearchOpen: false,
    isNotificationsOpen: false,
    isCreatePostModalOpen: false,
    isStoryViewerOpen: false,
    activeStoryIndex: 0,
    isMobileMenuOpen: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.isSidebarOpen = action.payload;
        },
        toggleSearch: (state) => {
            state.isSearchOpen = !state.isSearchOpen;
            if (state.isSearchOpen) {
                state.isNotificationsOpen = false;
            }
        },
        toggleNotifications: (state) => {
            state.isNotificationsOpen = !state.isNotificationsOpen;
            if (state.isNotificationsOpen) {
                state.isSearchOpen = false;
            }
        },
        openCreatePostModal: (state) => {
            state.isCreatePostModalOpen = true;
        },
        closeCreatePostModal: (state) => {
            state.isCreatePostModalOpen = false;
        },
        openStoryViewer: (state, action: PayloadAction<number>) => {
            state.isStoryViewerOpen = true;
            state.activeStoryIndex = action.payload;
        },
        closeStoryViewer: (state) => {
            state.isStoryViewerOpen = false;
            state.activeStoryIndex = 0;
        },
        setActiveStoryIndex: (state, action: PayloadAction<number>) => {
            state.activeStoryIndex = action.payload;
        },
        toggleMobileMenu: (state) => {
            state.isMobileMenuOpen = !state.isMobileMenuOpen;
        },
        closeMobileMenu: (state) => {
            state.isMobileMenuOpen = false;
        },
        closeAllModals: (state) => {
            state.isSearchOpen = false;
            state.isNotificationsOpen = false;
            state.isCreatePostModalOpen = false;
            state.isStoryViewerOpen = false;
            state.isMobileMenuOpen = false;
        },
    },
});

export const {
    toggleSidebar,
    setSidebarOpen,
    toggleSearch,
    toggleNotifications,
    openCreatePostModal,
    closeCreatePostModal,
    openStoryViewer,
    closeStoryViewer,
    setActiveStoryIndex,
    toggleMobileMenu,
    closeMobileMenu,
    closeAllModals,
} = uiSlice.actions;

export default uiSlice.reducer;
