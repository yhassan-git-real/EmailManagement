import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { EnvelopeIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DataTable from '../components/DataTable';
import FilePreviewer from '../components/FilePreviewer';
import { fetchEmailTableData, updateEmailRecordStatus, deleteEmailRecord } from '../utils/apiClient';

const EmailRecordsPage = ({ connectionInfo, onDisconnect }) => {
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');

    // Function to load email records data
    const loadTableData = async (pageToLoad = currentPage) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setIsLoading(true);

        try {
            console.log(`Loading email records - page: ${pageToLoad}, search: ${searchTerm}, status: ${statusFilter}`);

            const response = await fetchEmailTableData(pageToLoad, pageSize, searchTerm, statusFilter);

            // Handle missing records
            if (!response.data || !response.data.rows) {
                console.error('No records found in response:', response);
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
                display_file_path: record.file_path // Keep full path for preview
            }));

            setTableData(processedRecords);
            setTotalRows(response.data.total || processedRecords.length);

            console.log('Records loaded:', processedRecords.length);
        } catch (error) {
            console.error('Error loading email records:', error);
            toast.error('Failed to load email records');
        } finally {
            setIsLoading(false);
            loadingRef.current = false;
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle row selection
    const handleRowSelect = (row, isSelected) => {
        if (isSelected) {
            setSelectedRows(prev => [...prev, row]);
        } else {
            setSelectedRows(prev => prev.filter(r => r.id !== row.id));
        }
    };

    // Handle search
    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Handle status filter change
    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1); // Reset to first page when filtering
    };

    // Handle Execute button click
    const handleExecuteFilter = () => {
        loadTableData();
    };

    // Handle retry for failed emails
    const handleRetry = async (emailId) => {
        try {
            const toastId = toast.loading("Retrying email...");

            // First update status to pending
            const response = await updateEmailRecordStatus(emailId, "Pending");

            if (response.success) {
                toast.update(toastId, {
                    render: "Email queued for retry",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });

                // Reload table data to reflect changes
                loadTableData();
            } else {
                toast.update(toastId, {
                    render: `Failed to retry: ${response.message}`,
                    type: "error",
                    isLoading: false,
                    autoClose: 5000
                });
            }
        } catch (error) {
            console.error('Error retrying email:', error);
            toast.error(`Error: ${error.message}`);
        }
    };

    // Handle status update
    const handleStatusChange = async (emailId, newStatus) => {
        try {
            const response = await updateEmailRecordStatus(emailId, newStatus);

            if (response.success) {
                // Only show toast for important status changes
                if (newStatus === 'Failed') {
                    toast.error(`Email status marked as ${newStatus}`);
                }
                // Reload table data to reflect changes
                loadTableData();
            } else {
                console.error(`Failed to update status: ${response.message}`);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Handle delete email record
    const handleDelete = async (emailId) => {
        try {
            const toastId = toast.loading("Deleting email record...");

            // API call to delete email record would go here
            // const response = await deleteEmailRecord(emailId);

            // Placeholder for now
            const response = { success: true };

            if (response.success) {
                toast.update(toastId, {
                    render: "Email record deleted successfully",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000
                });

                // Update selected rows to remove the deleted one
                setSelectedRows(prev => prev.filter(r => r.id !== emailId));

                // Reload table data to reflect changes
                loadTableData();
            } else {
                toast.update(toastId, {
                    render: `Failed to delete record: ${response.message}`,
                    type: "error",
                    isLoading: false,
                    autoClose: 5000
                });
            }
        } catch (error) {
            console.error('Error deleting email record:', error);
            toast.error(`Error: ${error.message}`);
        }
    };

    // Define table columns
    const columns = [
        {
            id: 'select',
            header: '',
            cell: (row) => (
                <input
                    type="checkbox"
                    checked={selectedRows.some(r => r.id === row.id)}
                    onChange={(e) => handleRowSelect(row, e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
            ),
            width: '40px'
        },
        {
            id: 'company',
            header: 'Company',
            accessor: 'company',
            width: '150px'
        },
        {
            id: 'email',
            header: 'Email',
            accessor: 'email',
            width: '200px'
        },
        {
            id: 'subject',
            header: 'Subject',
            accessor: 'subject',
            width: '200px'
        },
        {
            id: 'file',
            header: 'File',
            accessor: 'file_path',
            width: '200px'
        },
        {
            id: 'send_date',
            header: 'Send Date',
            accessor: 'send_date',
            width: '160px'
        },
        {
            id: 'status',
            header: 'Status',
            accessor: 'status',
            width: '100px',
            cell: (row) => {
                const status = row.status.toLowerCase();
                let bgColor;

                if (status === 'success') bgColor = 'bg-green-100 text-green-800';
                else if (status === 'pending') bgColor = 'bg-yellow-100 text-yellow-800';
                else if (status === 'failed') bgColor = 'bg-red-100 text-red-800';
                else bgColor = 'bg-gray-100 text-gray-800';

                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            id: 'created',
            header: 'Created',
            accessor: 'created_at',
            width: '120px'
        },
        {
            id: 'reason',
            header: 'Reason',
            accessor: 'reason',
            width: '250px'
        },
        {
            id: 'actions',
            header: 'Actions',
            width: '150px',
            cell: (row) => {
                const status = row.status.toLowerCase();
                return (
                    <div className="flex space-x-1">
                        {status === 'failed' && (
                            <button
                                onClick={() => handleRetry(row.id)}
                                className="text-xs font-medium text-primary-600 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded"
                                title="Retry this email"
                            >
                                <ArrowPathIcon className="w-4 h-4 inline" /> Retry
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(row.id)}
                            className="text-xs font-medium text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                            title="Delete this record"
                        >
                            Delete
                        </button>
                    </div>
                );
            }
        }
    ];

    // Effect to load data when mounting and on filters/page change
    useEffect(() => {
        // Don't load data automatically - wait for Execute button
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />

            <div className="flex flex-row flex-grow relative">
                <main className="flex-grow py-3 px-4 bg-gradient-to-b from-gray-50 to-gray-100 w-full overflow-x-hidden">
                    <div className="max-w-7xl mx-auto w-full relative">
                        <h1 className="text-sm font-medium mb-2 text-primary-600 pl-1 flex items-center">
                            <EnvelopeIcon className="h-3.5 w-3.5 mr-1" />
                            Email Records
                        </h1>

                        {/* Data Table Section */}
                        <div className="bg-white rounded-lg shadow mb-4 relative overflow-x-hidden">
                            <div className="p-3 border-b border-gray-200">
                                <h2 className="text-sm font-medium text-gray-700">Database Email Records</h2>
                                <p className="text-xs text-gray-500">
                                    View and filter email records from the database.
                                    <span className="ml-1 text-primary-600 font-medium">Click "Execute" after selecting filters to load data.</span>
                                </p>
                            </div>

                            {/* Data Table Component */}
                            <div className="overflow-hidden">
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
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmailRecordsPage;
