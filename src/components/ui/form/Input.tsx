import React from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { useFormContext } from 'react-hook-form';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | any;
  name: string;
  error?: string | undefined;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, name, type, error, ...props }, ref) => {
    const { currentTheme } = useTheme();
    const {
      register,
      formState: { errors },
    } = useFormContext();
    const errorMessage = errors[name]?.message as string;

    return (
      <div className=' space-y-2'>
        {label && (
          <label className='block text-sm font-medium text-text/80 transition-colors group-focus-within:text-accent'>
            {label}
          </label>
        )}
        <input
          type={type}
          style={
            {
              // backgroundColor: currentTheme.colors.background,
              // color: currentTheme.colors.text,
              // borderColor: currentTheme.colors.primaryBorder,
            }
          }
          className={cn(
            'w-full rounded-lg border border-primaryBorder/50 bg-background px-4 py-2.5 text-text shadow-sm',
            'transition-all duration-200 ease-in-out',
            'placeholder:text-text/50',
            'focus:border-accent/50 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background/50',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            className,
          )}
          {...register(name)}
          ref={ref}
          {...props}
        />
        {errorMessage && (
          <p className='text-sm text-red-500/90 mt-1.5 animate-fadeIn'>{errorMessage}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
