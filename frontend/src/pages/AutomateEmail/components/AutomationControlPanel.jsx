import React, { useState } from 'react';
import { StatusBadge, GDriveShareButton } from '../../../components';
import {
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { CogIcon as CogIconSolid } from '@heroicons/react/24/solid';
import ConsolidatedSettingsPanel from './ConsolidatedSettingsPanel';
import TestMailModal from './TestMailModal';
import AttachmentDropdown from './AttachmentDropdown';

/**
 * AutomationControlPanel - Readable compact control panel
 * Balanced between compactness and readability
 */
const AutomationControlPanel = ({
  automationStatus,
  isLoading,
  onStartAutomation,
  onStopAutomation,
  onRestartFailed,
  onRefreshStatus,
  onOpenSettings,
  onOpenTemplateSelector,
  sharingOption,
  specificEmails,
  onUpdateSharingSettings,
  automationSettings,
  cleanupDays,
  setCleanupDays,
  onCleanupArchive
}) => {
  const [showTestMailModal, setShowTestMailModal] = useState(false);

  const getTemplateName = () => {
    switch (automationSettings?.templateId) {
      case 'default': return 'Default';
      case 'followup': return 'Follow-up';
      case 'escalation': return 'Escalation';
      case 'reminder': return 'Reminder';
      default: return 'Custom';
    }
  };

  // Button base styles - readable size
  const btnBase = "inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5";

  return (
    <div className="mb-3 relative z-30">
      {/* Main Container */}
      <div className="rounded-xl z-50 relative" style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 45, 0.9) 0%, rgba(15, 20, 35, 0.95) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}>

        {/* Header Row */}
        <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <CogIconSolid className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Email Automation Control Panel</h2>
              <p className="text-[10px] text-slate-400 hidden md:block">Start, stop, and monitor your email automation workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings */}
            <button onClick={onOpenSettings} className={`${btnBase}`}
              style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(71, 85, 105, 0.4)', color: '#cbd5e1' }}>
              <CogIcon className="h-4 w-4 mr-1.5 text-slate-400" />Configure Email Settings
            </button>

            {/* GDrive */}
            <GDriveShareButton sharingOption={sharingOption} specificEmails={specificEmails} onChange={onUpdateSharingSettings} />

            {/* Automation Status */}
            <span className="hidden lg:flex items-center text-[10px] font-medium px-2 py-1 rounded-md"
              style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
              Automation Status
            </span>
            <StatusBadge status={automationStatus.status} />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="px-3 py-2 flex flex-wrap items-center gap-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
          {/* Test Mail */}
          <button onClick={() => setShowTestMailModal(true)}
            className={`${btnBase} text-white`}
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)' }}
            title="Send a test email">
            <PaperAirplaneIcon className="h-4 w-4 mr-1.5" />Test Mail
          </button>

          {/* Start */}
          <button onClick={onStartAutomation}
            disabled={isLoading.start || automationStatus.status === 'running' || automationStatus.status === 'restarting'}
            className={`${btnBase} ${isLoading.start || automationStatus.status === 'running' || automationStatus.status === 'restarting' ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'text-white'}`}
            style={!(isLoading.start || automationStatus.status === 'running' || automationStatus.status === 'restarting') ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' } : {}}>
            <PlayIcon className="h-4 w-4 mr-1.5" />{isLoading.start ? 'Starting...' : 'Start Pending Emails'}
          </button>

          {/* Restart */}
          <button onClick={onRestartFailed}
            disabled={isLoading.restart || automationStatus.status === 'restarting' || automationStatus.status === 'running' || automationStatus.summary.failed === 0}
            className={`${btnBase} ${isLoading.restart || automationStatus.status === 'restarting' || automationStatus.status === 'running' || automationStatus.summary.failed === 0 ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'text-white'}`}
            style={!(isLoading.restart || automationStatus.status === 'restarting' || automationStatus.status === 'running' || automationStatus.summary.failed === 0) ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' } : {}}>
            <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${isLoading.restart ? 'animate-spin' : ''}`} />
            {isLoading.restart ? 'Restarting...' : `Restart Failed${automationStatus.summary.failed > 0 ? ` (${automationStatus.summary.failed})` : ''}`}
          </button>

          {/* Stop */}
          <button onClick={onStopAutomation}
            disabled={isLoading.stop || automationStatus.status !== 'running'}
            className={`${btnBase} ${automationStatus.status !== 'running' ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'text-white'}`}
            style={automationStatus.status === 'running' ? { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)' } : {}}>
            <StopIcon className="h-4 w-4 mr-1.5" />Stop Automation
          </button>

          {/* Refresh */}
          <button onClick={onRefreshStatus} disabled={isLoading.refresh}
            className={`${btnBase} text-white`}
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)' }}>
            <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${isLoading.refresh ? 'animate-spin' : ''}`} />Refresh Status
          </button>

          {/* Attachment Dropdown */}
          <AttachmentDropdown />
        </div>

        {/* Settings Row */}
        <div className="px-3 py-2 flex flex-wrap items-center gap-2">
          {/* Template */}
          <div className="inline-flex items-center rounded-lg overflow-hidden text-xs" style={{ border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div className="flex items-center px-2 py-1.5 font-medium" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc' }}>
              <DocumentTextIcon className="h-3.5 w-3.5 mr-1" />Template:
            </div>
            <button onClick={onOpenTemplateSelector}
              className="flex items-center px-2.5 py-1.5 font-medium hover:bg-indigo-500/10 transition-colors"
              style={{ background: 'rgba(30, 41, 59, 0.5)', color: '#c7d2fe' }}>
              {getTemplateName()}<ChevronDownIcon className="ml-1 h-3 w-3" />
            </button>
          </div>

          {/* Other settings */}
          <ConsolidatedSettingsPanel
            automationSettings={automationSettings}
            onOpenTemplateSelector={onOpenTemplateSelector}
            cleanupDays={cleanupDays}
            setCleanupDays={setCleanupDays}
            onCleanupArchive={onCleanupArchive}
            isCleanupLoading={isLoading.archive}
            hideTemplateSelector={true}
            hideAttachment={true}
            compact={false}
          />
        </div>
      </div>

      <TestMailModal isOpen={showTestMailModal} onClose={() => setShowTestMailModal(false)} />
    </div>
  );
};

export default AutomationControlPanel;
