import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function getUsers() {
  const raw = localStorage.getItem('ubl_users');
  return raw ? JSON.parse(raw) : [];
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const users = getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setError('An account with this email already exists.');
      return;
    }

    const newUser = { id: Date.now(), name: name.trim(), email: email.trim(), password };
    users.push(newUser);
    localStorage.setItem('ubl_users', JSON.stringify(users));

    // generate mock token for registration step optionally
    const token = `mock-token-${Date.now()}`;
    localStorage.setItem('ubl_token', token);
    // store safe user copy
    const safeUser = { name: newUser.name, email: newUser.email };
    localStorage.setItem('ubl_user', JSON.stringify(safeUser));

    setSuccess('Registration successful! Redirecting to login...');

    // small delay so user sees message, then navigate to login
    setTimeout(() => {
      // For the MVP we log out the token and send user to login to explicitly login
      localStorage.removeItem('ubl_token');
      navigate('/');
    }, 900);
  };

  return (
    <div className="auth-wrap">
      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <h1>UberLite — Register</h1>
        <p className="muted">Create an account to start booking rides.</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <label>
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </label>

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
            placeholder="Choose a password"
            required
          />
        </label>

        <button className="btn" type="submit">Register</button>

        <p className="muted">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}
