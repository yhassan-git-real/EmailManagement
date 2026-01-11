import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { EmailLogViewer } from '../../../components';

/**
 * EmailLogs - Displays email processing logs with status indicators
 */
const EmailLogs = ({ automationStatus }) => {
  return (
    <div className="mt-12 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-2 sm:gap-0">
        <div className="flex items-center">
          <DocumentTextIcon className="h-5 w-5 text-text-secondary mr-2" />
          <h3 className="text-base font-semibold text-text-primary font-display">Email Processing Logs</h3>
        </div>
        <div className="ml-0 sm:ml-auto flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${automationStatus.status === 'running' || automationStatus.status === 'restarting' ? 'bg-success/20 text-success-light border border-success/30' : 'bg-dark-400/50 text-text-muted border border-dark-300/50'}`}>
            <span className={`h-2 w-2 rounded-full mr-1.5 ${automationStatus.status === 'running' || automationStatus.status === 'restarting' ? 'bg-success animate-pulse' : 'bg-text-muted'}`}></span>
            {automationStatus.status === 'running' || automationStatus.status === 'restarting' ? 'Live Updates' : 'Auto-refresh paused'}
          </span>
        </div>
      </div>
      <div className="card rounded-xl overflow-hidden transition-all duration-300 animate-fadeIn" style={{ animationDelay: '200ms' }}>
        <EmailLogViewer
          maxHeight="350px"
          autoRefresh={true}
          isActive={automationStatus.status === 'running' || automationStatus.status === 'restarting'}
        />
      </div>
    </div>
  );
};

export default EmailLogs;
