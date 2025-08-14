import React from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';

export interface RadioOption {
    label: string;
    value: string;
    description?: string;
}

export interface RadioGroupProps {
    label?: string;
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    className?: string;
    orientation?: 'horizontal' | 'vertical';
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({
        label,
        options,
        value,
        onChange,
        error,
        className,
        orientation = 'vertical'
    }, ref) => {
        const { currentTheme } = useTheme();

        return (
            <div ref={ref} className={cn('space-y-2', className)}>
                {label && (
                    <label
                        style={{ color: currentTheme.colors.text }}
                        className="block text-sm font-medium transition-colors"
                    >
                        {label}
                    </label>
                )}
                <div className={cn(
                    'space-y-2',
                    orientation === 'horizontal' && 'space-y-0 space-x-4 flex items-center'
                )}>
                    {options.map((option) => (
                        <label
                            key={option.value}
                            style={{
                                backgroundColor: 'transparent',
                                '--hover-bg': `${currentTheme.colors.background}80`
                            } as React.CSSProperties}
                            className={cn(
                                'flex items-start space-x-3 cursor-pointer',
                                'hover:bg-[var(--hover-bg)] p-2 rounded-md transition-colors'
                            )}
                        >
                            <input
                                type="radio"
                                style={{
                                    borderColor: currentTheme.colors.primaryBorder,
                                    '--ring-color': `${currentTheme.colors.accent}40`
                                } as React.CSSProperties}
                                className={cn(
                                    'h-4 w-4 mt-1 border',
                                    'focus:ring-2 focus:ring-[var(--ring-color)] focus:ring-offset-2',
                                    error && 'border-red-500'
                                )}
                                checked={value === option.value}
                                onChange={() => onChange?.(option.value)}
                                value={option.value}
                            />
                            <div className="flex flex-col">
                                <span
                                    style={{ color: currentTheme.colors.text }}
                                    className="text-sm font-medium"
                                >
                                    {option.label}
                                </span>
                                {option.description && (
                                    <span
                                        style={{ color: `${currentTheme.colors.text}80` }}
                                        className="text-sm"
                                    >
                                        {option.description}
                                    </span>
                                )}
                            </div>
                        </label>
                    ))}
                </div>
                {error && (
                    <p className="text-sm text-red-500/90">{error}</p>
                )}
            </div>
        );
    }
);

RadioGroup.displayName = 'RadioGroup'; 