import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { updateEmailRecord, deleteEmailRecord } from '../../../utils/emailRecordsApi';

/**
 * Custom hook for managing email record actions (edit, delete, etc.)
 * @param {Function} refreshData - Function to refresh data after actions
 * @returns {Object} - Actions and related state
 */
const useEmailRecordActions = (refreshData) => {
    // State for UI interactions
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle file preview
     * @param {Object} file - File to preview
     */
    const handleFilePreview = useCallback((file) => {
        setSelectedFile(file);
    }, []);

    /**
     * Handle row selection with support for both single row and multi-row selection
     * @param {Object|Array} row - Row or rows to select/deselect
     * @param {boolean} isSelected - Whether to select or deselect
     * @param {boolean} isMultiSelect - Whether this is a multi-select operation
     */
    const handleRowSelect = useCallback((row, isSelected, isMultiSelect = false) => {
        console.log(`[useEmailRecordActions] Row selection: isSelected=${isSelected}, isMultiSelect=${isMultiSelect}`);

        if (isMultiSelect) {
            // Handle multi-select (select all / deselect all)
            if (isSelected && Array.isArray(row)) {
                // Select all rows on current page
                const allIds = row.map(r => r.id);
                console.log(`[useEmailRecordActions] Selecting all ${allIds.length} rows`);
                setSelectedRows(allIds); // Replace with just the current page rows
            } else {
                // Deselect all rows
                console.log(`[useEmailRecordActions] Deselecting all rows`);
                setSelectedRows([]);
            }
        } else {
            // Handle single row selection
            setSelectedRows(prev => {
                if (isSelected) {
                    // Check if the row is already selected
                    if (prev.includes(row.id)) {
                        console.log(`[useEmailRecordActions] Row ${row.id} already selected, no change`);
                        return prev; // Already selected, don't add duplicate
                    }
                    console.log(`[useEmailRecordActions] Adding row ${row.id} to selection`);
                    return [...prev, row.id];
                } else {
                    console.log(`[useEmailRecordActions] Removing row ${row.id} from selection`);
                    return prev.filter(id => id !== row.id);
                }
            });
        }
    }, []);

    /**
     * Handle edit record
     * @param {Object} record - Record to edit
     */
    const handleEditRecord = useCallback((record) => {
        console.log(`[useEmailRecordActions] Editing record:`, record);
        setEditingRecord(record);
        setShowEditModal(true);
    }, []);

    /**
     * Handle save edited record
     * @param {Object} updatedRecord - Updated record data
     */
    const handleSaveRecord = useCallback(async (updatedRecord) => {
        console.log(`[useEmailRecordActions] Saving record:`, updatedRecord);
        setIsLoading(true);

        try {
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
                console.log(`[useEmailRecordActions] Removed null email_send_date field`);
            }

            console.log(`[useEmailRecordActions] Sending record data to backend:`, recordForBackend);

            // Update existing record
            const response = await updateEmailRecord(updatedRecord.id, recordForBackend);
            console.log(`[useEmailRecordActions] Update record response:`, response);

            if (response.success) {
                toast.success('Record updated successfully');
                setShowEditModal(false);
                refreshData(); // Reload data to reflect changes
            } else {
                toast.error(response.error || 'Failed to update record');
            }
        } catch (error) {
            console.error('Error saving record:', error);
            toast.error('Failed to save record: ' + (error.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [refreshData]);

    /**
     * Handle delete record
     * @param {string|number} id - ID of record to delete
     */
    const handleDeleteRecord = useCallback(async (id) => {
        console.log(`[useEmailRecordActions] Deleting record with ID: ${id}`);
        if (!window.confirm('Are you sure you want to delete this record?')) {
            return;
        }

        setIsLoading(true);

        try {
            await deleteEmailRecord(id);
            toast.success('Record deleted successfully');
            refreshData(); // Reload data to reflect changes
        } catch (error) {
            console.error('Error deleting record:', error);
            toast.error('Failed to delete record');
        } finally {
            setIsLoading(false);
        }
    }, [refreshData]);

    /**
     * Handle delete selected records
     */
    const handleDeleteSelected = useCallback(async () => {
        if (selectedRows.length === 0) {
            toast.warning('Please select at least one record to delete');
            return;
        }

        console.log(`[useEmailRecordActions] Deleting ${selectedRows.length} selected records`);
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
            refreshData(); // Reload data to reflect changes
        } catch (error) {
            console.error('Error deleting records:', error);
            toast.error('Failed to delete selected records');
        } finally {
            setIsLoading(false);
        }
    }, [selectedRows, refreshData]);

    return {
        // State
        selectedRows,
        selectedFile,
        editingRecord,
        showEditModal,
        isLoading,
        
        // Actions
        handleFilePreview,
        handleRowSelect,
        handleEditRecord,
        handleSaveRecord,
        handleDeleteRecord,
        handleDeleteSelected,
        
        // Setters
        setSelectedFile,
        setShowEditModal,
    };
};

export default useEmailRecordActions;
