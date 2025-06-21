import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

const AutomatePage = ({ connectionInfo, onDisconnect }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header connectionInfo={connectionInfo} onDisconnect={onDisconnect} />
        <div className="flex flex-row flex-grow relative">
        <Sidebar />
        
        <main className="flex-grow py-12 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-gray-50 to-gray-100 w-full md:ml-20">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Automate Email</h1>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <p className="text-gray-600">This is the Automate Email page where you can set up automated email workflows.</p>
              
              {/* Automation settings will go here */}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AutomatePage;
