import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import socketService from './services/socketService';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import StoryViewer from './pages/StoryViewer';
import ReelsPage from './pages/ReelsPage';
import Saved from './pages/Saved';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminPosts } from './pages/admin/AdminPosts';
import NotFound from './pages/NotFound';

// Components
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { Loading } from './components/common/Loading';
import { CallProvider } from './context/CallContext';
import { CallManager } from './components/call/CallManager';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const { mode } = useAppSelector((state) => state.theme);

  useEffect(() => {
    // Apply theme on mount
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    // Get current user if token exists
    const token = localStorage.getItem('auth_token');
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Connect socket when authenticated
    if (isAuthenticated) {
      socketService.connect();
    }
    // No cleanup on unmount to prevent accidental disconnection in Strict Mode
    // Socket will be disconnected on logout via authSlice
  }, [isAuthenticated]);

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  return (
    <CallProvider>
      <CallManager />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:conversationId" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/reels" element={<ReelsPage />} />
            <Route path="/saved" element={<Saved />} />
          </Route>
          {/* Full screen routes outside layout */}
          <Route path="/stories/:username" element={<StoryViewer />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CallProvider>
  );
}

export default App;
