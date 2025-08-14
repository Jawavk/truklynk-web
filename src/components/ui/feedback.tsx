import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { createContext, useState } from 'react';
import { AlertProps, ProgressBarProps, SpinnerProps, ToastProps, TooltipProps } from '@/types/type';


// Toast Component and Context
const ToastContext = createContext<{
    showToast: (props: Omit<ToastProps, 'id'>) => void;
}>({ showToast: () => { } });

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const showToast = ({ message, type, duration = 3000 }: Omit<ToastProps, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Toast key={toast.id} {...toast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

// Individual Components
export const Toast: React.FC<ToastProps> = ({ message, type }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
                'p-4 rounded-lg shadow-lg min-w-[300px]',
                {
                    'bg-green-500 text-white': type === 'success',
                    'bg-red-500 text-white': type === 'error',
                    'bg-blue-500 text-white': type === 'info',
                    'bg-yellow-500 text-white': type === 'warning',
                }
            )}
        >
            {message}
        </motion.div>
    );
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'currentColor', label }) => {
    return (
        <div className="flex items-center gap-2">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={cn(
                    'border-t-2 rounded-full',
                    {
                        'w-4 h-4': size === 'sm',
                        'w-8 h-8': size === 'md',
                        'w-12 h-12': size === 'lg',
                    }
                )}
                style={{ borderColor: color }}
            />
            {label && <span className="text-sm">{label}</span>}
        </div>
    );
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    color = '#3B82F6',
    showLabel = true,
    size = 'md',
    animated = true
}) => {
    return (
        <div className="w-full">
            <div className={cn(
                'bg-gray-200 rounded-full overflow-hidden',
                {
                    'h-2': size === 'sm',
                    'h-4': size === 'md',
                    'h-6': size === 'lg',
                }
            )}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: animated ? 0.5 : 0 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
            {showLabel && (
                <span className="text-sm text-gray-600 mt-1">{progress}%</span>
            )}
        </div>
    );
};

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 0
}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setTimeout(() => setIsVisible(true), delay)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ opacity: 0, y: position === 'top' ? 10 : -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                                'absolute z-50 px-2 py-1 text-sm text-white bg-black rounded shadow-lg',
                                {
                                    'bottom-full mb-2': position === 'top',
                                    'top-full mt-2': position === 'bottom',
                                    'right-full mr-2': position === 'left',
                                    'left-full ml-2': position === 'right',
                                }
                            )}
                        >
                            {content}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export const Alert: React.FC<AlertProps> = ({
    type,
    title,
    message,
    onClose,
    action
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
                'p-4 rounded-lg border',
                {
                    'bg-green-50 border-green-200': type === 'success',
                    'bg-red-50 border-red-200': type === 'error',
                    'bg-yellow-50 border-yellow-200': type === 'warning',
                    'bg-blue-50 border-blue-200': type === 'info',
                }
            )}
        >
            <div className="flex justify-between items-start">
                <div>
                    {title && (
                        <h3 className={cn(
                            'text-lg font-medium mb-1',
                            {
                                'text-green-800': type === 'success',
                                'text-red-800': type === 'error',
                                'text-yellow-800': type === 'warning',
                                'text-blue-800': type === 'info',
                            }
                        )}>
                            {title}
                        </h3>
                    )}
                    <p className="text-sm text-gray-600">{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                )}
            </div>
            {action && (
                <div className="mt-3">
                    {action}
                </div>
            )}
        </motion.div>
    );
};

// Add this type to your types file
type BadgeProps = {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
    size?: 'sm' | 'md' | 'lg';
    rounded?: 'full' | 'md';
    icon?: React.ReactNode;
};

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    size = 'md',
    rounded = 'md',
    icon
}) => {
    return (
        <span className={cn(
            'inline-flex items-center gap-1 font-medium',
            {
                // Size variations
                'px-2 py-0.5 text-xs': size === 'sm',
                'px-2.5 py-1 text-sm': size === 'md',
                'px-3 py-1.5 text-base': size === 'lg',

                // Rounded variations
                'rounded-md': rounded === 'md',
                'rounded-full': rounded === 'full',

                // Variant styles
                'bg-gray-100 text-gray-800': variant === 'default',
                'bg-green-100 text-green-800': variant === 'success',
                'bg-red-100 text-red-800': variant === 'error',
                'bg-yellow-100 text-yellow-800': variant === 'warning',
                'bg-blue-100 text-blue-800': variant === 'info',
            }
        )}>
            {icon && <span className="inline-block">{icon}</span>}
            {children}
        </span>
    );
};