import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storyService } from '../services/storyService';
import { viewStory } from '../store/slices/storySlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { Story, User } from '../types';
import { Loading } from '../components/common/Loading';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { formatDistanceToNow } from 'date-fns';

const StoryViewer: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(state => state.auth.user);

    const [stories, setStories] = useState<Story[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [storyUser, setStoryUser] = useState<any>(null); // The user whose story we are viewing

    // Viewers Modal State
    const [showViewers, setShowViewers] = useState(false);
    const [viewers, setViewers] = useState<User[]>([]);
    const [isLoadingViewers, setIsLoadingViewers] = useState(false);

    const isOwnStory = currentUser?._id === storyUser?._id;

    useEffect(() => {
        const fetchStories = async () => {
            if (!username) return;
            try {
                const fetchedStories = await storyService.getUserStories(username);
                if (fetchedStories && fetchedStories.length > 0) {
                    setStories(fetchedStories);
                    setStoryUser(fetchedStories[0].userId);
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Failed to fetch stories', error);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStories();
    }, [username, navigate]);

    // Mark story as viewed
    useEffect(() => {
        if (stories.length > 0 && stories[currentIndex] && !isOwnStory) {
            const story = stories[currentIndex];
            if (!story.hasViewed) {
                dispatch(viewStory(story._id));
                // Update local state to reflect viewed
                setStories(prev => prev.map((s, i) => i === currentIndex ? { ...s, hasViewed: true, viewsCount: s.viewsCount + 1 } : s));
            }
        }
    }, [currentIndex, stories.length, dispatch, isOwnStory]);

    // Auto-advance timer
    useEffect(() => {
        if (stories.length === 0 || showViewers) return; // Pause if viewing viewers list

        const timer = setTimeout(() => {
            handleNext();
        }, 5000);

        return () => clearTimeout(timer);
    }, [currentIndex, stories, showViewers]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showViewers) {
                if (e.key === 'Escape') setShowViewers(false);
                return;
            }
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Escape') navigate('/');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, stories.length, showViewers]);

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            navigate('/');
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleViewersClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOwnStory) return;

        setShowViewers(true);
        setIsLoadingViewers(true);
        try {
            const storyId = stories[currentIndex]._id;
            const response = await storyService.getStoryViews(storyId);
            const data = Array.isArray(response) ? response : (response?.data || []);
            setViewers(data);
        } catch (error) {
            console.error('Failed to fetch viewers', error);
        } finally {
            setIsLoadingViewers(false);
        }
    };

    if (isLoading) return <Loading fullScreen text="Loading story..." />;
    if (stories.length === 0) return null;

    const currentStory = stories[currentIndex];

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Close Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 bg-black/20 rounded-full backdrop-blur-sm"
            >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Story Container */}
            <div className="relative w-full max-w-md h-full md:h-[90vh] bg-gray-900 md:rounded-lg overflow-hidden flex flex-col shadow-2xl">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 z-20 flex p-2 space-x-1">
                    {stories.map((story, idx) => (
                        <div key={story._id} className="h-1 flex-1 bg-gray-600/50 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white transition-all duration-300 ${idx < currentIndex ? 'w-full' :
                                    idx === currentIndex ? 'animate-progress' : 'w-0'
                                    }`}
                                style={{
                                    animationDuration: '5s',
                                    animationPlayState: (idx === currentIndex && !showViewers) ? 'running' : 'paused'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* User Info Header */}
                <div className="absolute top-4 left-4 z-20 flex items-center text-white cursor-pointer" onClick={() => navigate(`/profile/${storyUser?.username}`)}>
                    <Avatar src={storyUser?.avatar} alt={storyUser?.username} size="sm" className="border border-white/20" />
                    <span className="ml-2 font-semibold text-sm shadow-sm">{storyUser?.username}</span>
                    <span className="ml-2 text-xs text-white/70">
                        {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                    </span>
                </div>

                {/* Media Content */}
                <div className="flex-1 relative flex items-center justify-center bg-black">
                    {/* Navigation Tap Areas */}
                    <div className="absolute inset-0 flex z-10">
                        <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
                        <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
                    </div>

                    {currentStory.type === 'video' ? (
                        <video
                            src={currentStory.mediaUrl}
                            className="w-full h-full object-contain"
                            autoPlay
                            muted
                            playsInline
                            loop
                        />
                    ) : currentStory.type === 'text' ? (
                        <div
                            className="w-full h-full flex items-center justify-center p-8"
                            style={{ backgroundColor: currentStory.backgroundColor || '#6366f1' }}
                        >
                            <p className="text-white text-3xl font-bold text-center break-words font-display leading-relaxed">
                                {currentStory.text}
                            </p>
                        </div>
                    ) : (
                        <img
                            src={currentStory.mediaUrl}
                            alt="Story"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Caption Overlay */}
                    {currentStory.text && currentStory.type !== 'text' && (
                        <div className="absolute bottom-20 left-0 right-0 p-4 text-center bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white font-medium drop-shadow-md">{currentStory.text}</p>
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
                    <div className="flex items-center justify-between">
                        {isOwnStory ? (
                            // Only owner sees Viewers count button
                            <div
                                className="flex items-center space-x-2 text-white cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors"
                                onClick={handleViewersClick}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="font-semibold text-sm">{currentStory.viewsCount} Views</span>
                                <span className="text-xs text-white/60 ml-1">(Tap to see)</span>
                            </div>
                        ) : (
                            // Others see Reply Input
                            <div className="flex-1 flex items-center gap-3">
                                <input
                                    type="text"
                                    placeholder={`Reply to ${storyUser?.username}...`}
                                    className="flex-1 bg-white/10 border border-white/20 rounded-full py-2.5 px-4 text-white placeholder-white/70 focus:outline-none focus:border-white/50 focus:bg-white/20 text-sm backdrop-blur-md transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            // Handle reply
                                            e.stopPropagation();
                                        }
                                    }}
                                />
                                <button className="p-2 text-white hover:text-pink-500 transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>
                                <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Viewers Modal (Slide Up) */}
                {showViewers && (
                    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm" onClick={() => setShowViewers(false)}>
                        <div
                            className="bg-white dark:bg-dark-card w-full h-[60%] rounded-t-2xl shadow-2xl p-4 flex flex-col"
                            onClick={(e) => e.stopPropagation()} // Prevent close on content click
                        >
                            <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Viewers ({viewers.length})</h3>
                                <button onClick={() => setShowViewers(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {isLoadingViewers ? (
                                    <div className="flex justify-center p-4">
                                        <Loading size="sm" />
                                    </div>
                                ) : viewers.length > 0 ? (
                                    viewers.map(viewer => (
                                        <div key={viewer._id} className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-dark-bg px-2 rounded-lg cursor-pointer" onClick={() => navigate(`/profile/${viewer.username}`)}>
                                            <div className="flex items-center gap-3">
                                                <Avatar src={viewer.avatar} alt={viewer.username} size="sm" />
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{viewer.username}</p>
                                                    <p className="text-xs text-gray-500">{viewer.fullName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 mt-8">No views yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryViewer;
