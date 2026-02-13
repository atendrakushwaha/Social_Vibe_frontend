
import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';

export const AdminPosts: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const fetchPosts = async () => {
        try {
            const data = await adminService.getAllPosts(page, limit);
            if (data.posts.length > 0) {
                setPosts(data.posts);
                setHasMore(data.posts.length === limit);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await adminService.deletePost(postId);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (error) {
            console.error('Failed to delete post', error);
        }
    };

    if (isLoading) return <Loading fullScreen />;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post Management</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <div key={post._id} className="bg-white dark:bg-dark-card rounded-2xl shadow overflow-hidden flex flex-col">
                        <div className="relative aspect-square">
                            <img
                                src={post.media[0]?.url || 'https://via.placeholder.com/300'}
                                alt={post.caption}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center mb-2">
                                    <Avatar src={post.userId?.avatar} size="xs" />
                                    <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-white truncate">{post.userId?.username}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{post.caption}</p>
                            </div>
                            <Button
                                variant="danger"
                                size="sm"
                                className="w-full bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => handleDelete(post._id)}
                            >
                                Delete Post
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Simple Pagination */}
            <div className="flex justify-between items-center py-4">
                <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <span className="text-gray-600 dark:text-gray-400">Page {page}</span>
                <Button disabled={!hasMore} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
        </div>
    );
};
