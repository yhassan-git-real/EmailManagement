import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/animations.css';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AutomatePage from './pages/AutomatePage';
import EmailRecordsPage from './pages/EmailRecordsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { saveConnectionToSession, loadConnectionFromSession, clearConnectionSession } from './utils/sessionUtils';

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
        <Routes>
          {/* Login Page - Entry point where users connect to the database */}
          <Route
            path="/login"
            element={<LoginPage
              onConnected={handleConnect}
              onConnectionInfoUpdate={setConnectionInfo}
              connectionInfo={connectionInfo}
              isConnected={isConnected}
              onDisconnect={handleDisconnect}
            />}
          />

          {/* Redirect root to login if not connected, otherwise to home */}
          <Route
            path="/"
            element={isConnected ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
          />

          {/* Home page showing email status reports */}
          <Route
            path="/home"
            element={
              <ProtectedRoute isConnected={isConnected}>
                <HomePage
                  connectionInfo={connectionInfo}
                  onDisconnect={handleDisconnect}
                />
              </ProtectedRoute>
            }
          />

          {/* For backwards compatibility, redirect old routes to home */}
          <Route
            path="/status"
            element={<Navigate to="/home" replace />}
          />

          <Route
            path="/dashboard"
            element={<Navigate to="/home" replace />}
          />

          <Route
            path="/automate"
            element={
              <ProtectedRoute isConnected={isConnected}>
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
              <ProtectedRoute isConnected={isConnected}>
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
              <ProtectedRoute isConnected={isConnected}>
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
