import React from 'react';
import { Modal } from '@/components/ui/layout/Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
}) => {
    const variantStyles = {
        danger: {
            icon: 'text-red-500',
            button: 'bg-red-600 hover:bg-red-700',
            border: 'border-red-100'
        },
        warning: {
            icon: 'text-yellow-500',
            button: 'bg-yellow-600 hover:bg-yellow-700',
            border: 'border-yellow-100'
        },
        info: {
            icon: 'text-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700',
            border: 'border-blue-100'
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className={`p-6 border-l-4 ${variantStyles[variant].border}`}>
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-2 rounded-full bg-gray-50 ${variantStyles[variant].icon}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                </div>

                <p className="mb-6 text-gray-600">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 
                                 transition-colors duration-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-md transition-colors duration-200 
                                  ${variantStyles[variant].button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}; 