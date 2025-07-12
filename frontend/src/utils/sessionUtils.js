/**
 * Session storage utility functions for the EmailManagement application
 * These functions handle storing and retrieving data from session storage
 */

/**
 * Save database connection info to both session and local storage
 * @param {boolean} isConnected - Whether the user is connected to the database
 * @param {Object} connectionInfo - Database connection information
 */
export const saveConnectionToSession = (isConnected, connectionInfo) => {
  try {
    // Save to sessionStorage for same-tab persistence
    sessionStorage.setItem('isConnected', JSON.stringify(isConnected));
    sessionStorage.setItem('connectionInfo', JSON.stringify(connectionInfo));
    
    // Save to localStorage for cross-tab sharing
    localStorage.setItem('emailMgmt_isConnected', JSON.stringify(isConnected));
    localStorage.setItem('emailMgmt_connectionInfo', JSON.stringify(connectionInfo));
    localStorage.setItem('emailMgmt_lastActivity', Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Error saving connection to storage:', error);
    return false;
  }
};

/**
 * Load database connection info from session storage, fallback to localStorage
 * @returns {Object} Object containing isConnected and connectionInfo
 */
export const loadConnectionFromSession = () => {
  try {
    // Try sessionStorage first (same tab)
    let isConnected = JSON.parse(sessionStorage.getItem('isConnected'));
    let connectionInfo = JSON.parse(sessionStorage.getItem('connectionInfo'));
    
    // If not found in sessionStorage, try localStorage (cross-tab)
    if (!isConnected || !connectionInfo) {
      const lastActivity = parseInt(localStorage.getItem('emailMgmt_lastActivity') || '0');
      const currentTime = Date.now();
      const maxAge = 8 * 60 * 60 * 1000; // 8 hours
      
      // Check if localStorage data is still valid
      if (lastActivity && (currentTime - lastActivity) < maxAge) {
        isConnected = JSON.parse(localStorage.getItem('emailMgmt_isConnected'));
        connectionInfo = JSON.parse(localStorage.getItem('emailMgmt_connectionInfo'));
        
        // Update sessionStorage with localStorage data
        if (isConnected && connectionInfo) {
          sessionStorage.setItem('isConnected', JSON.stringify(isConnected));
          sessionStorage.setItem('connectionInfo', JSON.stringify(connectionInfo));
        }
      }
    }
    
    return { 
      isConnected: isConnected || false, 
      connectionInfo: connectionInfo || null 
    };
  } catch (error) {
    console.error('Error loading connection from storage:', error);
    return { isConnected: false, connectionInfo: null };
  }
};

/**
 * Clear database connection info from both session and local storage
 */
export const clearConnectionSession = () => {
  try {
    // Clear sessionStorage
    sessionStorage.removeItem('isConnected');
    sessionStorage.removeItem('connectionInfo');
    
    // Clear localStorage
    localStorage.removeItem('emailMgmt_isConnected');
    localStorage.removeItem('emailMgmt_connectionInfo');
    localStorage.removeItem('emailMgmt_lastActivity');
    
    return true;
  } catch (error) {
    console.error('Error clearing connection from storage:', error);
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

/**
 * Update activity timestamp to maintain localStorage session
 */
export const updateActivityTimestamp = () => {
  try {
    localStorage.setItem('emailMgmt_lastActivity', Date.now().toString());
    return true;
  } catch (error) {
    console.error('Error updating activity timestamp:', error);
    return false;
  }
};

/**
 * Check if the localStorage session is still valid
 * @param {number} maxAgeHours - Maximum age in hours (default: 8)
 * @returns {boolean} True if session is still valid
 */
export const isSessionValid = (maxAgeHours = 8) => {
  try {
    const lastActivity = parseInt(localStorage.getItem('emailMgmt_lastActivity') || '0');
    if (!lastActivity) return false;
    
    const currentTime = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    
    return (currentTime - lastActivity) < maxAge;
  } catch (error) {
    console.error('Error checking session validity:', error);
    return false;
  }
};
