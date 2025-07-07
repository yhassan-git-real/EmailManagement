import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

/**
 * TemplateSettings - Displays and manages email template selection
 */
const TemplateSettings = ({ automationSettings, onOpenTemplateSelector }) => {
  return (
    <div>
      <hr className="my-6 border-t border-gray-200" />
      
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
              onClick={onOpenTemplateSelector}
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
    </div>
  );
};

export default TemplateSettings;
