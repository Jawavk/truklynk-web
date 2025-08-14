import React from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { useFormContext } from 'react-hook-form';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    name: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, name, ...props }, ref) => {
        const { currentTheme } = useTheme();
        const { register, formState: { errors } } = useFormContext();
        const error = errors[name]?.message as string;

        return (
            <div className="relative space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-text/80 transition-colors group-focus-within:text-accent">
                        {label}
                    </label>
                )}
                <textarea
                    style={{
                        // backgroundColor: currentTheme.colors.background,
                        color: currentTheme.colors.text,
                    }}
                    className={cn(
                        'w-full rounded-lg border border-primaryBorder/50 bg-background px-4 py-2.5 text-text shadow-sm',
                        'transition-all duration-200 ease-in-out',
                        'placeholder:text-text/50',
                        'focus:border-accent/50 focus:outline-none',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background/50',
                        error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
                        className
                    )}
                    {...register(name)}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-500/90 mt-1.5 animate-fadeIn">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea'; 