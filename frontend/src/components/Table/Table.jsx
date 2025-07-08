import React from 'react';
import PropTypes from 'prop-types';
import TableHeader from './TableHeader';
import TableBody from './TableBody';
import TablePagination from './TablePagination';
import TableEmpty from './TableEmpty';

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
}) => {
  return (
    <div className={`w-full bg-white overflow-hidden relative ${className}`}>
      {/* Table Container with both horizontal and vertical scrolling */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <TableHeader 
            columns={columns} 
            onSelectAll={(selected) => {
              if (onRowSelect) {
                if (selected) {
                  // Select all rows
                  onRowSelect(data, true, true);
                } else {
                  // Deselect all rows
                  onRowSelect([], false, true);
                }
              }
            }}
            allSelected={data.length > 0 && selectedRows.length === data.length}
            someSelected={selectedRows.length > 0 && selectedRows.length < data.length}
          />
          
          {isLoading || data.length === 0 ? (
            <TableEmpty 
              isLoading={isLoading} 
              colSpan={columns.length + 1} 
            />
          ) : (
            <TableBody 
              data={data}
              columns={columns}
              selectedRows={selectedRows}
              onRowSelect={onRowSelect}
              onFilePreview={onFilePreview}
            />
          )}
        </table>
      </div>
      
      <TablePagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(totalRows / pageSize))}
        totalRows={totalRows}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
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
  compact: PropTypes.bool,
  className: PropTypes.string,
  isFiltered: PropTypes.bool,
  onFilePreview: PropTypes.func,
};

export default Table;
