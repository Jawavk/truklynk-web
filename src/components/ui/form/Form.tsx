import React from 'react';
import { cn } from '@/utils/cn';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    onSubmit: (e: React.FormEvent) => void;
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
    ({ className, onSubmit, children, ...props }, ref) => {
        return (
            <form
                ref={ref}
                onSubmit={onSubmit}
                className={cn('space-y-4', className)}
                {...props}
            >
                {children}
            </form>
        );
    }
);

Form.displayName = 'Form';