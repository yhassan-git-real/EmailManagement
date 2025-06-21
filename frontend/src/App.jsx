import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import StatusPage from './pages/StatusPage';
import ComposePage from './pages/ComposePage';
import AutomatePage from './pages/AutomatePage';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);  const handleConnect = (connected, info) => {
    setIsConnected(connected);
    if (info) {
      setConnectionInfo(info);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionInfo(null);
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
        <Routes>          <Route 
            path="/" 
            element={
              isConnected ? 
              <Navigate to="/dashboard" replace /> : 
              <Dashboard 
                onConnected={handleConnect} 
                onConnectionInfoUpdate={setConnectionInfo} 
                connectionInfo={connectionInfo} 
                isConnected={isConnected} 
                onDisconnect={handleDisconnect} 
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <StatusPage 
                  connectionInfo={connectionInfo} 
                  onDisconnect={handleDisconnect} 
                />
              </ProtectedRoute>
            } 
          />          {/* Redirect legacy /status route to /dashboard */}
          <Route 
            path="/status" 
            element={<Navigate to="/dashboard" replace />} 
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
        </Routes>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={3}
        />
      </div>
    </Router>
  );

}

export default App;
