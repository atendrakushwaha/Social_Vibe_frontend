import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFeed } from '../store/slices/postSlice';
import { Loading } from '../components/common/Loading';
import { PostCard } from '../components/feed/PostCard';
import { StoriesBar } from '../components/feed/StoriesBar';
import { SuggestedUsers } from '../components/user/SuggestedUsers';
import { Button } from '../components/common/Button';
import { openCreatePostModal } from '../store/slices/uiSlice';

export const Home: React.FC = () => {
    const dispatch = useAppDispatch();
    const { feed, isLoading, hasMoreFeed } = useAppSelector((state) => state.post);

    useEffect(() => {
        dispatch(fetchFeed({ page: 1, type: 'following' }));
    }, [dispatch]);

    if (isLoading && feed.length === 0) {
        return <Loading fullScreen text="Loading your feed..." />;
    }

    return (
        <div className="flex gap-8 max-w-6xl mx-auto">
            {/* Main Feed */}
            <div className="flex-1 max-w-[470px]">
                <StoriesBar />

                <div className="space-y-4">
                    {feed.length === 0 ? (
                        <div className="bg-white dark:bg-dark-card rounded-2xl p-12 text-center border border-gray-200 dark:border-dark-border">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                No posts yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Follow users to see their posts in your feed
                            </p>
                            <div className="space-x-4">
                                <Button onClick={() => window.location.href = '/explore'}>
                                    Explore Users
                                </Button>
                                <Button variant="outline" onClick={() => dispatch(openCreatePostModal())}>
                                    Create First Post
                                </Button>
                            </div>
                        </div>
                    ) : (
                        feed.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))
                    )}
                </div>

                {hasMoreFeed && (
                    <div className="text-center py-4">
                        <Button
                            variant="ghost"
                            onClick={() => dispatch(fetchFeed({ page: Math.ceil(feed.length / 10) + 1, type: 'following' }))}
                        >
                            Load More
                        </Button>
                    </div>
                )}
            </div>

            {/* Sidebar with Suggestions */}
            <div className="hidden lg:block w-80 sticky top-20 h-fit">
                <SuggestedUsers />
            </div>
        </div>
    );
};

export default Home;
