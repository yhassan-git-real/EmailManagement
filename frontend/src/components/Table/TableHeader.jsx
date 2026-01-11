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
    <thead className="bg-dark-700 sticky top-0 z-10" role="rowgroup">
      <tr role="row">
        {/* Checkbox Column - Compact */}
        <th scope="col" className="w-10 px-2 py-2">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              ref={checkboxRef}
              className="h-3.5 w-3.5 rounded border-dark-400 bg-dark-600 text-primary-500 focus:ring-1 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
              checked={allSelected}
              onChange={handleSelectAllChange}
              aria-label="Select all rows"
            />
          </div>
        </th>

        {/* Column Headers - Compact uppercase */}
        {columns.map((column) => (
          <th
            key={column.key}
            scope="col"
            className={`px-3 py-2 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider ${column.width || ''}`}
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
