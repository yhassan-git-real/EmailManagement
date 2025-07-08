import React from 'react';
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
  // Check if a row is selected
  const isRowSelected = (row) => {
    try {
      if (!row || !row.id || !Array.isArray(selectedRows)) return false;
      return selectedRows.includes(row.id);
    } catch (error) {
      console.error('[TableBody] Error checking row selection status:', error);
      return false;
    }
  };

  // Handle row selection
  const handleRowSelect = (row, isSelected) => {
    if (onRowSelect) {
      onRowSelect(row, isSelected);
    }
  };

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {data.map((row) => (
        <TableRow
          key={row.id}
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
};

export default TableBody;
