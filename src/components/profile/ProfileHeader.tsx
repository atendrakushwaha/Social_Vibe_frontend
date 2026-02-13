import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { followService } from '../../services/followService';
import toast from 'react-hot-toast';

interface ProfileHeaderProps {
    user: User;
    isOwnProfile: boolean;
    onUpdate?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isOwnProfile, onUpdate }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOwnProfile && user?._id) {
            fetchFollowStatus();
        }
    }, [user?._id, isOwnProfile]);

    const fetchFollowStatus = async () => {
        try {
            const status = await followService.getFollowStatus(user._id);
            setIsFollowing(status?.isFollowing || false);
        } catch (error) {
            console.error('Failed to fetch follow status', error);
        }
    };

    const handleFollow = async () => {
        setIsLoading(true);
        try {
            await followService.followUser(user._id);
            setIsFollowing(true);
            toast.success(`Followed ${user.username}`);
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to follow user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnfollow = async () => {
        setIsLoading(true);
        try {
            await followService.unfollowUser(user._id);
            setIsFollowing(false);
            toast.success(`Unfollowed ${user.username}`);
            onUpdate?.();
        } catch (error) {
            toast.error('Failed to unfollow user');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="relative">
                    <Avatar
                        src={user.avatar}
                        alt={user.username}
                        size="xl"
                        className="w-32 h-32 md:w-40 md:h-40 border-4 border-white dark:border-dark-card shadow-lg"
                    />
                    {user.isVerified && (
                        <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-dark-card">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {user.username}
                        </h1>

                        <div className="flex gap-2">
                            {isOwnProfile ? (
                                <Button variant="outline" size="sm" onClick={() => toast('Edit profile coming soon!')}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <>
                                    {isFollowing ? (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleUnfollow}
                                            isLoading={isLoading}
                                        >
                                            Following
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleFollow}
                                            isLoading={isLoading}
                                        >
                                            Follow
                                        </Button>
                                    )}
                                    <Button variant="secondary" size="sm">Message</Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center md:justify-start gap-8 text-sm md:text-base">
                        <div className="text-center md:text-left">
                            <span className="font-bold text-gray-900 dark:text-white block md:inline md:mr-1">
                                {user.postsCount}
                            </span>
                            <span className="text-gray-500">posts</span>
                        </div>
                        <div className="text-center md:text-left cursor-pointer hover:underline">
                            <span className="font-bold text-gray-900 dark:text-white block md:inline md:mr-1">
                                {user.followersCount}
                            </span>
                            <span className="text-gray-500">followers</span>
                        </div>
                        <div className="text-center md:text-left cursor-pointer hover:underline">
                            <span className="font-bold text-gray-900 dark:text-white block md:inline md:mr-1">
                                {user.followingCount}
                            </span>
                            <span className="text-gray-500">following</span>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="max-w-md">
                        {user.fullName && (
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {user.fullName}
                            </p>
                        )}
                        {user.bio && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                                {user.bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
