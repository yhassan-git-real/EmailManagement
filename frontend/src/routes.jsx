import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AutomatePage from './pages/AutomateEmail';
import EmailRecordsPage from './pages/EmailRecords/EmailRecordsPage';

/**
 * Centralized route definitions for the application
 * @param {Object} props - Component properties
 * @param {boolean} props.isConnected - Whether the user is connected to the database
 * @param {Object} props.connectionInfo - Database connection information
 * @param {Function} props.onConnect - Function to handle successful connection
 * @param {Function} props.onDisconnect - Function to handle disconnection
 * @returns {React.ReactNode} - Application routes
 */
const AppRoutes = ({ isConnected, connectionInfo, onConnect, onDisconnect }) => {
  return (
    <Routes>
      {/* Login Page - Entry point where users connect to the database */}
      <Route
        path="/login"
        element={<LoginPage
          onConnected={onConnect}
          onConnectionInfoUpdate={(info) => onConnect(true, info)}
          connectionInfo={connectionInfo}
          isConnected={isConnected}
          onDisconnect={onDisconnect}
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
              onDisconnect={onDisconnect}
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
              onDisconnect={onDisconnect}
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
              onDisconnect={onDisconnect}
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
              onDisconnect={onDisconnect}
            />
          </ProtectedRoute>
        }
      />


    </Routes>
  );
};

export default AppRoutes;
