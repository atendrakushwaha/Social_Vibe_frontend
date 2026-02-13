import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, fullWidth = false, className, ...props }, ref) => {
        return (
            <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
                {label && (
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'input-field',
                            !!icon && 'pl-10',
                            !!error && 'border-accent-500 focus:ring-accent-500',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <span className="text-sm text-accent-600 dark:text-accent-400">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
