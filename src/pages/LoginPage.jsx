import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Simple helper to get users from localStorage
function getUsers() {
  const raw = localStorage.getItem('ubl_users');
  return raw ? JSON.parse(raw) : [];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      setError('No account found with that email.');
      return;
    }

    if (found.password !== password) {
      setError('Invalid credentials.');
      return;
    }

    // Login successful: save token and current user reference
    const token = `mock-token-${Date.now()}`;
    localStorage.setItem('ubl_token', token);
    // Save a pointer to the logged-in user (without password for safety)
    const safeUser = { name: found.name, email: found.email };
    localStorage.setItem('ubl_user', JSON.stringify(safeUser));

    // redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="auth-wrap">
      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <h1>UberLite — Login</h1>
        <p className="muted">Welcome back — login to continue.</p>

        {error && <div className="error">{error}</div>}

        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
        </label>

        <button className="btn" type="submit">Login</button>

        <p className="muted">
          New to UberLite? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
