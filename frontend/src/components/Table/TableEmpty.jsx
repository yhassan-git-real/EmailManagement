import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Component for displaying empty or loading states in the table
 */
const TableEmpty = ({
  isLoading = false,
  colSpan = 1,
  loadingMessage = 'Loading data...',
  emptyMessage = 'No data available',
  error = null,
}) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200" role="rowgroup">
      <tr role="row">
        <td 
          colSpan={colSpan} 
          className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500"
          role="cell"
          aria-live="polite"
        >
          {isLoading ? (
            <div 
              className="flex justify-center items-center space-x-2"
              role="status"
              aria-label="Loading content"
            >
              <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" aria-hidden="true" />
              <span>{loadingMessage}</span>
              <span className="sr-only">Loading</span>
            </div>
          ) : error ? (
            <div 
              className="flex justify-center items-center space-x-2 text-red-600"
              role="alert"
              aria-live="assertive"
            >
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
              <span>{typeof error === 'string' ? error : 'An error occurred while loading data'}</span>
            </div>
          ) : (
            <div className="py-2" aria-label={emptyMessage}>
              {emptyMessage}
            </div>
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
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

// Use memo to prevent unnecessary re-renders
export default memo(TableEmpty);
