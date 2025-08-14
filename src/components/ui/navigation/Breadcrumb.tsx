import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/context/ThemeContext';

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
    showHomeIcon?: boolean;
    separator?: React.ReactNode;
    maxItems?: number;
    onItemClick?: (item: BreadcrumbItem) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
    items,
    className,
    showHomeIcon = true,
    separator = <ChevronRight className="w-3.5 h-3.5 opacity-50" />,
    maxItems = 0,
    onItemClick
}) => {
    const { currentTheme } = useTheme();

    // Handle max items display with ellipsis
    const displayedItems = maxItems > 0 && items.length > maxItems
        ? [
            ...items.slice(0, Math.ceil(maxItems / 2)),
            { label: '...' },
            ...items.slice(-Math.floor(maxItems / 2))
        ]
        : items;

    return (
        <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-2 py-3", className)}>
            <ol className="flex items-center flex-wrap gap-3">
                {showHomeIcon && (
                    <li className="transform transition-all duration-300 hover:scale-110 hover:rotate-[-5deg]">
                        <a
                            href="/"
                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 hover:shadow-lg hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-300"
                            style={{ color: currentTheme.colors.text }}
                        >
                            <Home className="w-4 h-4" />
                        </a>
                    </li>
                )}

                {displayedItems.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <li className="text-gray-400 dark:text-gray-600">
                                {separator}
                            </li>
                        )}
                        <li className="transform transition-all duration-300 hover:translate-y-[-3px] hover:rotate-[-1deg]">
                            {item.href ? (
                                <a
                                    href={item.href}
                                    onClick={(e) => {
                                        if (onItemClick) {
                                            e.preventDefault();
                                            onItemClick(item);
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center px-4 py-1.5 rounded-lg transition-all duration-300",
                                        index === items.length - 1
                                            ? "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 font-semibold shadow-md hover:shadow-lg hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-700"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:shadow-sm backdrop-blur-sm"
                                    )}
                                >
                                    {item.icon && (
                                        <span className="mr-2 opacity-75 group-hover:opacity-100">{item.icon}</span>
                                    )}
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </a>
                            ) : (
                                <span className="flex items-center px-4 py-1.5 text-gray-500 dark:text-gray-400">
                                    {item.icon && (
                                        <span className="mr-2 opacity-75">{item.icon}</span>
                                    )}
                                    <span className="whitespace-nowrap">{item.label}</span>
                                </span>
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
}; 