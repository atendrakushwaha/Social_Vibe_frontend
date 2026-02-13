import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils';
import {
    HomeIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    HeartIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    MagnifyingGlassIcon as MagnifyingGlassIconSolid,
    ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
    HeartIcon as HeartIconSolid,
    UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';

export const MobileNav: React.FC = () => {
    const { user } = useAuth();

    const navItems = [
        { to: '/', icon: HomeIcon, iconSolid: HomeIconSolid },
        { to: '/explore', icon: MagnifyingGlassIcon, iconSolid: MagnifyingGlassIconSolid },
        { to: '/messages', icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid },
        { to: '/notifications', icon: HeartIcon, iconSolid: HeartIconSolid },
        { to: `/profile/${user?.username}`, icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center justify-around px-4 py-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                'p-2 rounded-lg transition-colors',
                                isActive
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            )
                        }
                    >
                        {({ isActive }) =>
                            isActive ? (
                                <item.iconSolid className="w-7 h-7" />
                            ) : (
                                <item.icon className="w-7 h-7" />
                            )
                        }
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
