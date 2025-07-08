import React from 'react';
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
  const handleRowClick = () => {
    try {
      if (onSelect) {
        onSelect(!isSelected);
      }
    } catch (error) {
      console.error('[TableRow] Error handling row click:', error);
    }
  };

  return (
    <tr
      className={`${isSelected
        ? 'bg-blue-100 hover:bg-blue-200 border border-blue-300'
        : 'hover:bg-gray-50'
      } cursor-pointer transition-all`}
      onClick={handleRowClick}
    >
      {/* Checkbox Cell */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="flex items-center justify-center">
          <div
            className={`w-6 h-6 border rounded-md flex items-center justify-center transition-all ${isSelected
              ? 'border-blue-600 bg-blue-100 shadow-md'
              : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              className="focus:ring-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-400 rounded cursor-pointer"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation(); // Prevent row click
                if (onSelect) {
                  onSelect(e.target.checked);
                }
              }}
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
};

export default TableRow;
