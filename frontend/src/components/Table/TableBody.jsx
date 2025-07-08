import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import TableRow from './TableRow';

/**
 * Table body component that renders rows of data
 */
const TableBody = ({
  data = [],
  columns = [],
  selectedRows = [],
  onRowSelect,
  onFilePreview,
}) => {
  // Check if a row is selected - memoize the function to prevent recreation on each render
  const isRowSelected = useCallback((row) => {
    try {
      if (!row || !row.id || !Array.isArray(selectedRows)) return false;
      return selectedRows.includes(row.id);
    } catch (error) {
      console.error('[TableBody] Error checking row selection status:', error);
      return false;
    }
  }, [selectedRows]);

  // Handle row selection - memoize to prevent recreation on each render
  const handleRowSelect = useCallback((row, isSelected) => {
    try {
      if (onRowSelect) {
        onRowSelect(row, isSelected);
      }
    } catch (error) {
      console.error('[TableBody] Error handling row selection:', error);
    }
  }, [onRowSelect]);
  
  // Memoize the data array to prevent unnecessary re-renders
  const memoizedData = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  return (
    <tbody className="bg-white divide-y divide-gray-200" role="rowgroup">
      {memoizedData.map((row) => (
        <TableRow
          key={row.id || `row-${Math.random().toString(36).substr(2, 9)}`}
          row={row}
          columns={columns}
          isSelected={isRowSelected(row)}
          onSelect={(isSelected) => handleRowSelect(row, isSelected)}
          onFilePreview={onFilePreview}
        />
      ))}
    </tbody>
  );
};

TableBody.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  selectedRows: PropTypes.array,
  onRowSelect: PropTypes.func,
  onFilePreview: PropTypes.func,
};

export default TableBody;
