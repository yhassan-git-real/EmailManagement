import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const StatusPage = ({ connectionInfo, onDisconnect }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />
        <div className="flex flex-row flex-grow relative">
        <Sidebar />
        
        <main className="flex-grow py-3 px-1 bg-gradient-to-b from-gray-50 to-gray-100 w-full md:ml-14">
          <div className="w-full lg:px-1">
            <h1 className="text-sm font-medium mb-2 text-primary-600 pl-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 00-8 8c0 3.96 2.867 7.254 6.656 7.897.194.033.395.05.6.05 1.158 0 2.234-.36 3.13-.973a4.735 4.735 0 01-1.21-1.82 2.842 2.842 0 01-1.92.743c-1.76 0-3.2-1.6-3.2-3.55 0-2.05 1.4-3.5 3.2-3.5.994 0 1.868.479 2.4 1.209A2.98 2.98 0 0113 8.17c.293 0 .572.057.844.147A8.204 8.204 0 0010 2zM8 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 4a1 1 0 00-1-1h-3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1v-3z" clipRule="evenodd" />
              </svg>
              Email Status
            </h1>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">This is the Email Status page where you can view and track all your emails.</p>
              
              {/* Status content will go here */}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default StatusPage;
