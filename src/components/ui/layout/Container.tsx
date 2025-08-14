import { cn } from '@/utils/cn';
import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: boolean;
    centered?: boolean;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
    ({ className, maxWidth = 'lg', padding = true, centered = true, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'w-full',
                    {
                        'max-w-screen-sm': maxWidth === 'sm',
                        'max-w-screen-md': maxWidth === 'md',
                        'max-w-screen-lg': maxWidth === 'lg',
                        'max-w-screen-xl': maxWidth === 'xl',
                        'max-w-screen-2xl': maxWidth === '2xl',
                        'max-w-full': maxWidth === 'full',
                        'px-4 md:px-6 lg:px-8': padding,
                        'mx-auto': centered,
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Container.displayName = 'Container'; 