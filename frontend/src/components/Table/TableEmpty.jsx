import React from 'react';
import PropTypes from 'prop-types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Component for displaying empty or loading states in the table
 */
const TableEmpty = ({
  isLoading = false,
  colSpan = 1,
  loadingMessage = 'Loading data...',
  emptyMessage = 'No data available',
}) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      <tr>
        <td colSpan={colSpan} className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
          {isLoading ? (
            <div className="flex justify-center items-center space-x-2">
              <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />
              <span>{loadingMessage}</span>
            </div>
          ) : (
            emptyMessage
          )}
        </td>
      </tr>
    </tbody>
  );
};

TableEmpty.propTypes = {
  isLoading: PropTypes.bool,
  colSpan: PropTypes.number,
  loadingMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default TableEmpty;
