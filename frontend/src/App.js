import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/animations.css';
import AppRoutes from './routes';
import { saveConnectionToSession, loadConnectionFromSession, clearConnectionSession, updateActivityTimestamp } from './utils/sessionUtils';

// Silence React Router warnings for future version
const originalConsoleWarn = console.warn;
console.warn = function (msg) {
  if (msg && msg.includes && msg.includes('react-router-dom')) {
    // Suppress React Router migration warnings
    return;
  }
  originalConsoleWarn.apply(console, arguments);
};

function App() {
  // Initialize state from sessionStorage if available
  const [isConnected, setIsConnected] = useState(() => {
    const { isConnected } = loadConnectionFromSession();
    return isConnected;
  });

  const [connectionInfo, setConnectionInfo] = useState(() => {
    const { connectionInfo } = loadConnectionFromSession();
    return connectionInfo;
  });

  // Update sessionStorage when connection state changes
  useEffect(() => {
    saveConnectionToSession(isConnected, connectionInfo);
  }, [isConnected, connectionInfo]);

  // Update activity timestamp periodically to maintain localStorage session
  useEffect(() => {
    const updateActivity = () => {
      if (isConnected) {
        updateActivityTimestamp();
      }
    };

    // Update activity every 5 minutes
    const interval = setInterval(updateActivity, 5 * 60 * 1000);
    
    // Update activity on user interactions
    const handleUserActivity = () => {
      if (isConnected) {
        updateActivityTimestamp();
      }
    };

    // Listen for user activity
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, [isConnected]);

  const handleConnect = (connected, info) => {
    setIsConnected(connected);
    setConnectionInfo(info);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionInfo(null);
    // Clear session storage on disconnect
    clearConnectionSession();
  };

  return (
    <Router>
      <div className="min-h-screen">
        <AppRoutes 
          isConnected={isConnected}
          connectionInfo={connectionInfo}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </Router>
  );
}

export default App;
