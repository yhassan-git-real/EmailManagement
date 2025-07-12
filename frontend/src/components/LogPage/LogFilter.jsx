import React, { useState, useEffect } from 'react';

/**
 * LogFilter component for filtering and searching logs
 * Provides date range, log level, search term, and file type filtering
 */
const LogFilter = ({ 
  onFilter, 
  isLoading = false,
  totalLogs = 0,
  filteredLogs = 0,
  onClearFilters,
  isRealTimeEnabled = false,
  onRealTimeToggle
}) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    logLevel: 'all',
    dateFrom: '',
    dateTo: '',
    processId: '',
    fileType: 'all'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Log levels for filter dropdown
  const logLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'info', label: 'Info' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' },
    { value: 'success', label: 'Success' },
    { value: 'debug', label: 'Debug' }
  ];

  // File types for filter dropdown
  const fileTypes = [
    { value: 'all', label: 'All Files' },
    { value: 'automation', label: 'Automation Logs' },
    { value: 'error', label: 'Error Logs' },
    { value: 'success', label: 'Success Logs' },
    { value: 'email_automation', label: 'Email Automation' }
  ];

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  // Apply filters
  const handleApplyFilters = () => {
    onFilter(filters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      logLevel: 'all',
      dateFrom: '',
      dateTo: '',
      processId: '',
      fileType: 'all'
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.searchTerm || 
           filters.logLevel !== 'all' || 
           filters.dateFrom || 
           filters.dateTo || 
           filters.processId ||
           filters.fileType !== 'all';
  };

  // Auto-apply search term filter with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.searchTerm !== '') {
        handleApplyFilters();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
      {/* Enhanced Filter Header with better spacing */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="bg-primary-100 p-1.5 rounded-lg mr-2">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">Log Filters & Search</h3>
            </div>
            {hasActiveFilters() && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-1.5"></span>
                {Object.values(filters).filter(v => v && v !== 'all').length} Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {/* Real-time Toggle - moved to left side */}
            {onRealTimeToggle && (
              <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-md border border-gray-200">
                <span className="text-xs text-gray-600 font-medium">Live Updates</span>
                <button
                  onClick={onRealTimeToggle}
                  className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                    isRealTimeEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={isRealTimeEnabled}
                  aria-label="Toggle real-time updates"
                >
                  <span
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isRealTimeEnabled ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </button>
                {isRealTimeEnabled && (
                  <span className="inline-flex items-center">
                    <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
                  </span>
                )}
              </div>
            )}
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
              {filteredLogs !== totalLogs ? (
                <span><span className="font-medium text-primary-600">{filteredLogs}</span> of {totalLogs} logs</span>
              ) : (
                <span className="font-medium">{totalLogs} logs</span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-primary-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              <svg 
                className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filter Content */}
      {isExpanded && (
        <div className="px-4 py-4 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {/* Enhanced Search Term */}
            <div>
              <label htmlFor="searchTerm" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Search Message
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="searchTerm"
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Search in log messages..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Enhanced Log Level */}
            <div>
              <label htmlFor="logLevel" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Log Level
              </label>
              <select
                id="logLevel"
                value={filters.logLevel}
                onChange={(e) => handleFilterChange('logLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200 bg-white"
              >
                {logLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Enhanced File Type */}
            <div>
              <label htmlFor="fileType" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                File Type
              </label>
              <select
                id="fileType"
                value={filters.fileType}
                onChange={(e) => handleFilterChange('fileType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200 bg-white"
              >
                {fileTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Enhanced Date From */}
            <div>
              <label htmlFor="dateFrom" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Date From
              </label>
              <input
                type="date"
                id="dateFrom"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200"
              />
            </div>

            {/* Enhanced Date To */}
            <div>
              <label htmlFor="dateTo" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Date To
              </label>
              <input
                type="date"
                id="dateTo"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200"
              />
            </div>

            {/* Enhanced Process ID */}
            <div>
              <label htmlFor="processId" className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Process ID
              </label>
              <input
                type="text"
                id="processId"
                value={filters.processId}
                onChange={(e) => handleFilterChange('processId', e.target.value)}
                placeholder="Enter process ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-300">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Applying...
                  </>
                ) : (
                  <>
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Apply Filters
                  </>
                )}
              </button>

              {hasActiveFilters() && (
                <button
                  onClick={handleClearFilters}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                >
                  <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
              <svg className="inline w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Search applies automatically as you type
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogFilter;
