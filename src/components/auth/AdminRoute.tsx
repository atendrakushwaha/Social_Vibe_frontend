
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../common/Loading';

export const AdminRoute: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <Loading fullScreen />;
    }

    // Check if user is authenticated and has admin role
    if (!isAuthenticated || user?.role !== 'admin') {
        // Redirect to home or login
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
