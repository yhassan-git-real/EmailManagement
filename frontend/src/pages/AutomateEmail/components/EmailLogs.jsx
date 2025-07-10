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
  );
};

export default EmailLogs;
