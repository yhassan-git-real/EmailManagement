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
    <tbody className="bg-dark-600/50 divide-y divide-dark-300/30" role="rowgroup">
      <tr role="row">
        <td
          colSpan={colSpan}
          className="px-3 py-4 whitespace-nowrap text-center text-sm text-text-muted"
          role="cell"
          aria-live="polite"
        >
          {isLoading ? (
            <div
              className="flex justify-center items-center space-x-2"
              role="status"
              aria-label="Loading content"
            >
              <ArrowPathIcon className="h-5 w-5 animate-spin text-primary-500" aria-hidden="true" />
              <span className="text-text-secondary">{loadingMessage}</span>
              <span className="sr-only">Loading</span>
            </div>
          ) : error ? (
            <div
              className="flex justify-center items-center space-x-2 text-danger"
              role="alert"
              aria-live="assertive"
            >
              <ExclamationTriangleIcon className="h-5 w-5 text-danger" aria-hidden="true" />
              <span>{typeof error === 'string' ? error : 'An error occurred while loading data'}</span>
            </div>
          ) : (
            <div className="py-2 text-text-muted" aria-label={emptyMessage}>
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
