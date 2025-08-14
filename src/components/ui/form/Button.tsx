import { cn } from '@/utils/cn';
import React from 'react';
import { Spinner } from '../feedback';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'icon'
  | 'select'
  | 'purple'
  | 'purpleLight'
  | 'pink';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      loadingText,
      children,
      disabled,
      fullWidth,
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      primary: 'bg-accent text-white hover:bg-accent/90',
      secondary: 'bg-secondary text-text hover:bg-secondary/90',
      danger: 'bg-red-500 text-white hover:bg-red-600',
      warning: 'bg-amber-500 text-white hover:bg-amber-600',
      success: 'bg-green-500 text-white hover:bg-green-600',
      outline: 'border-2 border-accent text-accent hover:bg-accent/10',
      ghost: 'hover:bg-accent/10 text-accent',
      link: 'text-accent hover:underline p-0 height-auto',
      icon: 'p-2 aspect-square',
      select: 'bg-blue-500 text-white hover:bg-blue-600',
      purple: 'bg-purple-500 text-white hover:bg-purple-600',
      purpleLight: 'bg-purple-800 text-white hover:bg-purple-600',
      pink: 'bg-pink-500 text-white hover:bg-pink-600',
    };

    const sizeStyles = {
      sm: 'text-sm px-3 py-1',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
      xl: 'text-xl px-8 py-4',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-accent/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Variant styles
          variantStyles[variant],
          // Size styles
          variant !== 'link' && variant !== 'icon' && sizeStyles[size],
          // Full width
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner />
            {loadingText && <span className='ml-2'>{loadingText}</span>}
          </>
        ) : (
          <>
            {icon && (
              <span className={cn(children && 'mr-2', 'inline-flex items-center')}>{icon}</span>
            )}
            {children}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
