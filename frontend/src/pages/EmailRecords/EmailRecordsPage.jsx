import React from 'react';
import { toast } from 'react-toastify';
import useEmailRecords from './hooks/useEmailRecords';
import useEmailRecordActions from './hooks/useEmailRecordActions';
import EmailRecordsHeader from './components/EmailRecordsHeader';
import EmailRecordsToolbar from './components/EmailRecordsToolbar';
import EmailRecordsList from './components/EmailRecordsList';
import EmailRecordEditModal from './components/EmailRecordEditModal';
import { FilePreviewer, Header, Footer } from '../../components';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

/**
 * Main EmailRecordsPage component that combines header, toolbar, list, and edit modal
 */
const EmailRecordsPage = ({ connectionInfo, onDisconnect }) => {
    // Add a console log to verify when this component is rendered
    console.log('[EmailRecordsPage] Rendering Email Records Page component');
    // Hooks
    const {
        tableData,
        filteredData,
        totalRows,
        currentPage,
        pageSize,
        isLoading,
        searchTerm,
        statusFilter,
        isLocalFiltering,
        loadTableData,
        handleSearch,
        handleStatusFilterChange,
        handlePageChange,
        handleExecuteFilter,
        clearFilters,
        applyClientSideFilter
    } = useEmailRecords();

    const {
        selectedRows,
        selectedFile,
        editingRecord,
        showEditModal,
        isLoading: actionsLoading,
        handleFilePreview,
        handleRowSelect,
        handleEditRecord,
        handleSaveRecord,
        handleDeleteRecord,
        handleDeleteSelected,
        setSelectedFile,
        setShowEditModal
    } = useEmailRecordActions(loadTableData);

    // Handlers for toolbar operations
    const handleEditSelected = () => {
        if (selectedRows.length === 1) {
            const selectedRecord = tableData.find(record => record.id === selectedRows[0]);
            if (selectedRecord) {
                handleEditRecord(selectedRecord);
            }
        } else {
            toast.warning('Please select exactly one record to edit');
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />

            <div className="flex-grow">
                <main className="flex-grow py-4 px-4 w-full animate-fadeIn">
                    <div className="w-full max-w-full mx-auto">
                        {/* Header */}
                        <EmailRecordsHeader />

                        {/* Toolbar */}
                        <EmailRecordsToolbar
                            searchTerm={searchTerm}
                            onSearchChange={handleSearch}
                            statusFilter={statusFilter}
                            onStatusFilterChange={handleStatusFilterChange}
                            onExecuteFilter={handleExecuteFilter}
                            selectedRows={selectedRows}
                            onEditSelected={handleEditSelected}
                            onDeleteSelected={handleDeleteSelected}
                            isLoading={isLoading || actionsLoading}
                            isLocalFiltering={isLocalFiltering}
                            onClearFilters={clearFilters}
                            filteredCount={filteredData.length}
                            totalCount={tableData.length}
                        />

                        {/* List */}
                        <EmailRecordsList
                            data={isLocalFiltering ? filteredData : tableData}
                            isLoading={isLoading || actionsLoading}
                            totalRows={isLocalFiltering ? filteredData.length : totalRows}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onRowSelect={handleRowSelect}
                            selectedRows={selectedRows}
                            onFilePreview={handleFilePreview}
                            isFiltering={isLocalFiltering}
                            onEditRecord={handleEditRecord}
                            onDeleteRecord={handleDeleteRecord}
                        />

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
                                isLoading={actionsLoading}
                            />
                        )}
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default EmailRecordsPage;
