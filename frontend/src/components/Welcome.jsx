import React from 'react';

const Welcome = () => {
  return (
    <div className="flex flex-col h-full justify-center">
      <div>
        <div className="mb-5">
          <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-md border border-blue-100">
            Email Automation Platform
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-3 text-gray-800">
          Streamline your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">email delivery</span> workflows
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Connect to your SQL Server database to manage and monitor email delivery status.
          Track sent, failed, and pending emails in real-time.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-blue-200 cursor-pointer group">
            <div className="flex-shrink-0 bg-blue-50 p-1.5 rounded-md mr-2.5 transition-all duration-300 group-hover:bg-blue-100 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600 transition-all duration-300 group-hover:text-blue-700">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-0.5">
              <h3 className="font-medium text-gray-900 text-xs transition-all duration-300 group-hover:text-blue-700">Real-time Monitoring</h3>
              <p className="text-xs text-gray-500 leading-tight transition-all duration-300 group-hover:text-gray-700">Track delivery status</p>
            </div>
          </div>
          
          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-cyan-200 cursor-pointer group">
            <div className="flex-shrink-0 bg-cyan-50 p-1.5 rounded-md mr-2.5 transition-all duration-300 group-hover:bg-cyan-100 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-cyan-600 transition-all duration-300 group-hover:text-cyan-700 group-hover:rotate-45">
                <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06 6.5 6.5 0 109.192 0 .75.75 0 111.06-1.06 8 8 0 11-11.313 0 .75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-0.5">
              <h3 className="font-medium text-gray-900 text-xs transition-all duration-300 group-hover:text-cyan-700">Database Integration</h3>
              <p className="text-xs text-gray-500 leading-tight transition-all duration-300 group-hover:text-gray-700">Connect to SQL Server</p>
            </div>
          </div>
          
          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 hover:border-gray-200 cursor-pointer group">
            <div className="flex-shrink-0 bg-gray-50 p-1.5 rounded-md mr-2.5 transition-all duration-300 group-hover:bg-gray-100 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-600 transition-all duration-300 group-hover:text-gray-800">
                <path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 015 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914z" />
                <path d="M14 6c-.762 0-1.52.02-2.271.062C10.157 6.148 9 7.472 9 8.998v2.24c0 1.519 1.147 2.839 2.71 2.935.214.013.428.024.642.034.2.009.385.09.518.224l2.35 2.35a.75.75 0 001.28-.531v-2.07c1.453-.195 2.5-1.463 2.5-2.915V8.998c0-1.526-1.157-2.85-2.729-2.936A41.645 41.645 0 0014 6z" />
              </svg>
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-0.5">
              <h3 className="font-medium text-gray-900 text-xs transition-all duration-300 group-hover:text-gray-800">Delivery Reports</h3>
              <p className="text-xs text-gray-500 leading-tight transition-all duration-300 group-hover:text-gray-700">Comprehensive analytics</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <div className="relative hover:cursor-pointer group">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:from-blue-400/20 group-hover:to-cyan-400/20 group-hover:scale-105">
            <div className="w-36 h-36 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full border-2 border-white flex items-center justify-center shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:from-blue-100 group-hover:to-cyan-100 group-hover:border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-blue-500 transition-all duration-500 group-hover:text-blue-600 group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>
          
          {/* Animated decorative elements */}
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full opacity-50 transition-all duration-700 ease-in-out group-hover:transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-125 group-hover:opacity-70 group-hover:bg-blue-600"></div>
          <div className="absolute -bottom-3 left-3 w-3 h-3 bg-cyan-500 rounded-full opacity-50 transition-all duration-700 ease-in-out group-hover:transform group-hover:translate-y-1 group-hover:translate-x-1 group-hover:scale-125 group-hover:opacity-70 group-hover:bg-cyan-600"></div>
          <div className="absolute top-1/3 -left-3 w-2 h-2 bg-gray-500 rounded-full opacity-30 transition-all duration-700 ease-in-out group-hover:transform group-hover:-translate-x-1 group-hover:scale-125 group-hover:opacity-50 group-hover:bg-gray-600"></div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
