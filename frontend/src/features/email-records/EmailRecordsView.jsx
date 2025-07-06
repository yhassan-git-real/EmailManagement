import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { TrashIcon, PencilIcon, MagnifyingGlassIcon, ArrowPathIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import DataTable from '../../components/DataTable';
import FilePreviewer from '../../components/FilePreviewer';
import EmailRecordEditModal from './EmailRecordEditModal';
import {
    fetchEmailTableData,
    deleteEmailRecord,
    updateEmailRecord
} from './emailRecordsApi';

const EmailRecordsView = () => {
    // State for data management
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLocalFiltering, setIsLocalFiltering] = useState(false);

    // State for UI interactions
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Refs to prevent race conditions and track loading state
    const loadingRef = useRef(false);
    const mountedRef = useRef(true);

    // Define table columns
    const columns = [
        { key: 'company_name', label: 'Company', width: 'w-40' },
        { key: 'email', label: 'Email', width: 'w-48', editable: true },
        { key: 'subject', label: 'Subject', width: 'w-64', editable: true },
        { key: 'file_path', label: 'File', type: 'file', width: 'w-40', editable: true },
        { key: 'email_send_date', label: 'Send Date', type: 'datetime', width: 'w-40' },
        {
            key: 'email_status', label: 'Status', type: 'status', width: 'w-28',
            filterOptions: ['Success', 'Failed', 'Pending']
        },
        { key: 'date', label: 'Created', type: 'date', width: 'w-32' },
        { key: 'reason', label: 'Reason', width: 'w-48' },
        { key: 'actions', label: 'Actions', type: 'actions', width: 'w-24' }
    ];

    // Combine cleanup and initial load in a single useEffect
    useEffect(() => {
        console.log("[EmailRecordsView] Component mounted, triggering initial data load");

        // Set mounted flag
        mountedRef.current = true;

        // Explicitly call loadTableData on mount to fetch initial data
        loadTableData(1);

        // Cleanup effect to prevent memory leaks
        return () => {
            console.log("[EmailRecordsView] Component unmounting, cleaning up");
            mountedRef.current = false;
        };
    }, []);    // Function to load email records data
    const loadTableData = async (pageToLoad = currentPage) => {
        console.log(`[EmailRecordsView] Loading data for page ${pageToLoad}, status: ${statusFilter}, search: ${searchTerm}`);

        // Important to check if we're still mounted before starting
        if (!mountedRef.current) {
            console.log('[EmailRecordsView] Component not mounted, skipping data load');
            return;
        }

        if (loadingRef.current) {
            console.log('[EmailRecordsView] Already loading data, skipping request');
            return;
        }

        loadingRef.current = true;
        setIsLoading(true);

        try {
            console.log(`[EmailRecordsView] Making API call to fetchEmailTableData(${pageToLoad}, ${pageSize}, ${searchTerm}, ${statusFilter})`);
            const response = await fetchEmailTableData(pageToLoad, pageSize, searchTerm, statusFilter);
            console.log('[EmailRecordsView] API response:', response);

            // Double-check component is still mounted
            if (!mountedRef.current) {
                console.log('[EmailRecordsView] Component unmounted, ignoring response');
                return;
            }

            console.log('[EmailRecordsView] Component still mounted, processing response');

            // Handle missing records
            if (!response || !response.data || !response.data.rows) {
                console.error('[EmailRecordsView] No records found in response:', response);
                toast.error('Error loading email records: Invalid response format');
                setTableData([]);
                setTotalRows(0);
                return;
            }

            // Process records to ensure file_path display is user-friendly
            const processedRecords = response.data.rows.map(record => ({
                ...record,
                id: record.id, // ensure ID is preserved
                file_path: record.file_path ? record.file_path.split('/').pop() : '-', // Show just filename, not full path
                display_file_path: record.file_path, // Keep full path for preview
                actions: [
                    {
                        icon: <PencilIcon className="h-4 w-4 text-blue-600" />,
                        label: 'Edit',
                        onClick: (e) => {
                            e.stopPropagation(); // Prevent row selection when clicking edit
                            handleEditRecord(record);
                        },
                        className: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                    },
                    {
                        icon: <TrashIcon className="h-4 w-4 text-red-600" />,
                        label: 'Delete',
                        onClick: (e) => {
                            e.stopPropagation(); // Prevent row selection when clicking delete
                            handleDeleteRecord(record.id);
                        },
                        className: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                    }
                ].filter(Boolean)
            }));

            setTableData(processedRecords);
            setFilteredData(processedRecords);
            setTotalRows(response.data.total || processedRecords.length);
        } catch (error) {
            console.error('Error loading email records:', error);
            if (mountedRef.current) {
                toast.error('Failed to load email records');
            }
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
            loadingRef.current = false;
        }
    };

    // Handle file preview
    const handleFilePreview = (file) => {
        setSelectedFile(file);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        console.log(`[EmailRecordsView] Page changed to ${newPage}`);
        setCurrentPage(newPage);
        loadTableData(newPage);
    };

    // Handle row selection with support for both single row and multi-row selection
    const handleRowSelect = (row, isSelected, isMultiSelect = false) => {
        console.log(`[EmailRecordsView] Row selection: isSelected=${isSelected}, isMultiSelect=${isMultiSelect}`);

        if (isMultiSelect) {
            // Handle multi-select (select all / deselect all)
            if (isSelected && Array.isArray(row)) {
                // Select all rows on current page
                const allIds = row.map(r => r.id);
                console.log(`[EmailRecordsView] Selecting all ${allIds.length} rows`);
                setSelectedRows(allIds); // Replace with just the current page rows
            } else {
                // Deselect all rows
                console.log(`[EmailRecordsView] Deselecting all rows`);
                setSelectedRows([]);
            }
        } else {
            // Handle single row selection
            setSelectedRows(prev => {
                if (isSelected) {
                    // Check if the row is already selected
                    if (prev.includes(row.id)) {
                        console.log(`[EmailRecordsView] Row ${row.id} already selected, no change`);
                        return prev; // Already selected, don't add duplicate
                    }
                    console.log(`[EmailRecordsView] Adding row ${row.id} to selection`);
                    return [...prev, row.id];
                } else {
                    console.log(`[EmailRecordsView] Removing row ${row.id} from selection`);
                    return prev.filter(id => id !== row.id);
                }
            });
        }
    };

    // Apply client-side filtering based on search term
    const applyClientSideFilter = (term) => {
        console.log(`[EmailRecordsView] Applying client-side filter: "${term}"`);
        if (!term.trim()) {
            // If search term is empty, use the original data
            setFilteredData([...tableData]);
            setIsLocalFiltering(false);
            return;
        }

        const searchLower = term.toLowerCase();
        // Filter data by searching all string fields
        const filtered = tableData.filter(record => {
            // Search in all text fields
            return Object.keys(record).some(key => {
                const value = record[key];
                // Only search string values and skip display_file_path which is internal
                return typeof value === 'string' &&
                    key !== 'display_file_path' &&
                    key !== 'id' &&
                    value.toLowerCase().includes(searchLower);
            });
        });

        setFilteredData(filtered);
        setIsLocalFiltering(true);
    };

    // Handle search - now applies client-side filtering immediately
    const handleSearch = (term) => {
        console.log(`[EmailRecordsView] Search term set to: ${term}`);
        setSearchTerm(term);
        applyClientSideFilter(term);
        // The Execute button will still be available for server-side search
    };

    // Handle status filter change
    const handleStatusFilterChange = (status) => {
        console.log(`[EmailRecordsView] Status filter set to: ${status}`);
        setStatusFilter(status);
        // Don't automatically load data, wait for Execute button
    };

    // Handle execute filter button click
    const handleExecuteFilter = () => {
        console.log(`[EmailRecordsView] Execute button clicked with filters: status=${statusFilter}, search=${searchTerm}`);
        setCurrentPage(1); // Reset to first page
        setIsLocalFiltering(false); // Disable local filtering when executing server search
        loadTableData(1); // Load first page with current filters
    };

    // Retry functionality removed as requested

    // Handle edit record
    const handleEditRecord = (record) => {
        console.log(`[EmailRecordsView] Editing record:`, record);
        setEditingRecord(record);
        setShowEditModal(true);
    };

    // Create record functionality removed as requested

    // Handle save edited record
    const handleSaveRecord = async (updatedRecord) => {
        console.log(`[EmailRecordsView] Saving record:`, updatedRecord);
        setIsLoading(true);

        try {
            let response;

            // Format the record data for backend compatibility
            const recordForBackend = {
                ...updatedRecord,
                // Remove frontend-only fields
                display_file_path: undefined,
                actions: undefined
            };

            // Remove email_send_date if it's null to avoid validation errors
            if (recordForBackend.email_send_date === null) {
                delete recordForBackend.email_send_date;
                console.log(`[EmailRecordsView] Removed null email_send_date field`);
            }

            console.log(`[EmailRecordsView] Sending record data to backend:`, recordForBackend);

            // Only update existing records since create is removed
            response = await updateEmailRecord(updatedRecord.id, recordForBackend);
            console.log(`[EmailRecordsView] Update record response:`, response);

            if (response.success) {
                toast.success('Record updated successfully');
                setShowEditModal(false);
                loadTableData(currentPage); // Reload data to reflect changes
            } else {
                toast.error(response.error || 'Failed to update record');
            }
        } catch (error) {
            console.error('Error saving record:', error);
            toast.error('Failed to save record: ' + (error.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete record
    const handleDeleteRecord = async (id) => {
        console.log(`[EmailRecordsView] Deleting record with ID: ${id}`);
        if (!window.confirm('Are you sure you want to delete this record?')) {
            return;
        }

        setIsLoading(true);

        try {
            await deleteEmailRecord(id);
            toast.success('Record deleted successfully');
            loadTableData(currentPage); // Reload data to reflect changes
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error('Failed to delete record');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete selected records
    const handleDeleteSelected = async () => {
        if (selectedRows.length === 0) {
            toast.warning('Please select at least one record to delete');
            return;
        }

        console.log(`[EmailRecordsView] Deleting ${selectedRows.length} selected records`);
        if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} selected record(s)?`)) {
            return;
        }

        setIsLoading(true);

        try {
            for (const id of selectedRows) {
                await deleteEmailRecord(id);
            }

            toast.success(`${selectedRows.length} record(s) deleted successfully`);
            setSelectedRows([]);
            loadTableData(currentPage); // Reload data to reflect changes
        } catch (error) {
            console.error('Error deleting records:', error);
            toast.error('Failed to delete selected records');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="bg-white shadow-md rounded-xl p-5">
                {/* Enhanced header with date and info */}
                <div className="mb-4 border-b border-gray-200 pb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <div className="bg-primary-100 p-2 rounded-lg mr-3">
                                <EnvelopeIcon className="h-5 w-5 text-primary-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-primary-700 tracking-tight">Database Email Records</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-200 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </div>
                            <div className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-md border border-primary-100 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                </svg>
                                Last updated: Today
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                        View and manage email records with search, filter, and bulk actions functionality.
                    </div>
                </div>

                {/* Enhanced data information section */}
                <div className="mb-4">
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm mb-2">
                        {/* Information section */}
                        <div className="flex items-center">
                            <div className={`h-8 w-1 ${isLocalFiltering ? 'bg-yellow-500' : 'bg-primary-500'} rounded-r-md mr-2`}></div>
                            <div className="flex flex-col">
                                <div className="flex items-center">
                                    {!isLocalFiltering ? (
                                        <p className="text-sm text-gray-700 font-medium">
                                            Total Records: <span className="text-primary-600">{tableData.length}</span>
                                        </p>
                                    ) : (
                                        <p className="text-sm text-yellow-700 font-medium">
                                            Filtered: <span className="text-yellow-600">{filteredData.length}</span> of {tableData.length} records match "<span className="font-medium">{searchTerm}</span>"
                                        </p>
                                    )}

                                    {isLocalFiltering && (
                                        <button
                                            className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-0.5 rounded-md text-xs transition-colors flex items-center"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setIsLocalFiltering(false);
                                                setFilteredData([...tableData]);
                                            }}
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
                                placeholder={isLocalFiltering ? `Filtering ${filteredData.length} records...` : "Search records..."}
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleExecuteFilter();
                                    }
                                }}
                            />
                            {isLocalFiltering && searchTerm && (
                                <div
                                    className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setIsLocalFiltering(false);
                                        setFilteredData([...tableData]);
                                    }}
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
                                        onClick={() => handleStatusFilterChange(status)}
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

                        {/* Execute Button with enhanced styling - Slightly larger and consistent with other buttons */}
                        <button
                            onClick={handleExecuteFilter}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary-500 transition-all duration-200 relative overflow-hidden group"
                            title={isLocalFiltering ? "Search server database with current filters" : "Execute search with current filters"}
                        >
                            <span className="absolute inset-0 w-0 bg-white bg-opacity-30 transition-all duration-300 ease-out group-hover:w-full"></span>
                            <ArrowPathIcon className="h-4 w-4 mr-1.5 group-hover:rotate-180 transition-transform duration-300" />
                            <span className="font-medium tracking-wide">{isLocalFiltering ? "Search Server" : "Execute"}</span>
                        </button>

                        {/* Edit Button - Only enabled when exactly one row is selected - Slightly larger */}
                        <button
                            onClick={() => {
                                if (selectedRows.length === 1) {
                                    const selectedRecord = tableData.find(record => record.id === selectedRows[0]);
                                    if (selectedRecord) {
                                        handleEditRecord(selectedRecord);
                                    }
                                } else {
                                    toast.warning('Please select exactly one record to edit');
                                }
                            }}
                            disabled={selectedRows.length !== 1 || isLoading}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <PencilIcon className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium tracking-wide">Edit</span>
                        </button>
                    </div>

                    {/* Right side: Delete Selected Button with improved styling - Slightly larger */}
                    <div>
                        <button
                            onClick={handleDeleteSelected}
                            disabled={isLoading || selectedRows.length === 0}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <TrashIcon className="h-4 w-4 mr-1.5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium tracking-wide">Delete</span> {selectedRows.length > 0 && <span className="ml-0.5 bg-red-800 bg-opacity-30 rounded-full px-1.5 py-0.5 text-xs">{selectedRows.length}</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table Component */}
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow-md">
                <DataTable
                    data={isLocalFiltering ? filteredData : tableData}
                    columns={columns}
                    isLoading={isLoading}
                    totalRows={isLocalFiltering ? filteredData.length : totalRows}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onRowSelect={handleRowSelect}
                    onSearch={handleSearch}
                    onSearchChange={handleSearch}
                    selectedRows={selectedRows}
                    compact={true}
                    onStatusChange={handleStatusFilterChange}
                    onExecute={handleExecuteFilter}
                    onFilePreview={handleFilePreview}
                    isFiltered={isLocalFiltering}
                />
            </div>

            {/* File Previewer */}
            {selectedFile && (
                <FilePreviewer
                    file={selectedFile}
                    onClose={() => setSelectedFile(null)}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingRecord && (
                <EmailRecordEditModal
                    record={editingRecord}
                    onSave={handleSaveRecord}
                    onCancel={() => setShowEditModal(false)}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default EmailRecordsView;
