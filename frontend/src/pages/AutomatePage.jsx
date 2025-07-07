import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EmailSettingsModal from '../components/EmailSettingsModal';
import TemplateSelector from '../components/TemplateSelector';
import StatusBadge from '../components/StatusBadge';
import EmailLogViewer from '../components/EmailLogViewer';
import SchedulerSettings from '../components/SchedulerSettings';
import Breadcrumb, { HomeIcon } from '../components/Breadcrumb';
import { CogIcon, PlayIcon, StopIcon, ArrowPathIcon, DocumentTextIcon, TrashIcon, InformationCircleIcon, ChartBarIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { CogIcon as CogIconSolid, PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid';
import { 
  getEmailAutomationSettings, 
  saveEmailAutomationSettings,
  getAutomationStatus,
  startAutomation,
  stopAutomation,
  restartFailedEmails,
  updateRetrySettings,
  updateAutomationTemplate,
  cleanupEmailArchive,
  saveCleanupSettings
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
    refresh: false,
    archive: false
  });
  const [cleanupDays, setCleanupDays] = useState(30);
  const [isCleanupConfigChanged, setIsCleanupConfigChanged] = useState(false);
  
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
        
        // Automation completion handling (removed toast notification)
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
        // Removed toast notification as per requirement
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
        // Removed toast notification as per requirement
      }
    } catch (error) {
      console.error('Error saving email settings:', error);
      // Removed toast notification as per requirement
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
        
        // Removed toast notification as per requirement
        
        // Start polling for status updates when automation starts
        startPolling();
      }
    } catch (error) {
      console.error('Error starting automation:', error);
      // Removed toast notification as per requirement
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
        // Removed toast notification as per requirement
        
        // Stop polling when automation is manually stopped
        stopPolling();
      }
    } catch (error) {
      console.error('Error stopping automation:', error);
      // Removed toast notification as per requirement
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
        // Removed toast notification as per requirement
        
        // Start polling since automation will be running after restart
        startPolling();
      }
    } catch (error) {
      console.error('Error restarting failed emails:', error);
      // Removed toast notification as per requirement
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
        // Removed toast notification as per requirement
      }
    } catch (error) {
      console.error('Error updating retry settings:', error);
      // Removed toast notification as per requirement
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
        // Removed toast notification as per requirement
      }
    } catch (error) {
      console.error('Error updating retry interval:', error);
      // Removed toast notification as per requirement
    }
  };
  
  // Handle template selection for automation
  const handleSelectTemplate = async (template) => {
    setIsLoading({ ...isLoading, template: true });
    try {
      const response = await updateAutomationTemplate(template.id);
      if (response.success) {
        // Make sure the templateId is correctly updated in automationSettings
        setAutomationSettings(prevSettings => ({
          ...prevSettings,
          templateId: template.id
        }));
        setShowTemplateSelector(false);
        // Removed toast notification as per requirement
      }
    } catch (error) {
      console.error('Error updating automation template:', error);
      // Removed toast notification as per requirement
    } finally {
      setIsLoading({ ...isLoading, template: false });
    }
  };
  
  // Handle manual refresh of automation status
  const handleRefreshStatus = async () => {
    setIsLoading({ ...isLoading, refresh: true });
    try {
      await fetchAutomationStatus();
      // Removed toast notification as per requirement
    } catch (error) {
      console.error('Error refreshing status:', error);
      // Removed toast notification as per requirement
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
          // Removed toast notification as per requirement
          
          // Reset the change flag after successful cleanup
          setIsCleanupConfigChanged(false);
          
          // Save the cleanup days setting to persist it
          await saveCleanupSettings({ cleanupDays });
        } else {
          // Fallback if data structure is different than expected
          // Removed toast notification as per requirement
        }
      } else {
        // Removed toast notification as per requirement
      }
    } catch (error) {
      console.error('Error cleaning up archive:', error);
      // Removed toast notification as per requirement
    } finally {
      setIsLoading({ ...isLoading, archive: false });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />
      <div className="flex flex-row flex-grow relative">
        <main className="flex-grow py-3 px-3 w-full animate-fadeIn">
          <div className="w-full max-w-full mx-auto px-2">
            {/* Breadcrumb Navigation */}
            <Breadcrumb
              items={[
                { label: 'Home', path: '/home', icon: <HomeIcon /> },
                { label: 'Automate Email', path: '/automate' }
              ]}
            />
            
            {/* Control Panel Card - Enhanced with modern UI */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 mb-6 border border-gray-100">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center">
                  <div className="mr-4 bg-gradient-to-br from-primary-500 to-primary-600 text-white p-3 rounded-lg shadow-sm transform transition-all duration-300 hover:scale-105 hover:rotate-3">
                    <CogIconSolid className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Email Automation Control Panel</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Start, stop, and monitor your email automation workflow</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm font-semibold text-primary-600 mr-3 hidden sm:flex items-center bg-primary-50 px-2.5 py-1 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Automation Status
                  </div>
                  <StatusBadge status={automationStatus.status} />
                </div>
              </div>
              
              <div className="p-5">                
                {/* Control Buttons - Enhanced with modern UI, tooltips, and improved responsive layout */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button
                    onClick={handleStartAutomation}
                    disabled={isLoading.start || automationStatus.status === 'running'}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 hover:shadow"
                    title="Process only pending emails, never emails with status 'Failed' or 'Success'"
                  >
                    <div className="relative">
                      <PlayIcon className={`h-5 w-5 mr-2 transition-transform duration-200 ${!isLoading.start && automationStatus.status !== 'running' ? 'group-hover:scale-110' : ''}`} />
                      {isLoading.start && <span className="absolute inset-0 flex items-center justify-center animate-ping h-2 w-2 rounded-full bg-white opacity-75"></span>}
                    </div>
                    <span>{isLoading.start ? 'Starting...' : 'Start Pending Emails'}</span>
                  </button>
                  
                  <button
                    onClick={handleRestartFailed}
                    disabled={isLoading.restart || automationStatus.status === 'restarting'}
                    className={`group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${
                      automationStatus.status === 'restarting'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500 hover:shadow'
                    }`}
                    title="Process only emails with status 'Failed', never pending emails"
                  >
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading.restart ? 'animate-spin' : 'group-hover:animate-spin-slow'}`} />
                    <span>{isLoading.restart ? 'Restarting...' : `Restart Failed${automationStatus.summary.failed > 0 ? ` (${automationStatus.summary.failed})` : ''}`}</span>
                  </button>
                  
                  <button
                    onClick={handleStopAutomation}
                    disabled={isLoading.stop || automationStatus.status !== 'running'}
                    className={`group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${
                      automationStatus.status !== 'running'
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 hover:shadow'
                    }`}
                  >
                    <StopIcon className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
                    <span>{isLoading.stop ? 'Stopping...' : 'Stop Automation'}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="group inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:border-primary-200 hover:shadow"
                  >
                    <CogIcon className="h-5 w-5 mr-2 text-gray-500 transition-transform duration-300 group-hover:rotate-45 group-hover:text-primary-500" />
                    <span>Configure Email Settings</span>
                  </button>
                  
                  <button
                    onClick={() => setShowTemplateSelector(true)}
                    className="group inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:border-primary-200 hover:shadow"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500 transition-transform duration-200 group-hover:scale-110 group-hover:text-primary-500" />
                    <span>Use Template Editor</span>
                  </button>
                  
                  <button
                    onClick={handleRefreshStatus}
                    disabled={isLoading.refresh}
                    className="group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"
                  >
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading.refresh ? 'animate-spin' : 'group-hover:animate-spin-slow'}`} />
                    <span>{isLoading.refresh ? 'Refreshing...' : 'Refresh Status'}</span>
                  </button>
                </div>
                
                <hr className="my-6 border-t border-gray-200" />
                
                {/* Status Summary */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <ChartBarIcon className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-base font-semibold text-gray-800">Email Status Summary</h3>

                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:border-green-300 animate-fadeIn" style={{ animationDelay: '0ms' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Success</span>
                        <div className="bg-white bg-opacity-80 rounded-full p-1">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                      <div className="mt-3 text-3xl font-bold text-green-700 flex items-baseline">
                        <span className="animate-fadeIn">{automationStatus.summary.successful}</span>
                        <span className="text-xs ml-1 text-green-600 font-normal">emails</span>
                      </div>
                      <div className="mt-2 h-1 w-full bg-green-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (automationStatus.summary.successful / Math.max(1, automationStatus.summary.total)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:border-red-300 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">Failed</span>
                        <div className="bg-white bg-opacity-80 rounded-full p-1">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                        </div>
                      </div>
                      <div className="mt-3 text-3xl font-bold text-red-700 flex items-baseline">
                        <span className="animate-fadeIn">{automationStatus.summary.failed}</span>
                        <span className="text-xs ml-1 text-red-600 font-normal">emails</span>
                      </div>
                      <div className="mt-2 h-1 w-full bg-red-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (automationStatus.summary.failed / Math.max(1, automationStatus.summary.total)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:border-amber-300 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-amber-800">Pending</span>
                        <div className="bg-white bg-opacity-80 rounded-full p-1">
                          <ClockIcon className="h-5 w-5 text-amber-500" />
                        </div>
                      </div>
                      <div className="mt-3 text-3xl font-bold text-amber-700 flex items-baseline">
                        <span className="animate-fadeIn">{automationStatus.summary.pending}</span>
                        <span className="text-xs ml-1 text-amber-600 font-normal">emails</span>
                      </div>
                      <div className="mt-2 h-1 w-full bg-amber-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (automationStatus.summary.pending / Math.max(1, automationStatus.summary.total)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-300 animate-fadeIn" style={{ animationDelay: '300ms' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Total</span>
                        <div className="bg-white bg-opacity-80 rounded-full p-1">
                          <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>
                      <div className="mt-3 text-3xl font-bold text-blue-700 flex items-baseline">
                        <span className="animate-fadeIn">{automationStatus.summary.total}</span>
                        <span className="text-xs ml-1 text-blue-600 font-normal">emails</span>
                      </div>
                      <div className="mt-2 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <hr className="my-6 border-t border-gray-200" />
                
                {/* Template Settings */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mb-6 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="bg-blue-600/10 px-4 py-2 border-b border-blue-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-sm font-semibold text-blue-800">Email Automation Template</h3>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center">
                          <span className="text-base font-medium text-gray-900">
                            {automationSettings.templateId === 'default' ? 'Default Template' : 
                             automationSettings.templateId === 'followup' ? 'Follow-up Template' :
                             automationSettings.templateId === 'escalation' ? 'Escalation Template' :
                             automationSettings.templateId === 'reminder' ? 'Payment Reminder Template' :
                             'Custom Template'}
                          </span>
                          {automationSettings.templateId === 'custom' && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {automationSettings.templateId === 'default' ? 'Standard email format with company branding' : 
                           automationSettings.templateId === 'followup' ? 'Template for following up on previous communications' :
                           automationSettings.templateId === 'escalation' ? 'Escalation template for urgent matters' :
                           automationSettings.templateId === 'reminder' ? 'Template for payment reminders' :
                           'Custom template with specialized formatting'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowTemplateSelector(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Change Template
                      </button>
                    </div>
                  </div>
                </div>
                
                <hr className="my-6 border-t border-gray-200" />
                
                {/* Scheduler Settings */}
                <SchedulerSettings onSettingsChange={(updatedSettings) => console.log("Scheduler settings updated:", updatedSettings)} />
                
                <hr className="my-6 border-t border-gray-200" />
                
                {/* Email Archive Cleanup */}
                <div className="mt-10 mb-10">
                  <div className="flex items-center mb-4">
                    <TrashIcon className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-base font-semibold text-gray-800">Local Archive Folder Management</h3>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '150ms' }}>
                    <div className="flex flex-col sm:flex-row sm:items-start md:items-center sm:justify-between gap-4 sm:gap-6">
                      <div className="max-w-lg">
                        <p className="text-sm leading-relaxed text-gray-600 font-medium hover:text-gray-800 transition-colors duration-200">
                          Keep your local archive folder optimized by removing old processed emails.
                          This helps maintain system performance and reduces local storage requirements.
                        </p>
                        <div className="mt-4 flex items-center flex-wrap">
                          <label htmlFor="cleanupDays" className="block text-base font-medium text-gray-700 mr-3 whitespace-nowrap mb-2 sm:mb-0 hover:text-primary-600 transition-colors duration-200">
                            Remove Zip files older than:
                          </label>
                          <div className="flex items-center">
                            <div className="flex items-center rounded-md shadow-sm border border-gray-300 bg-white hover:border-primary-400 hover:shadow transition-all duration-200">
                              {/* Minus button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const current = parseInt(cleanupDays) || 0;
                                  const newValue = current > 0 ? current - 1 : 0;
                                  setCleanupDays(newValue);
                                  setIsCleanupConfigChanged(true);
                                }}
                                className="px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-l-md transition-all duration-150 transform hover:scale-105"
                                aria-label="Decrease days"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                              
                              {/* Input field */}
                              <input
                                type="text"
                                id="cleanupDays"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={cleanupDays}
                                onChange={(e) => {
                                  // Only allow numeric input
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  const parsedValue = value === '' ? '' : parseInt(value);
                                  // Allow explicit 0 value
                                  setCleanupDays(parsedValue === 0 ? 0 : (parsedValue || ''));
                                  setIsCleanupConfigChanged(true);
                                }}
                                onBlur={() => {
                                  // Set default value if empty or NaN, but allow explicit 0
                                  if (cleanupDays === '' || (isNaN(cleanupDays) && cleanupDays !== 0)) {
                                    setCleanupDays(30);
                                  }
                                }}
                                className="w-16 text-center border-0 focus:ring-0 focus:text-primary-700 text-base py-2 transition-colors duration-200"
                              />
                              
                              {/* Plus button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newValue = (parseInt(cleanupDays) || 0) + 1;
                                  setCleanupDays(newValue);
                                  setIsCleanupConfigChanged(true);
                                }}
                                className="px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-r-md transition-all duration-150 transform hover:scale-105"
                                aria-label="Increase days"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* Days label */}
                            <span className="ml-3 text-gray-500 text-base hover:text-gray-700 transition-colors duration-200">days</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCleanupArchive}
                        disabled={isLoading.archive || (!isCleanupConfigChanged && cleanupDays === 30)}
                        className={`mt-4 sm:mt-0 px-4 py-2 rounded-md text-white font-medium flex items-center justify-center min-w-[180px] shadow-sm hover:shadow transform hover:-translate-y-0.5 transition-all duration-200 ${isCleanupConfigChanged ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'} disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm`}
                      >
                        {isLoading.archive ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Cleaning...
                          </>
                        ) : (
                          <>
                            <TrashIcon className="-ml-1 mr-2 h-5 w-5 group-hover:animate-bounce" aria-hidden="true" />
                            {isCleanupConfigChanged ? 'Apply & Clean Archive' : 'Clean Archive'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Email Log Viewer - Enhanced with modern UI */}
                <div className="mt-12 mb-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-2 sm:gap-0">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-2" />
                      <h3 className="text-base font-semibold text-gray-800">Email Processing Logs</h3>
                    </div>
                    <div className="ml-0 sm:ml-auto flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${automationStatus.status === 'running' || automationStatus.status === 'restarting' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        <span className={`h-2 w-2 rounded-full mr-1.5 ${automationStatus.status === 'running' || automationStatus.status === 'restarting' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
                        {automationStatus.status === 'running' || automationStatus.status === 'restarting' ? 'Live Updates' : 'Auto-refresh paused'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md animate-fadeIn" style={{ animationDelay: '200ms' }}>
                    <EmailLogViewer 
                      maxHeight="350px" 
                      autoRefresh={true} 
                      isActive={automationStatus.status === 'running' || automationStatus.status === 'restarting'}
                    />
                  </div>
                </div>
              </div>
            </div>
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
