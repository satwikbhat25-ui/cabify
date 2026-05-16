import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashBoardpage from './pages/DashBoardpage';
import RideStatusPage from './pages/RideStatusPage';
import ProtectedRoute from './utils/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashBoardpage />
            </ProtectedRoute>
          }
        />

        {/* YOUR Ride Tracking Route */}
        <Route
          path="/ride/:rideId"
          element={
            <ProtectedRoute requiresRide={true}>
              <RideStatusPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}