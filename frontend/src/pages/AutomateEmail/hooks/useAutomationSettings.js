import { useState, useEffect } from 'react';
import { 
  getEmailAutomationSettings, 
  saveEmailAutomationSettings,
  updateRetrySettings,
  updateAutomationTemplate,
  saveCleanupSettings
} from '../../../utils/automationApi';

/**
 * Custom hook to manage automation settings
 * @returns {Object} Settings state and management functions
 */
const useAutomationSettings = () => {
  // Settings state
  const [automationSettings, setAutomationSettings] = useState({});
  const [cleanupDays, setCleanupDays] = useState(30);
  const [isCleanupConfigChanged, setIsCleanupConfigChanged] = useState(false);
  
  // Load settings from backend and localStorage
  const loadSettings = async () => {
    try {
      // Try to load settings from localStorage first
      const savedSettings = localStorage.getItem('emailSettings');
      let localSettings = null;
      
      if (savedSettings) {
        try {
          localSettings = JSON.parse(savedSettings);
          // Ensure specificEmails is an array if it exists in local settings
          if (localSettings.specificEmails && !Array.isArray(localSettings.specificEmails)) {
            if (typeof localSettings.specificEmails === 'string') {
              // Convert comma-separated string to array if needed
              localSettings.specificEmails = localSettings.specificEmails
                .split(',')
                .map(email => email.trim())
                .filter(email => email.length > 0);
            } else {
              // If it's neither an array nor a string, initialize as empty array
              localSettings.specificEmails = [];
            }
          }
        } catch (e) {
          console.error('Error parsing saved email settings', e);
        }
      }
      
      const settingsResponse = await getEmailAutomationSettings();
      
      if (settingsResponse.success) {
        // Ensure specificEmails is an array in backend response
        if (settingsResponse.data.specificEmails && !Array.isArray(settingsResponse.data.specificEmails)) {
          if (typeof settingsResponse.data.specificEmails === 'string') {
            // Convert comma-separated string to array if needed
            settingsResponse.data.specificEmails = settingsResponse.data.specificEmails
              .split(',')
              .map(email => email.trim())
              .filter(email => email.length > 0);
          } else {
            // If it's neither an array nor a string, initialize as empty array
            settingsResponse.data.specificEmails = [];
          }
        } else if (!settingsResponse.data.specificEmails) {
          // Initialize as empty array if undefined
          settingsResponse.data.specificEmails = [];
        }
        
        // Merge backend settings with locally stored email settings
        const mergedSettings = {
          ...settingsResponse.data,
          ...(localSettings || {})
        };
        setAutomationSettings(mergedSettings);
      } else if (localSettings) {
        // Fall back to local settings if backend request fails
        setAutomationSettings(localSettings);
      }
      
      return settingsResponse.success ? settingsResponse.data : localSettings;
    } catch (error) {
      console.error('Error loading automation settings:', error);
      return null;
    }
  };
  
  // Save settings
  const saveSettings = async (settings) => {
    try {
      // Ensure specificEmails is always an array before saving
      const settingsToSave = { ...settings };
      
      if (settingsToSave.specificEmails) {
        if (!Array.isArray(settingsToSave.specificEmails)) {
          if (typeof settingsToSave.specificEmails === 'string') {
            // Convert comma-separated string to array if needed
            settingsToSave.specificEmails = settingsToSave.specificEmails
              .split(',')
              .map(email => email.trim())
              .filter(email => email.length > 0);
          } else {
            // If it's neither an array nor a string, initialize as empty array
            settingsToSave.specificEmails = [];
          }
        }
      } else if (settingsToSave.sharingOption === 'specific') {
        // If sharing option is 'specific' but no emails provided, initialize as empty array
        settingsToSave.specificEmails = [];
      }
      
      const response = await saveEmailAutomationSettings(settingsToSave);
      if (response.success) {
        // Ensure specificEmails is an array in the response
        if (response.data.specificEmails && !Array.isArray(response.data.specificEmails)) {
          response.data.specificEmails = Array.isArray(settingsToSave.specificEmails) ? 
            settingsToSave.specificEmails : [];
        }
        
        setAutomationSettings(response.data);
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error('Error saving email settings:', error);
      return { success: false, error };
    }
  };
  
  // Update retry settings
  const updateRetry = async (enabled, interval) => {
    try {
      const response = await updateRetrySettings({
        retryOnFailure: enabled !== undefined ? enabled : automationSettings.retryOnFailure,
        retryInterval: interval !== undefined ? interval : automationSettings.retryInterval
      });
      
      if (response.success) {
        setAutomationSettings(response.data);
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating retry settings:', error);
      return { success: false, error };
    }
  };
  
  // Update template
  const updateTemplate = async (templateId) => {
    try {
      const response = await updateAutomationTemplate(templateId);
      if (response.success) {
        // Make sure the templateId is correctly updated in automationSettings
        setAutomationSettings(prevSettings => ({
          ...prevSettings,
          templateId: templateId
        }));
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error('Error updating automation template:', error);
      return { success: false, error };
    }
  };
  
  // Update cleanup settings
  const updateCleanupSettings = async (days) => {
    if (days !== undefined) {
      setCleanupDays(days);
      setIsCleanupConfigChanged(true);
    }
  };
  
  // Save cleanup settings
  const saveCleanup = async () => {
    try {
      const response = await saveCleanupSettings({ cleanupDays });
      if (response.success) {
        setIsCleanupConfigChanged(false);
        return { success: true, data: response.data };
      }
      return { success: false };
    } catch (error) {
      console.error('Error saving cleanup settings:', error);
      return { success: false, error };
    }
  };
  
  return {
    automationSettings,
    setAutomationSettings,
    cleanupDays,
    setCleanupDays,
    isCleanupConfigChanged,
    setIsCleanupConfigChanged,
    loadSettings,
    saveSettings,
    updateRetry,
    updateTemplate,
    updateCleanupSettings,
    saveCleanup
  };
};

export default useAutomationSettings;
