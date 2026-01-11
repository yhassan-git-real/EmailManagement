import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import TableCell from './TableCell';

/**
 * Table row component that renders a single row with cells
 */
const TableRow = ({
  row,
  columns = [],
  isSelected = false,
  onSelect,
  onFilePreview,
}) => {
  // Memoize the click handler to prevent unnecessary re-renders
  const handleRowClick = useCallback(() => {
    try {
      if (onSelect) {
        onSelect(!isSelected);
      }
    } catch (error) {
      console.error('[TableRow] Error handling row click:', error);
    }
  }, [onSelect, isSelected]);

  // Memoize the checkbox change handler
  const handleCheckboxChange = useCallback((e) => {
    e.stopPropagation(); // Prevent row click
    if (onSelect) {
      onSelect(e.target.checked);
    }
  }, [onSelect]);

  return (
    <tr
      className={`${isSelected
        ? 'bg-primary-500/15 hover:bg-primary-500/20 border-l-2 border-primary-500'
        : 'hover:bg-dark-500/50'
        } cursor-pointer transition-all`}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        // Add keyboard navigation support
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
      tabIndex="0"
      role="row"
      aria-selected={isSelected}
    >
      {/* Checkbox Cell */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex items-center justify-center">
          <div
            className={`w-6 h-6 border rounded-md flex items-center justify-center transition-all ${isSelected
              ? 'border-primary-500 bg-primary-500/20 shadow-md'
              : 'border-dark-300/50 bg-dark-500/50 hover:bg-dark-400/50'
              }`}
          >
            <input
              type="checkbox"
              className="focus:ring-2 focus:ring-primary-500 h-4 w-4 text-primary-600 border-dark-300 rounded cursor-pointer bg-dark-500"
              checked={isSelected}
              onChange={handleCheckboxChange}
              aria-label={`Select ${row.id || 'row'}`}
            />
          </div>
        </div>
      </td>

      {/* Data Cells */}
      {columns.map((column) => (
        <TableCell
          key={column.key}
          row={row}
          column={column}
          isSelected={isSelected}
          onFileClick={onFilePreview}
        />
      ))}
    </tr>
  );
};

TableRow.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.array,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onFilePreview: PropTypes.func,
};

export default TableRow;
