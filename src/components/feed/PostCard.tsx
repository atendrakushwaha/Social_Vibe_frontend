import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import type { Post } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { postService, bookmarkService } from '../../services/postService';
import toast from 'react-hot-toast';

interface PostCardProps {
    post: Post;
    onUpdate?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [isSaved, setIsSaved] = useState(post.isSaved);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);

    const handleLike = async () => {
        if (isLiked) {
            setLikesCount(prev => prev - 1);
            setIsLiked(false);
            try {
                await postService.unlikePost(post._id);
            } catch (error) {
                setLikesCount(prev => prev + 1);
                setIsLiked(true);
                toast.error('Failed to unlike post');
            }
        } else {
            setLikesCount(prev => prev + 1);
            setIsLiked(true);
            setIsLikeAnimating(true);
            setTimeout(() => setIsLikeAnimating(false), 1000);
            try {
                await postService.likePost(post._id);
            } catch (error) {
                setLikesCount(prev => prev - 1);
                setIsLiked(false);
                toast.error('Failed to like post');
            }
        }
    };

    const handleSave = async () => {
        if (isSaved) {
            setIsSaved(false);
            try {
                await bookmarkService.unsavePost(post._id);
                toast.success('Post unsaved');
            } catch (error) {
                setIsSaved(true);
                toast.error('Failed to unsave post');
            }
        } else {
            setIsSaved(true);
            try {
                await bookmarkService.savePost(post._id);
                toast.success('Post saved');
            } catch (error) {
                setIsSaved(false);
                toast.error('Failed to save post');
            }
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Link to={`/profile/${post.userId.username}`}>
                        <Avatar src={post.userId.avatar} alt={post.userId.username} size="sm" />
                    </Link>
                    <div>
                        <Link
                            to={`/profile/${post.userId.username}`}
                            className="font-semibold text-gray-900 dark:text-white hover:underline text-sm"
                        >
                            {post.userId.username}
                        </Link>
                        {post.location && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{post.location.name}</p>
                        )}
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
            </div>

            {/* Media */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800" onDoubleClick={handleLike}>
                {post.media.length > 0 ? (
                    post.media[0].type === 'video' ? (
                        <video
                            src={post.media[0].url}
                            className="w-full h-full object-cover"
                            controls
                        />
                    ) : (
                        <img
                            src={post.media[0].url}
                            alt={post.caption || 'Post content'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    )
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No Media
                    </div>
                )}

                {/* Heart Animation */}
                {isLikeAnimating && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-bounce-in">
                        <svg className="w-24 h-24 text-white drop-shadow-lg filter" fill="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLike}
                            className={`hover:scale-110 transition-transform ${isLiked ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
                        >
                            <svg className="w-7 h-7" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>

                        <button className="hover:scale-110 transition-transform text-gray-900 dark:text-white">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </button>

                        <button className="hover:scale-110 transition-transform text-gray-900 dark:text-white">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        className={`hover:scale-110 transition-transform ${isSaved ? 'text-yellow-500' : 'text-gray-900 dark:text-white'}`}
                    >
                        <svg className="w-7 h-7" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>

                <div className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
                    {likesCount.toLocaleString()} likes
                </div>

                <div className="space-y-1">
                    {post.caption && (
                        <p className="text-sm text-gray-900 dark:text-white break-words">
                            <Link to={`/profile/${post.userId.username}`} className="font-semibold mr-2 hover:underline">
                                {post.userId.username}
                            </Link>
                            {post.caption}
                            {post.hashtags && post.hashtags.map(tag => (
                                <Link key={tag} to={`/explore?tag=${tag}`} className="text-primary-500 ml-1 hover:underline">
                                    #{tag}
                                </Link>
                            ))}
                        </p>
                    )}
                </div>

                {post.commentsCount > 0 && (
                    <button className="text-gray-500 text-sm mt-2 hover:text-gray-700 dark:hover:text-gray-300">
                        View all {post.commentsCount} comments
                    </button>
                )}
            </div>
        </div>
    );
};
