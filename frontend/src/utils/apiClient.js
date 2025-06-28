/**
 * API client functions for the EmailManagement application
 * These functions connect to the real backend API
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Test the database connection with provided credentials
 * @param {Object} credentials - Database connection credentials
 * @returns {Promise} - Promise with the response
 */
export const testDatabaseConnection = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/database/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server: credentials.serverName,
        database: credentials.databaseName,
        username: credentials.username,
        password: credentials.password
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to test database connection');
    }

    if (!data.success) {
      throw new Error(data.message || 'Connection test failed');
    }

    return {
      success: data.success,
      message: data.message,
      details: {
        server: credentials.serverName,
        database: credentials.databaseName,
        status: data.success ? 'Available' : 'Unavailable'
      }
    };
  } catch (error) {
    throw {
      success: false,
      message: error.message || 'An error occurred while testing the connection'
    };
  }
};

/**
 * Connect to the database with provided credentials
 * Note: For now, this uses the same endpoint as the test connection
 * In a real implementation, this would create a session or store the connection info
 * @param {Object} credentials - Database connection credentials
 * @returns {Promise} - Promise with the response
 */
export const connectToDatabase = async (credentials) => {
  try {
    // We're using the same test endpoint for now
    // In a real implementation, you might have a separate endpoint for establishing a session
    const response = await testDatabaseConnection(credentials);
    
    return {
      success: true,
      message: 'Successfully connected to database',
      connectionInfo: {
        serverName: credentials.serverName,
        databaseName: credentials.databaseName,
        username: credentials.username,
        connectedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch email status summary from the API
 * @returns {Promise} - Promise with email status data
 */
export const fetchEmailStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/status-summary`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch email status');
    }
    
    const data = await response.json();
    
    return {
      total: data.total || 0,
      pending: data.pending || 0,
      success: data.success || 0,
      sent: data.success || 0, // Added sent as an alias for success for the UI
      failed: data.failed || 0,
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error('Error fetching email status:', error);
    throw error;
  }
};

/**
 * Fetch email records from the API
 * @param {Object} options - Filter options like status
 * @returns {Promise} - Promise with email records
 */
export const fetchEmailRecords = async (options = {}) => {
  try {
    let url = `${API_BASE_URL}/api/email/records`;
    
    // Add query parameters if options provided
    if (Object.keys(options).length > 0) {
      url += '?';
      const params = [];
      if (options.status) params.push(`status=${options.status}`);
      if (options.limit) params.push(`limit=${options.limit}`);
      if (options.offset) params.push(`offset=${options.offset}`);
      url += params.join('&');
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch email records');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching email records:', error);
    throw error;
  }
};
