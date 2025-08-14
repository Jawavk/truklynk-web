import { TableProps } from "@/types/type";
import { Settings } from "lucide-react";
import { useState } from 'react';

export const ColumnVisibilityDropdown = <T extends { id: string | number }>({
    columns,
    visibleColumns,
    onToggle,
}: {
    columns: TableProps<T>['columns'];
    visibleColumns: Set<string>;
    onToggle: (newVisibleColumns: Set<string>) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    let timeoutId: any;

    const handleMouseEnter = () => {
        setIsOpen(true);
        clearTimeout(timeoutId);
    };

    const handleMouseLeave = () => {
        timeoutId = setTimeout(() => {
            setIsOpen(false);
        }, 2500);
    };

    const handleToggle = (columnKey: string) => {
        const newVisibleColumns = new Set(visibleColumns);
        if (visibleColumns.has(columnKey)) {
            newVisibleColumns.delete(columnKey);
        } else {
            newVisibleColumns.add(columnKey);
        }
        onToggle(newVisibleColumns);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button className="btn btn-secondary">
                <Settings size={18} />
            </button>
            {isOpen && (
                <div className="absolute z-10 right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                    {columns.map((column: any) => (
                        <label key={column.key} className="flex items-center px-4 py-2 hover:bg-gray-100">
                            <input
                                type="checkbox"
                                checked={visibleColumns.has(column.key.toString())}
                                onChange={(e: any) => {
                                    handleToggle(column.key.toString());
                                }}
                                className="mr-2"
                            />
                            {column.header}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}; 