import { cn } from '@/utils/cn';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode; // Optional icon support
  disabled?: boolean; // Disabled state support
}

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: Tab[];
  defaultTab?: string;
  variant?: 'underline' | 'contained' | 'pills';
  alignment?: 'start' | 'center' | 'end';
  fullWidth?: boolean;
  headerSize?: string;
  onTabChange?: (tabId: string) => void; // Use onTabChange instead of onChange
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      tabs,
      defaultTab,
      variant = 'underline',
      alignment = 'start',
      fullWidth = false,
      onTabChange,
      headerSize,
      ...props
    },
    ref,
  ) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const handleTabClick = (tabId: string) => {
      setActiveTab(tabId);
      if (onTabChange) {
        onTabChange?.(tabId); // Call onTabChange when a tab is clicked
      }
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div
          className={cn(
            'relative flex',
            variant !== 'pills' && 'border-b border-gray-200 dark:border-gray-700',
            {
              'justify-start': alignment === 'start',
              'justify-center': alignment === 'center',
              'justify-end': alignment === 'end',
              'space-x-4': !fullWidth,
              'bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg': variant === 'pills',
            },
            headerSize,
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabClick(tab.id)}
              disabled={tab.disabled}
              aria-selected={activeTab === tab.id}
              role='tab'
              className={cn(
                'relative px-6 py-3 text-sm font-medium transition-all duration-300',
                fullWidth && 'flex-1',
                tab.disabled && 'opacity-50 cursor-not-allowed',
                !tab.disabled && 'hover:text-primary-500',
                {
                  // Underline variant - enhanced with smooth animation and better contrast
                  'before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:transition-all before:duration-300':
                    variant === 'underline',
                  'text-primary before:bg-gray-600 before:scale-x-100':
                    variant === 'underline' && activeTab === tab.id,
                  'before:bg-primary before:scale-x-0 hover:before:scale-x-100':
                    variant === 'underline' && activeTab !== tab.id,

                  // Contained variant - enhanced with gradient and subtle shadow
                  'bg-gradient-to-r from-gray-800 to-gray-900/90 text-white rounded shadow-sm dark:from-gray-900/20 dark:to-gray-800/20 dark:text-gray-300':
                    variant === 'contained' && activeTab === tab.id,
                  'hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:shadow-sm':
                    variant === 'contained' && activeTab !== tab.id,

                  // Pills variant - enhanced with better transitions and effects
                  'rounded-lg transition-all duration-300': variant === 'pills',
                  'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow-md dark:shadow-gray-900/30':
                    variant === 'pills' && activeTab === tab.id,
                  'hover:bg-gray-50 dark:hover:bg-gray-600/50 text-gray-600 dark:text-gray-300':
                    variant === 'pills' && activeTab !== tab.id,
                },
              )}
            >
              <div className='flex items-center gap-3'>
                {tab.icon && (
                  <motion.span
                    className={cn('w-4 h-4', {
                      'text-primary-500': activeTab === tab.id,
                      'text-gray-400': activeTab !== tab.id,
                    })}
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: activeTab === tab.id ? 1 : 0.8,
                      rotate: activeTab === tab.id ? 0 : -5,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab.icon}
                  </motion.span>
                )}
                {tab.label}
              </div>
            </button>
          ))}
        </div>

        <div className='mt-6'>
          <AnimatePresence mode='wait'>
            {mounted && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                {tabs.find((tab) => tab.id === activeTab)?.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';
