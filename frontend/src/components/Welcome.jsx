import React from 'react';

const Welcome = () => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-10 items-center justify-center my-6 lg:my-0">
      <div className="flex-1 max-w-xl">
        <div className="mb-6">
          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-md">
            Email Management System
          </span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-800">
          Streamline your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">email delivery</span> workflows
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Connect to your database to manage and monitor email delivery status. 
          Track sent, failed, and pending emails in real-time.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <div className="bg-primary-50 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary-600">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Real-time Monitoring</h3>
              <p className="text-xs text-gray-500">Track email delivery status</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-secondary-50 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-secondary-600">
                <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06 6.5 6.5 0 109.192 0 .75.75 0 111.06-1.06 8 8 0 11-11.313 0 .75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Database Integration</h3>
              <p className="text-xs text-gray-500">Connect to any SQL Server</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-green-50 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-600">
                <path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 015 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914z" />
                <path d="M14 6c-.762 0-1.52.02-2.271.062C10.157 6.148 9 7.472 9 8.998v2.24c0 1.519 1.147 2.839 2.71 2.935.214.013.428.024.642.034.2.009.385.09.518.224l2.35 2.35a.75.75 0 001.28-.531v-2.07c1.453-.195 2.5-1.463 2.5-2.915V8.998c0-1.526-1.157-2.85-2.729-2.936A41.645 41.645 0 0014 6z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Delivery Reports</h3>
              <p className="text-xs text-gray-500">Comprehensive status reports</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center items-center">
        <div className="relative">
          <div className="w-64 h-64 bg-gradient-to-br from-primary-400/30 to-secondary-400/30 rounded-full flex items-center justify-center animate-pulse-slow">
            <div className="w-48 h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full border-4 border-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-primary-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-500 rounded-full opacity-70"></div>
          <div className="absolute -bottom-6 left-6 w-5 h-5 bg-secondary-500 rounded-full opacity-70"></div>
          <div className="absolute top-1/3 -left-6 w-4 h-4 bg-green-500 rounded-full opacity-70"></div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
