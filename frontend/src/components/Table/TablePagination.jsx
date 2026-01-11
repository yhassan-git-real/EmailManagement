import React, { useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * Table pagination component for navigating between pages of data
 */
const TablePagination = ({
  currentPage = 1,
  totalPages = 1,
  totalRows = 0,
  pageSize = 5,
  onPageChange,
}) => {
  // Validate and normalize inputs to prevent errors
  const validatedCurrentPage = Math.max(1, Math.min(isNaN(currentPage) ? 1 : currentPage, Math.max(1, totalPages)));
  const validatedTotalPages = Math.max(1, isNaN(totalPages) ? 1 : totalPages);
  const validatedTotalRows = Math.max(0, isNaN(totalRows) ? 0 : totalRows);
  const validatedPageSize = Math.max(1, isNaN(pageSize) ? 5 : pageSize);

  // Handle pagination - memoized to prevent unnecessary re-renders
  const goToPage = useCallback((page) => {
    try {
      if (page >= 1 && page <= validatedTotalPages && onPageChange) {
        onPageChange(page);
      }
    } catch (error) {
      console.error('[TablePagination] Error navigating to page:', error);
    }
  }, [validatedTotalPages, onPageChange]);

  return (
    <div className="bg-dark-700/80 px-3 py-2 border-t border-dark-300/50 flex items-center justify-between relative overflow-x-auto" role="navigation" aria-label="Pagination navigation">
      {/* Mobile pagination controls */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => goToPage(validatedCurrentPage - 1)}
          disabled={validatedCurrentPage === 1}
          className={`relative inline-flex items-center px-2 py-1 border border-dark-300/50 text-xs font-medium rounded-md text-text-secondary bg-dark-500/50 hover:bg-dark-400/50 ${validatedCurrentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Previous page"
          tabIndex={validatedCurrentPage === 1 ? -1 : 0}
        >
          Previous
        </button>
        <button
          onClick={() => goToPage(validatedCurrentPage + 1)}
          disabled={validatedCurrentPage === validatedTotalPages}
          className={`ml-3 relative inline-flex items-center px-2 py-1 border border-dark-300/50 text-xs font-medium rounded-md text-text-secondary bg-dark-500/50 hover:bg-dark-400/50 ${validatedCurrentPage === validatedTotalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Next page"
          tabIndex={validatedCurrentPage === validatedTotalPages ? -1 : 0}
        >
          Next
        </button>
      </div>

      {/* Desktop pagination controls */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {/* Results summary */}
        <div>
          <p className="text-xs text-text-secondary" aria-live="polite">
            Showing <span className="font-medium text-text-primary">{validatedTotalRows === 0 ? 0 : Math.min((validatedCurrentPage - 1) * validatedPageSize + 1, validatedTotalRows)}</span> to{' '}
            <span className="font-medium text-text-primary">{Math.min(validatedCurrentPage * validatedPageSize, validatedTotalRows)}</span> of{' '}
            <span className="font-medium text-text-primary">{validatedTotalRows}</span> results
          </p>
        </div>

        {/* Page navigation */}
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Previous page button */}
            <button
              onClick={() => goToPage(validatedCurrentPage - 1)}
              disabled={validatedCurrentPage === 1}
              className={`relative inline-flex items-center px-2 py-1 rounded-l-md border border-dark-300/50 bg-dark-500/50 text-xs font-medium text-text-muted hover:bg-dark-400/50 ${validatedCurrentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Go to previous page"
              tabIndex={validatedCurrentPage === 1 ? -1 : 0}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-3 w-3" aria-hidden="true" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, validatedTotalPages) }, (_, i) => {
              let pageNumber;
              if (validatedTotalPages <= 5) {
                pageNumber = i + 1;
              } else if (validatedCurrentPage <= 3) {
                pageNumber = i + 1;
              } else if (validatedCurrentPage >= validatedTotalPages - 2) {
                pageNumber = validatedTotalPages - 4 + i;
              } else {
                pageNumber = validatedCurrentPage - 2 + i;
              }

              const isCurrentPage = validatedCurrentPage === pageNumber;

              return (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${isCurrentPage
                    ? 'z-10 bg-primary-500/20 border-primary-500/50 text-primary-400'
                    : 'bg-dark-500/50 border-dark-300/50 text-text-muted hover:bg-dark-400/50'
                    }`}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={isCurrentPage ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}

            {/* Next page button */}
            <button
              onClick={() => goToPage(validatedCurrentPage + 1)}
              disabled={validatedCurrentPage === validatedTotalPages}
              className={`relative inline-flex items-center px-2 py-1 rounded-r-md border border-dark-300/50 bg-dark-500/50 text-xs font-medium text-text-muted hover:bg-dark-400/50 ${validatedCurrentPage === validatedTotalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Go to next page"
              tabIndex={validatedCurrentPage === validatedTotalPages ? -1 : 0}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-3 w-3" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

TablePagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  totalRows: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
};

// Use memo to prevent unnecessary re-renders
export default memo(TablePagination);
