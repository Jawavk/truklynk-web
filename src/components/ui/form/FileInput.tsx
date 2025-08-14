import React from 'react';

interface FileInputProps {
    label: string;
    onChange: (file: File | null) => void;
    value?: File | null;
    error?: string;
    className?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
    label,
    onChange,
    error,
    className
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type="file"
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/80"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}; 