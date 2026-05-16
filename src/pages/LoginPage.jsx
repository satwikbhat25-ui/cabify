import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function getUsers() {
  const raw = localStorage.getItem('ubl_users');
  return raw ? JSON.parse(raw) : [];
}

const GOOGLE_CLIENT_ID = '937676436138-baj40c80e03v3vsap5pbs8ebiq2157lf.apps.googleusercontent.com'; // 🔴 Replace this

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 // Fix 1 — auto redirect, add eslint disable to avoid lint warning
useEffect(() => {
  const token = localStorage.getItem('ubl_token');
  const user = localStorage.getItem('ubl_user');
  if (token && user) {
    navigate('/dashboard');
  }
}, []); // ← empty array, run only once on mount

// Fix 2 — Google script loader
useEffect(() => {
  // Don't load if already loaded
  if (document.getElementById('google-gsi-script')) return;

  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.id = 'google-gsi-script'; // ← give it an ID to prevent duplicates
  document.body.appendChild(script);

  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
  };

  return () => {
    // Don't remove it on cleanup, just leave it loaded
  };
}, []); // ← empty array, run only once on mount

  const handleGoogleResponse = (response) => {
    try {
      // Decode JWT token from Google
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const { name, email, sub } = JSON.parse(jsonPayload);

      const token = `google-token-${sub}-${Date.now()}`;
      localStorage.setItem('ubl_token', token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('activeRideId', 'test123');
      localStorage.setItem('ubl_user', JSON.stringify({ name, email }));

      navigate('/dashboard');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google sign-in is not ready yet. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    const users = getUsers();

    if (users.length === 0) {
      setError('No accounts found. Please register first.');
      setLoading(false);
      return;
    }

    const found = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!found) {
      setError('No account found with that email. Please register first.');
      setLoading(false);
      return;
    }

    if (found.password !== password) {
      setError('Incorrect password. Please try again.');
      setLoading(false);
      return;
    }

    const token = `mock-token-${Date.now()}`;
    localStorage.setItem('ubl_token', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('activeRideId', 'test123');
    localStorage.setItem('ubl_user', JSON.stringify({ name: found.name, email: found.email }));

    setLoading(false);
    navigate('/dashboard');
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
        maxWidth: '900px',
        background: '#0a0a0f',
        display: 'flex',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 40px 120px rgba(0,0,0,0.8)'
      }}>

        {/* LEFT PANEL */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #0f0c29, #1a1040, #0d0d1a)',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '620px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(108,77,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(108,77,246,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}/>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '42px', height: '42px',
              background: 'linear-gradient(135deg, #6c4df6, #9333ea)',
              borderRadius: '12px', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '20px'
            }}>🚗</div>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>
              Uber<span style={{ color: '#a78bfa' }}>Lite</span>
            </span>
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(108,77,246,0.2)', border: '0.5px solid rgba(108,77,246,0.4)',
              color: '#c4b5fd', fontSize: '11px', fontWeight: '500',
              letterSpacing: '1.2px', textTransform: 'uppercase',
              padding: '5px 12px', borderRadius: '20px', marginBottom: '1.2rem'
            }}>• Now in your city</div>

            <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#fff', lineHeight: '1.1', margin: '0 0 1rem 0' }}>
              Move smarter,<br/>
              <span style={{ color: '#a78bfa' }}>live better.</span>
            </h1>

            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', maxWidth: '240px', margin: 0 }}>
              Premium rides at honest prices. Transparent fares, no surge surprises — just seamless travel.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          width: '360px', flexShrink: 0, background: '#0e0e18',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '2.8rem 2.4rem', borderLeft: '0.5px solid rgba(255,255,255,0.07)'
        }}>
          <p style={{ fontSize: '11px', fontWeight: '500', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', margin: '0 0 0.4rem 0' }}>
            Welcome back
          </p>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#fff', margin: '0 0 0.35rem 0' }}>Sign in</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', margin: '0 0 2rem 0' }}>Enter your credentials to continue</p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', color: '#EF4444',
              padding: '10px 14px', borderRadius: '10px',
              marginBottom: '16px', fontSize: '14px',
              border: '1px solid rgba(239,68,68,0.2)'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.48)', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{
                  width: '100%', height: '46px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px',
                  padding: '0 14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.48)', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{
                  width: '100%', height: '46px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: '#fff',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px',
                  padding: '0 14px', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: '#a78bfa', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', height: '48px',
                background: loading ? 'rgba(108,77,246,0.5)' : 'linear-gradient(135deg, #6c4df6, #9333ea)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontFamily: 'Inter, sans-serif', fontSize: '15px',
                fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '1rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {loading ? 'Signing in...' : '→ Continue'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '1.3rem 0' }}>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.08)' }}/>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}>or sign in with</span>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.08)' }}/>
          </div>

          {/* Social Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                height: '42px', background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: 'rgba(255,255,255,0.65)',
                fontFamily: 'Inter, sans-serif', fontSize: '13px',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              🔵 Google
            </button>
            <button style={{
              height: '42px', background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: 'rgba(255,255,255,0.65)',
              fontFamily: 'Inter, sans-serif', fontSize: '13px',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
               Apple
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.32)', margin: '1.7rem 0 0 0' }}>
            New to UberLite?{' '}
            <Link to="/register" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: '500' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}