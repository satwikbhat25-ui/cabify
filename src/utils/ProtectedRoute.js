import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiresRide = false }) => {
  const token = localStorage.getItem('ubl_token') ||
                localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiresRide) {
    const activeRideId = localStorage.getItem('activeRideId');
    if (!activeRideId) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;