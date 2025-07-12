import React, { useState, useEffect } from 'react';
import LogBadge from './LogBadge';

/**
 * LogTable component for displaying log entries
 * Supports pagination, sorting, log level badges, and row selection
 */
const LogTable = ({
  logs = [],
  isLoading = false,
  totalRows = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onRowSelect,
  selectedRows = [],
}) => {
  const [allSelected, setAllSelected] = useState(false);
  const [someSelected, setSomeSelected] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    if (logs.length === 0) {
      setAllSelected(false);
      setSomeSelected(false);
    } else {
      setAllSelected(selectedRows.length === logs.length);
      setSomeSelected(
        selectedRows.length > 0 && selectedRows.length < logs.length
      );
    }
  }, [selectedRows, logs]);

  const handleSelectAll = () => {
    if (allSelected) {
      onRowSelect([]);
    } else {
      onRowSelect(logs.map((log, index) => index));
    }
  };

  const handleRowClick = (id) => {
    const alreadySelected = selectedRows.includes(id);
    const newSelectedRows = alreadySelected
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];
    onRowSelect(newSelectedRows);
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      return timestamp;
    }
  };

  const truncateMessage = (message, maxLength = 100) => {
    if (!message) return '';
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  const parseLogLevel = (logLine) => {
    if (logLine.includes('ERROR')) return 'error';
    if (logLine.includes('WARNING') || logLine.includes('WARN')) return 'warning';
    if (logLine.includes('INFO')) return 'info';
    if (logLine.includes('SUCCESS')) return 'success';
    if (logLine.includes('DEBUG')) return 'debug';
    return 'info';
  };

  const parseLogData = (logLine, index) => {
    try {
      // Parse log line format: "2025-07-12 00:47:54 - INFO - {json}"
      const parts = logLine.split(' - ');
      if (parts.length >= 3) {
        const timestamp = parts[0];
        const level = parts[1];
        const jsonPart = parts.slice(2).join(' - ');
        
        let messageData = {};
        try {
          messageData = JSON.parse(jsonPart);
        } catch {
          messageData = { message: jsonPart };
        }

        return {
          id: index,
          timestamp: timestamp,
          level: level.toLowerCase(),
          message: messageData.message || jsonPart,
          process_id: messageData.process_id || 'N/A',
          email_id: messageData.email_id,
          recipient: messageData.recipient,
          subject: messageData.subject,
          status: messageData.status,
          file_path: messageData.file_path,
          raw: logLine
        };
      }
    } catch (error) {
      console.error('Error parsing log line:', error);
    }
    
    return {
      id: index,
      timestamp: new Date().toISOString(),
      level: parseLogLevel(logLine),
      message: logLine,
      process_id: 'N/A',
      raw: logLine
    };
  };

  // Parse logs if they're raw strings
  const parsedLogs = logs.map((log, index) => {
    if (typeof log === 'string') {
      return parseLogData(log, index);
    }
    return { ...log, id: log.id || index };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Enhanced Table Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 p-1.5 rounded-lg mr-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Log Entries & Details</h3>
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
            {totalRows > 0 ? (
              <span><span className="font-medium">{totalRows}</span> total logs</span>
            ) : (
              <span className="text-amber-600">No logs found</span>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Table Content */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-50 sticky top-0 z-10 border-b-2 border-gray-300">
            <tr className="divide-x divide-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12 bg-gray-100">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Timestamp
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Level
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Message
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Process ID
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              // Loading skeleton
              Array.from(Array(pageSize).keys()).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-8 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : parsedLogs.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                    <p className="text-gray-500">There are no log entries to display.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Enhanced Log entries with better styling and borders
              parsedLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    className={`divide-x divide-gray-100 border-b border-gray-100 hover:bg-blue-50 transition-all duration-200 ${
                      selectedRows.includes(log.id) ? 'bg-primary-50 border-primary-200' : 'hover:shadow-sm'
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(log.id)}
                        onChange={() => handleRowClick(log.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono bg-gray-50">
                      <div className="text-xs leading-tight">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <LogBadge level={log.level} className="text-xs" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="max-w-2xl">
                        <p className="break-words text-sm leading-relaxed">{truncateMessage(log.message, 120)}</p>
                        {log.email_id && (
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border">
                            <span className="inline-flex items-center">
                              <span className="w-1 h-1 bg-blue-500 rounded-full mr-1"></span>
                              ID: <span className="font-medium ml-1">{log.email_id}</span>
                            </span>
                            {log.recipient && (
                              <span className="inline-flex items-center">
                                <span className="w-1 h-1 bg-green-500 rounded-full mr-1"></span>
                                To: <span className="font-medium ml-1">{log.recipient}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono bg-gray-50">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700 border">
                        {log.process_id}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRowExpansion(log.id);
                        }}
                        className="text-primary-600 hover:text-primary-900 transition-colors p-1 rounded-md hover:bg-primary-100"
                        title="View details"
                      >
                        <svg 
                          className={`w-4 h-4 transform transition-transform ${
                            expandedRows[log.id] ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {/* Enhanced Expanded row details */}
                  {expandedRows[log.id] && (
                    <tr className="bg-gradient-to-r from-blue-50 to-gray-50 border-t border-blue-200">
                      <td colSpan="6" className="px-4 py-4">
                        <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
                          <div className="flex items-center mb-4">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="text-base font-semibold text-gray-900">Detailed Log Information</h4>
                          </div>
                          <div className="space-y-4 text-sm">
                            {/* Full Message */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Full Message</label>
                              <p className="text-gray-900 break-words leading-relaxed">{log.message}</p>
                            </div>

                            {/* Additional Details Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Email Details */}
                              {log.email_id && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Email ID</label>
                                  <p className="text-blue-900 font-medium">{log.email_id}</p>
                                </div>
                              )}
                              {log.recipient && (
                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                  <label className="block text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Recipient</label>
                                  <p className="text-green-900 font-medium break-all">{log.recipient}</p>
                                </div>
                              )}
                              {log.status && (
                                <div className="bg-gray-50 p-3 rounded-lg border">
                                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">Status</label>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    log.status?.toLowerCase() === 'success' ? 'bg-green-100 text-green-800' :
                                    log.status?.toLowerCase() === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {log.status}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Subject */}
                            {log.subject && (
                              <div className="bg-gray-50 p-4 rounded-lg border">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Subject</label>
                                <p className="text-gray-900">{log.subject}</p>
                              </div>
                            )}

                            {/* File Path */}
                            {log.file_path && (
                              <div className="bg-gray-50 p-4 rounded-lg border">
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">File Path</label>
                                <p className="text-gray-900 font-mono text-xs break-all bg-white px-3 py-2 rounded border">{log.file_path}</p>
                              </div>
                            )}

                            {/* Raw Log Entry */}
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Raw Log Entry</label>
                              <pre className="text-xs text-gray-600 bg-white p-3 rounded border font-mono leading-relaxed whitespace-pre-wrap">
{log.raw}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalRows / pageSize)}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalRows)}
              </span>{' '}
              of <span className="font-medium">{totalRows}</span> results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(totalRows / pageSize)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogTable;

