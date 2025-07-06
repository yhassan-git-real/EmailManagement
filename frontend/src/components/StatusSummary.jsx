import React, { useState, useEffect } from 'react';
// Import real API client and session utilities
import { fetchEmailStatus } from '../utils/apiClient';
import { saveEmailStatusToSession, loadEmailStatusFromSession, isEmailStatusStale } from '../utils/sessionUtils';
import EmailStatusCard from './EmailStatusCard';

const StatusSummary = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadStatusData = async (forceRefresh = false) => {
    setLoading(true);
    
    try {
      // Check if we have cached data and it's not stale
      if (!forceRefresh) {
        const { statusData: cachedData, lastUpdated: cachedTimestamp } = loadEmailStatusFromSession();
        if (cachedData && !isEmailStatusStale(5)) { // 5 minutes max age
          setStatusData(cachedData);
          setLastUpdated(new Date(cachedTimestamp).toLocaleString());
          setLoading(false);
          return;
        }
      }
      
      // Fetch fresh data from API
      const data = await fetchEmailStatus();
      setStatusData(data);
      
      // Update session storage with new data
      saveEmailStatusToSession(data);
      
      // Update last updated timestamp
      const now = new Date();
      setLastUpdated(now.toLocaleString());
    } catch (error) {
      console.error(error);
      
      // Try to use cached data even if it's stale
      const { statusData: cachedData, lastUpdated: cachedTimestamp } = loadEmailStatusFromSession();
      if (cachedData) {
        setStatusData(cachedData);
        setLastUpdated(`${new Date(cachedTimestamp).toLocaleString()} (cached)`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadStatusData();
  }, []);

  const handleRefresh = () => {
    loadStatusData(true); // Force refresh from server
    // Removed toast notification as per requirement
  };  return (
    <div className="w-full">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">Email Status Report</h2>
                {lastUpdated && (
                  <p className="text-xs text-gray-500">Last updated: {lastUpdated}</p>
                )}
              </div>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-600 text-xs font-medium rounded-lg border border-primary-200 transition-colors group flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className={`w-3.5 h-3.5 mr-1.5 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>      {loading && !statusData ? (
        <div className="pt-2 pb-4 flex justify-center">
          <div className="animate-pulse flex flex-col items-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-2">
              <div className="h-32 bg-gray-100 rounded-lg shadow-sm"></div>
              <div className="h-32 bg-gray-100 rounded-lg shadow-sm"></div>
              <div className="h-32 bg-gray-100 rounded-lg shadow-sm"></div>
            </div>
          </div>
        </div>      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 px-2">
          <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <EmailStatusCard 
              title="Sent" 
              count={statusData?.success || 0}
              color="border-green-500"
              description="Successfully delivered emails"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
            <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <EmailStatusCard 
              title="Failed" 
              count={statusData?.failed || 0}
              color="border-red-500"
              description="Emails that failed to deliver"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
            <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <EmailStatusCard 
              title="Pending" 
              count={statusData?.pending || 0}
              color="border-amber-500"
              description="Emails waiting to be processed"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>        </div>
      )}
    </div>
  );
};

export default StatusSummary;
