import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Avatar } from '../common/Avatar';

export const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length > 0) {
                searchUsers();
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const searchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await userService.searchUsers(query);
            setResults(data?.data || []);
            setIsOpen(true);
        } catch (error) {
            console.error('Search failed', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserClick = (username: string) => {
        navigate(`/profile/${username}`);
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setIsOpen(true)}
                    placeholder="Search users..."
                    className="w-64 px-4 py-2 pl-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-dark-card rounded-lg shadow-xl border border-gray-200 dark:border-dark-border max-h-96 overflow-y-auto z-50">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    ) : results.length > 0 ? (
                        results.map(user => (
                            <div
                                key={user._id}
                                onClick={() => handleUserClick(user.username)}
                                className="flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            >
                                <Avatar src={user.avatar} alt={user.username} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">{user.username}</p>
                                    <p className="text-sm text-gray-500 truncate">{user.fullName || 'Instagram User'}</p>
                                </div>
                            </div>
                        ))
                    ) : query ? (
                        <div className="p-4 text-center text-gray-500">
                            No users found
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};
