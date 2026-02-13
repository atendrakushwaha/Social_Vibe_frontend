import React, { useState } from 'react';
import type { Post } from '../../types';
import { PostModal } from '../post/PostModal';

interface ProfileGridProps {
    posts: Post[];
    isLoading?: boolean;
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({ posts, isLoading }) => {
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-1 md:gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl">
                    📷
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Posts Yet</h3>
                <p className="text-gray-500">When you post photos, they will appear on your profile.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-3 gap-1 md:gap-4">
                {posts.map((post) => (
                    <div
                        key={post._id}
                        onClick={() => setSelectedPostId(post._id)}
                        className="relative aspect-square group overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-md cursor-pointer"
                    >
                        {post.media[0]?.type === 'video' ? (
                            <video
                                src={post.media[0].url}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={post.media[0]?.url}
                                alt={post.caption}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white text-lg font-bold">
                            <div className="flex items-center">
                                <span className="mr-2">❤️</span>
                                {post.likesCount}
                            </div>
                            <div className="flex items-center">
                                <span className="mr-2">💬</span>
                                {post.commentsCount}
                            </div>
                        </div>

                        {post.media.length > 1 && (
                            <div className="absolute top-2 right-2 text-white drop-shadow-md">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Post Modal */}
            {selectedPostId && (
                <PostModal
                    postId={selectedPostId}
                    isOpen={!!selectedPostId}
                    onClose={() => setSelectedPostId(null)}
                />
            )}
        </>
    );
};
