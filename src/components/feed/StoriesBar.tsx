import React, { useEffect, useState } from 'react';
import { storyService } from '../../services/storyService';
import type { StoryGroup } from '../../types';
import { Avatar } from '../common/Avatar';
import { Link } from 'react-router-dom';
import { CreateStoryModal } from '../story/CreateStoryModal';

export const StoriesBar: React.FC = () => {
    const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const data = await storyService.getStories();
                setStoryGroups(data || []);
            } catch (error) {
                console.error('Failed to fetch stories:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStories();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border mb-6">
                <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center flex-shrink-0 space-y-2">
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-dark-bg animate-pulse" />
                            <div className="w-12 h-3 bg-gray-200 dark:bg-dark-bg rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-200 dark:border-dark-border mb-6">
                <h2 className="font-semibold mb-4 text-gray-900 dark:text-white">Stories</h2>
                <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
                    {/* Create Story Button */}
                    <div
                        className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary-500 flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                            <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 font-medium">Add Story</span>
                    </div>

                    {storyGroups.length === 0 ? (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-2">
                            No stories yet
                        </div>
                    ) : (
                        storyGroups
                            .filter(group => group?.userId?.username)
                            .map((group) => (
                                <Link
                                    to={`/stories/${group.userId.username}`}
                                    key={group.userId._id}
                                    className="flex flex-col items-center flex-shrink-0 cursor-pointer"
                                >
                                    <div className={`p-0.5 rounded-full ${group.hasUnviewed ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        <div className="p-0.5 bg-white dark:bg-dark-card rounded-full">
                                            <Avatar
                                                src={group.userId.avatar}
                                                alt={group.userId.username}
                                                size="md"
                                                className="border-2 border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 font-medium max-w-[64px] truncate">
                                        {group.userId.username}
                                    </span>
                                </Link>
                            ))
                    )}
                </div>
            </div>

            {/* Create Story Modal */}
            <CreateStoryModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </>
    );
};
