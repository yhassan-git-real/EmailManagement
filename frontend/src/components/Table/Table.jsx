import React, { useMemo, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TableEmpty from './TableEmpty';
import TablePagination from './TablePagination';

/**
 * Main Table component that composes the header, body, and pagination components
 */
const Table = ({
  data = [],
  columns = [],
  isLoading = false,
  totalRows = 0,
  pageSize = 5,
  currentPage = 1,
  onPageChange,
  onRowSelect,
  selectedRows = [],
  onFilePreview = null,
  compact = true,
  className = '',
  isFiltered = false,
  error = null,
}) => {
  // Memoize the data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);
  
  // Memoize the columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);
  
  // Memoize the selected rows to prevent unnecessary re-renders
  const memoizedSelectedRows = useMemo(() => selectedRows, [selectedRows]);
  
  // Calculate if all rows are selected
  const allSelected = useMemo(() => {
    return memoizedData.length > 0 && memoizedSelectedRows.length === memoizedData.length;
  }, [memoizedData.length, memoizedSelectedRows.length]);
  
  // Calculate if some rows are selected
  const someSelected = useMemo(() => {
    return memoizedSelectedRows.length > 0 && memoizedSelectedRows.length < memoizedData.length;
  }, [memoizedData.length, memoizedSelectedRows.length]);
  
  // Handle select all rows
  const handleSelectAll = useCallback((selected) => {
    if (onRowSelect) {
      try {
        if (selected) {
          // Select all rows
          onRowSelect(memoizedData, true, true);
        } else {
          // Deselect all rows
          onRowSelect([], false, true);
        }
      } catch (error) {
        console.error('[Table] Error handling select all:', error);
      }
    }
  }, [memoizedData, onRowSelect]);
  return (
    <div 
      className={`w-full bg-white overflow-hidden relative ${className}`}
      role="region"
      aria-label="Data table"
    >
      {/* Table Container with both horizontal and vertical scrolling */}
      <div 
        className="overflow-x-auto max-h-[400px] overflow-y-auto" 
        style={{ scrollbarWidth: 'thin' }}
        tabIndex="0"
      >
        <table 
          className="min-w-full divide-y divide-gray-200 table-fixed"
          role="table"
          aria-busy={isLoading ? 'true' : 'false'}
          aria-colcount={memoizedColumns.length}
          aria-rowcount={memoizedData.length}
        >
          <caption className="sr-only">
            {isFiltered ? 'Filtered table data' : 'Table data'}
            {memoizedData.length > 0 ? ` showing ${memoizedData.length} rows` : ''}
          </caption>
          
          <TableHeader 
            columns={memoizedColumns} 
            onSelectAll={handleSelectAll}
            allSelected={allSelected}
            someSelected={someSelected}
          />
          
          {isLoading || memoizedData.length === 0 ? (
            <TableEmpty 
              isLoading={isLoading} 
              colSpan={memoizedColumns.length + 1}
              error={error}
            />
          ) : (
            <TableBody 
              data={memoizedData}
              columns={memoizedColumns}
              selectedRows={memoizedSelectedRows}
              onRowSelect={onRowSelect}
              onFilePreview={onFilePreview}
            />
          )}
        </table>
      </div>
      
      {/* Only render pagination if we have data or are loading */}
      {(totalRows > 0 || isLoading) && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.max(1, Math.ceil(totalRows / pageSize))}
          totalRows={totalRows}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  isLoading: PropTypes.bool,
  totalRows: PropTypes.number,
  pageSize: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowSelect: PropTypes.func,
  selectedRows: PropTypes.array,
  onFilePreview: PropTypes.func,
  compact: PropTypes.bool,
  className: PropTypes.string,
  isFiltered: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

// Use memo to prevent unnecessary re-renders
export default memo(Table);
