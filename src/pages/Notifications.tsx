import React, { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { Avatar } from '../components/common/Avatar';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface NotificationData {
    _id: string;
    userId: string;
    actorId: {
        _id: string;
        username: string;
        fullName?: string;
        avatar?: string;
        isVerified: boolean;
    };
    type: string;
    targetId?: string;
    targetType?: string;
    content?: string;
    thumbnail?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const getNotificationMessage = (type: string) => {
        const messages: Record<string, string> = {
            'like_post': 'liked your post',
            'like_comment': 'liked your comment',
            'like_reel': 'liked your reel',
            'like_story': 'liked your story',
            'comment_post': 'commented on your post',
            'comment_reel': 'commented on your reel',
            'reply_comment': 'replied to your comment',
            'mention_post': 'mentioned you in a post',
            'mention_comment': 'mentioned you in a comment',
            'mention_story': 'mentioned you in their story',
            'follow': 'started following you',
            'follow_request': 'requested to follow you',
            'follow_accept': 'accepted your follow request',
            'story_view': 'viewed your story',
            'story_reply': 'replied to your story',
            'message': 'sent you a message',
            'group_message': 'sent a message in a group',
            'tag_post': 'tagged you in a post',
            'tag_story': 'tagged you in their story',
        };
        return messages[type] || 'interacted with you';
    };

    if (isLoading) return <Loading fullScreen />;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Notifications {unreadCount > 0 && (
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({unreadCount} unread)
                        </span>
                    )}
                </h1>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        Mark all as read
                    </Button>
                )}
            </div>

            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border divide-y divide-gray-100 dark:divide-dark-border overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            No notifications yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            When someone likes, comments, or follows you, you'll see it here
                        </p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                        >
                            <Link to={`/profile/${notification.actorId.username}`}>
                                <Avatar src={notification.actorId.avatar} alt={notification.actorId.username} size="md" />
                            </Link>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-white">
                                    <Link to={`/profile/${notification.actorId.username}`} className="font-semibold hover:underline mr-1">
                                        {notification.actorId.username}
                                    </Link>
                                    {getNotificationMessage(notification.type)}
                                </p>
                                {notification.content && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                        {notification.content}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                            </div>

                            {notification.thumbnail && (
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                    <img src={notification.thumbnail} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}

                            {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
