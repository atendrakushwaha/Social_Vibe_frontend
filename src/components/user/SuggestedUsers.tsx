import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { followService } from '../../services/followService';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

interface SuggestedUser {
    _id: string;
    username: string;
    fullName?: string;
    avatar?: string;
    followersCount: number;
}

export const SuggestedUsers: React.FC = () => {
    const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const response = await followService.getSuggestions(5);
            // Ensure we handle both PaginatedResponse and array
            const data = Array.isArray(response) ? response : (response?.data || []);
            setSuggestions(data);
        } catch (error) {
            console.error('Failed to fetch suggestions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId: string) => {
        try {
            await followService.followUser(userId);
            // Remove user from suggestions list immediately
            setSuggestions(prev => prev.filter(user => user._id !== userId));
        } catch (error) {
            console.error('Failed to follow user', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-dark-card rounded-lg p-4">
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-dark-card rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm">Suggestions For You</h3>
                <button
                    onClick={() => navigate('/explore')}
                    className="text-xs font-semibold text-gray-900 dark:text-white hover:text-gray-600"
                >
                    See All
                </button>
            </div>

            <div className="space-y-3">
                {suggestions.map(user => (
                    <div key={user._id} className="flex items-center justify-between">
                        <div
                            className="flex items-center space-x-3 flex-1 cursor-pointer"
                            onClick={() => navigate(`/profile/${user.username}`)}
                        >
                            <Avatar src={user.avatar} alt={user.username} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                    {user.username}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user.fullName || 'Suggested for you'}
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleFollow(user._id)}
                            className="font-semibold text-xs ml-2"
                        >
                            Follow
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};
