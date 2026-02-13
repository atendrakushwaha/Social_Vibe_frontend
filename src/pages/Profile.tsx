import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileGrid } from '../components/profile/ProfileGrid';
import { Loading } from '../components/common/Loading';
import type { User, Post } from '../types';
import { useAppSelector } from '../store/hooks';

const Profile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = useAppSelector(state => state.auth.user);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return;
            setIsLoading(true);
            try {
                // Fetch user data
                const userData = await userService.getProfile(username);
                setUser(userData || null);

                // Fetch user posts
                const postsData = await postService.getUserPosts(username);
                setPosts(postsData?.data || []);
            } catch (error) {
                console.error('Failed to fetch profile', error);
                setUser(null);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    if (isLoading) return <Loading fullScreen />;
    if (!user) return <div className="text-center p-8">User not found</div>;

    const isOwnProfile = currentUser?.username === user.username;

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <ProfileHeader
                user={user}
                isOwnProfile={isOwnProfile}
                onUpdate={() => {
                    // Refresh profile data if needed
                    // For now, simpler to just trigger a re-mount or re-fetch if we had a function
                }}
            />

            <div className="border-t border-gray-200 dark:border-dark-border pt-6">
                <div className="flex justify-center space-x-12 mb-8">
                    <button className="flex items-center space-x-2 text-sm font-semibold uppercase tracking-widest border-t border-black dark:border-white -mt-[25px] pt-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>Posts</span>
                    </button>
                    <button className="flex items-center space-x-2 text-sm font-semibold text-gray-500 uppercase tracking-widest -mt-[25px] pt-4 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span>Saved</span>
                    </button>
                </div>

                <ProfileGrid posts={posts} />
            </div>
        </div>
    );
};

export default Profile;
