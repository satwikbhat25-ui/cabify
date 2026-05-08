import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function getUsers() {
  const raw = localStorage.getItem('ubl_users');
  return raw ? JSON.parse(raw) : [];
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ul-body {
    font-family: 'DM Sans', sans-serif;
    background: #060611;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .ul-root {
    width: 100%;
    max-width: 900px;
    background: #0a0a0f;
    display: flex;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.07);
  }

  .ul-left {
    flex: 1;
    background: linear-gradient(135deg, #0f0c29, #1a1040, #0d0d1a);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.5rem;
    overflow: hidden;
    min-height: 620px;
  }

  .ul-left::before {
    content: '';
    position: absolute;
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, rgba(108,77,246,0.38) 0%, transparent 70%);
    top: -100px;
    left: -100px;
    pointer-events: none;
  }

  .ul-left::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,75,110,0.18) 0%, transparent 70%);
    bottom: 40px;
    right: -60px;
    pointer-events: none;
  }

  .ul-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(108,77,246,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(108,77,246,0.07) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .ul-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 2;
  }

  .ul-logo-wordmark {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 24px;
    color: #fff;
    letter-spacing: -1px;
  }

  .ul-logo-wordmark span { color: #a78bfa; }

  .ul-hero { position: relative; z-index: 2; }

  .ul-hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(108,77,246,0.2);
    border: 0.5px solid rgba(108,77,246,0.4);
    color: #c4b5fd;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 20px;
    margin-bottom: 1.2rem;
  }

  .ul-hero-tag::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #a78bfa;
    border-radius: 50%;
  }

  .ul-hero-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 38px;
    line-height: 1.1;
    color: #fff;
    margin-bottom: 1rem;
  }

  .ul-hero-title em { font-style: normal; color: #a78bfa; }

  .ul-hero-desc {
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    line-height: 1.7;
    max-width: 240px;
  }

  .ul-right {
    width: 380px;
    flex-shrink: 0;
    background: #0e0e18;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2.8rem 2.4rem;
    border-left: 0.5px solid rgba(255,255,255,0.07);
  }

  .ul-form-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    margin-bottom: 0.4rem;
  }

  .ul-form-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.35rem;
  }

  .ul-form-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.38);
    margin-bottom: 2rem;
  }

  .ul-field { margin-bottom: 1rem; }

  .ul-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.48);
    margin-bottom: 6px;
    letter-spacing: 0.3px;
  }

  .ul-input-wrap { position: relative; }

  .ul-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255,255,255,0.22);
    font-size: 16px;
    pointer-events: none;
  }

  .ul-input {
    width: 100%;
    height: 46px;
    background: rgba(255,255,255,0.05);
    border: 0.5px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 0 14px 0 42px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }

  .ul-input:focus {
    border-color: rgba(108,77,246,0.65);
    background: rgba(108,77,246,0.08);
  }

  .ul-input::placeholder { color: rgba(255,255,255,0.18); }

  .ul-btn {
    width: 100%;
    height: 48px;
    background: linear-gradient(135deg, #6c4df6, #9333ea);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.3px;
    cursor: pointer;
    margin-top: 1.4rem;
    position: relative;
    overflow: hidden;
    transition: opacity 0.2s, transform 0.12s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .ul-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, transparent 55%);
    pointer-events: none;
  }

  .ul-btn:hover { opacity: 0.9; }
  .ul-btn:active { transform: scale(0.98); }

  .ul-alert {
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    margin-bottom: 1.2rem;
  }

  .ul-alert-error {
    background: rgba(220, 38, 38, 0.12);
    border: 0.5px solid rgba(220, 38, 38, 0.35);
    color: #fca5a5;
  }

  .ul-alert-success {
    background: rgba(74, 222, 128, 0.1);
    border: 0.5px solid rgba(74, 222, 128, 0.3);
    color: #86efac;
  }

  .ul-signup-row {
    text-align: center;
    margin-top: 1.7rem;
    font-size: 13px;
    color: rgba(255,255,255,0.32);
  }

  .ul-signup-row a {
    color: #a78bfa;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
  }

  .ul-signup-row a:hover { text-decoration: underline; }

  @media (max-width: 700px) {
    .ul-body { padding: 0; }
    .ul-root { flex-direction: column; border-radius: 0; max-width: 100%; min-height: 100vh; }
    .ul-left { min-height: 280px; padding: 2rem; }
    .ul-hero-title { font-size: 28px; }
    .ul-right { width: 100%; padding: 2rem 1.6rem; }
  }
`;

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

    const token = `mock-token-${Date.now()}`;
    localStorage.setItem('ubl_token', token);

    const safeUser = { name: newUser.name, email: newUser.email };
    localStorage.setItem('ubl_user', JSON.stringify(safeUser));

    setSuccess('Registration successful! Redirecting to login...');
    setTimeout(() => {
      localStorage.removeItem('ubl_token');
      navigate('/');
    }, 900);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ul-body">
        <div className="ul-root">

          {/* LEFT PANEL */}
          <div className="ul-left">
            <div className="ul-grid" />

            {/* Logo */}
            <div className="ul-logo">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="44" height="44" rx="14" fill="url(#cabifyGrad2)" />
                <circle cx="22" cy="22" r="11" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
                <circle cx="22" cy="22" r="4" fill="white" opacity="0.95" />
                <line x1="22" y1="11" x2="22" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <line x1="22" y1="26" x2="22" y2="33" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <line x1="11" y1="22" x2="18" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <line x1="26" y1="22" x2="33" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <defs>
                  <linearGradient id="cabifyGrad2" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6c4df6" />
                    <stop offset="1" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="ul-logo-wordmark">ca<span>bify</span></div>
            </div>

            {/* Hero */}
            <div className="ul-hero">
              <div className="ul-hero-tag">Join today</div>
              <div className="ul-hero-title">
                Your first ride<br /><em>starts here.</em>
              </div>
              <div className="ul-hero-desc">
                Create your account in seconds and enjoy premium rides at honest, transparent prices.
              </div>
            </div>

            <div />
          </div>

          {/* RIGHT PANEL */}
          <div className="ul-right">
            <div className="ul-form-eyebrow">Get started</div>
            <div className="ul-form-title">Create account</div>
            <div className="ul-form-sub">Fill in your details to register</div>

            {error && <div className="ul-alert ul-alert-error">{error}</div>}
            {success && <div className="ul-alert ul-alert-success">{success}</div>}

            <div className="ul-field">
              <label className="ul-label" htmlFor="name">Full name</label>
              <div className="ul-input-wrap">
                <i className="ti ti-user ul-input-icon" aria-hidden="true" />
                <input
                  className="ul-input"
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ul-field">
              <label className="ul-label" htmlFor="email">Email address</label>
              <div className="ul-input-wrap">
                <i className="ti ti-mail ul-input-icon" aria-hidden="true" />
                <input
                  className="ul-input"
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ul-field">
              <label className="ul-label" htmlFor="password">Password</label>
              <div className="ul-input-wrap">
                <i className="ti ti-lock ul-input-icon" aria-hidden="true" />
                <input
                  className="ul-input"
                  id="password"
                  type="password"
                  placeholder="Choose a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="ul-btn" type="button" onClick={handleSubmit}>
              <i className="ti ti-arrow-right" aria-hidden="true" />
              Create account
            </button>

            <div className="ul-signup-row">
              Already have an account? <Link to="/">Sign in</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}