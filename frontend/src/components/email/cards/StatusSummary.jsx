import React, { useState, useEffect } from 'react';
import { fetchEmailStatus } from '../../../utils/apiClient';
import { saveEmailStatusToSession, loadEmailStatusFromSession, isEmailStatusStale } from '../../../utils/sessionUtils';

const StatusSummary = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadStatusData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      if (!forceRefresh) {
        const { statusData: cachedData, lastUpdated: cachedTimestamp } = loadEmailStatusFromSession();
        if (cachedData && !isEmailStatusStale(5)) {
          setStatusData(cachedData);
          setLastUpdated(new Date(cachedTimestamp).toLocaleString());
          setLoading(false);
          return;
        }
      }
      const data = await fetchEmailStatus();
      setStatusData(data);
      saveEmailStatusToSession(data);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error(error);
      const { statusData: cachedData, lastUpdated: cachedTimestamp } = loadEmailStatusFromSession();
      if (cachedData) {
        setStatusData(cachedData);
        setLastUpdated(`${new Date(cachedTimestamp).toLocaleString()} (cached)`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatusData();
  }, []);

  const handleRefresh = () => loadStatusData(true);

  const StatusChip = ({ label, count, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${color}`}>
      <span className="text-lg font-bold">{count}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );

  return (
    <div className="bg-dark-600/60 rounded-xl border border-dark-300/40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-300/30">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-primary">Email Status</h3>
          {lastUpdated && (
            <span className="text-xs text-text-muted">• {lastUpdated}</span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 text-text-muted hover:text-text-secondary hover:bg-dark-500/60 rounded-md transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading && !statusData ? (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-24 bg-dark-500 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <StatusChip
              label="Sent"
              count={statusData?.success || 0}
              color="bg-success/10 border-success/30 text-success-light"
            />
            <StatusChip
              label="Failed"
              count={statusData?.failed || 0}
              color="bg-danger/10 border-danger/30 text-danger-light"
            />
            <StatusChip
              label="Pending"
              count={statusData?.pending || 0}
              color="bg-warning/10 border-warning/30 text-warning-light"
            />
          </div>
        )}

        {/* Recent Activity Table */}
        {statusData && (statusData.recentEmails?.length > 0) && (
          <div className="mt-4">
            <div className="text-xs font-medium text-text-muted mb-2">Recent Activity</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-muted text-xs">
                    <th className="pb-2 pr-4 font-medium">Time</th>
                    <th className="pb-2 pr-4 font-medium">Recipient</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  {statusData.recentEmails.slice(0, 5).map((email, i) => (
                    <tr key={i} className="border-t border-dark-300/20">
                      <td className="py-2 pr-4 text-xs text-text-muted">{email.time}</td>
                      <td className="py-2 pr-4 truncate max-w-[140px]">{email.recipient}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${email.status === 'sent' ? 'bg-success/20 text-success-light' :
                            email.status === 'failed' ? 'bg-danger/20 text-danger-light' :
                              'bg-warning/20 text-warning-light'
                          }`}>
                          {email.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusSummary;
