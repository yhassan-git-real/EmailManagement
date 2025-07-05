import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import StatusPage from './pages/StatusPage';
import ComposePage from './pages/ComposePage';
import AutomatePage from './pages/AutomatePage';
import EmailRecordsPage from './features/email-records';

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
    const saved = sessionStorage.getItem('isConnected');
    return saved ? JSON.parse(saved) : false;
  });

  const [connectionInfo, setConnectionInfo] = useState(() => {
    const saved = sessionStorage.getItem('connectionInfo');
    return saved ? JSON.parse(saved) : null;
  });

  // Update sessionStorage when connection state changes
  useEffect(() => {
    sessionStorage.setItem('isConnected', JSON.stringify(isConnected));
    sessionStorage.setItem('connectionInfo', JSON.stringify(connectionInfo));
  }, [isConnected, connectionInfo]);

  const handleConnect = (connected, info) => {
    setIsConnected(connected);
    setConnectionInfo(info);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionInfo(null);
    // Clear session storage on disconnect
    sessionStorage.removeItem('isConnected');
    sessionStorage.removeItem('connectionInfo');
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isConnected) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route
            path="/"
            element={<Dashboard
              onConnected={handleConnect}
              onConnectionInfoUpdate={setConnectionInfo}
              connectionInfo={connectionInfo}
              isConnected={isConnected}
              onDisconnect={handleDisconnect}
            />}
          />
          <Route
            path="/dashboard"
            element={<Navigate to="/" replace />}
          />
          <Route
            path="/status"
            element={
              <ProtectedRoute>
                <StatusPage
                  connectionInfo={connectionInfo}
                  onDisconnect={handleDisconnect}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compose"
            element={
              <ProtectedRoute>
                <ComposePage
                  connectionInfo={connectionInfo}
                  onDisconnect={handleDisconnect}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/automate"
            element={
              <ProtectedRoute>
                <AutomatePage
                  connectionInfo={connectionInfo}
                  onDisconnect={handleDisconnect}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-records"
            element={
              <ProtectedRoute>
                <EmailRecordsPage
                  connectionInfo={connectionInfo}
                  onDisconnect={handleDisconnect}
                />
              </ProtectedRoute>
            }
          />
          {/* Keep the old route for backward compatibility */}
          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <EmailRecordsPage
                  connectionInfo={connectionInfo}
                  onDisconnect={handleDisconnect}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={5000} />
      </div>    </Router>
  );
}

export default App;
