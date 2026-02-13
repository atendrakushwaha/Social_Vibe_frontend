import React from 'react';
import { cn } from '../../utils';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    fullScreen?: boolean;
    text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
    size = 'md',
    fullScreen = false,
    text,
}) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={cn('spinner', sizes[size])} />
            {text && (
                <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-bg z-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-8">
            {spinner}
        </div>
    );
};

// Skeleton loader component
interface SkeletonProps {
    className?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={cn('skeleton rounded-lg', className)}
                />
            ))}
        </>
    );
};
