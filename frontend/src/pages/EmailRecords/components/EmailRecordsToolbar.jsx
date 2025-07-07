import React from 'react';
import PropTypes from 'prop-types';
import { 
    TrashIcon, 
    PencilIcon, 
    MagnifyingGlassIcon, 
    ArrowPathIcon 
} from '@heroicons/react/24/outline';

/**
 * Toolbar component for Email Records with search, filters, and action buttons
 */
const EmailRecordsToolbar = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onExecuteFilter,
    selectedRows,
    onEditSelected,
    onDeleteSelected,
    isLoading,
    isLocalFiltering,
    onClearFilters,
    filteredCount,
    totalCount
}) => {
    return (
        <div className="mb-4">
            {/* Data information section */}
            <div className="mb-4">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm mb-2">
                    {/* Information section */}
                    <div className="flex items-center">
                        <div className={`h-8 w-1 ${isLocalFiltering ? 'bg-yellow-500' : 'bg-primary-500'} rounded-r-md mr-2`}></div>
                        <div className="flex flex-col">
                            <div className="flex items-center">
                                {!isLocalFiltering ? (
                                    <p className="text-sm text-gray-700 font-medium">
                                        Total Records: <span className="text-primary-600">{totalCount}</span>
                                    </p>
                                ) : (
                                    <p className="text-sm text-yellow-700 font-medium">
                                        Filtered: <span className="text-yellow-600">{filteredCount}</span> of {totalCount} records match "<span className="font-medium">{searchTerm}</span>"
                                    </p>
                                )}

                                {isLocalFiltering && (
                                    <button
                                        className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-0.5 rounded-md text-xs transition-colors flex items-center"
                                        onClick={onClearFilters}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Clear filter
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                {!isLocalFiltering ? "Instant search available • Use Execute Button for table data" : "Client-side filtering active"}
                            </p>
                        </div>
                    </div>

                    {/* Show selected count in a prominent way */}
                    {selectedRows.length > 0 && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-sm font-medium shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{selectedRows.length} record{selectedRows.length !== 1 ? 's' : ''} selected</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons Bar - More compact and wider layout */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 mb-4 shadow-sm">
                {/* Left side: Search and Filter controls */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input with enhanced styling and functionality */}
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className={`h-3 w-3 ${isLocalFiltering ? 'text-primary-500' : 'text-gray-400'}`} aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className={`focus:ring-primary-500 focus:border-primary-500 block w-32 md:w-48 pl-7 text-xs font-medium rounded-md py-1.5 transition-all duration-200 ${isLocalFiltering
                                ? 'border-primary-300 bg-primary-50'
                                : 'border-gray-300'
                                }`}
                            placeholder={isLocalFiltering ? `Filtering ${filteredCount} records...` : "Search records..."}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    onExecuteFilter();
                                }
                            }}
                        />
                        {isLocalFiltering && searchTerm && (
                            <div
                                className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                                onClick={onClearFilters}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Status Filter Buttons with enhanced styling */}
                    <div className="flex space-x-1 bg-white border border-gray-200 p-0.5 rounded-md shadow-sm">
                        {['All', 'Pending', 'Success', 'Failed'].map((status) => {
                            // Define status-specific colors
                            const activeColor = status === 'All' ? 'bg-primary-600 text-white' :
                                status === 'Pending' ? 'bg-yellow-500 text-white' :
                                    status === 'Success' ? 'bg-green-600 text-white' :
                                        'bg-red-600 text-white';

                            return (
                                <button
                                    key={status}
                                    onClick={() => onStatusFilterChange(status)}
                                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${statusFilter === status
                                        ? `${activeColor} shadow-sm`
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {status}
                                </button>
                            );
                        })}
                    </div>

                    {/* Execute Button with enhanced styling */}
                    <button
                        onClick={onExecuteFilter}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary-500 transition-all duration-200 relative overflow-hidden group"
                        title={isLocalFiltering ? "Search server database with current filters" : "Execute search with current filters"}
                    >
                        <span className="absolute inset-0 w-0 bg-white bg-opacity-30 transition-all duration-300 ease-out group-hover:w-full"></span>
                        <ArrowPathIcon className="h-4 w-4 mr-1.5 group-hover:rotate-180 transition-transform duration-300" />
                        <span className="font-medium tracking-wide">{isLocalFiltering ? "Search Server" : "Execute"}</span>
                    </button>

                    {/* Edit Button - Only enabled when exactly one row is selected */}
                    <button
                        onClick={onEditSelected}
                        disabled={selectedRows.length !== 1 || isLoading}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <PencilIcon className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium tracking-wide">Edit</span>
                    </button>
                </div>

                {/* Right side: Delete Selected Button with improved styling */}
                <div>
                    <button
                        onClick={onDeleteSelected}
                        disabled={isLoading || selectedRows.length === 0}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <TrashIcon className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium tracking-wide">Delete</span> {selectedRows.length > 0 && <span className="ml-0.5 bg-red-800 bg-opacity-30 rounded-full px-1.5 py-0.5 text-xs">{selectedRows.length}</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

EmailRecordsToolbar.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    statusFilter: PropTypes.string.isRequired,
    onStatusFilterChange: PropTypes.func.isRequired,
    onExecuteFilter: PropTypes.func.isRequired,
    selectedRows: PropTypes.array.isRequired,
    onEditSelected: PropTypes.func.isRequired,
    onDeleteSelected: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isLocalFiltering: PropTypes.bool.isRequired,
    onClearFilters: PropTypes.func.isRequired,
    filteredCount: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired
};

export default EmailRecordsToolbar;
