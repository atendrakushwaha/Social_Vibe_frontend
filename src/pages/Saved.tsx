import React, { useEffect, useState } from 'react';
import { bookmarkService } from '../services/postService';
import { Loading } from '../components/common/Loading';
import { ProfileGrid } from '../components/profile/ProfileGrid';
import type { Post } from '../types';

export const Saved: React.FC = () => {
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    const fetchSavedPosts = async () => {
        try {
            const data = await bookmarkService.getSavedPosts();
            setSavedPosts(data?.data || []);
        } catch (error) {
            console.error('Failed to fetch saved posts', error);
            setSavedPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loading fullScreen text="Loading saved posts..." />;
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                    Saved Posts
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    All your saved posts in one place
                </p>
            </div>

            {savedPosts.length === 0 ? (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-border">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No saved posts yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Save posts to view them later
                    </p>
                </div>
            ) : (
                <ProfileGrid posts={savedPosts} />
            )}
        </div>
    );
};

export default Saved;
