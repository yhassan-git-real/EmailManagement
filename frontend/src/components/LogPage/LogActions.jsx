import React, { useState, useEffect, useRef } from 'react';

/**
 * LogActions component for managing log operations
 * Provides download, delete, cleanup, search, and log filtering functionality
 */
const LogActions = ({ 
  selectedLogs = [], 
  totalLogs = 0,
  onDownload,
  onDelete,
  onCleanup,
  onRefresh,
  onSearch,
  onStart,
  isLoading = false 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogType, setSelectedLogType] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState('');

  const hasSelection = selectedLogs.length > 0;
  
  // Log type options with user-friendly labels
  const logTypes = [
    { value: 'all', label: 'All Logs' },
    { value: 'automation', label: 'Automation Logs' },
    { value: 'error', label: 'Error Logs' },
    { value: 'success', label: 'Success Logs' }
  ];

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  // Handle download logs
  const handleDownload = () => {
    if (hasSelection) {
      onDownload(selectedLogs);
    } else {
      onDownload('all');
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    onDelete(selectedLogs);
    setShowDeleteConfirm(false);
  };

  // Handle cleanup confirmation
  const handleCleanupConfirm = () => {
    onCleanup(cleanupDays);
    setShowCleanupConfirm(false);
  };
  
  // Handle log type change
  const handleLogTypeChange = (value) => {
    setSelectedLogType(value);
    setDropdownOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  // Handle start button click
  const handleStart = () => {
    if (onStart) {
      // Format date as YYYYMMDD for the filename pattern
      const formattedDate = selectedDate ? selectedDate.replace(/-/g, '') : '';
      onStart(selectedLogType, formattedDate);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 p-1.5 rounded-md mr-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">Log Actions & Management</h3>
          {hasSelection && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {selectedLogs.length} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Quick Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Quick search logs..."
              className="w-64 pl-7 pr-2 py-1 text-sm border border-gray-300 rounded-md hover:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          
          <div className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
            <span className="font-bold">{totalLogs}</span> logs
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="p-4 bg-gray-50 rounded-b-lg">
        <div className="flex flex-wrap items-center gap-3">
          {/* Log Type Dropdown */}
          <div className="flex-shrink-0 relative z-20" ref={dropdownRef}>
            {/* Custom dropdown button */}
            <button
              id="logType"
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between w-64 h-10 px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {logTypes.find(type => type.value === selectedLogType)?.label || 'All Logs'}
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
            
            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute left-0 z-30 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg transition-opacity duration-200">
                <ul className="py-1 overflow-auto text-base">
                  {logTypes.map(type => (
                    <li key={type.value}>
                      <button
                        type="button"
                        className={`block w-full px-4 py-2 text-sm text-left hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ${selectedLogType === type.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-800'}`}
                        onClick={() => handleLogTypeChange(type.value)}
                      >
                        {type.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Date Selector */}
          <div className="flex-shrink-0">
            <input
              type="date"
              id="logDate"
              value={selectedDate}
              onChange={handleDateChange}
              className="input-field py-2 px-3 h-10 text-sm rounded-lg border border-gray-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-sm"
            />
          </div>
          
          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="btn btn-primary h-10 bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 3L19 12L5 21V3Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Start
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn btn-secondary h-10 bg-white border border-gray-300 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 hover:shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <svg 
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="btn btn-primary h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-105 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {hasSelection ? 'Download' : 'Download All'}
          </button>

          {/* Cleanup Button */}
          <button
            onClick={() => setShowCleanupConfirm(true)}
            disabled={isLoading}
            className="btn h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center hover:from-orange-400 hover:to-orange-500 focus:ring-orange-500 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Cleanup
          </button>
          
          {/* Delete Selected Button */}
          {hasSelection && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
              className="btn h-10 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center hover:from-red-400 hover:to-red-500 focus:ring-red-500 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-4 border w-80 shadow-md rounded-lg bg-white">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-red-100 mr-3">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Delete Selected Logs</h3>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete {selectedLogs.length} selected log{selectedLogs.length !== 1 ? 's' : ''}? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary flex-1 bg-white border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg py-2 hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cleanup Confirmation Modal */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-4 border w-80 shadow-md rounded-lg bg-white">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-full bg-orange-100 mr-3">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Cleanup Old Logs</h3>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-3">
                Delete logs older than the specified number of days.
              </p>
              <div className="flex items-center">
                <label htmlFor="cleanupDays" className="text-sm font-medium text-gray-700 mr-2">
                  Days to keep:
                </label>
                <input
                  type="number"
                  id="cleanupDays"
                  value={cleanupDays}
                  onChange={(e) => setCleanupDays(parseInt(e.target.value) || 30)}
                  min="1"
                  max="365"
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCleanupConfirm(false)}
                className="btn btn-secondary flex-1 bg-white border border-gray-300 text-gray-700 rounded-lg py-2 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCleanupConfirm}
                className="btn flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg py-2 hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              >
                Cleanup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogActions;
