import { cn } from '@/utils/cn';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'elevated' | 'bordered' | 'flat';
    padding?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'elevated', padding = true, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-lg',
                    {
                        'shadow-lg bg-white dark:bg-gray-800': variant === 'elevated',
                        'border border-gray-200 dark:border-gray-700': variant === 'bordered',
                        'bg-gray-50 dark:bg-gray-900': variant === 'flat',
                        'p-4 md:p-6': padding,
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

Card.displayName = 'Card'; 