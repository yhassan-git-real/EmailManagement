import React, { useCallback, memo } from 'react';
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
  // Safely get cell value with error handling
  const getCellValue = () => {
    try {
      return row[column.key];
    } catch (error) {
      console.error(`[TableCell] Error accessing ${column.key}:`, error);
      return '';
    }
  };

  // Format cell content based on column type
  const content = formatCellContent(getCellValue(), column.type, {
    onFileClick: column.type === 'file' ? onFileClick : null
  });

  // Handle file click for preview - memoized to prevent unnecessary re-renders
  const handleFileClick = useCallback((file) => {
    try {
      if (onFileClick && file) {
        onFileClick(file);
      }
    } catch (error) {
      console.error('[TableCell] Error handling file click:', error);
    }
  }, [onFileClick]);

  return (
    <td
      className={`px-3 py-1.5 whitespace-nowrap text-[13px] truncate ${column.align === 'right' ? 'text-right' : ''
        } ${isSelected ? 'text-text-primary' : 'text-text-secondary'} ${column.type === 'actions' ? 'text-right' : ''
        }`}
      style={{ maxWidth: column.width ? undefined : '150px' }}
      title={column.key !== 'actions' ? getCellValue() : undefined}
      role="cell"
      data-column={column.key}
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

// Use memo to prevent unnecessary re-renders
export default memo(TableCell);
