import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { TrashIcon, PencilIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

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

    // Handle search
    const handleSearch = (term) => {
        console.log(`[EmailRecordsView] Search term set to: ${term}`);
        setSearchTerm(term);
        // Don't automatically load data, wait for Execute button
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
            <div className="bg-white shadow-sm rounded-lg p-4">
                {/* Improved header styling with better typography and visual hierarchy */}
                <div className="mb-6 border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold text-primary-700 tracking-tight">Email Records</h1>
                    <p className="text-sm text-gray-600 mt-1">View and monitor email records in the system</p>
                </div>

                {/* Records section with improved heading */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-base font-semibold text-gray-800">Database Email Records</h2>

                        {/* Show selected count in a prominent way */}
                        {selectedRows.length > 0 && (
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 text-sm font-medium">
                                <span>{selectedRows.length} record{selectedRows.length !== 1 ? 's' : ''} selected</span>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                        View and filter email records from the database.
                        <span className="ml-1 text-primary-600 font-medium">Click "Execute" after selecting filters to load data.</span>
                    </p>

                    {/* Action Buttons Bar - Improved layout and alignment */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 mb-4 shadow-sm">
                        {/* Left side: Search and Filter controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search Input with better styling */}
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                                    placeholder="Search records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Status Filter Buttons with improved styling */}
                            <div className="flex space-x-1 bg-white border border-gray-200 p-1 rounded-md shadow-sm">
                                {['All', 'Pending', 'Success', 'Failed'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusFilterChange(status)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === status
                                            ? 'bg-primary-600 text-white shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            {/* Execute Button with better styling */}
                            <button
                                onClick={handleExecuteFilter}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                Execute
                            </button>

                            {/* Edit Button - Only enabled when exactly one row is selected */}
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
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PencilIcon className="h-4 w-4 mr-2" />
                                Edit Selected
                            </button>
                        </div>

                        {/* Right side: Delete Selected Button with improved styling */}
                        <div>
                            <button
                                onClick={handleDeleteSelected}
                                disabled={isLoading || selectedRows.length === 0}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Delete Selected {selectedRows.length > 0 && `(${selectedRows.length})`}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Table Component */}
                <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                    <DataTable
                        data={tableData}
                        columns={columns}
                        isLoading={isLoading}
                        totalRows={totalRows}
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
                    />
                </div>
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
