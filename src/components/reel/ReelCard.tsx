
import React, { useRef, useState, useEffect } from 'react';
import { Avatar } from '../common/Avatar';
import reelService from '../../services/reelService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ReelProps {
    reel: any; // Type should be Reel but using any for now to match service response flexibility
    isActive: boolean;
}

export const ReelCard: React.FC<ReelProps> = ({ reel, isActive }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLiked, setIsLiked] = useState(reel.isLiked);
    const [likesCount, setLikesCount] = useState(reel.likesCount);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(e => console.log('Autoplay prevented', e));
        } else {
            videoRef.current?.pause();
            if (videoRef.current) videoRef.current.currentTime = 0;
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play();
        } else {
            videoRef.current?.pause();
        }
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiked) {
            setLikesCount((prev: number) => prev - 1);
            setIsLiked(false);
            try {
                await reelService.unlikeReel(reel._id);
            } catch (err) {
                setLikesCount((prev: number) => prev + 1);
                setIsLiked(true);
            }
        } else {
            setLikesCount((prev: number) => prev + 1);
            setIsLiked(true);
            try {
                await reelService.likeReel(reel._id);
            } catch (err) {
                setLikesCount((prev: number) => prev - 1);
                setIsLiked(false);
            }
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await reelService.shareReel(reel._id);
            navigator.clipboard.writeText(`${window.location.origin}/reels/${reel._id}`);
            toast.success('Link copied manually!');
        } catch (error) {
            console.error('Share failed', error);
            toast.error('Failed to share');
        }
    };

    const handleComment = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast('Comments feature coming soon!', { icon: '💬' });
    };

    return (
        <div className="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] bg-black md:rounded-lg overflow-hidden snap-start shrink-0 flex items-center justify-center">
            {/* Background Blur */}
            <div
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-30"
                style={{ backgroundImage: `url(${reel.thumbnailUrl || 'https://via.placeholder.com/150'})` }}
            />

            {/* Video */}
            <div className="relative h-full w-full max-w-md bg-gray-900" onClick={togglePlay}>
                <video
                    ref={videoRef}
                    src={reel.videoUrl}
                    className="h-full w-full object-cover"
                    loop
                    playsInline
                />

                {/* Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-16 z-10 text-white pointer-events-auto">
                    <div className="flex items-center mb-4">
                        <Link to={`/profile/${reel.userId?.username}`} className="flex items-center group">
                            <Avatar src={reel.userId?.avatar} size="sm" className="border-2 border-white" />
                            <span className="ml-2 font-bold group-hover:underline">{reel.userId?.username}</span>
                        </Link>
                        {/* Follow button logic could go here */}
                    </div>

                    <p className="mb-4 text-sm line-clamp-2">{reel.caption}</p>

                    {reel.musicName && (
                        <div className="flex items-center text-xs">
                            <svg className="w-4 h-4 mr-2 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 10l12-3" />
                            </svg>
                            <span className="truncate w-40">{reel.musicName}</span>
                        </div>
                    )}
                </div>

                {/* Sidebar Actions */}
                <div className="absolute bottom-4 right-2 z-20 flex flex-col items-center space-y-6 pointer-events-auto">
                    <button onClick={handleLike} className="flex flex-col items-center group">
                        <div className={`p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition ${isLiked ? 'text-red-500' : 'text-white'}`}>
                            <svg className="w-8 h-8" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-white text-xs font-medium mt-1">{likesCount}</span>
                    </button>

                    <button className="flex flex-col items-center group" onClick={handleComment}>
                        <div className="p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition text-white">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-white text-xs font-medium mt-1">{reel.commentsCount || 0}</span>
                    </button>

                    <button className="flex flex-col items-center group" onClick={handleShare}>
                        <div className="p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition text-white">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                    </button>

                    <button className="flex flex-col items-center">
                        <Avatar src={reel.userId?.avatar} size="sm" className="border-2 border-white animate-spin-slow" />
                    </button>
                </div>
            </div>
        </div>
    );
};
