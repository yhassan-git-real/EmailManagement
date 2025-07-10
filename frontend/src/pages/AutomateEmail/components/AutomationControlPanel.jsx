import React from 'react';
import { StatusBadge } from '../../../components';
import {
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CogIcon as CogIconSolid, PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid';

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
  onOpenTemplateSelector
}) => {
  return (
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
            onClick={onStartAutomation}
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
            onClick={onRestartFailed}
            disabled={isLoading.restart || automationStatus.status === 'restarting'}
            className={`group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${automationStatus.status === 'restarting'
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500 hover:shadow'
              }`}
            title="Process only emails with status 'Failed', never pending emails"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading.restart ? 'animate-spin' : 'group-hover:animate-spin-slow'}`} />
            <span>{isLoading.restart ? 'Restarting...' : `Restart Failed${automationStatus.summary.failed > 0 ? ` (${automationStatus.summary.failed})` : ''}`}</span>
          </button>

          <button
            onClick={onStopAutomation}
            disabled={isLoading.stop || automationStatus.status !== 'running'}
            className={`group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 ${automationStatus.status !== 'running'
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 hover:shadow'
              }`}
          >
            <StopIcon className="h-5 w-5 mr-2 transition-transform duration-200 group-hover:scale-110" />
            <span>{isLoading.stop ? 'Stopping...' : 'Stop Automation'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="group inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:border-primary-200 hover:shadow"
          >
            <CogIcon className="h-5 w-5 mr-2 text-gray-500 transition-transform duration-300 group-hover:rotate-45 group-hover:text-primary-500" />
            <span>Configure Email Settings</span>
          </button>

          <button
            onClick={onOpenTemplateSelector}
            className="group inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:border-primary-200 hover:shadow"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500 transition-transform duration-200 group-hover:scale-110 group-hover:text-primary-500" />
            <span>Use Template Editor</span>
          </button>

          <button
            onClick={onRefreshStatus}
            disabled={isLoading.refresh}
            className="group inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading.refresh ? 'animate-spin' : 'group-hover:animate-spin-slow'}`} />
            <span>{isLoading.refresh ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomationControlPanel;
