import { createContext, useContext, useState } from 'react';

interface Toast {
  id: number;
  message: string;
  type: string;
}

interface ToastContextType {
  showToast: (toast: { message: string; type: 'success' | 'error' | 'warning' | 'info' }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const MAX_TOASTS = 3; // Maximum number of visible toasts

  const showToast = (toast: { message: string; type: string }) => {
    const id = Date.now();

    setToasts((prev) => {
      // Check if a toast with the same message already exists
      const isDuplicate = prev.some((t) => t.message === toast.message);
      if (isDuplicate) {
        return prev; // Don't add duplicate toast
      }

      // Add new toast and limit to MAX_TOASTS
      const newToasts = [...prev, { ...toast, id }];
      return newToasts.slice(-MAX_TOASTS);
    });

    // Remove this specific toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className='fixed top-4 right-4 z-50'>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`mb-2 p-4 rounded shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                  ? 'bg-red-500'
                  : toast.type === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
            } text-white`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
