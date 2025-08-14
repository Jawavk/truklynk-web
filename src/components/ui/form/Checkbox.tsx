import React from 'react';

interface CheckboxProps {
  id?: string;
  label: string;
  checked?: any;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  error,
  className = '',
}) => {
  return (
    <div className={className}>
      <div className='flex items-center '>
        <input
          id={id}
          type='checkbox'
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className='h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer'
        />
        <label id={id} htmlFor={id} className='ml-2 block text-sm text-gray-700 cursor-pointer'>
          {label}
        </label>
      </div>
      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
    </div>
  );
};
