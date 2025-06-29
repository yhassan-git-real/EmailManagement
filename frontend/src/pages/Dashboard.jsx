import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DatabaseConnector from '../components/DatabaseConnector';
import StatusSummary from '../components/StatusSummary';
import Alert from '../components/Alert';
import Welcome from '../components/Welcome';
import BackgroundIllustration from '../components/BackgroundIllustration';

const Dashboard = ({ isConnected, connectionInfo, onConnected, onConnectionInfoUpdate, onDisconnect }) => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const localIsConnected = isConnected === undefined ? false : isConnected;  // Handle successful connection
  const handleConnected = (connected) => {
    if (connected) {
      onConnected(connected);
      // No need to show success alert here since we're redirecting to status page
    }
  };

  // Handle disconnect locally
  const handleLocalDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
      toast.info('Disconnected from database');
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background decoration */}
      <BackgroundIllustration />
        {/* Header */}
      <Header 
        connectionInfo={connectionInfo} 
        onDisconnect={handleLocalDisconnect} 
      />
        {/* Main container */}
      <div className="flex flex-row flex-grow relative">
        {/* Main content */}
        <main className="flex-grow py-12 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-gray-50 to-gray-100 w-full">
          <div className="max-w-7xl mx-auto">
            {!localIsConnected ? (
            <div className="animate-fadeIn transition-all duration-500">
              {/* Two-column layout for welcome + connection form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                {/* Welcome section - only visible on larger screens */}
                <div className="hidden lg:block">
                  <Welcome />
                </div>                {/* Database connector - takes limited width and centered */}                <div className="lg:mt-4 flex justify-center items-center">                  <DatabaseConnector 
                    onConnected={(connected) => handleConnected(connected)}
                    onConnectionInfoUpdate={onConnectionInfoUpdate}
                  />
                </div>
              </div>
              
              {/* Mobile welcome - visible only on smaller screens */}
              <div className="block lg:hidden mt-12">
                <Welcome />
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn transition-all duration-500">              {/* Connection status indicator */}
              {showSuccessAlert && (
                <div className="max-w-4xl mx-auto mb-8">
                  <Alert 
                    type="success"
                    message="Successfully connected to database"
                    onClose={() => setShowSuccessAlert(false)}
                    autoDismiss={true}
                    dismissTime={5000}
                  />
                </div>
              )}

              <StatusSummary />
            </div>          )}
          </div>
        </main>

        {/* Mobile menu is now handled in HeaderNav component */}
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
