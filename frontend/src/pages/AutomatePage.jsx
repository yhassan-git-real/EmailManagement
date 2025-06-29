import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EmailSettingsModal from '../components/EmailSettingsModal';
import TemplateSelector from '../components/TemplateSelector';
import StatusBadge from '../components/StatusBadge';
import { CogIcon, PlayIcon, StopIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { 
  getEmailAutomationSettings, 
  saveEmailAutomationSettings,
  getAutomationStatus,
  startAutomation,
  stopAutomation,
  restartFailedEmails,
  updateRetrySettings,
  updateAutomationTemplate
} from '../utils/automationApi';

const AutomatePage = ({ connectionInfo, onDisconnect }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [automationSettings, setAutomationSettings] = useState({});
  const [automationStatus, setAutomationStatus] = useState({
    status: 'idle',
    lastRun: null,
    summary: { processed: 0, successful: 0, failed: 0, pending: 0 }
  });
  const [isLoading, setIsLoading] = useState({
    start: false,
    stop: false,
    restart: false,
    template: false,
    refresh: false
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
        
        // Show a toast notification when automation completes
        if ((previousStatusRef.current === 'running' || previousStatusRef.current === 'restarting') && 
            newStatus === 'idle') {
          const { successful, failed } = response.data.summary;
          toast.info(`Email automation completed! ${successful} successful, ${failed} failed emails.`);
          
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
  
  // Load automation settings and status
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load settings from localStorage first
        const savedSettings = localStorage.getItem('emailSettings');
        let localSettings = null;
        
        if (savedSettings) {
          try {
            localSettings = JSON.parse(savedSettings);
          } catch (e) {
            console.error('Error parsing saved email settings', e);
          }
        }
        
        const [settingsResponse, statusResponse] = await Promise.all([
          getEmailAutomationSettings(),
          getAutomationStatus()
        ]);
        
        if (settingsResponse.success) {
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
        
        if (statusResponse.success) {
          setAutomationStatus(statusResponse.data);
          
          // Update previous status reference
          previousStatusRef.current = statusResponse.data.status;
          
          // Only set up polling if automation is running or restarting
          if (statusResponse.data.status === 'running' || statusResponse.data.status === 'restarting') {
            console.log("Setting up initial polling - automation is running");
            startPolling();
          } else {
            console.log("Initial status is not running, no polling needed");
            stopPolling(); // Make sure polling is stopped
          }
        }
      } catch (error) {
        console.error('Error loading automation data:', error);
        toast.error('Failed to load automation data');
      }
    };
    
    loadData();
    
    // Cleanup the interval on unmount
    return () => {
      stopPolling();
    };
  }, []);
  
  // Handle saving email settings
  const handleSaveSettings = async (settings) => {
    try {
      const response = await saveEmailAutomationSettings(settings);
      if (response.success) {
        setAutomationSettings(response.data);
        setShowSettingsModal(false);
        toast.success('Email settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast.error('Failed to save email settings');
    }
  };
  
  // Handle starting automation
  const handleStartAutomation = async () => {
    setIsLoading({ ...isLoading, start: true });
    try {
      const response = await startAutomation();
      if (response.success) {
        // Update the status
        setAutomationStatus(response.data);
        
        // Update the previous status reference
        previousStatusRef.current = response.data.status;
        
        toast.success('Email automation started successfully');
        
        // Start polling for status updates when automation starts
        startPolling();
      }
    } catch (error) {
      console.error('Error starting automation:', error);
      toast.error('Failed to start email automation');
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
        toast.success('Email automation stopped successfully');
        
        // Stop polling when automation is manually stopped
        stopPolling();
      }
    } catch (error) {
      console.error('Error stopping automation:', error);
      toast.error('Failed to stop email automation');
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
        toast.success('Restarting failed emails');
        
        // Start polling since automation will be running after restart
        startPolling();
      }
    } catch (error) {
      console.error('Error restarting failed emails:', error);
      toast.error('Failed to restart failed emails');
    } finally {
      setIsLoading({ ...isLoading, restart: false });
    }
  };
  
  // Handle toggle retry on failure
  const handleToggleRetry = async (enabled) => {
    try {
      const response = await updateRetrySettings({
        retryOnFailure: enabled,
        retryInterval: automationSettings.retryInterval
      });
      
      if (response.success) {
        setAutomationSettings(response.data);
        toast.success(`Auto retry ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error updating retry settings:', error);
      toast.error('Failed to update retry settings');
    }
  };
  
  // Handle retry interval change
  const handleRetryIntervalChange = async (interval) => {
    try {
      const response = await updateRetrySettings({
        retryOnFailure: automationSettings.retryOnFailure,
        retryInterval: interval
      });
      
      if (response.success) {
        setAutomationSettings(response.data);
        toast.success(`Retry interval updated to ${interval}`);
      }
    } catch (error) {
      console.error('Error updating retry interval:', error);
      toast.error('Failed to update retry interval');
    }
  };
  
  // Handle template selection for automation
  const handleSelectTemplate = async (template) => {
    setIsLoading({ ...isLoading, template: true });
    try {
      const response = await updateAutomationTemplate(template.id);
      if (response.success) {
        setAutomationSettings(response.data);
        setShowTemplateSelector(false);
        toast.success(`Automation template set to "${template.name}"`);
      }
    } catch (error) {
      console.error('Error updating automation template:', error);
      toast.error('Failed to update automation template');
    } finally {
      setIsLoading({ ...isLoading, template: false });
    }
  };
  
  // Handle manual refresh of automation status
  const handleRefreshStatus = async () => {
    setIsLoading({ ...isLoading, refresh: true });
    try {
      await fetchAutomationStatus();
      toast.success('Status refreshed');
    } catch (error) {
      console.error('Error refreshing status:', error);
      toast.error('Failed to refresh status');
    } finally {
      setIsLoading({ ...isLoading, refresh: false });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />
        <div className="flex flex-row flex-grow relative">
        <main className="flex-grow py-3 px-4 bg-gradient-to-b from-gray-50 to-gray-100 w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full relative">
            <h1 className="text-sm font-medium mb-2 text-primary-600 pl-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Automate Email
            </h1>
            
            {/* Control Panel Card */}
            <div className="bg-white rounded-lg shadow mb-4">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-800">Email Automation Control Panel</h2>
                  <p className="text-sm text-gray-600">Start, stop, and monitor your email automation</p>
                </div>
                <StatusBadge status={automationStatus.status} />
              </div>
              
              <div className="p-5">                {/* Control Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={handleStartAutomation}
                    disabled={isLoading.start || automationStatus.status === 'running'}
                    className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      automationStatus.status === 'running' 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    {isLoading.start ? 'Starting...' : 'Start Automation'}
                  </button>
                  
                  <button
                    onClick={handleRestartFailed}
                    disabled={isLoading.restart || automationStatus.status === 'restarting' || automationStatus.summary.failed === 0}
                    className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      automationStatus.status === 'restarting' || automationStatus.summary.failed === 0
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                    }`}
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    {isLoading.restart ? 'Restarting...' : `Restart Failed (${automationStatus.summary.failed})`}
                  </button>
                  
                  <button
                    onClick={handleStopAutomation}
                    disabled={isLoading.stop || automationStatus.status !== 'running'}
                    className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      automationStatus.status !== 'running'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    }`}
                  >
                    <StopIcon className="h-5 w-5 mr-2" />
                    {isLoading.stop ? 'Stopping...' : 'Stop Automation'}
                  </button>
                  
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <CogIcon className="h-5 w-5 mr-2" />
                    Configure Email Settings
                  </button>
                  
                  <button
                    onClick={() => setShowTemplateSelector(true)}
                    className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Use Template
                  </button>
                  
                  <button
                    onClick={handleRefreshStatus}
                    disabled={isLoading.refresh}
                    className={`inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    {isLoading.refresh ? 'Refreshing...' : 'Refresh Status'}
                  </button>
                </div>
                
                {/* Status Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Total Processed</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-800">{automationStatus.summary.processed}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm border border-green-200">
                    <div className="text-sm font-medium text-green-800">Successful</div>
                    <div className="mt-1 text-2xl font-semibold text-green-700">{automationStatus.summary.successful}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 shadow-sm border border-red-200">
                    <div className="text-sm font-medium text-red-800">Failed</div>
                    <div className="mt-1 text-2xl font-semibold text-red-700">{automationStatus.summary.failed}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm border border-blue-200">
                    <div className="text-sm font-medium text-blue-800">Pending</div>
                    <div className="mt-1 text-2xl font-semibold text-blue-700">{automationStatus.summary.pending}</div>
                  </div>
                </div>
                  {/* Additional Settings */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Settings</h3>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="retryOnFailure"
                          checked={automationSettings.retryOnFailure || false}
                          onChange={(e) => handleToggleRetry(e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="retryOnFailure" className="ml-2 block text-sm text-gray-700">
                          Auto retry on failure
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <label htmlFor="retryInterval" className="block text-sm text-gray-700 mr-2">
                          Retry interval:
                        </label>
                        <select
                          id="retryInterval"
                          value={automationSettings.retryInterval || '15min'}
                          onChange={(e) => handleRetryIntervalChange(e.target.value)}
                          disabled={!automationSettings.retryOnFailure}
                          className="mt-1 block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        >
                          <option value="5min">5 minutes</option>
                          <option value="15min">15 minutes</option>
                          <option value="30min">30 minutes</option>
                          <option value="1hr">1 hour</option>
                          <option value="3hr">3 hours</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">Current template:</span>
                          <span className="ml-2 text-sm font-medium text-primary-600">
                            {automationSettings.templateId === 'default' ? 'Default Template' : 
                             automationSettings.templateId === 'followup' ? 'Follow-up Template' :
                             automationSettings.templateId === 'escalation' ? 'Escalation Template' :
                             automationSettings.templateId === 'reminder' ? 'Payment Reminder' :
                             'Custom Template'}
                          </span>
                        </div>
                        <button 
                          onClick={() => setShowTemplateSelector(true)}
                          className="text-xs text-primary-600 hover:text-primary-800"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Last Run Info */}
            {automationStatus.lastRun && (
              <div className="bg-white rounded-lg shadow p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Last Automation Run</h3>
                <p className="text-sm text-gray-600">
                  Started: {new Date(automationStatus.lastRun).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
        {/* Email Settings Modal */}
      {showSettingsModal && (
        <EmailSettingsModal 
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSaveSettings}
        />
      )}
      
      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          initialTemplateId={automationSettings.templateId || 'default'}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default AutomatePage;
