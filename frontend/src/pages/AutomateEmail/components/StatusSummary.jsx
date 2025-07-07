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
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <ChartBarIcon className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-base font-semibold text-gray-800">Email Status Summary</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Successful Emails Card */}
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
        
        {/* Failed Emails Card */}
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
        
        {/* Pending Emails Card */}
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
        
        {/* Total Emails Card */}
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
  );
};

export default StatusSummary;
