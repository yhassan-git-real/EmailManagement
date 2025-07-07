import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

/**
 * ArchiveManagement - Handles email archive cleanup functionality
 */
const ArchiveManagement = ({ 
  cleanupDays, 
  setCleanupDays, 
  isCleanupConfigChanged, 
  setIsCleanupConfigChanged,
  isLoading,
  onCleanupArchive
}) => {
  return (
    <div className="mt-10 mb-10">
      <div className="flex items-center mb-4">
        <TrashIcon className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-base font-semibold text-gray-800">Local Archive Folder Management</h3>
      </div>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '150ms' }}>
        <div className="flex flex-col sm:flex-row sm:items-start md:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="max-w-lg">
            <p className="text-sm leading-relaxed text-gray-600 font-medium hover:text-gray-800 transition-colors duration-200">
              Keep your local archive folder optimized by removing old processed emails.
              This helps maintain system performance and reduces local storage requirements.
            </p>
            <div className="mt-4 flex items-center flex-wrap">
              <label htmlFor="cleanupDays" className="block text-base font-medium text-gray-700 mr-3 whitespace-nowrap mb-2 sm:mb-0 hover:text-primary-600 transition-colors duration-200">
                Remove Zip files older than:
              </label>
              <div className="flex items-center">
                <div className="flex items-center rounded-md shadow-sm border border-gray-300 bg-white hover:border-primary-400 hover:shadow transition-all duration-200">
                  {/* Minus button */}
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseInt(cleanupDays) || 0;
                      const newValue = current > 0 ? current - 1 : 0;
                      setCleanupDays(newValue);
                      setIsCleanupConfigChanged(true);
                    }}
                    className="px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-l-md transition-all duration-150 transform hover:scale-105"
                    aria-label="Decrease days"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Input field */}
                  <input
                    type="text"
                    id="cleanupDays"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={cleanupDays}
                    onChange={(e) => {
                      // Only allow numeric input
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      const parsedValue = value === '' ? '' : parseInt(value);
                      // Allow explicit 0 value
                      setCleanupDays(parsedValue === 0 ? 0 : (parsedValue || ''));
                      setIsCleanupConfigChanged(true);
                    }}
                    onBlur={() => {
                      // Set default value if empty or NaN, but allow explicit 0
                      if (cleanupDays === '' || (isNaN(cleanupDays) && cleanupDays !== 0)) {
                        setCleanupDays(30);
                      }
                    }}
                    className="w-16 text-center border-0 focus:ring-0 focus:text-primary-700 text-base py-2 transition-colors duration-200"
                  />
                  
                  {/* Plus button */}
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = (parseInt(cleanupDays) || 0) + 1;
                      setCleanupDays(newValue);
                      setIsCleanupConfigChanged(true);
                    }}
                    className="px-3 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-r-md transition-all duration-150 transform hover:scale-105"
                    aria-label="Increase days"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {/* Days label */}
                <span className="ml-3 text-gray-500 text-base hover:text-gray-700 transition-colors duration-200">days</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onCleanupArchive}
            disabled={isLoading || (!isCleanupConfigChanged && cleanupDays === 30)}
            className={`mt-4 sm:mt-0 px-4 py-2 rounded-md text-white font-medium flex items-center justify-center min-w-[180px] shadow-sm hover:shadow transform hover:-translate-y-0.5 transition-all duration-200 ${isCleanupConfigChanged ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'} disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cleaning...
              </>
            ) : (
              <>
                <TrashIcon className="-ml-1 mr-2 h-5 w-5 group-hover:animate-bounce" aria-hidden="true" />
                {isCleanupConfigChanged ? 'Apply & Clean Archive' : 'Clean Archive'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveManagement;
