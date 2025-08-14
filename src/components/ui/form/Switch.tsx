import React from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { useFormContext } from 'react-hook-form';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    name: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, label, name, ...props }, ref) => {
        const { register, formState: { errors }, watch } = useFormContext();
        const error = errors[name]?.message as string;
        const checked = watch(name);
        const { currentTheme } = useTheme();
        const { ref: registerRef, ...registerRest } = register(name);

        const inputRef: any = React.useRef<HTMLInputElement>(null);

        return (
            <div className=" flex items-center">
                <div className="flex items-center h-5">
                    <input
                        type="checkbox"
                        className="sr-only"
                        ref={(e) => {
                            registerRef(e);
                            if (ref) {
                                if (typeof ref === 'function') ref(e);
                                else ref.current = e;
                            }
                            inputRef.current = e;
                        }}
                        {...registerRest}
                        {...props}
                    />
                    <div
                        onClick={() => inputRef.current?.click()}
                        className={cn(
                            ' inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border',
                            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',

                            error && 'ring-2 ring-red-500/50',
                            className
                        )} style={{
                            backgroundColor: checked ? currentTheme.colors.primaryDark : currentTheme.colors.primaryDisabled,
                            color: currentTheme.colors.text,
                        }}
                    >
                        <span
                            className={cn(
                                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                                checked ? 'translate-x-6' : 'translate-x-1'
                            )}
                        />
                    </div>
                </div>
                <div className="ml-3">
                    {label && (
                        <label className="text-sm font-medium text-text/80">
                            {label}
                        </label>
                    )}
                    {error && (
                        <p className="text-sm text-red-500/90 mt-1 animate-fadeIn">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        );
    }
);

Switch.displayName = 'Switch'; 