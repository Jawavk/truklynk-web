import React from 'react';
import { cn } from '@/utils/cn';

interface FormFieldProps {
    children: React.ReactNode;
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    children,
    label,
    error,
    helperText,
    required,
    className,
}) => {
    return (
        <div className={cn('space-y-1', className)}>
            {label && (
                <label className="block text-sm font-medium text-text">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {children}
            {helperText && !error && (
                <p className="text-sm text-text/70">{helperText}</p>
            )}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}; 