import React from 'react';
import { cn } from '@/utils/cn';
import { useFormContext } from 'react-hook-form';

export interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
  name?: any;
  error?: any;
  isFutureDateAllowed?: boolean;
  isPastDateAllowed?: boolean;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, name, error, isFutureDateAllowed = false, isPastDateAllowed = false, ...props }, ref) => {
    const {
      register,
      formState: { errors },
      setValue,
    } = useFormContext();
    error = errors[name]?.message as string;

    const today: any = new Date().toISOString().split('T')[0];

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = e.target.value;

      if (!isFutureDateAllowed && selectedDate > today) {
        setValue(name, today, { shouldValidate: true });
      }
      if (!isPastDateAllowed && selectedDate < today) {
        setValue(name, today, { shouldValidate: true });
      }
    };

    return (
      <div className='space-y-2'>
        {label && (
          <label className='block text-sm font-medium text-text/80 transition-colors group-focus-within:text-accent'>
            {label}
          </label>
        )}
        <input
          type='date'
          className={cn(
            'w-full rounded-lg border border-primaryBorder/50 bg-background px-4 py-2.5 text-text shadow-sm',
            'transition-all duration-200 ease-in-out',
            'focus:border-accent/50 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background/50',
            '[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[50%]',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            className,
          )}
          min={!isPastDateAllowed ? today : undefined}
          max={!isFutureDateAllowed ? today : undefined}
          {...register(name, {
            onChange: handleDateChange,
          })}
          ref={ref}
          {...props}
        />

        {error && <p className='text-sm text-red-500/90 mt-1.5 animate-fadeIn'>{error}</p>}
        {!isFutureDateAllowed && errors[name]?.type === 'manual' && (
          <p className='text-sm text-red-500/90 mt-1.5 animate-fadeIn'>
            Future dates are not allowed.
          </p>
        )}
      </div>
    );
  },
);

DateInput.displayName = 'DateInput';
