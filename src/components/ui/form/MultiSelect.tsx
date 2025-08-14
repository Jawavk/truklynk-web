import React, { forwardRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';
import { useFormContext, FieldError } from 'react-hook-form';
import { X } from 'lucide-react'; // Import X icon for chip close button

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  name: string;
  options: MultiSelectOption[];
  placeholder?: string;
  className?: string;
  singleSelect?: boolean;
  onChange?: (selectedOptions: string[]) => void;
  value?: string[];
  disabled?: boolean;
}

export const MultiSelect = forwardRef<HTMLSelectElement, MultiSelectProps>(
  ({ className, label, name, options, placeholder, singleSelect, onChange, value = [], disabled, ...props }, ref) => {
    const { currentTheme } = useTheme();
    const {
      register,
      formState: { errors },
    } = useFormContext();
    const error = (errors[name] as FieldError)?.message;
    const [isOpen, setIsOpen] = useState(false);

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newValue = value.filter(v => v !== optionValue);
      onChange?.(newValue);
    };

    return (
      <div className='space-y-1 relative'>
        {label && (
          <label className='block text-sm font-medium text-gray-600 mb-1'>
            {label}
          </label>
        )}
        <div
          className={cn(
            'min-h-[42px] rounded-md border border-gray-200 bg-white px-3 py-2',
            'transition-all duration-200 ease-in-out cursor-pointer',
            'hover:border-purple-300 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-100',
            disabled && 'cursor-not-allowed opacity-50 bg-gray-50',
            error && 'border-red-300 focus-within:border-red-400 focus-within:ring-red-100',
            className
          )}
          onClick={() => !disabled && setIsOpen(true)}
        >
          <div className="flex flex-wrap gap-1.5">
            {selectedOptions.length === 0 && (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            )}
            {selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full border border-purple-100"
              >
                {option.label}
                {!disabled && (
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-purple-800 transition-colors"
                    onClick={(e) => handleRemoveOption(option.value, e)}
                  />
                )}
              </span>
            ))}
          </div>
          {/* Hidden select element */}
          <select
            multiple
            value={value}
            className="hidden"
            {...register(name)}
            ref={ref}
            onChange={(e) => {
              const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
              onChange?.(selectedValues);
            }}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'px-3 py-1.5 text-sm cursor-pointer transition-colors',
                  'hover:bg-purple-50',
                  value.includes(option.value) && 'bg-purple-50 text-purple-700'
                )}
                onClick={() => {
                  const newValue = value.includes(option.value)
                    ? value.filter(v => v !== option.value)
                    : [...value, option.value];
                  onChange?.(newValue);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
        {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
