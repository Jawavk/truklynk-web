import { Suspense } from 'react';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback = (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
      </div>
    </div>
  ),
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};
