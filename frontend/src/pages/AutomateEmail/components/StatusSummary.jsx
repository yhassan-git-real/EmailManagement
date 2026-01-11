import React from 'react';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

/**
 * StatusSummary - Displays email processing metrics and visualizations
 */
const StatusSummary = ({ automationStatus }) => {
  return (
    <div className="mb-8 relative z-10">
      <div className="flex items-center mb-4">
        <ChartBarIcon className="h-5 w-5 text-text-secondary mr-2" />
        <h3 className="text-base font-semibold text-text-primary font-display">Email Status Summary</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Successful Emails Card */}
        <div className="bg-dark-500/50 p-4 rounded-xl border border-success/30 shadow-sm hover:shadow-glow-sm hover:border-success/50 transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn backdrop-blur-sm" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-success-light">Success</span>
            <div className="bg-success/20 rounded-full p-1.5">
              <CheckCircleIcon className="h-5 w-5 text-success" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-success flex items-baseline">
            <span className="animate-fadeIn">{automationStatus.summary.successful}</span>
            <span className="text-xs ml-1 text-success/70 font-normal">emails</span>
          </div>
          <div className="mt-2 h-1 w-full bg-dark-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (automationStatus.summary.successful / Math.max(1, automationStatus.summary.total)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Failed Emails Card */}
        <div className="bg-dark-500/50 p-4 rounded-xl border border-danger/30 shadow-sm hover:shadow-lg hover:border-danger/50 transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn backdrop-blur-sm" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-danger-light">Failed</span>
            <div className="bg-danger/20 rounded-full p-1.5">
              <ExclamationCircleIcon className="h-5 w-5 text-danger" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-danger flex items-baseline">
            <span className="animate-fadeIn">{automationStatus.summary.failed}</span>
            <span className="text-xs ml-1 text-danger/70 font-normal">emails</span>
          </div>
          <div className="mt-2 h-1 w-full bg-dark-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-danger rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (automationStatus.summary.failed / Math.max(1, automationStatus.summary.total)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Pending Emails Card */}
        <div className="bg-dark-500/50 p-4 rounded-xl border border-warning/30 shadow-sm hover:shadow-lg hover:border-warning/50 transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn backdrop-blur-sm" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-warning-light">Pending</span>
            <div className="bg-warning/20 rounded-full p-1.5">
              <ClockIcon className="h-5 w-5 text-warning" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-warning flex items-baseline">
            <span className="animate-fadeIn">{automationStatus.summary.pending}</span>
            <span className="text-xs ml-1 text-warning/70 font-normal">emails</span>
          </div>
          <div className="mt-2 h-1 w-full bg-dark-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-warning rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (automationStatus.summary.pending / Math.max(1, automationStatus.summary.total)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Total Emails Card */}
        <div className="bg-dark-500/50 p-4 rounded-xl border border-primary-500/30 shadow-sm hover:shadow-glow-sm hover:border-primary-500/50 transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn backdrop-blur-sm" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-400">Total</span>
            <div className="bg-primary-500/20 rounded-full p-1.5">
              <DocumentTextIcon className="h-5 w-5 text-primary-400" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-primary-400 flex items-baseline">
            <span className="animate-fadeIn">{automationStatus.summary.total}</span>
            <span className="text-xs ml-1 text-primary-400/70 font-normal">emails</span>
          </div>
          <div className="mt-2 h-1 w-full bg-dark-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-1000"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusSummary;
