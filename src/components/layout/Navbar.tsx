import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../store/hooks';
import { openCreatePostModal } from '../../store/slices/uiSlice';
import {
    MagnifyingGlassIcon,
    BellIcon,
    PlusCircleIcon,
} from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className="font-display font-bold text-xl gradient-text hidden sm:block">
                            SocialVibe
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Search */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => navigate('/explore')}
                        >
                            <MagnifyingGlassIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Create Post */}
                        <button
                            onClick={() => dispatch(openCreatePostModal())}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <PlusCircleIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Notifications */}
                        <Link
                            to="/notifications"
                            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            {/* In a real app, show count if > 0 */}
                            {/* <span className="notification-badge">3</span> */}
                        </Link>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Profile */}
                        <Link to={`/profile/${user?.username}`}>
                            <Avatar
                                src={user?.avatar}
                                alt={user?.fullName || user?.username || ''}
                                size="md"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
