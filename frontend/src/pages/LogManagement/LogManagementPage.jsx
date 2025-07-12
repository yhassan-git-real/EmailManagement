import React, { useState, useEffect } from 'react';
import { Header, Footer, Breadcrumb } from '../../components';
import { HomeIcon } from '@heroicons/react/24/outline';
import LogActions from '../../components/LogPage/LogActions';
import LogTable from '../../components/LogPage/LogTable';

/**
 * LogManagementPage - Main page component for log management
 * Provides comprehensive log viewing, filtering, and management capabilities
 */
const LogManagementPage = ({ connectionInfo, onDisconnect }) => {
  // State for logs data
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);

  // State for selections
  const [selectedRows, setSelectedRows] = useState([]);

  // State for real-time updates
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Sample log data for development (replace with API call)
  const generateSampleLogs = () => {
    const sampleLogs = [
      "2025-07-12 00:47:54 - INFO - {\"timestamp\": \"2025-07-12T00:47:54.045092\", \"message\": \"Google Drive service is available for large file uploads.\", \"process_id\": null}",
      "2025-07-12 00:49:34 - INFO - {\"timestamp\": \"2025-07-12T00:49:34.902663\", \"message\": \"Starting automation process: Email Automation Process\", \"process_id\": \"auto_20250712_004934\"}",
      "2025-07-12 01:07:04 - ERROR - {\"timestamp\": \"2025-07-12T01:07:04.085371\", \"message\": \"Email transaction: Failed - ERROR: Attachment path does not exist or is not a directory\", \"email_id\": 3, \"recipient\": \"ryanhzb7@gmail.com\", \"subject\": \"Hello Testing\", \"status\": \"Failed\", \"process_id\": \"auto_20250712_010700\", \"file_path\": \"D:\\\\Reports\\\\ABC\"}",
      "2025-07-12 01:06:34 - INFO - {\"timestamp\": \"2025-07-12T01:06:34.052617\", \"message\": \"Email transaction: Success - SUCCESS: Email sent with Google Drive link - Reports_XZY_20250712_010600.zip (27.47 MB)\", \"email_id\": 2, \"recipient\": \"ryanhzb14@gmail.com\", \"subject\": \"Link_testing\", \"status\": \"Success\", \"process_id\": \"auto_20250712_010554\"}",
      "2025-07-12 05:48:55 - ERROR - {\"timestamp\": \"2025-07-12T05:48:55.692941\", \"message\": \"Email transaction: Failed - ERROR: File too large (59.2 MB) - GDrive upload failed: Failed to authenticate with Google Drive\", \"email_id\": 7, \"recipient\": \"ryanhzb18@gmail.com\", \"subject\": \"Link_testing 2\", \"status\": \"Failed\", \"process_id\": \"auto_20250712_054845\"}",
    ];

    return sampleLogs.map((log, index) => ({
      id: index,
      raw: log,
      isString: true
    }));
  };

  // Load logs from backend (placeholder function)
  const loadLogs = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call to backend
      // In a real implementation, this would fetch logs from the backend based on the file pattern
      // const response = await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     filters, 
      //     filePattern: filters.filePattern, 
      //     page: currentPage, 
      //     pageSize 
      //   })
      // });
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use sample data for now
      const sampleData = generateSampleLogs();
      
      // Simulate filtering based on filePattern
      let filteredData = sampleData;
      if (filters.filePattern) {
        console.log(`Filtering logs by pattern: ${filters.filePattern}`);
        
        // Filter logs based on the file pattern (for demonstration purposes)
        filteredData = sampleData.filter(log => {
          const logText = log.raw.toLowerCase();
          
          if (filters.filePattern.includes('email_automation')) {
            return logText.includes('automation');
          } else if (filters.filePattern.includes('error')) {
            return logText.includes('error');
          } else if (filters.filePattern.includes('success')) {
            return logText.includes('success');
          }
          
          return true;
        });
      }
      
      setLogs(filteredData.map(log => log.raw));
      setFilteredLogs(filteredData.map(log => log.raw));
      setTotalLogs(filteredData.length);
      setLastRefresh(new Date());
    } catch (err) {
      setError(`Failed to load logs: ${err.message}`);
      console.error('Error loading logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to logs
  const handleFilter = (filters) => {
    setIsLoading(true);
    
    try {
      let filtered = [...logs];
      
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(log => 
          log.toLowerCase().includes(searchLower)
        );
      }
      
      // Log level filter
      if (filters.logLevel && filters.logLevel !== 'all') {
        filtered = filtered.filter(log => 
          log.toLowerCase().includes(filters.logLevel.toLowerCase())
        );
      }
      
      // File type filter
      if (filters.fileType && filters.fileType !== 'all') {
        // This would be implemented based on backend file structure
        // For now, just filter by keywords in the log
        const fileTypeMap = {
          'automation': 'automation',
          'error': 'error',
          'success': 'success',
          'email_automation': 'email_automation'
        };
        
        if (fileTypeMap[filters.fileType]) {
          filtered = filtered.filter(log => 
            log.toLowerCase().includes(fileTypeMap[filters.fileType])
          );
        }
      }
      
      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        filtered = filtered.filter(log => {
          const logDate = extractLogDate(log);
          if (!logDate) return true;
          
          if (filters.dateFrom && logDate < new Date(filters.dateFrom)) {
            return false;
          }
          if (filters.dateTo && logDate > new Date(filters.dateTo + ' 23:59:59')) {
            return false;
          }
          return true;
        });
      }
      
      // Process ID filter
      if (filters.processId) {
        filtered = filtered.filter(log => 
          log.includes(filters.processId)
        );
      }
      
      setFilteredLogs(filtered);
      setCurrentPage(1); // Reset to first page when filtering
    } catch (err) {
      setError(`Failed to apply filters: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilteredLogs(logs);
    setCurrentPage(1);
  };

  // Extract date from log line for filtering
  const extractLogDate = (logLine) => {
    try {
      const dateMatch = logLine.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      return dateMatch ? new Date(dateMatch[1]) : null;
    } catch {
      return null;
    }
  };

  // Handle row selection
  const handleRowSelect = (selectedIds) => {
    setSelectedRows(selectedIds);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle refresh logs
  const handleRefresh = () => {
    loadLogs();
  };

  // Handle download logs
  const handleDownload = (selection) => {
    try {
      const logsToDownload = selection === 'all' ? filteredLogs : 
        selectedRows.map(id => filteredLogs[id]).filter(Boolean);
      
      const content = logsToDownload.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `logs_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Downloaded ${logsToDownload.length} log entries`);
    } catch (err) {
      setError(`Failed to download logs: ${err.message}`);
    }
  };

  // Handle delete logs
  const handleDelete = (selection) => {
    try {
      // TODO: Implement actual deletion via API
      console.log('Delete logs:', selection);
      
      // For now, just remove from current view
      const remainingLogs = logs.filter((_, index) => !selectedRows.includes(index));
      setLogs(remainingLogs);
      setFilteredLogs(remainingLogs);
      setSelectedRows([]);
      setTotalLogs(remainingLogs.length);
    } catch (err) {
      setError(`Failed to delete logs: ${err.message}`);
    }
  };

  // Handle cleanup old logs
  const handleCleanup = (days) => {
    try {
      // TODO: Implement actual cleanup via API
      console.log(`Cleanup logs older than ${days} days`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const remainingLogs = logs.filter(log => {
        const logDate = extractLogDate(log);
        return !logDate || logDate >= cutoffDate;
      });
      
      setLogs(remainingLogs);
      setFilteredLogs(remainingLogs);
      setSelectedRows([]);
      setTotalLogs(remainingLogs.length);
    } catch (err) {
      setError(`Failed to cleanup logs: ${err.message}`);
    }
  };

  // Handle quick search from LogActions
  const handleQuickSearch = (searchTerm) => {
    try {
      if (!searchTerm.trim()) {
        setFilteredLogs(logs);
        return;
      }
      
      const searchLower = searchTerm.toLowerCase();
      const filtered = logs.filter(log => 
        log.toLowerCase().includes(searchLower)
      );
      
      setFilteredLogs(filtered);
      setCurrentPage(1); // Reset to first page when searching
    } catch (err) {
      setError(`Failed to search logs: ${err.message}`);
    }
  };

  // Handle start button click to fetch logs with specified type and date
  const handleStart = (logType, date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construct the filename pattern based on selected log type and date
      // "Automation Logs" → corresponds to email_automation_YYYYMMDD.log
      // "Error Logs" → corresponds to error_YYYYMMDD.log
      // "Success Logs" → corresponds to success_YYYYMMDD.log
      let filePattern = '';
      
      if (logType === 'automation') {
        filePattern = `email_automation_${date || ''}`;
      } else if (logType === 'error') {
        filePattern = `error_${date || ''}`;
      } else if (logType === 'success') {
        filePattern = `success_${date || ''}`;
      }
      
      console.log(`Starting log fetch with pattern: ${filePattern || 'All logs'}`);
      
      // TODO: Replace with actual API call to backend
      // In a real implementation, this would fetch logs from the backend based on the file pattern
      // For now, we'll use the existing loadLogs function with a simulated delay
      setTimeout(() => {
        loadLogs({ filePattern });
      }, 1000);
      
    } catch (err) {
      setError(`Failed to start log fetching: ${err.message}`);
      setIsLoading(false);
    }
  };


  // Real-time updates
  useEffect(() => {
    let interval;
    if (isRealTimeEnabled) {
      interval = setInterval(() => {
        loadLogs();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRealTimeEnabled]);

  // Initial load
  useEffect(() => {
    loadLogs();
  }, []);

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col min-h-screen">
      <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />
      
      <div className="flex-grow bg-gradient-to-b from-gray-50 to-gray-100">
        <main className="flex-grow py-3 px-3 w-full animate-fadeIn">
          <div className="w-full max-w-full mx-auto px-2">
            {/* Breadcrumb Navigation */}
            <Breadcrumb
              items={[
                { label: 'Home', path: '/home', icon: <HomeIcon /> },
                { label: 'Log Management' }
              ]}
            />

            <div className="w-full bg-white shadow-md rounded-xl p-5">
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="mr-3">📊</span>
                    Log Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Monitor, filter, and manage system logs from your email automation backend.
                  </p>
                </div>
                
                {/* Controls Section */}
                <div className="flex items-center space-x-4">
                  {/* Real-time toggle */}
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRealTimeEnabled}
                        onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        Real-time updates
                      </span>
                    </label>
                  </div>
                  
                  {/* Last refresh info */}
                  {lastRefresh && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      Last: {lastRefresh.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-1 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Log Actions Section */}
              <LogActions
                selectedLogs={selectedRows}
                totalLogs={filteredLogs.length}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onCleanup={handleCleanup}
                onRefresh={handleRefresh}
                onSearch={handleQuickSearch}
                onStart={handleStart}
                isLoading={isLoading}
              />

              {/* Log Table Section */}
              <LogTable
                logs={paginatedLogs}
                isLoading={isLoading}
                totalRows={filteredLogs.length}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onRowSelect={handleRowSelect}
                selectedRows={selectedRows}
              />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default LogManagementPage;
