import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../store/hooks';
import { openCreatePostModal } from '../../store/slices/uiSlice';
import { CreateStoryModal } from '../story/CreateStoryModal';
import { CreateReelModal } from '../reel/CreateReelModal';
import { cn } from '../../utils';
import {
    HomeIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    HeartIcon,
    UserCircleIcon,
    BookmarkIcon,
    FilmIcon,
    PlusCircleIcon,
    CameraIcon,
    VideoCameraIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../../store/slices/authSlice';
import {
    HomeIcon as HomeIconSolid,
    MagnifyingGlassIcon as MagnifyingGlassIconSolid,
    ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
    HeartIcon as HeartIconSolid,
    UserCircleIcon as UserCircleIconSolid,
    BookmarkIcon as BookmarkIconSolid,
    FilmIcon as FilmIconSolid,
} from '@heroicons/react/24/solid';

export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
    const [isReelModalOpen, setIsReelModalOpen] = useState(false);

    const navItems = [
        { to: '/', label: 'Home', icon: HomeIcon, iconSolid: HomeIconSolid },
        { to: '/explore', label: 'Explore', icon: MagnifyingGlassIcon, iconSolid: MagnifyingGlassIconSolid },
        { to: '/reels', label: 'Reels', icon: FilmIcon, iconSolid: FilmIconSolid },
        { to: '/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
        { to: '/notifications', label: 'Notifications', icon: HeartIcon, iconSolid: HeartIconSolid },
        { to: '/saved', label: 'Saved', icon: BookmarkIcon, iconSolid: BookmarkIconSolid },
        { to: `/profile/${user?.username}`, label: 'Profile', icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
    ];

    const createItems = [
        { label: 'Create Post', icon: PlusCircleIcon, onClick: () => dispatch(openCreatePostModal()) },
        { label: 'Create Story', icon: CameraIcon, onClick: () => setIsStoryModalOpen(true) },
        { label: 'Create Reel', icon: VideoCameraIcon, onClick: () => setIsReelModalOpen(true) },
    ];

    return (
        <>
            <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border overflow-y-auto">
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive ? (
                                        <item.iconSolid className="w-6 h-6" />
                                    ) : (
                                        <item.icon className="w-6 h-6" />
                                    )}
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                    {/* Create Actions */}
                    <div className="space-y-2">
                        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Create
                        </p>
                        {createItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                                <item.icon className="w-6 h-6" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                    {/* Logout */}
                    <button
                        onClick={() => {
                            dispatch(logout());
                            navigate('/login');
                        }}
                        className="w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                    >
                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Modals */}
            <CreateStoryModal
                isOpen={isStoryModalOpen}
                onClose={() => setIsStoryModalOpen(false)}
            />
            <CreateReelModal
                isOpen={isReelModalOpen}
                onClose={() => setIsReelModalOpen(false)}
            />
        </>
    );
};
