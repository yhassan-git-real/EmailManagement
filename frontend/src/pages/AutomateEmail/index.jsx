import React from 'react';
import {
  Header,
  Footer,
  Breadcrumb,
  EmailSettingsModal,
  TemplateSelector,
  SchedulerSettings
} from '../../components';
import { HomeIcon } from '@heroicons/react/24/outline';

// Custom hooks
import useAutomationStatus from './hooks/useAutomationStatus';
import useAutomationSettings from './hooks/useAutomationSettings';
import useAutomationActions from './hooks/useAutomationActions';

// Page components
import AutomationControlPanel from './components/AutomationControlPanel';
import StatusSummary from './components/StatusSummary';
import TemplateSettings from './components/TemplateSettings';
import ArchiveManagement from './components/ArchiveManagement';
import EmailLogs from './components/EmailLogs';

/**
 * AutomatePage - Main container for email automation functionality
 * Refactored to use custom hooks and modular components
 */
const AutomatePage = ({ connectionInfo, onDisconnect }) => {
    // Use custom hooks for state and logic
    const {
        automationStatus,
        setAutomationStatus,
        fetchAutomationStatus,
        startPolling,
        stopPolling,
        previousStatusRef
    } = useAutomationStatus();

    const {
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
        saveCleanup
    } = useAutomationSettings();

    const {
        isLoading,
        handleStartAutomation,
        handleStopAutomation,
        handleRestartFailed,
        handleRefreshStatus,
        handleCleanupArchive
    } = useAutomationActions({
        setAutomationStatus,
        startPolling,
        stopPolling,
        saveCleanup,
        cleanupDays
    });

    // State for modals
    const [showSettingsModal, setShowSettingsModal] = React.useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = React.useState(false);

    // Load initial data
    React.useEffect(() => {
        const initializeData = async () => {
            // Load settings
            await loadSettings();

            // Load status
            const statusResponse = await fetchAutomationStatus();

            // Set up polling if automation is running
            if (automationStatus.status === 'running' || automationStatus.status === 'restarting') {
                console.log("Setting up initial polling - automation is running");
                startPolling();
            } else {
                console.log("Initial status is not running, no polling needed");
                stopPolling(); // Make sure polling is stopped
            }
        };

        initializeData();

        // Cleanup on unmount
        return () => {
            stopPolling();
        };
    }, []);

    // Handle saving email settings
    const handleSaveSettings = async (settings) => {
        const response = await saveSettings(settings);
        if (response.success) {
            setShowSettingsModal(false);
        }
    };

    // Handle template selection
    const handleSelectTemplate = async (template) => {
        const response = await updateTemplate(template.id);
        if (response.success) {
            setShowTemplateSelector(false);
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

                        {/* Control Panel */}
                        <AutomationControlPanel
                            automationStatus={automationStatus}
                            isLoading={isLoading}
                            onStartAutomation={handleStartAutomation}
                            onStopAutomation={handleStopAutomation}
                            onRestartFailed={handleRestartFailed}
                            onRefreshStatus={() => handleRefreshStatus(fetchAutomationStatus)}
                            onOpenSettings={() => setShowSettingsModal(true)}
                            onOpenTemplateSelector={() => setShowTemplateSelector(true)}
                        />

                        {/* Status Summary */}
                        <StatusSummary automationStatus={automationStatus} />

                        {/* Template Settings */}
                        <TemplateSettings
                            automationSettings={automationSettings}
                            onOpenTemplateSelector={() => setShowTemplateSelector(true)}
                        />

                        {/* Scheduler Settings (using existing component) */}
                        <div className="my-6">
                            <hr className="my-6 border-t border-gray-200" />
                            <SchedulerSettings
                                onSettingsChange={(updatedSettings) => console.log("Scheduler settings updated:", updatedSettings)}
                            />
                        </div>

                        {/* Archive Management */}
                        <ArchiveManagement
                            cleanupDays={cleanupDays}
                            setCleanupDays={setCleanupDays}
                            isCleanupConfigChanged={isCleanupConfigChanged}
                            setIsCleanupConfigChanged={setIsCleanupConfigChanged}
                            isLoading={isLoading.archive}
                            onCleanupArchive={handleCleanupArchive}
                        />

                        {/* Email Logs */}
                        <EmailLogs
                            automationStatus={automationStatus}
                        />
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
