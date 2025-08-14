import React from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    name?: string;
    options: { value: string; label: string }[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string | number;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    ({ className, label, name, options, onChange, value, ...props }, ref) => {
        const { currentTheme } = useTheme();

        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-medium text-text/80">
                        {label}
                    </label>
                )}
                <div className="flex gap-2 items-center">
                    {options.map((option) => (
                        <div key={option.value} className="flex items-center">
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={value?.toString() === option.value.toString()}
                                onChange={onChange}
                                className={cn(
                                    'h-4 w-4 border-primaryBorder/50 text-accent',
                                    'focus:ring-accent focus:ring-offset-background',
                                    'disabled:cursor-not-allowed disabled:opacity-50',
                                    className
                                )}
                                style={{
                                    backgroundColor: currentTheme.colors.background,
                                    color: currentTheme.colors.text,
                                }}
                                {...props}
                            />
                            <label className="ml-3 text-sm font-medium text-text/80">
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
);

Radio.displayName = 'Radio';