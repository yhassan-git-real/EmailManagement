import { useState, useCallback } from 'react';
import { fetchDashboardMetrics } from '../utils/apiClient';
import { saveToSessionStorage, loadFromSessionStorage, isDataStale } from '../utils/sessionUtils';

// Session storage keys
const DASHBOARD_DATA_KEY = 'dashboardData';
const DASHBOARD_TIMESTAMP_KEY = 'dashboardDataTimestamp';

/**
 * Custom hook for managing dashboard data
 * Only fetches data on manual trigger, not automatically
 */
const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState(() => {
    // Try to load from session storage on initial render
    const cachedData = loadFromSessionStorage(DASHBOARD_DATA_KEY);
    return cachedData || null;
  });
  
  const [lastUpdated, setLastUpdated] = useState(() => {
    const timestamp = loadFromSessionStorage(DASHBOARD_TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp).toLocaleString() : null;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Fetch dashboard data with optional date range
   * This is only triggered manually, never automatically
   */
  const fetchData = useCallback(async (startDate = null, endDate = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch fresh data from API
      const data = await fetchDashboardMetrics(startDate, endDate);
      
      // Update state with new data
      setDashboardData(data);
      
      // Save to session storage
      saveToSessionStorage(DASHBOARD_DATA_KEY, data);
      
      // Update timestamp
      const now = new Date();
      saveToSessionStorage(DASHBOARD_TIMESTAMP_KEY, now.toISOString());
      setLastUpdated(now.toLocaleString());
      
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    dashboardData,
    lastUpdated,
    loading,
    error,
    fetchData
  };
};

export default useDashboardData;
