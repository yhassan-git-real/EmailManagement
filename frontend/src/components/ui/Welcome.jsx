import React from 'react';

const Welcome = () => {
  return (
    <div className="flex flex-col h-full justify-center">
      <div>
        <div className="mb-5">
          <span className="text-xs font-medium px-2.5 py-1 rounded-md" style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            Email Automation Platform
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-3 text-white">
          Streamline your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">email delivery</span> workflows
        </h1>
        <p className="text-slate-300 text-sm mb-6">
          Connect to your SQL Server database to manage and monitor email delivery status.
          Track sent, failed, and pending emails in real-time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center rounded-lg px-3 py-2.5 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group" style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <div className="flex-shrink-0 p-1.5 rounded-md mr-2.5 transition-all duration-300 group-hover:scale-110" style={{
              background: 'rgba(99, 102, 241, 0.15)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-400 transition-all duration-300 group-hover:text-indigo-300">
                <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-0.5">
              <h3 className="font-medium text-white text-xs transition-all duration-300 group-hover:text-indigo-300">Real-time Monitoring</h3>
              <p className="text-xs text-slate-400 leading-tight transition-all duration-300 group-hover:text-slate-300">Track delivery status</p>
            </div>
          </div>

          <div className="flex items-center rounded-lg px-3 py-2.5 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group" style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}>
            <div className="flex-shrink-0 p-1.5 rounded-md mr-2.5 transition-all duration-300 group-hover:scale-110" style={{
              background: 'rgba(6, 182, 212, 0.15)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-cyan-400 transition-all duration-300 group-hover:text-cyan-300 group-hover:rotate-45">
                <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06 6.5 6.5 0 109.192 0 .75.75 0 111.06-1.06 8 8 0 11-11.313 0 .75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-0.5">
              <h3 className="font-medium text-white text-xs transition-all duration-300 group-hover:text-cyan-300">Database Integration</h3>
              <p className="text-xs text-slate-400 leading-tight transition-all duration-300 group-hover:text-slate-300">Connect to SQL Server</p>
            </div>
          </div>

          <div className="flex items-center rounded-lg px-3 py-2.5 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group" style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div className="flex-shrink-0 p-1.5 rounded-md mr-2.5 transition-all duration-300 group-hover:scale-110" style={{
              background: 'rgba(139, 92, 246, 0.15)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-purple-400 transition-all duration-300 group-hover:text-purple-300">
                <path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 015 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914z" />
                <path d="M14 6c-.762 0-1.52.02-2.271.062C10.157 6.148 9 7.472 9 8.998v2.24c0 1.519 1.147 2.839 2.71 2.935.214.013.428.024.642.034.2.009.385.09.518.224l2.35 2.35a.75.75 0 001.28-.531v-2.07c1.453-.195 2.5-1.463 2.5-2.915V8.998c0-1.526-1.157-2.85-2.729-2.936A41.645 41.645 0 0014 6z" />
              </svg>
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-0.5">
              <h3 className="font-medium text-white text-xs transition-all duration-300 group-hover:text-purple-300">Delivery Reports</h3>
              <p className="text-xs text-slate-400 leading-tight transition-all duration-300 group-hover:text-slate-300">Comprehensive analytics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative hover:cursor-pointer group">
          <div className="w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-105" style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)'
          }}>
            <div className="w-36 h-36 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:shadow-xl" style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-indigo-400 transition-all duration-500 group-hover:text-indigo-300 group-hover:scale-110">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>

          {/* Animated decorative elements */}
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-500 rounded-full opacity-50 transition-all duration-700 ease-in-out group-hover:transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-125 group-hover:opacity-70 group-hover:bg-indigo-400"></div>
          <div className="absolute -bottom-3 left-3 w-3 h-3 bg-cyan-500 rounded-full opacity-50 transition-all duration-700 ease-in-out group-hover:transform group-hover:translate-y-1 group-hover:translate-x-1 group-hover:scale-125 group-hover:opacity-70 group-hover:bg-cyan-400"></div>
          <div className="absolute top-1/3 -left-3 w-2 h-2 bg-purple-500 rounded-full opacity-30 transition-all duration-700 ease-in-out group-hover:transform group-hover:-translate-x-1 group-hover:scale-125 group-hover:opacity-50 group-hover:bg-purple-400"></div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
