/**
 * Session storage utility functions for the EmailManagement application
 * These functions handle storing and retrieving data from session storage
 */

/**
 * Save database connection info to session storage
 * @param {boolean} isConnected - Whether the user is connected to the database
 * @param {Object} connectionInfo - Database connection information
 */
export const saveConnectionToSession = (isConnected, connectionInfo) => {
  try {
    sessionStorage.setItem('isConnected', JSON.stringify(isConnected));
    sessionStorage.setItem('connectionInfo', JSON.stringify(connectionInfo));
    return true;
  } catch (error) {
    console.error('Error saving connection to session storage:', error);
    return false;
  }
};

/**
 * Load database connection info from session storage
 * @returns {Object} Object containing isConnected and connectionInfo
 */
export const loadConnectionFromSession = () => {
  try {
    const isConnected = JSON.parse(sessionStorage.getItem('isConnected')) || false;
    const connectionInfo = JSON.parse(sessionStorage.getItem('connectionInfo')) || null;
    return { isConnected, connectionInfo };
  } catch (error) {
    console.error('Error loading connection from session storage:', error);
    return { isConnected: false, connectionInfo: null };
  }
};

/**
 * Clear database connection info from session storage
 */
export const clearConnectionSession = () => {
  try {
    sessionStorage.removeItem('isConnected');
    sessionStorage.removeItem('connectionInfo');
    return true;
  } catch (error) {
    console.error('Error clearing connection from session storage:', error);
    return false;
  }
};

/**
 * Save email status data to session storage
 * @param {Object} statusData - Email status data
 */
export const saveEmailStatusToSession = (statusData) => {
  try {
    sessionStorage.setItem('emailStatusData', JSON.stringify(statusData));
    sessionStorage.setItem('emailStatusLastUpdated', new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Error saving email status to session storage:', error);
    return false;
  }
};

/**
 * Load email status data from session storage
 * @returns {Object} Email status data or null if not found
 */
export const loadEmailStatusFromSession = () => {
  try {
    const statusData = JSON.parse(sessionStorage.getItem('emailStatusData'));
    const lastUpdated = sessionStorage.getItem('emailStatusLastUpdated');
    return { statusData, lastUpdated };
  } catch (error) {
    console.error('Error loading email status from session storage:', error);
    return { statusData: null, lastUpdated: null };
  }
};

/**
 * Check if the cached email status data is stale (older than specified minutes)
 * @param {number} maxAgeMinutes - Maximum age of the data in minutes
 * @returns {boolean} True if the data is stale or doesn't exist
 */
export const isEmailStatusStale = (maxAgeMinutes = 5) => {
  try {
    const lastUpdated = sessionStorage.getItem('emailStatusLastUpdated');
    if (!lastUpdated) return true;
    
    const lastUpdatedTime = new Date(lastUpdated).getTime();
    const currentTime = new Date().getTime();
    const maxAgeMs = maxAgeMinutes * 60 * 1000;
    
    return (currentTime - lastUpdatedTime) > maxAgeMs;
  } catch (error) {
    console.error('Error checking if email status is stale:', error);
    return true; // Default to stale on error
  }
};
