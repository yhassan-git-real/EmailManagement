import React, { useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Table header component that renders column headers and select all checkbox
 */
const TableHeader = ({
  columns = [],
  onSelectAll,
  allSelected = false,
  someSelected = false
}) => {
  // Use ref to store checkbox element
  const checkboxRef = useRef(null);

  // Memoize the change handler to prevent unnecessary re-renders
  const handleSelectAllChange = useCallback((e) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  }, [onSelectAll]);

  // Set indeterminate state when props change
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);
  return (
    <thead className="bg-dark-700/80 sticky top-0 z-10" role="rowgroup">
      <tr role="row">
        {/* Checkbox Column - Enhanced for better visibility */}
        <th scope="col" className="w-10 px-2 py-2 text-left text-xs font-medium text-text-muted tracking-wider">
          <div className="flex items-center justify-center">
            <div
              className="w-6 h-6 border border-dark-300/50 bg-dark-500/50 rounded-md flex items-center justify-center shadow-sm hover:bg-dark-400/50 cursor-pointer"
              tabIndex="0"
              role="checkbox"
              aria-checked={allSelected}
              aria-label="Select all rows"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onSelectAll) {
                    onSelectAll(!allSelected);
                  }
                }
              }}
              onClick={() => {
                if (onSelectAll) {
                  onSelectAll(!allSelected);
                }
              }}
            >
              <input
                type="checkbox"
                className="focus:ring-2 focus:ring-primary-500 h-4 w-4 text-primary-600 border-dark-300 rounded cursor-pointer bg-dark-500"
                checked={allSelected}
                ref={checkboxRef}
                onChange={handleSelectAllChange}
                aria-label="Select all rows"
              />
            </div>
          </div>
        </th>

        {/* Column Headers */}
        {columns.map((column) => (
          <th
            key={column.key}
            scope="col"
            className={`px-3 py-2 text-left text-xs font-medium text-text-muted tracking-wider ${column.width ? column.width : ''}`}
            aria-sort={column.sortable ? (column.sortDirection || 'none') : undefined}
          >
            <div className="flex items-center">
              <span>{column.label}</span>
              {column.sortable && (
                <button
                  className="ml-1 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-1"
                  onClick={() => column.onSort && column.onSort(column.key)}
                  aria-label={`Sort by ${column.label}`}
                >
                  <span className="sr-only">Sort</span>
                  {/* Sort icon placeholder - can be replaced with actual sort direction icon */}
                  <svg className="h-3 w-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </button>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

TableHeader.propTypes = {
  columns: PropTypes.array,
  onSelectAll: PropTypes.func,
  allSelected: PropTypes.bool,
  someSelected: PropTypes.bool,
};

export default TableHeader;
