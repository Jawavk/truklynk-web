  import React from 'react';
  import { cn } from '@/utils/cn';
  import { useTheme } from '@/context/ThemeContext';
  import { useFormContext } from 'react-hook-form';

  export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    name: string;
    options: { value: string; label: string }[];
    placeholder?: string;
  }

  export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, name, options, placeholder, ...props }, ref) => {
      const { currentTheme } = useTheme();
      const {
        register,
        formState: { errors },
      } = useFormContext();
      const error = errors[name]?.message as string;

      return (
        <div className='space-y-2'>
          {label && (
            <label className='block text-sm font-medium text-text/80 transition-colors group-focus-within:text-accent'>
              {label}
            </label>
          )}
          <select
            style={{
              // backgroundColor: '#fff',
              // || currentTheme.colors.background
              // color: '#0f0f0f',
              // || currentTheme.colors.text,
            }}
            className={cn(
              'w-full rounded-lg border border-primaryBorder/50 bg-background px-4 py-3 text-text shadow-sm',
              'transition-all duration-200 ease-in-out',
              'focus:border-accent/50 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background/50',
              error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
              className,
            )}
            {...register(name)}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value='' disabled selected hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className='text-sm text-red-500/90 mt-1.5 animate-fadeIn'>{error}</p>}
        </div>
      );
    },
  );

  Select.displayName = 'Select';
