import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// Import both mock and real API
import { fetchEmailStatus } from '../utils/mockApi';
// TODO: When backend API for email status is ready, update to use:
// import { fetchEmailStatus } from '../utils/apiClient';
import EmailStatusCard from './EmailStatusCard';

const StatusSummary = () => {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatusData = async () => {
    setLoading(true);
    try {
      const data = await fetchEmailStatus();
      setStatusData(data);
    } catch (error) {
      toast.error('Failed to load email status data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadStatusData();
  }, []);

  const handleRefresh = () => {
    loadStatusData();
    toast.info('Refreshing email status data...');
  };  return (
    <div className="card-glass max-w-5xl mx-auto shadow-xl">
      {/* Card header with accent line */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-t-lg"></div>
      </div>
      
      <div className="p-8 sm:p-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-700">Email Status Report</h2>
                <p className="text-gray-600 mt-2">Real-time overview of email delivery performance</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="btn-primary group self-end"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className={`w-5 h-5 mr-2 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh Report'}
          </button>
        </div>
      </div>      {loading && !statusData ? (
        <div className="pt-2 pb-6 flex justify-center">
          <div className="animate-pulse flex flex-col items-center space-y-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-4xl mt-4">
              <div className="h-52 bg-gray-200 rounded-2xl shadow-md"></div>
              <div className="h-52 bg-gray-200 rounded-2xl shadow-md"></div>
              <div className="h-52 bg-gray-200 rounded-2xl shadow-md"></div>
            </div>
          </div>
        </div>      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 py-6 sm:px-8 sm:py-8">
          <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <EmailStatusCard 
              title="Sent" 
              count={statusData?.sent || 0}
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
