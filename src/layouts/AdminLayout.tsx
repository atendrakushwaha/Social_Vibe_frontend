
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../utils';
import {
    HomeIcon,
    UserGroupIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';

export const AdminLayout: React.FC = () => {
    const navItems = [
        { to: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
        { to: '/admin/users', label: 'Users', icon: UserGroupIcon },
        { to: '/admin/posts', label: 'Posts', icon: PhotoIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border fixed h-full z-10">
                <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                        Admin Panel
                    </h1>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                )
                            }
                        >
                            <item.icon className="w-6 h-6" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};
