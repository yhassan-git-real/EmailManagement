import React, { useState } from 'react';
import { StatusBadge, GDriveShareButton } from '../../../components';
import {
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { CogIcon as CogIconSolid } from '@heroicons/react/24/solid';
import ConsolidatedSettingsPanel from './ConsolidatedSettingsPanel';
import TestMailModal from './TestMailModal';

/**
 * AutomationControlPanel - Contains control buttons and status display for email automation
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

  return (
    <div className="card rounded-xl mb-6 relative z-20">
      <div className="p-4 sm:p-5 border-b border-dark-300/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center">
          <div className="mr-4 bg-gradient-to-br from-primary-500 to-accent-violet text-white p-3 rounded-xl shadow-glow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-glow-md">
            <CogIconSolid className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary tracking-tight font-display">Email Automation Control Panel</h2>
            <p className="text-sm text-text-muted mt-0.5">Start, stop, and monitor your email automation workflow</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="text-sm font-semibold text-primary-400 mr-3 hidden sm:flex items-center bg-primary-500/15 px-2.5 py-1 rounded-lg border border-primary-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Automation Status
          </div>
          <StatusBadge status={automationStatus.status} />
        </div>
      </div>

      <div className="p-5">
        {/* Control Buttons - Enhanced with modern UI */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Test Mail Button */}
          <button
            onClick={() => setShowTestMailModal(true)}
            className="group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-accent-violet to-accent-purple hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-accent-violet transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-glow-accent"
            title="Send a test email to validate settings and templates"
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:translate-x-0.5" />
            <span>Test Mail</span>
          </button>

          <button
            onClick={onStartAutomation}
            disabled={isLoading.start || automationStatus.status === 'running' || automationStatus.status === 'restarting'}
            className={`group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${isLoading.start || automationStatus.status === 'running' || automationStatus.status === 'restarting'
              ? 'bg-dark-400 text-text-muted cursor-not-allowed'
              : 'text-white bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-success hover:shadow-lg'
              }`}
            title="Process only pending emails, never emails with status 'Failed' or 'Success'"
          >
            <div className="relative">
              <PlayIcon className={`h-5 w-5 mr-2 transition-transform duration-200 ${!isLoading.start && automationStatus.status !== 'running' && automationStatus.status !== 'restarting' ? 'group-hover:scale-110' : ''}`} />
              {isLoading.start && <span className="absolute inset-0 flex items-center justify-center animate-ping h-2 w-2 rounded-full bg-white opacity-75"></span>}
            </div>
            <span>{isLoading.start ? 'Starting...' : 'Start Pending Emails'}</span>
          </button>

          <button
            onClick={onRestartFailed}
            disabled={isLoading.restart || automationStatus.status === 'restarting' || automationStatus.status === 'running' || automationStatus.summary.failed === 0}
            className={`group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${isLoading.restart || automationStatus.status === 'restarting' || automationStatus.status === 'running' || automationStatus.summary.failed === 0
              ? 'bg-dark-400 text-text-muted cursor-not-allowed'
              : 'text-white bg-gradient-to-r from-warning to-warning-dark hover:from-warning-dark hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-warning hover:shadow-lg'
              }`}
            title="Process only emails with status 'Failed', never pending emails"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading.restart ? 'animate-spin' : 'group-hover:animate-spin-slow'}`} />
            <span>{isLoading.restart ? 'Restarting...' : `Restart Failed${automationStatus.summary.failed > 0 ? ` (${automationStatus.summary.failed})` : ''}`}</span>
          </button>

          <button
            onClick={onStopAutomation}
            disabled={isLoading.stop || automationStatus.status !== 'running'}
            className={`group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${automationStatus.status !== 'running'
              ? 'bg-dark-400 text-text-muted cursor-not-allowed'
              : 'text-white bg-gradient-to-r from-danger to-danger-dark hover:from-danger-dark hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-danger hover:shadow-lg'
              }`}
          >
            <StopIcon className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
            <span>{isLoading.stop ? 'Stopping...' : 'Stop Automation'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="group inline-flex items-center px-3 py-1.5 border border-dark-300/50 text-xs font-medium rounded-lg shadow-sm text-text-secondary bg-dark-500/50 hover:bg-dark-400/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-primary-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:border-primary-500/30 hover:shadow-glow-sm"
          >
            <CogIcon className="h-5 w-5 mr-2 text-text-muted transition-transform duration-300 group-hover:rotate-45 group-hover:text-primary-400" />
            <span>Configure Email Settings</span>
          </button>

          {/* Google Drive Sharing Button */}
          <GDriveShareButton
            sharingOption={sharingOption}
            specificEmails={specificEmails}
            onChange={onUpdateSharingSettings}
          />

          <button
            onClick={onRefreshStatus}
            disabled={isLoading.refresh}
            className="group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-primary-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-glow-sm"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading.refresh ? 'animate-spin' : 'group-hover:animate-spin-slow'}`} />
            <span>{isLoading.refresh ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>
        </div>

        {/* Consolidated Settings Panel - Template, Scheduler, Archive, Attachment */}
        <ConsolidatedSettingsPanel
          automationSettings={automationSettings}
          onOpenTemplateSelector={onOpenTemplateSelector}
          cleanupDays={cleanupDays}
          setCleanupDays={setCleanupDays}
          onCleanupArchive={onCleanupArchive}
          isCleanupLoading={isLoading.archive}
        />
      </div>

      {/* Test Mail Modal */}
      <TestMailModal
        isOpen={showTestMailModal}
        onClose={() => setShowTestMailModal(false)}
      />
    </div>
  );
};

export default AutomationControlPanel;
