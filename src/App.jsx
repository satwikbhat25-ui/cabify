import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Simple Dashboard placeholder component (kept here to keep pages folder minimal)
function Dashboard() {
  const userJson = localStorage.getItem('ubl_user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('ubl_token');
    // optionally keep users list intact
    window.location.href = '/';
  };

  if (!localStorage.getItem('ubl_token')) {
    // Not authenticated — redirect to login
    return <Navigate to="/" replace />;
  }

  return (
    <div className="dashboard-wrap">
      <div className="card">
        <h2>Welcome{user && user.name ? `, ${user.name}` : ''}!</h2>
        <p>This is a temporary dashboard for UberLite (Member 1).</p>
        <button className="btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

// ProtectedRoute component checks for a token in localStorage
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('ubl_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* catch-all: redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
