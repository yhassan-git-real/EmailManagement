import React from 'react';
import PropTypes from 'prop-types';
import {
    TrashIcon,
    PencilIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Compact single-row toolbar for Email Records - Modern SaaS style
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
    const statusOptions = ['All', 'Pending', 'Success', 'Failed'];

    return (
        <div className="flex items-center justify-between gap-3 py-2 mb-3">
            {/* Left side: Search + Status Tabs + Record Count */}
            <div className="flex items-center gap-3">
                {/* Search Input - Compact */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                    <input
                        type="text"
                        className="h-8 w-44 pl-8 pr-7 text-xs rounded-md bg-dark-600/60 border border-dark-300/40 text-text-primary placeholder-text-muted focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onExecuteFilter()}
                    />
                    {searchTerm && (
                        <button
                            onClick={onClearFilters}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                        >
                            <XMarkIcon className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Status Tabs - Pill style */}
                <div className="flex items-center bg-dark-600/40 border border-dark-300/30 rounded-md p-0.5">
                    {statusOptions.map((status) => {
                        const isActive = statusFilter === status;
                        const activeStyles = {
                            'All': 'bg-dark-500 text-text-primary',
                            'Pending': 'bg-amber-500/20 text-amber-400',
                            'Success': 'bg-emerald-500/20 text-emerald-400',
                            'Failed': 'bg-red-500/20 text-red-400'
                        };

                        return (
                            <button
                                key={status}
                                onClick={() => onStatusFilterChange(status)}
                                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${isActive
                                        ? activeStyles[status]
                                        : 'text-text-muted hover:text-text-secondary hover:bg-dark-500/40'
                                    }`}
                            >
                                {status}
                            </button>
                        );
                    })}
                </div>

                {/* Record Count - Small label */}
                <span className="text-xs text-text-muted">
                    {isLocalFiltering ? (
                        <><span className="text-primary-400">{filteredCount}</span> of {totalCount} records</>
                    ) : (
                        <>{totalCount} records</>
                    )}
                </span>

                {/* Selected Count - Only show when rows selected */}
                {selectedRows.length > 0 && (
                    <span className="text-xs font-medium text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                        {selectedRows.length} selected
                    </span>
                )}
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex items-center gap-2">
                {/* Execute Button */}
                <button
                    onClick={onExecuteFilter}
                    disabled={isLoading}
                    className="inline-flex items-center h-8 px-3 text-xs font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowPathIcon className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Execute
                </button>

                {/* Edit Button */}
                <button
                    onClick={onEditSelected}
                    disabled={selectedRows.length !== 1 || isLoading}
                    className="inline-flex items-center h-8 px-3 text-xs font-medium rounded-md text-text-primary bg-dark-500/60 border border-dark-300/40 hover:bg-dark-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <PencilIcon className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                </button>

                {/* Delete Button */}
                <button
                    onClick={onDeleteSelected}
                    disabled={selectedRows.length === 0 || isLoading}
                    className="inline-flex items-center h-8 px-3 text-xs font-medium rounded-md text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <TrashIcon className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                    {selectedRows.length > 0 && (
                        <span className="ml-1 text-[10px] bg-red-500/20 px-1 rounded">{selectedRows.length}</span>
                    )}
                </button>
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
