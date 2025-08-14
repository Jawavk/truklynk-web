import React from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { useFormContext } from 'react-hook-form';
 
export interface TimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: any;
  name?: any;
  error?: any;
  isFutureTimeAllowed?: boolean;
}
 
export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, label, name, error, isFutureTimeAllowed = false, ...props }, ref) => {
    const { currentTheme } = useTheme();
    const {
      register,
      formState: { errors },
      setValue,
    } = useFormContext();
    error = errors[name]?.message as string;
 
    // Get current time in HH:mm format
    const getCurrentTime = () => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    };
 
    const currentTime = getCurrentTime();
 
    // Handle time change
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedTime = e.target.value;
      const today = new Date();
      const [hours = 0, minutes = 0] = selectedTime.split(':').map(Number);
      const selectedDateTime = new Date(today.setHours(hours, minutes));
 
      // If future times are not allowed and the selected time is in the future
      if (!isFutureTimeAllowed && selectedDateTime > new Date()) {
        setValue(name, currentTime, { shouldValidate: true });
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
          type='time'
          style={{
            backgroundColor: '#fff',
            color: '#000',
          }}
          className={cn(
            'w-full rounded-lg border border-primaryBorder/50 bg-background px-4 py-2.5 text-text shadow-sm',
            'transition-all duration-200 ease-in-out',
            'focus:border-accent/50 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background/50',
            '[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert-[50%]',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            className,
          )}
          {...register(name, {
            onChange: handleTimeChange,
          })}
          ref={ref}
          {...props}
        />
        {error && <p className='text-sm text-red-500/90 mt-1.5 animate-fadeIn'>{error}</p>}
        {!isFutureTimeAllowed && errors[name]?.type === 'manual' && (
          <p className='text-sm text-red-500/90 mt-1.5 animate-fadeIn'>
            Future times are not allowed.
          </p>
        )}
      </div>
    );
  },
);
 
TimeInput.displayName = 'TimeInput';
 
 