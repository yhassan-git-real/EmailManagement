import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * A route wrapper that redirects to the login page if the user is not connected
 * @param {Object} props - Component properties
 * @param {boolean} props.isConnected - Whether the user is connected to the database
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} - The protected component or a redirect
 */
const ProtectedRoute = ({ isConnected, children }) => {
    if (!isConnected) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;
