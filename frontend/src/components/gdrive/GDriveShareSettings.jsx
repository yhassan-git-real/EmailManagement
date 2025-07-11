import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Google Drive Share Settings Component
 * 
 * Allows configuring how Google Drive files are shared when attached to emails
 */
const GDriveShareSettings = ({ 
  sharingOption, 
  specificEmails, 
  onChange, 
  className 
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (onChange) {
      onChange({ [name]: value });
    }
  };

  // Convert comma-separated emails to array when saving
  const handleEmailsChange = (e) => {
    const { name, value } = e.target;
    if (onChange) {
      // Convert to array if it's specificEmails
      if (name === 'specificEmails') {
        const emailsArray = value
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);
        onChange({ [name]: emailsArray });
      } else {
        onChange({ [name]: value });
      }
    }
  };
  
  // Simple tooltip state
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`rounded-lg bg-white shadow border border-gray-200 overflow-hidden ${className || ''}`}>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
            <path d="M8 13h2.55v3h2.9v-3H16l-4-4z"/>
          </svg>
          <h2 className="text-lg font-medium text-gray-900">Google Drive Sharing</h2>
          <div className="relative ml-2">
            <InformationCircleIcon 
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="h-5 w-5 text-gray-400 cursor-help"
            />
            {showTooltip && (
              <div className="absolute z-10 w-64 p-3 -mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg -left-28 top-6">
                <p className="font-semibold mb-1">Google Drive Sharing</p>
                <p>Control who can access files when they're shared through Google Drive instead of as email attachments.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="sharingOption" className="block text-sm font-medium text-gray-700">
              Sharing Permissions
            </label>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Default setting for all emails
            </span>
          </div>
          <select
            id="sharingOption"
            name="sharingOption"
            value={sharingOption || 'anyone'}
            onChange={handleChange}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="anyone">Public (Anyone with link)</option>
            <option value="restricted">Private (Recipient only)</option>
            <option value="specific">Custom (Specific users)</option>
          </select>
          
          {/* Description box with icon */}
          <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 flex">
            <div className="mr-3 flex-shrink-0 mt-0.5">
              {sharingOption === 'anyone' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                </svg>
              )}
              {sharingOption === 'restricted' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
              {sharingOption === 'specific' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {sharingOption === 'anyone' && 'Public Access'}
                {sharingOption === 'restricted' && 'Private Access'}
                {sharingOption === 'specific' && 'Custom Access'}
              </h4>
              <p className="text-sm text-gray-600">
                {sharingOption === 'anyone' && 'Anyone with the link can view and download the file. No sign-in required.'}
                {sharingOption === 'restricted' && 'Only the email recipient can access the file. Sign-in required.'}
                {sharingOption === 'specific' && 'Only specified emails can access the file. Sign-in required.'}
              </p>
            </div>
          </div>
        </div>
        
        {sharingOption === 'specific' && (
          <div className="border-t border-gray-200 pt-5">
            <label htmlFor="specificEmails" className="block text-sm font-medium text-gray-700 mb-1">
              Authorized Email Addresses
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow focus-within:z-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="specificEmails"
                  name="specificEmails"
                  value={specificEmails || ''}
                  onChange={handleEmailsChange}
                  placeholder="example1@email.com, example2@email.com"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md pl-10 sm:text-sm border-gray-300"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              These users will be granted access in addition to the email recipient. Separate multiple email addresses with commas.
            </p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-200">
          <p className="font-medium">Note:</p>
          <p>Large files (over 20MB) are automatically uploaded to Google Drive instead of being sent as attachments.</p>
        </div>
      </div>
    </div>
  );
};

export default GDriveShareSettings;
