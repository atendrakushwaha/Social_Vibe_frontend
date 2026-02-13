import React from 'react';
import { cn } from '../../utils';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    online?: boolean;
    className?: string;
    onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = 'User avatar',
    size = 'md',
    online,
    className,
    onClick,
}) => {
    const sizes = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const onlineDotSizes = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
    };

    return (
        <div className={cn('relative inline-block', className)} onClick={onClick}>
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className={cn(
                        sizes[size],
                        'rounded-full object-cover ring-2 ring-white dark:ring-dark-border',
                        onClick && 'cursor-pointer hover:opacity-90 transition-opacity'
                    )}
                />
            ) : (
                <div
                    className={cn(
                        sizes[size],
                        'rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold',
                        onClick && 'cursor-pointer hover:opacity-90 transition-opacity'
                    )}
                >
                    {alt.charAt(0).toUpperCase()}
                </div>
            )}
            {online && (
                <span
                    className={cn(
                        onlineDotSizes[size],
                        'absolute bottom-0 right-0 bg-green-500 border-2 border-white dark:border-dark-bg rounded-full'
                    )}
                />
            )}
        </div>
    );
};
