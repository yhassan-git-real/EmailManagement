import { useState, useEffect, useRef } from 'react';
import { getAutomationStatus } from '../../../utils/automationApi';

/**
 * Custom hook to manage automation status and polling
 * @returns {Object} Status state and control functions
 */
const useAutomationStatus = () => {
  // Status state
  const [automationStatus, setAutomationStatus] = useState({
    status: 'idle',
    lastRun: null,
    summary: { processed: 0, successful: 0, failed: 0, pending: 0 }
  });
  
  // References for polling and previous status tracking
  const statusPollingRef = useRef(null);
  const previousStatusRef = useRef('idle');
  
  // Function to fetch automation status
  const fetchAutomationStatus = async () => {
    try {
      const response = await getAutomationStatus();
      if (response.success) {
        // Get the current status from response
        const newStatus = response.data.status;
        
        // Update the status
        setAutomationStatus(response.data);
        
        // Log status change for debugging
        console.log(`Status changed: ${previousStatusRef.current} -> ${newStatus}`);
        
        // Automation completion handling
        if ((previousStatusRef.current === 'running' || previousStatusRef.current === 'restarting') && 
            newStatus === 'idle') {
          // Stop polling when automation is finished
          stopPolling();
          console.log("Detected automation completion - stopping polling");
        }
        
        // Update previous status reference
        previousStatusRef.current = newStatus;
      }
    } catch (error) {
      console.error('Error fetching automation status:', error);
    }
  };
  
  // Start polling for status updates
  const startPolling = () => {
    // Clear any existing polling first
    stopPolling();
    
    // Set up new polling (every 5 seconds)
    statusPollingRef.current = setInterval(fetchAutomationStatus, 5000);
    console.log('Status polling started - interval ID:', statusPollingRef.current);
  };
  
  // Stop polling for status updates
  const stopPolling = () => {
    if (statusPollingRef.current !== null) {
      console.log('Stopping polling interval ID:', statusPollingRef.current);
      window.clearInterval(statusPollingRef.current);
      statusPollingRef.current = null;
      console.log('Status polling stopped');
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);
  
  // Manual refresh function
  const refreshStatus = async () => {
    await fetchAutomationStatus();
  };
  
  return {
    automationStatus,
    setAutomationStatus,
    fetchAutomationStatus,
    startPolling,
    stopPolling,
    refreshStatus,
    previousStatusRef
  };
};

export default useAutomationStatus;
