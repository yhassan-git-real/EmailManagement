import { API_BASE_URL } from './constants';

/**
 * Fetch email records from the database
 * @param {number} page - The page number to fetch
 * @param {number} pageSize - Number of records per page
 * @param {string} searchTerm - Optional search term to filter records
 * @param {string} status - Optional status filter ('All', 'Pending', 'Success', 'Failed')
 * @returns {Promise<Object>} - The response with email records data
 */
export const fetchEmailTableData = async (page = 1, pageSize = 10, searchTerm = '', status = null) => {
    try {
        console.log(`[API] fetchEmailTableData called with page=${page}, pageSize=${pageSize}, searchTerm='${searchTerm}', status=${status || 'All'}`);

        // Ensure page is a valid number and force to integer
        const currentPage = parseInt(page, 10) || 1;

        // Calculate offset for pagination - ensure it's an integer
        const offset = (currentPage - 1) * pageSize;

        let url = `${API_BASE_URL}/api/email/records?limit=${pageSize}&offset=${offset}`;

        // If search term is provided, add it to the query
        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        // If status filter is provided, add it to the query
        if (status && status !== 'All') {
            url += `&status=${encodeURIComponent(status)}`;
        }

        console.log(`[API] Making fetch request to: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API] Error response (${response.status}):`, errorText);
            throw new Error(`Failed to fetch email records (${response.status})`);
        }

        const responseData = await response.json();
        console.log(`[API] Response data:`, responseData);

        // Check if response has the new format (success and data fields)
        if (responseData && responseData.success && responseData.data) {
            return {
                success: true,
                data: {
                    rows: responseData.data.rows || [],
                    total: responseData.data.total || 0,
                    page: currentPage,
                    pageSize: pageSize,
                    totalPages: Math.ceil((responseData.data.total || 0) / pageSize)
                }
            };
        } else {
            // Handle legacy format or unexpected response
            const formattedData = Array.isArray(responseData) ? responseData : [];
            console.warn(`[API] Response in unexpected format:`, responseData);

            return {
                success: true,
                data: {
                    rows: formattedData,
                    total: formattedData.length > pageSize ? 1000 : formattedData.length, // Estimate
                    page: currentPage,
                    pageSize: pageSize,
                    totalPages: Math.ceil(formattedData.length / pageSize)
                }
            };
        }
    } catch (error) {
        console.error('[API] Error fetching email records:', error);
        return {
            success: false,
            message: error.message || 'An unknown error occurred while fetching email records',
            data: {
                rows: [],
                total: 0,
                page: page,
                pageSize: pageSize,
                totalPages: 0
            }
        };
    }
};

/**
 * Update the status of an email record
 * @param {string|number} id - The ID of the email record to update
 * @param {string} status - The new status value ('Pending', 'Success', 'Failed')
 * @returns {Promise<Object>} - Response indicating success or failure
 */
export const updateEmailRecordStatus = async (id, status) => {
    try {
        console.log(`[API] updateEmailRecordStatus called with id=${id}, status=${status}`);

        if (!id) {
            throw new Error('Email record ID is required');
        }

        const validStatuses = ['Pending', 'Success', 'Failed'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status. Must be one of: Pending, Success, Failed');
        }

        const url = `${API_BASE_URL}/api/email/records/${id}/status`;
        console.log(`[API] Making PATCH request to: ${url}`);

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                const errorData = JSON.parse(errorText);
                console.error(`[API] Error response (${response.status}):`, errorData);
                throw new Error(errorData.message || `Failed to update status (${response.status})`);
            } catch (parseError) {
                console.error(`[API] Error response (${response.status}):`, errorText);
                throw new Error(`Failed to update status (${response.status}): ${errorText}`);
            }
        }

        const responseData = await response.json();
        console.log(`[API] Status update response:`, responseData);

        return {
            success: true,
            message: 'Status updated successfully'
        };
    } catch (error) {
        console.error('[API] Error updating status:', error);
        return {
            success: false,
            message: error.message || 'An unknown error occurred while updating the status'
        };
    }
};

/**
 * Update an email record
 * @param {string|number} id - The ID of the email record to update
 * @param {Object} data - The updated record data
 * @returns {Promise<Object>} - Response indicating success or failure
 */
export const updateEmailRecord = async (id, data) => {
    try {
        if (!id) {
            throw new Error('Email record ID is required');
        }

        const response = await fetch(`${API_BASE_URL}/api/email/records/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update record (${response.status})`);
        }

        return {
            success: true,
            message: 'Record updated successfully'
        };
    } catch (error) {
        console.error('Error updating record:', error);
        return {
            success: false,
            message: error.message || 'An unknown error occurred while updating the record'
        };
    }
};

/**
 * Delete an email record
 * @param {string|number} id - The ID of the email record to delete
 * @returns {Promise<Object>} - Response indicating success or failure
 */
export const deleteEmailRecord = async (id) => {
    try {
        if (!id) {
            throw new Error('Email record ID is required');
        }

        const response = await fetch(`${API_BASE_URL}/api/email/records/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to delete record (${response.status})`);
        }

        return {
            success: true,
            message: 'Record deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting record:', error);
        return {
            success: false,
            message: error.message || 'An unknown error occurred while deleting the record'
        };
    }
};

// createEmailRecord function has been removed as part of the Email Records feature refactoring
// New records should now be added directly to the database using SQL
