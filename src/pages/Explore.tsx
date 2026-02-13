import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFeed } from '../store/slices/postSlice';
import { Loading } from '../components/common/Loading';
import { ProfileGrid } from '../components/profile/ProfileGrid';
import { userService } from '../services/userService';
import type { User } from '../types';
import { Avatar } from '../components/common/Avatar';
import { Link } from 'react-router-dom';

export const Explore: React.FC = () => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    const { feed, isLoading: isFeedLoading } = useAppSelector((state) => state.post);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    useEffect(() => {
        if (query) {
            const search = async () => {
                setIsSearchLoading(true);
                try {
                    const data = await userService.searchUsers(query);
                    setSearchResults(data?.data || []);
                } catch (error) {
                    console.error('Search failed', error);
                    setSearchResults([]);
                } finally {
                    setIsSearchLoading(false);
                }
            };
            search();
        } else {
            dispatch(fetchFeed({ page: 1, type: 'explore' }));
        }
    }, [dispatch, query]);

    if (isFeedLoading && !query && feed.length === 0) {
        return <Loading fullScreen text="Discovering content..." />;
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    {query ? `Search Results for "${query}"` : 'Explore'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {query ? 'Found users matching your search' : 'Discover new posts and people'}
                </p>
            </div>

            {query ? (
                isSearchLoading ? (
                    <Loading text="Searching..." />
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No users found.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border">
                        {searchResults.map(user => (
                            <Link
                                key={user._id}
                                to={`/profile/${user.username}`}
                                className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                            >
                                <Avatar src={user.avatar} alt={user.username} size="md" />
                                <div className="ml-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{user.username}</h3>
                                    <p className="text-sm text-gray-500">{user.fullName}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            ) : (
                <ProfileGrid posts={feed} />
            )}
        </div>
    );
};

export default Explore;
