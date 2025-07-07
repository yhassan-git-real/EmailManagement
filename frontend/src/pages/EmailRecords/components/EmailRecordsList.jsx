import React from 'react';
import PropTypes from 'prop-types';
import DataTable from '../../../components/DataTable';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * Component for displaying the email records in a table
 */
const EmailRecordsList = ({
    data,
    isLoading,
    totalRows,
    currentPage,
    pageSize,
    onPageChange,
    onRowSelect,
    selectedRows,
    onFilePreview,
    isFiltering,
    onEditRecord,
    onDeleteRecord
}) => {
    // Process records to add action buttons
    const processedData = data.map(record => ({
        ...record,
        actions: [
            {
                icon: <PencilIcon className="h-4 w-4 text-blue-600" />,
                label: 'Edit',
                onClick: (e) => {
                    e.stopPropagation(); // Prevent row selection when clicking edit
                    onEditRecord(record);
                },
                className: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
            },
            {
                icon: <TrashIcon className="h-4 w-4 text-red-600" />,
                label: 'Delete',
                onClick: (e) => {
                    e.stopPropagation(); // Prevent row selection when clicking delete
                    onDeleteRecord(record.id);
                },
                className: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
            }
        ]
    }));

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

    return (
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-md">
            <DataTable
                data={processedData}
                columns={columns}
                isLoading={isLoading}
                totalRows={totalRows}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={onPageChange}
                onRowSelect={onRowSelect}
                selectedRows={selectedRows}
                onFilePreview={onFilePreview}
                compact={true}
                isFiltered={isFiltering}
            />
        </div>
    );
};

EmailRecordsList.propTypes = {
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    totalRows: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onRowSelect: PropTypes.func.isRequired,
    selectedRows: PropTypes.array.isRequired,
    onFilePreview: PropTypes.func.isRequired,
    isFiltering: PropTypes.bool.isRequired,
    onEditRecord: PropTypes.func.isRequired,
    onDeleteRecord: PropTypes.func.isRequired
};

export default EmailRecordsList;
