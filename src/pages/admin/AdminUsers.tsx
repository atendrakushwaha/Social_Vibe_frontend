
import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Link } from 'react-router-dom';

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getAllUsers(page, limit);
            if (data.users.length > 0) {
                setUsers(data.users);
                setHasMore(data.users.length === limit);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBan = async (userId: string, isBanned: boolean) => {
        try {
            if (isBanned) {
                await adminService.unbanUser(userId);
            } else {
                await adminService.banUser(userId);
            }
            // Optimistic update
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: !isBanned ? false : true } : u));
        } catch (error) {
            console.error('Failed to update user status', error);
        }
    };

    if (isLoading) return <Loading fullScreen />;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>

            <div className="bg-white dark:bg-dark-card rounded-2xl shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200 dark:divide-dark-border">
                    {users.map((user) => (
                        <li key={user._id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Avatar src={user.avatar} alt={user.username} size="md" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-primary-600 truncate">
                                                <Link to={`/profile/${user.username}`}>{user.username}</Link>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <p>{user.email}</p>
                                                <span className="mx-2">•</span>
                                                <p>{user.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 ml-2">
                                        <Button
                                            variant={user.isActive ? 'secondary' : 'primary'} // Primary usually red for ban? Or secondary.
                                            size="sm"
                                            className={user.isActive ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}
                                            onClick={() => handleBan(user._id, !user.isActive)}
                                        >
                                            {user.isActive ? 'Ban' : 'Unban'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
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
