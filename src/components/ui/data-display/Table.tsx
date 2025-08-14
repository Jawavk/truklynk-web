import React, { useState, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { TableProps } from '@/types/type';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Download,
  ChevronRight,
  MoreVertical,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

// Interfaces
interface ColumnFilter {
  key: string;
  value: string;
  operator: 'contains' | 'equals' | 'greater' | 'less';
}

interface RowAction<T> {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
}

// Helper function for CSV export
const exportToCSV = <T extends { id: string | number }>(
  data: T[],
  columns: TableProps<T>['columns'],
) => {
  const headers = columns.map((col) => col.header).join(',');
  const rows = data.map((item) => columns.map((col) => String(item[col.key as keyof T])).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'export.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};

// Row Actions Menu Component
const RowActionsMenu = <T extends { id: string | number }>({
  actions,
  item,
}: {
  actions: RowAction<T>[];
  item: T;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative'>
      <button onClick={() => setIsOpen(!isOpen)} className='p-2 hover:bg-gray-100 rounded-full'>
        <MoreVertical className='w-4 h-4' />
      </button>
      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
          <div className='py-1'>
            {actions.map((action, index) => (
              <button
                key={index}
                className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center'
                onClick={() => {
                  action.onClick(item);
                  setIsOpen(false);
                }}
              >
                {action.icon && <span className='mr-2'>{action.icon}</span>}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Table Component
export function Table<T extends { id: string | number }>({
  data,
  columns,
  className,
  pageSize = 10,
  searchable = false,
  isLoading = false,
  onRowClick,
  onAddButtonClick,
  enableSelection = false,
  enableExport = false,
  enableColumnVisibility = false,
  enableRowExpansion = false,
  optionsOverflow = false,
  buttonTxt,
  renderExpandedRow,
  rowActions,
}: TableProps<T>) {
  const { currentTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.key.toString())),
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);

  // Sorting logic
  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Enhanced filtering logic
  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      // Apply column-specific filters
      const passesColumnFilters = columnFilters.every((filter) => {
        const value = item[filter.key as keyof T];
        switch (filter.operator) {
          case 'contains':
            return String(value).toLowerCase().includes(filter.value.toLowerCase());
          case 'equals':
            return String(value) === filter.value;
          // ... add more operators
        }
        return true;
      });

      // Apply global search
      const passesGlobalSearch =
        searchTerm === '' ||
        Object.entries(item).some(
          ([key, value]) =>
            visibleColumns.has(key) &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase()),
        );

      return passesColumnFilters && passesGlobalSearch;
    });
  }, [sortedData, searchTerm, columnFilters, visibleColumns]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Function to handle CSV export
  const handleExportToCSV = () => {
    exportToCSV(data, columns);
  };

  return (
    <div className='w-full'>
      {/* Table Controls */}
      <div className='flex justify-between mb-4'>
        {searchable && (
          <div className='mb-4'>
            <input
              type='text'
              placeholder='Search...'
              className='w-full px-4 py-2 border rounded-lg focus:ring-2  focus:border-transparent'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        <div className='flex gap-2 items-center'>
          {/* {enableColumnVisibility && (
                        <ColumnVisibilityDropdown
                            columns={columns}
                            visibleColumns={visibleColumns}
                            onToggle={setVisibleColumns}
                        />
                    )} */}

          {enableExport && (
            <button
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.text,
              }}
              onClick={handleExportToCSV}
              className='btn btn-secondary p-2 rounded-md flex items-center'
            >
              <Download className='w-4 h-4 mr-2' />
              Export
            </button>
          )}
          {buttonTxt && (
            <button
              style={{
                backgroundColor: currentTheme.colors.accent,
                color: currentTheme.colors.primary,
              }}
              onClick={() => onAddButtonClick?.(data)}
              className='btn btn-primary p-2 rounded-md flex items-center'
            >
              <Plus className='w-4 h-4 mr-2' />
              Add {buttonTxt}
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Table Header */}
      <div
        className={`${optionsOverflow ? '' : 'overflow-x-auto'}  rounded-lg border border-gray-200 dark:border-gray-700`}
      >
        <table
          className={cn('min-w-full divide-y divide-gray-200 dark:divide-gray-700', className)}
        >
          <thead className='sticky top-0 bg-gray-50 dark:bg-gray-800'>
            <tr
              style={{
                backgroundColor: currentTheme.colors.primary,
                color: currentTheme.colors.text,
              }}
            >
              {enableSelection && (
                <th className='w-12 px-4'>
                  <input
                    type='checkbox'
                    onChange={(e) => {
                      const newSelected = new Set<string | number>();
                      if (e.target.checked) {
                        filteredData.forEach((item) => newSelected.add(item.id));
                      }
                      setSelectedRows(newSelected);
                    }}
                  />
                </th>
              )}
              {enableRowExpansion && <th className='w-12' />}
              {columns
                .filter((column) => visibleColumns.has(column.key.toString()))
                .map((column) => (
                  <th
                    key={column.key.toString()}
                    className={cn(
                      'px-6 py-3 text-left text-xs font-medium  dark:text-gray-300 uppercase tracking-wider',
                      column.width,
                      column.sortable && 'cursor-pointer dark:hover:bg-gray-700',
                    )}
                    onClick={() => {
                      if (column.sortable) {
                        setSortConfig({
                          key: column.key,
                          direction:
                            sortConfig?.key === column.key && sortConfig.direction === 'asc'
                              ? 'desc'
                              : 'asc',
                        });
                      }
                    }}
                  >
                    <div className='flex items-center space-x-1'>
                      <span>{column.header}</span>
                      {column.sortable && (
                        <div className='flex flex-col'>
                          <ChevronUpIcon
                            className={cn(
                              'w-3 h-3',
                              sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? 'text-primary-500'
                                : 'text-gray-400',
                            )}
                          />
                          <ChevronDownIcon
                            className={cn(
                              'w-3 h-3',
                              sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? 'text-primary-500'
                                : 'text-gray-400',
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              {rowActions && <th className='w-12' />}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700'>
            {isLoading ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (enableSelection ? 1 : 0) +
                    (enableRowExpansion ? 1 : 0) +
                    (rowActions ? 1 : 0)
                  }
                  className='px-6 py-4 text-center'
                >
                  <div className='flex justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-6 py-4 text-center text-gray-500 dark:text-gray-400'
                >
                  No results found
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <React.Fragment key={item.id}>
                  <tr
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                      onRowClick && 'cursor-pointer',
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {enableSelection && (
                      <td className='px-4'>
                        <input
                          type='checkbox'
                          checked={selectedRows.has(item.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedRows);
                            if (e.target.checked) {
                              newSelected.add(item.id);
                            } else {
                              newSelected.delete(item.id);
                            }
                            setSelectedRows(newSelected);
                          }}
                        />
                      </td>
                    )}
                    {enableRowExpansion && (
                      <td>
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedRows);
                            if (expandedRows.has(item.id)) {
                              newExpanded.delete(item.id);
                            } else {
                              newExpanded.add(item.id);
                            }
                            setExpandedRows(newExpanded);
                          }}
                        >
                          {expandedRows.has(item.id) ? (
                            <ChevronDown className='w-4 h-4' />
                          ) : (
                            <ChevronRight className='w-4 h-4' />
                          )}
                        </button>
                      </td>
                    )}
                    {columns
                      .filter((column) => visibleColumns.has(column.key.toString()))
                      .map((column: any) => (
                        <td
                          key={`${item.id}-${column.key}`}
                          className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'
                        >
                          {column.render
                            ? column.render(item)
                            : (item[column.key as keyof T] as React.ReactNode)}
                        </td>
                      ))}
                    {rowActions && (
                      <td>
                        <RowActionsMenu actions={rowActions} item={item} />
                      </td>
                    )}
                  </tr>
                  {enableRowExpansion && expandedRows.has(item.id) && (
                    <tr>
                      <td
                        colSpan={
                          columns.length +
                          (enableSelection ? 1 : 0) +
                          (enableRowExpansion ? 1 : 0) +
                          (rowActions ? 1 : 0)
                        }
                      >
                        {renderExpandedRow?.(item)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sm:px-6'>
        <div className='flex-1 flex justify-between sm:hidden'>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
          >
            Next
          </button>
        </div>
        <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Showing <span className='font-medium'>{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className='font-medium'>
                {Math.min(currentPage * pageSize, filteredData.length)}
              </span>{' '}
              of <span className='font-medium'>{filteredData.length}</span> results
            </p>
          </div>
          <div>
            <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
              {/* Pagination buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    currentPage === page
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                    'first:rounded-l-md last:rounded-r-md',
                  )}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
