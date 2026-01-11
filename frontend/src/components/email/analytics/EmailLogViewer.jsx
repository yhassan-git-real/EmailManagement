import React, { useState, useEffect } from 'react';
import { getFrontendLogs, clearAutomationLogs } from '../../../utils/automationApi';
import { toast } from 'react-toastify';
import { XCircleIcon, CheckCircleIcon, ClockIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const EmailLogViewer = ({ maxHeight = '300px', autoRefresh = true, isActive = false }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Function to fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getFrontendLogs(50, filterStatus || null);

      if (response.success) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  // Set up auto-refresh when component mounts
  useEffect(() => {
    fetchLogs(); // Initial fetch when component mounts

    // Only set up auto-refresh if both autoRefresh is enabled AND automation is active
    if (autoRefresh && isActive) {
      console.log("Setting up log polling - automation is active");
      const interval = setInterval(() => {
        fetchLogs();
      }, 5000); // Refresh every 5 seconds

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          console.log("Clearing log polling interval");
          clearInterval(interval);
        }
      };
    } else {
      // Clear any existing interval if automation is not active
      if (refreshInterval) {
        console.log("Clearing log polling - automation is not active");
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh, filterStatus, isActive]); // Add isActive to dependencies

  // Handle clearing logs
  const handleClearLogs = async () => {
    try {
      setLoading(true);
      const response = await clearAutomationLogs();

      if (response.success) {
        setLogs([]);
        toast.success('Logs cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Failed to clear logs');
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (!status) return null;

    const statusLower = status.toLowerCase();

    if (statusLower === 'success') {
      return <CheckCircleIcon className="h-4 w-4 text-success" />;
    } else if (statusLower === 'failed') {
      return <XCircleIcon className="h-4 w-4 text-danger" />;
    } else if (statusLower === 'pending') {
      return <ClockIcon className="h-4 w-4 text-primary-400" />;
    }

    return null;
  };

  return (
    <div className="bg-dark-600/80 rounded-xl">
      <div className="p-4 border-b border-dark-300/50 flex justify-between items-center">
        <h3 className="text-sm font-medium text-text-primary">Email Automation Logs</h3>

        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border-dark-300/50 rounded-lg bg-dark-500/80 text-text-primary focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-primary-500 transition-all"
            title="Refresh logs"
          >
            <ArrowPathIcon className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleClearLogs}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-danger to-danger-dark hover:from-danger-dark hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-700 focus:ring-danger transition-all"
            title="Clear all logs"
          >
            <TrashIcon className="h-3 w-3 mr-1" />
            Clear Logs
          </button>
        </div>
      </div>

      <div
        className="overflow-auto p-4"
        style={{ maxHeight }}
      >
        {loading && logs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-text-muted text-sm">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-text-muted text-sm">No logs available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`border-l-4 px-3 py-2 text-xs rounded-r-lg ${log.status?.toLowerCase() === 'success' ? 'border-success bg-success/10' :
                    log.status?.toLowerCase() === 'failed' ? 'border-danger bg-danger/10' :
                      'border-dark-300 bg-dark-500/50'
                  }`}
              >
                <div className="flex items-center text-text-secondary">
                  <span className="mr-1">{getStatusIcon(log.status)}</span>
                  <span className="font-medium text-text-primary">{formatTimestamp(log.timestamp)}</span>
                  {log.email_id && <span className="ml-2 text-text-muted">ID: {log.email_id}</span>}
                </div>

                {log.recipient && (
                  <div className="mt-1 text-text-secondary overflow-hidden text-ellipsis">
                    To: {log.recipient}
                  </div>
                )}

                {log.subject && (
                  <div className="text-text-secondary overflow-hidden text-ellipsis">
                    Subject: {log.subject}
                  </div>
                )}

                {log.file_name && (
                  <div className="text-text-secondary overflow-hidden text-ellipsis">
                    File: {log.file_name}
                  </div>
                )}

                {log.message && (
                  <div className={`mt-1 ${log.status?.toLowerCase() === 'failed' ? 'text-danger-light' : 'text-text-primary'}`}>
                    {log.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailLogViewer;
