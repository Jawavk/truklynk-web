import React, { useState, useEffect, useMemo } from "react"
import {
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Search,
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  X,
  FileX,
  SearchX,
  RefreshCw,
} from "lucide-react"
import Button from "@/components/ui/form/Button"
import { Input } from "@/components/ui/form/Input"
import { CSVLink } from "react-csv"

const Table = ({
  data = [],
  columns = [],
  actions = [],
  pagination = true,
  pageSize = 10,
  searchEnabled = true,
  downloadEnabled = true,
  createEnabled = true,
  createButtonText = "Create New",
  onCreateClick = () => {},
  downloadOptions = {
    filename: 'table-data.csv',
    headers: [],
  },
  customRowRender,
  customCellRender,
  className = '',
  emptyStateMessage = 'No data available',
}:any) => {
  // State for table functionalities
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] :any= useState({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Initialize table data
  useEffect(() => {
    setTableData(data);
    setFilteredData(data);
  }, [data]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() !== '' || Object.keys(filters).some(key => filters[key] && filters[key].trim() !== '');
  }, [searchQuery, filters]);

  // Sorting logic
  const requestSort = (key, sortable) => {
    if (!sortable) return;
    
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Apply filtering and search
  useEffect(() => {
    let result = [...tableData];
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        result = result.filter(item => 
          String(item[key]).toLowerCase().includes(String(filters[key]).toLowerCase())
        );
      }
    });
    
    // Apply search across all columns
    if (searchQuery) {
      result = result.filter(item => 
        columns.some(column => 
          item[column.key] && 
          String(item[column.key]).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    setFilteredData(result);
    
    // Update active filters display
    const newActiveFilters:any = Object.keys(filters)
      .filter(key => filters[key])
      .map(key => {
        const column = columns.find(col => col.key === key);
        return {
          key,
          label: column ? column.header : key,
          value: filters[key]
        };
      });
    setActiveFilters(newActiveFilters);
    
    setCurrentPage(1); // Reset to first page when filters change
  }, [tableData, filters, searchQuery, columns]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = pagination 
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Remove a specific filter
  const removeFilter = (key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Get context-aware empty state message
  const getEmptyStateContent = () => {
    // Determine the data type from emptyStateMessage for better context
    let dataType = 'items';
    if (emptyStateMessage.toLowerCase().includes('service provider')) {
      dataType = 'service providers';
    } else if (emptyStateMessage.toLowerCase().includes('booking')) {
      dataType = 'bookings';
    } else if (emptyStateMessage.toLowerCase().includes('order')) {
      dataType = 'orders';
    } else if (emptyStateMessage.toLowerCase().includes('customer')) {
      dataType = 'customers';
    } else if (emptyStateMessage.toLowerCase().includes('driver')) {
      dataType = 'drivers';
    } else if (emptyStateMessage.toLowerCase().includes('vehicle')) {
      dataType = 'vehicles';
    }

    if (tableData.length === 0) {
      // No data at all
      return {
        icon: <FileX className="h-16 w-16 text-gray-500 mb-4" />,
        title: emptyStateMessage,
        subtitle: `Get started by adding your first ${dataType.replace(/s$/, '')}.`,
        showCreateButton: createEnabled,
        showClearButton: false
      };
    } else if (hasActiveFilters && filteredData.length === 0) {
      // Has data but filtered results are empty
      return {
        icon: <SearchX className="h-16 w-16 text-gray-500 mb-4" />,
        title: `No ${dataType} found`,
        subtitle: `We couldn't find any ${dataType} matching your search criteria. Try adjusting your filters or search terms.`,
        showCreateButton: false,
        showClearButton: true
      };
    } else {
      // Fallback
      return {
        icon: <FileX className="h-16 w-16 text-gray-500 mb-4" />,
        title: emptyStateMessage,
        subtitle: `No ${dataType} to display.`,
        showCreateButton: createEnabled,
        showClearButton: hasActiveFilters
      };
    }
  };

  // Prepare data for download
  const downloadData = useMemo(() => {
    const headers = downloadOptions.headers.length > 0
      ? downloadOptions.headers
      : columns.map((col: any) => ({ label: col.header, key: col.key }));
  
    return {
      headers: headers.map(h => h.label || ''),
      data: filteredData.map(row => {
        const rowData = {};
        headers.forEach(header => {
          let value: any = row[header.key];
          if (value === null || value === undefined) {
            value = '';
          } else if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          rowData[header.label || ''] = value;
        });
        return rowData;
      }),
    };
  }, [filteredData, columns, downloadOptions.headers]);

  // Render pagination controls
  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-400">
          Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="p-2 rounded-lg border border-gray-700"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            className="p-2 rounded-lg border border-gray-700"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <span className="px-4 py-2 text-gray-400">
            {currentPage} / {totalPages || 1}
          </span>
          
          <Button
            className="p-2 rounded-lg border border-gray-700"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            className="p-2 rounded-lg border border-gray-700"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Render the search and table controls
  const renderTableControls = () => {
    return (
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center space-x-2">
          {searchEnabled && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
              name='search'
                className="pl-10 pr-4 py-2 bg-zinc-800 border border-gray-700 rounded-lg"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          
          
          <Button
            className="p-2 rounded-lg border border-gray-700 flex items-center"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4 mr-1" /> 
            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </Button>
          
          {downloadEnabled && downloadData.data && downloadData.data.length > 0 && (
            <CSVLink
              data={downloadData.data}
              headers={downloadData.headers.map(header => ({ label: header, key: header }))}
              filename={downloadOptions.filename}
              className="bg-zinc-800 hover:bg-gray-700 text-white p-2 rounded-lg border border-gray-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-1" /> Export
            </CSVLink>
          )}
          {createEnabled && (
            <Button
              className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={onCreateClick}
            >
              <Plus className="h-4 w-4 mr-1" /> {createButtonText}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render active filters
  const renderActiveFilters = () => {
    if (activeFilters.length === 0) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Active filters:</span>
        {activeFilters.map((filter:any, index) => (
          <div 
            key={index} 
            className="flex items-center bg-zinc-800 px-2 py-1 rounded-md text-sm"
          >
            <span className="mr-1 text-gray-400">{filter.label}:</span>
            <span className="mr-2">{filter.value}</span>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => removeFilter(filter.key)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button 
          className="text-sm text-gray-400 hover:text-white underline"
          onClick={clearAllFilters}
        >
          Clear all
        </button>
      </div>
    );
  };

  // Render the filter modal
  const renderFilterModal = () => {
    if (!isFilterOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-zinc-900 rounded-lg p-6 w-96 max-w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filter Data</h3>
            <Button
              className="p-1 rounded-full hover:bg-gray-700"
              onClick={() => setIsFilterOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {columns.filter(column => column.filterable !== false).map(column => (
              <div key={column.key} className="space-y-1">
                <label className="text-sm text-gray-400">{column.header}</label>
                <Input
                name='filter'
                  className="w-full bg-zinc-800 border border-gray-700 rounded-lg"
                  value={filters[column.key] || ''}
                  onChange={(e) => handleFilterChange(column.key, e.target.value)}
                  placeholder={`Filter by ${column.header.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-6 space-x-2">
            <Button
              className="px-4 py-2 rounded-lg border border-gray-700"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
            <Button
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render the table header
  const renderTableHeader = () => {
    return (
      <thead>
        <tr className="text-left text-gray-400 border-b border-gray-800">
          {columns.map((column, index) => (
            <th 
              key={index} 
              className="pb-4 pl-2 pr-4"
              onClick={() => requestSort(column.key, column.sortable !== false)}
              style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
            >
              <div className="flex items-center">
                {column.header}
                {column.sortable !== false && sortConfig.key === column.key && (
                  <span className="ml-1">
                    {sortConfig.direction === 'ascending' ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </span>
                )}
              </div>
            </th>
          ))}
          {actions.length > 0 && <th className="pb-4 pr-4">Actions</th>}
        </tr>
      </thead>
    );
  };

  // Render enhanced empty state
  const renderEmptyState = () => {
    const emptyStateContent = getEmptyStateContent();
    
    return (
      <tr>
        <td 
          colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
          className="py-16 text-center"
        >
          <div className="flex flex-col items-center justify-center">
            {emptyStateContent.icon}
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              {emptyStateContent.title}
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              {emptyStateContent.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {emptyStateContent.showClearButton && (
                <Button
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center justify-center"
                  onClick={clearAllFilters}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              
              {emptyStateContent.showCreateButton && (
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center justify-center"
                  onClick={onCreateClick}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {createButtonText}
                </Button>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Render the table rows
  const renderTableRows = () => {
    if (paginatedData.length === 0) {
      return renderEmptyState();
    }

    return paginatedData.map((row, rowIndex) => {
      // Use custom row renderer if provided
      if (customRowRender) {
        return customRowRender(row, rowIndex);
      }

      return (
        <tr key={rowIndex} className="border-b border-gray-800">
          {columns.map((column, colIndex) => (
            <td key={colIndex} className="py-4 pl-2 pr-4">
              {customCellRender ? 
                customCellRender(row, column.key, rowIndex, colIndex) : 
                row[column.key]}
            </td>
          ))}
          
          {actions.length > 0 && (
            <td className="py-4 pr-4 flex gap-2">
              {actions.map((action, actionIndex) => (
                action.render ? 
                  action.render(row, rowIndex) : 
                  <Button
                    key={actionIndex}
                    className={action.className || "bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium px-4 py-2 rounded-lg"}
                    onClick={() => action.onClick(row, rowIndex)}
                  >
                    {action.icon && <span className="mr-1">{action.icon}</span>}
                    {action.label}
                  </Button>
              ))}
            </td>
          )}
        </tr>
      );
    });
  };

  return (
    <div className={`w-full ${className}`}>
      {renderTableControls()}
      {renderActiveFilters()}
      {renderFilterModal()}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          {renderTableHeader()}
          <tbody>
            {renderTableRows()}
          </tbody>
        </table>
      </div>
      
      {pagination && totalPages > 1 && renderPagination()}
    </div>
  );
};

export default Table;