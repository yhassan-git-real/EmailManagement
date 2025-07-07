import { useState } from 'react';
import { 
  startAutomation,
  stopAutomation,
  restartFailedEmails,
  cleanupEmailArchive
} from '../../../utils/automationApi';

/**
 * Custom hook to manage automation actions and loading states
 * @param {Object} params - Parameters
 * @param {Function} params.setAutomationStatus - Function to update automation status
 * @param {Function} params.startPolling - Function to start status polling
 * @param {Function} params.stopPolling - Function to stop status polling
 * @param {Function} params.saveCleanup - Function to save cleanup settings
 * @returns {Object} Action handlers and loading states
 */
const useAutomationActions = ({ 
  setAutomationStatus, 
  startPolling, 
  stopPolling,
  saveCleanup,
  cleanupDays
}) => {
  // Loading states
  const [isLoading, setIsLoading] = useState({
    start: false,
    stop: false,
    restart: false,
    template: false,
    refresh: false,
    archive: false
  });
  
  // Handle starting automation
  const handleStartAutomation = async () => {
    setIsLoading({ ...isLoading, start: true });
    try {
      const response = await startAutomation();
      if (response.success) {
        // Update the status
        setAutomationStatus(response.data);
        
        // Start polling for status updates when automation starts
        startPolling();
      }
      return response;
    } catch (error) {
      console.error('Error starting automation:', error);
      return { success: false, error };
    } finally {
      setIsLoading({ ...isLoading, start: false });
    }
  };
  
  // Handle stopping automation
  const handleStopAutomation = async () => {
    setIsLoading({ ...isLoading, stop: true });
    try {
      const response = await stopAutomation();
      if (response.success) {
        setAutomationStatus(response.data);
        
        // Stop polling when automation is manually stopped
        stopPolling();
      }
      return response;
    } catch (error) {
      console.error('Error stopping automation:', error);
      return { success: false, error };
    } finally {
      setIsLoading({ ...isLoading, stop: false });
    }
  };
  
  // Handle restarting failed emails
  const handleRestartFailed = async () => {
    setIsLoading({ ...isLoading, restart: true });
    try {
      const response = await restartFailedEmails();
      if (response.success) {
        setAutomationStatus(response.data);
        
        // Start polling since automation will be running after restart
        startPolling();
      }
      return response;
    } catch (error) {
      console.error('Error restarting failed emails:', error);
      return { success: false, error };
    } finally {
      setIsLoading({ ...isLoading, restart: false });
    }
  };
  
  // Handle manual refresh of automation status
  const handleRefreshStatus = async (fetchAutomationStatus) => {
    setIsLoading({ ...isLoading, refresh: true });
    try {
      await fetchAutomationStatus();
      return { success: true };
    } catch (error) {
      console.error('Error refreshing status:', error);
      return { success: false, error };
    } finally {
      setIsLoading({ ...isLoading, refresh: false });
    }
  };
  
  // Handle email archive cleanup
  const handleCleanupArchive = async () => {
    setIsLoading({ ...isLoading, archive: true });
    try {
      // Send cleanup days to backend
      const response = await cleanupEmailArchive(cleanupDays);
      
      console.log('Archive cleanup response:', response); // Debug log
      
      if (response.success) {
        // Check if data exists and then access the property safely
        if (response.data) {
          const count = response.data.filesDeleted || response.filesDeleted || 0;
          
          // Save the cleanup days setting to persist it
          await saveCleanup();
        }
        return response;
      }
      return { success: false };
    } catch (error) {
      console.error('Error cleaning up archive:', error);
      return { success: false, error };
    } finally {
      setIsLoading({ ...isLoading, archive: false });
    }
  };
  
  return {
    isLoading,
    setIsLoading,
    handleStartAutomation,
    handleStopAutomation,
    handleRestartFailed,
    handleRefreshStatus,
    handleCleanupArchive
  };
};

export default useAutomationActions;
