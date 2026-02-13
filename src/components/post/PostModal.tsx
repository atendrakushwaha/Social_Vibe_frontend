import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../types';
import { postService, commentService } from '../../services/postService';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { formatDistanceToNow } from 'date-fns';

interface PostModalProps {
    postId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const PostModal: React.FC<PostModalProps> = ({ postId, isOpen, onClose }) => {
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && postId) {
            fetchPost();
            fetchComments();
        }
    }, [isOpen, postId]);

    const fetchPost = async () => {
        try {
            const data = await postService.getPost(postId);
            setPost(data);
            setIsLiked(data.isLiked || false);
            setLikesCount(data.likesCount || 0);
        } catch (error) {
            console.error('Failed to fetch post', error);
        }
    };

    const fetchComments = async () => {
        try {
            const data = await commentService.getComments(postId);
            setComments(data?.data || []);
        } catch (error) {
            console.error('Failed to fetch comments', error);
        }
    };

    const handleLike = async () => {
        try {
            if (isLiked) {
                await postService.unlikePost(postId);
                setLikesCount(prev => prev - 1);
            } else {
                await postService.likePost(postId);
                setLikesCount(prev => prev + 1);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Failed to like/unlike post', error);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await commentService.createComment(postId, newComment);
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Failed to post comment', error);
        }
    };

    const nextImage = () => {
        if (post && currentImageIndex < post.media.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
            <div className="relative w-full max-w-6xl h-[90vh] flex bg-white dark:bg-dark-card rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Image Section */}
                <div className="flex-1 bg-black flex items-center justify-center relative">
                    {post.media[currentImageIndex]?.type === 'video' ? (
                        <video
                            src={post.media[currentImageIndex].url}
                            controls
                            className="max-h-full max-w-full"
                        />
                    ) : (
                        <img
                            src={post.media[currentImageIndex]?.url}
                            alt={post.caption}
                            className="max-h-full max-w-full object-contain"
                        />
                    )}

                    {/* Navigation Arrows */}
                    {post.media.length > 1 && (
                        <>
                            {currentImageIndex > 0 && (
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 rounded-full p-2 hover:bg-white dark:hover:bg-black"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            {currentImageIndex < post.media.length - 1 && (
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 rounded-full p-2 hover:bg-white dark:hover:bg-black"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}
                        </>
                    )}

                    {/* Image Indicators */}
                    {post.media.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                            {post.media.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-96 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/profile/${(post.userId as any)?.username}`)}>
                            <Avatar src={(post.userId as any)?.avatar} alt={(post.userId as any)?.username} size="sm" />
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{(post.userId as any)?.username}</h3>
                            </div>
                        </div>
                        <button className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>

                    {/* Comments */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Caption */}
                        {post.caption && (
                            <div className="flex space-x-3">
                                <Avatar src={(post.userId as any)?.avatar} alt={(post.userId as any)?.username} size="sm" />
                                <div>
                                    <span className="font-bold text-gray-900 dark:text-white mr-2">{(post.userId as any)?.username}</span>
                                    <span className="text-gray-900 dark:text-white">{post.caption}</span>
                                    <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(post.createdAt))} ago</p>
                                </div>
                            </div>
                        )}

                        {/* Comments List */}
                        {comments.map((comment) => (
                            <div key={comment._id} className="flex space-x-3">
                                <Avatar src={comment.userId?.avatar} alt={comment.userId?.username} size="sm" />
                                <div className="flex-1">
                                    <span className="font-bold text-gray-900 dark:text-white mr-2">{comment.userId?.username}</span>
                                    <span className="text-gray-900 dark:text-white">{comment.content}</span>
                                    <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(comment.createdAt))} ago</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-200 dark:border-dark-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-4">
                                <button onClick={handleLike} className="hover:opacity-70">
                                    {isLiked ? (
                                        <svg className="w-7 h-7 text-red-500 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    )}
                                </button>
                                <button className="hover:opacity-70">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </button>
                                <button className="hover:opacity-70">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>
                            </div>
                            <button className="hover:opacity-70">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </button>
                        </div>

                        <p className="font-bold text-sm text-gray-900 dark:text-white">{likesCount} likes</p>
                        <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt))} ago</p>

                        {/* Comment Input */}
                        <form onSubmit={handleComment} className="flex items-center border-t border-gray-200 dark:border-dark-border pt-3">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                            />
                            <Button type="submit" variant="ghost" size="sm" disabled={!newComment.trim()}>
                                Post
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
