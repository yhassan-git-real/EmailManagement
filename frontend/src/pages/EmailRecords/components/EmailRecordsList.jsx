import React from 'react';
import PropTypes from 'prop-types';
import Table from '../../../components/Table';
import { getEmailColumns, processEmailRecords } from './EmailTable';

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
    // Process records to add action buttons and get columns configuration
    const processedData = processEmailRecords(data, onEditRecord, onDeleteRecord);
    const columns = getEmailColumns();

    return (
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-md">
            <Table
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
