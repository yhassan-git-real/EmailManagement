import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';

const DataTable = ({
  data = [],
  columns = [],
  isLoading = false,
  totalRows = 0,
  pageSize = 5,
  currentPage = 1,
  onPageChange,
  onRowSelect,
  onSearch,
  selectedRows = [],
  onSearchChange,
  compact = true,
  onStatusChange,
  onExecute, // New prop for Execute button
  onFilePreview = null // New prop for file preview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  // Handle row selection - with extra safeguards
  const handleRowSelect = (row, isSelected) => {
    console.log(`[DataTable] Row selection changed: id=${row.id}, isSelected=${isSelected}`);
    if (onRowSelect) {
      onRowSelect(row, isSelected);
    }
  };

  // Handle file click for preview
  const handleFileClick = (file) => {
    if (onFilePreview && file) {
      onFilePreview(file);
    }
  };

  // Handle search form submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  // Debounced search input
  useEffect(() => {
    // Skip the first render
    const skipFirstRender = searchTerm === '';
    if (skipFirstRender) return;

    const delayDebounceFn = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearchChange]);

  // Handle pagination
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      console.log(`DataTable - Going to page ${page}`);
      onPageChange(page);
    }
  };

  // Check if a row is selected - improved to be more robust
  const isRowSelected = (row) => {
    try {
      if (!row || !row.id || !Array.isArray(selectedRows)) return false;

      // Simple ID comparison
      return selectedRows.includes(row.id);
    } catch (error) {
      console.error('[DataTable] Error checking row selection status:', error);
      return false;
    }
  };

  // Handle row click for selection
  const handleRowClick = (row) => {
    try {
      console.log(`[DataTable] Row clicked: id=${row.id}`);
      handleRowSelect(row, !isRowSelected(row));
    } catch (error) {
      console.error('[DataTable] Error handling row click:', error);
    }
  };

  // Format cell content based on column type
  const formatCellContent = (column, value) => {
    if (value === null || value === undefined) return '-';

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    } else if (column.type === 'datetime' && value) {
      return new Date(value).toLocaleString();
    } else if (column.type === 'status') {
      // For status columns, just show the status badge, no dropdown
      return (
        <div className="relative inline-block text-left">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${value === 'Success' ? 'bg-green-100 text-green-800' :
                value === 'Failed' ? 'bg-red-100 text-red-800' :
                  value === 'Draft' ? 'bg-gray-100 text-gray-800' :
                    value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'}`}
          >
            {value}
          </span>
        </div>
      );
    } else if (column.type === 'file') {
      return value ? (
        <span className="text-primary-600 hover:underline cursor-pointer truncate max-w-[150px] inline-block" title={value} onClick={() => handleFileClick(value)}>
          {value.split('/').pop()}
        </span>
      ) : '-';
    }

    return value;
  };

  // Render different types of cell content
  const renderCellContent = (row, column) => {
    const value = row[column.key];

    switch (column.type) {
      case 'status':
        let statusColor;
        switch (value) {
          case 'Success':
            statusColor = 'bg-green-100 text-green-800';
            break;
          case 'Failed':
            statusColor = 'bg-red-100 text-red-800';
            break;
          case 'Pending':
            statusColor = 'bg-yellow-100 text-yellow-800';
            break;
          default:
            statusColor = 'bg-gray-100 text-gray-800';
        }
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
            {value}
          </span>
        );

      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';

      case 'datetime':
        return value ? new Date(value).toLocaleString() : '-';

      case 'file':
        if (!value || value === '-') return '-';
        return (
          <button
            className="text-primary-600 hover:text-primary-700 text-xs underline"
            onClick={() => handleFileClick(row.display_file_path || value)}
          >
            {value}
          </button>
        );

      case 'actions':
        if (!value || !Array.isArray(value) || value.length === 0) return null;
        return (
          <div className="flex space-x-2 justify-end">
            {value.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                title={action.label}
                className={`p-1.5 rounded-md border shadow-sm transition-colors ${action.className || 'bg-gray-100 hover:bg-gray-200 border-gray-200'}`}
              >
                <span className="sr-only">{action.label}</span>
                {action.icon}
              </button>
            ))}
          </div>
        );

      default:
        return value || '-';
    }
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    setActiveStatus(status);
    if (onStatusChange) {
      onStatusChange(status);
    }
  };

  // Handle updating status variable
  const [updatingStatus, setUpdatingStatus] = useState(null);

  return (
    <div className="w-full bg-white overflow-hidden relative">
      {/* Table Container with both horizontal and vertical scrolling */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {/* Checkbox Column - Enhanced for better visibility */}
              <th scope="col" className="w-10 px-2 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border border-gray-300 bg-white rounded-md flex items-center justify-center shadow-sm hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      className="focus:ring-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-400 rounded cursor-pointer"
                      checked={data.length > 0 && selectedRows.length === data.length}
                      onChange={(e) => {
                        console.log(`[DataTable] Select all checkbox changed: ${e.target.checked}`);
                        if (e.target.checked) {
                          // Select all rows
                          if (onRowSelect) {
                            // Pass array of rows and flag for select all
                            onRowSelect(data, true, true);
                          }
                        } else {
                          // Deselect all rows
                          if (onRowSelect) {
                            // Pass empty array and flag for deselect all
                            onRowSelect([], false, true);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </th>

              {/* Column Headers */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-3 py-2 text-left text-xs font-medium text-gray-500 tracking-wider ${column.width ? column.width : ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Loading State
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  <div className="flex justify-center items-center space-x-2">
                    <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              // Data Rows with improved highlighting
              data.map((row) => {
                const selected = isRowSelected(row);
                return (
                  <tr
                    key={row.id}
                    className={`${selected
                        ? 'bg-blue-100 hover:bg-blue-200 border border-blue-300'
                        : 'hover:bg-gray-50'
                      } cursor-pointer transition-all`}
                    onClick={() => handleRowClick(row)}
                  >
                    {/* Checkbox Cell - Enhanced for better visibility */}
                    <td className="px-2 py-2 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-6 h-6 border rounded-md flex items-center justify-center transition-all ${selected
                              ? 'border-blue-600 bg-blue-100 shadow-md'
                              : 'border-gray-300 bg-white hover:bg-gray-50'
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="focus:ring-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-400 rounded cursor-pointer"
                            checked={selected}
                            onChange={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleRowSelect(row, e.target.checked);
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Data Cells */}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-3 py-2 whitespace-nowrap ${column.align === 'right' ? 'text-right' : ''} 
                          ${selected ? 'text-gray-900 font-medium' : 'text-gray-800'} text-sm
                          ${column.type === 'actions' ? 'text-right' : ''}`}
                        style={{ maxWidth: column.width ? undefined : '150px' }}
                        title={column.key !== 'actions' ? row[column.key] : undefined}
                      >
                        {renderCellContent(row, column)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between relative overflow-x-auto">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-700">
              Showing <span className="font-medium">{totalRows === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, totalRows)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalRows)}</span> of{' '}
              <span className="font-medium">{totalRows}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-3 w-3" aria-hidden="true" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${currentPage === pageNumber
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
