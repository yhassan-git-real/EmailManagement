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
      className={`h-10 ${isSelected
        ? 'bg-primary-500/10 hover:bg-primary-500/15'
        : 'hover:bg-dark-500/30 odd:bg-dark-600/20'
        } cursor-pointer transition-colors`}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
      tabIndex="0"
      role="row"
      aria-selected={isSelected}
    >
      {/* Checkbox Cell - Compact */}
      <td className="px-2 py-1.5 whitespace-nowrap">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-dark-400 bg-dark-600 text-primary-500 focus:ring-1 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
            checked={isSelected}
            onChange={handleCheckboxChange}
            aria-label={`Select ${row.id || 'row'}`}
          />
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
