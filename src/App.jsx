import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/forgotpassword';
import DashboardPage from './pages/DashboardPage';

function Dashboard() {
  const userJson = localStorage.getItem('ubl_user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('ubl_token');
    window.location.href = '/';
  };

  if (!localStorage.getItem('ubl_token')) {
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
