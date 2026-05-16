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
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('ubl_token');
    const user = localStorage.getItem('ubl_user');
    if (token && user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const users = getUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (exists) {
      setError('An account with this email already exists.');
      setLoading(false);
      return;
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      password
    };

    users.push(newUser);
    localStorage.setItem('ubl_users', JSON.stringify(users));

    setSuccess('Account created! Redirecting to login...');
    setLoading(false);

    setTimeout(() => {
      localStorage.removeItem('ubl_token');
      navigate('/');
    }, 900);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060611',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: '#0e0e18',
        borderRadius: '20px',
        padding: '2.8rem 2.4rem',
        border: '0.5px solid rgba(255,255,255,0.07)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #6c4df6, #9333ea)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            🚗
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>
            Uber<span style={{ color: '#a78bfa' }}>Lite</span>
          </span>
        </div>

        <p style={{
          fontSize: '11px',
          fontWeight: '500',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.28)',
          margin: '0 0 0.4rem 0'
        }}>
          Get started
        </p>

        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: '0 0 0.35rem 0' }}>
          Create account
        </h2>

        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', margin: '0 0 2rem 0' }}>
          Sign up to start booking rides
        </p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            color: '#EF4444',
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid rgba(239,68,68,0.2)'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16,185,129,0.1)',
            color: '#10B981',
            padding: '10px 14px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid rgba(16,185,129,0.2)'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: 'rgba(255,255,255,0.48)',
              marginBottom: '6px'
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              style={{
                width: '100%',
                height: '46px',
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                padding: '0 14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: 'rgba(255,255,255,0.48)',
              marginBottom: '6px'
            }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                height: '46px',
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                padding: '0 14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: 'rgba(255,255,255,0.48)',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              style={{
                width: '100%',
                height: '46px',
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                padding: '0 14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              background: loading ? 'rgba(108,77,246,0.5)' : 'linear-gradient(135deg, #6c4df6, #9333ea)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Creating account...' : '→ Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: 'rgba(255,255,255,0.32)' }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '500' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}