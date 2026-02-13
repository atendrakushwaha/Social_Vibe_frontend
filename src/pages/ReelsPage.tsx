
import React, { useEffect, useState, useRef } from 'react';
import reelService from '../services/reelService';
import { ReelCard } from '../components/reel/ReelCard';
import { Loading } from '../components/common/Loading';

const ReelsPage: React.FC = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeReelIndex, setActiveReelIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        loadReels(1);
    }, []);

    const loadReels = async (pageNum: number) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const data = await reelService.getReels(pageNum);
            const reelsData = data?.data || [];
            if (pageNum === 1) {
                setReels(reelsData);
            } else {
                setReels(prev => [...prev, ...reelsData]);
            }
            setHasMore(data?.hasMore || false);
        } catch (error) {
            console.error('Failed to load reels', error);
            setReels([]);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Intersection Observer to detect which reel is in view
    // Using simple scroll handler for now as refs inside map can be tricky without a wrapper
    const handleScroll = () => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scrollPosition = container.scrollTop;
        const reelHeight = container.clientHeight;

        const index = Math.round(scrollPosition / reelHeight);
        if (activeReelIndex !== index) {
            setActiveReelIndex(index);
        }

        // Infinite scroll
        if (scrollPosition + reelHeight * 2 >= container.scrollHeight && hasMore && !isLoading) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadReels(nextPage);
        }
    };

    if (reels.length === 0 && isLoading) {
        return <Loading fullScreen />;
    }

    return (
        <div
            ref={containerRef}
            className="h-[calc(100vh-4rem)] md:h-[calc(100vh-3rem)] overflow-y-scroll snap-y snap-mandatory hide-scrollbar bg-black"
            onScroll={handleScroll}
        >
            {reels.length > 0 ? reels.map((reel, index) => (
                <ReelCard
                    key={reel._id}
                    reel={reel}
                    isActive={index === activeReelIndex}
                />
            )) : (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h3 className="text-xl font-bold mb-2">No Reels Yet</h3>
                    <p className="text-gray-400">Be the first to create a reel!</p>
                </div>
            )}
            {isLoading && hasMore && (
                <div className="flex justify-center py-4 bg-black">
                    <Loading />
                </div>
            )}
        </div>
    );
};

export default ReelsPage;
