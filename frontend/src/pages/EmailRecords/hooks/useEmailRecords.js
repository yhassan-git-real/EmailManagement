import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { fetchEmailTableData } from '../../../utils/emailRecordsApi';

/**
 * Custom hook for managing email records data and state
 * @param {number} initialPageSize - Default page size for pagination
 * @returns {Object} - Email records state and functions
 */
const useEmailRecords = (initialPageSize = 10) => {
    // State for data management
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(initialPageSize);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLocalFiltering, setIsLocalFiltering] = useState(false);

    // Refs to prevent race conditions and track loading state
    const loadingRef = useRef(false);
    const mountedRef = useRef(true);

    // Clean up effect when the component unmounts
    useEffect(() => {
        console.log("[useEmailRecords] Hook initialized");

        // Set mounted flag
        mountedRef.current = true;

        return () => {
            console.log("[useEmailRecords] Hook cleanup");
            mountedRef.current = false;
        };
    }, []);

    /**
     * Load email records data from the API
     * @param {number} pageToLoad - Page number to load
     */
    const loadTableData = useCallback(async (pageToLoad = currentPage) => {
        console.log(`[useEmailRecords] Loading data for page ${pageToLoad}, status: ${statusFilter}, search: ${searchTerm}`);

        // Important to check if we're still mounted before starting
        if (!mountedRef.current) {
            console.log('[useEmailRecords] Component not mounted, skipping data load');
            return;
        }

        if (loadingRef.current) {
            console.log('[useEmailRecords] Already loading data, skipping request');
            return;
        }

        loadingRef.current = true;
        setIsLoading(true);

        try {
            console.log(`[useEmailRecords] Making API call to fetchEmailTableData(${pageToLoad}, ${pageSize}, ${searchTerm}, ${statusFilter})`);
            const response = await fetchEmailTableData(pageToLoad, pageSize, searchTerm, statusFilter);
            console.log('[useEmailRecords] API response:', response);

            // Double-check component is still mounted
            if (!mountedRef.current) {
                console.log('[useEmailRecords] Component unmounted, ignoring response');
                return;
            }

            console.log('[useEmailRecords] Component still mounted, processing response');

            // Handle missing records
            if (!response || !response.data || !response.data.rows) {
                console.error('[useEmailRecords] No records found in response:', response);
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
    }, [currentPage, pageSize, searchTerm, statusFilter]);



    /**
     * Apply client-side filtering based on search term
     * @param {string} term - Search term to filter by
     */
    const applyClientSideFilter = useCallback((term) => {
        console.log(`[useEmailRecords] Applying client-side filter: "${term}"`);
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
    }, [tableData]);

    /**
     * Handle search - applies client-side filtering immediately
     * @param {string} term - Search term
     */
    const handleSearch = useCallback((term) => {
        console.log(`[useEmailRecords] Search term set to: ${term}`);
        setSearchTerm(term);
        applyClientSideFilter(term);
    }, [applyClientSideFilter]);

    /**
     * Handle status filter change
     * @param {string} status - Status filter value
     */
    const handleStatusFilterChange = useCallback((status) => {
        console.log(`[useEmailRecords] Status filter set to: ${status}`);
        setStatusFilter(status);
        // Don't automatically load data, wait for Execute button
    }, []);

    /**
     * Handle page change for pagination
     * @param {number} newPage - New page number
     */
    const handlePageChange = useCallback((newPage) => {
        console.log(`[useEmailRecords] Page changed to ${newPage}`);
        setCurrentPage(newPage);
        loadTableData(newPage);
    }, [loadTableData]);

    /**
     * Execute server-side filtering
     */
    const handleExecuteFilter = useCallback(() => {
        console.log(`[useEmailRecords] Execute button clicked with filters: status=${statusFilter}, search=${searchTerm}`);
        setCurrentPage(1); // Reset to first page
        setIsLocalFiltering(false); // Disable local filtering when executing server search
        loadTableData(1); // Load first page with current filters
    }, [loadTableData, searchTerm, statusFilter]);

    /**
     * Clear all filters and reset to default state
     */
    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setStatusFilter('All');
        setIsLocalFiltering(false);
        setFilteredData([...tableData]);
    }, [tableData]);

    return {
        // Data
        tableData,
        filteredData,
        totalRows,
        currentPage,
        pageSize,
        isLoading,
        searchTerm,
        statusFilter,
        isLocalFiltering,

        // Actions
        loadTableData,
        handleSearch,
        handleStatusFilterChange,
        handlePageChange,
        handleExecuteFilter,
        clearFilters,
        applyClientSideFilter,
        setSearchTerm,
    };
};

export default useEmailRecords;
