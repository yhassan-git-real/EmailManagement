import React from 'react';
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
  return (
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr>
        {/* Checkbox Column - Enhanced for better visibility */}
        <th scope="col" className="w-10 px-2 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border border-gray-300 bg-white rounded-md flex items-center justify-center shadow-sm hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                className="focus:ring-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-400 rounded cursor-pointer"
                checked={allSelected}
                ref={input => {
                  // Set indeterminate state for partial selection
                  if (input) {
                    input.indeterminate = someSelected && !allSelected;
                  }
                }}
                onChange={(e) => {
                  if (onSelectAll) {
                    onSelectAll(e.target.checked);
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
  );
};

TableHeader.propTypes = {
  columns: PropTypes.array,
  onSelectAll: PropTypes.func,
  allSelected: PropTypes.bool,
  someSelected: PropTypes.bool,
};

export default TableHeader;
