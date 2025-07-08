import React from 'react';
import PropTypes from 'prop-types';
import { formatCellContent } from './utils/formatters';

/**
 * Table cell component that renders a single cell with formatted content
 */
const TableCell = ({
  row,
  column,
  isSelected = false,
  onFileClick = null,
}) => {
  // Format cell content based on column type
  const content = formatCellContent(row[column.key], column.type, {
    onFileClick: column.type === 'file' ? onFileClick : null
  });

  // Handle file click for preview
  const handleFileClick = (file) => {
    if (onFileClick && file) {
      onFileClick(file);
    }
  };

  return (
    <td
      className={`px-3 py-2 whitespace-nowrap ${column.align === 'right' ? 'text-right' : ''} 
        ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-800'} text-sm
        ${column.type === 'actions' ? 'text-right' : ''}`}
      style={{ maxWidth: column.width ? undefined : '150px' }}
      title={column.key !== 'actions' ? row[column.key] : undefined}
    >
      {content}
    </td>
  );
};

TableCell.propTypes = {
  row: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onFileClick: PropTypes.func,
};

export default TableCell;
