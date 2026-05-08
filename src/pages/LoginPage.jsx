import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

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
    width: 360px;
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

  .ul-forgot { text-align: right; margin-top: 6px; }

  .ul-forgot-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: 11px;
    color: #a78bfa;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  .ul-forgot-btn:hover { text-decoration: underline; }

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

  .ul-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 1.3rem 0;
  }

  .ul-divider-line { flex: 1; height: 0.5px; background: rgba(255,255,255,0.08); }

  .ul-divider-text {
    font-size: 11px;
    color: rgba(255,255,255,0.22);
    letter-spacing: 0.5px;
  }

  .ul-social-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .ul-social-btn {
    height: 42px;
    background: rgba(255,255,255,0.04);
    border: 0.5px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: rgba(255,255,255,0.65);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s, border-color 0.2s;
  }

  .ul-social-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.2);
  }

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

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = () => {
    setError('');
    setSuccess('');
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('ubl_users') || '[]');
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      setError('Incorrect email or password. Please register first if you don\'t have an account.');
      return;
    }
    localStorage.setItem('ubl_token', `token-${Date.now()}`);
    localStorage.setItem('ubl_user', JSON.stringify({ name: user.name, email: user.email }));
    setSuccess('Login successful! Redirecting...');
    setTimeout(() => navigate('/dashboard'), 900);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();
        const googleUser = { name: profile.name, email: profile.email };
        localStorage.setItem('ubl_token', `google-token-${Date.now()}`);
        localStorage.setItem('ubl_user', JSON.stringify(googleUser));
        const users = JSON.parse(localStorage.getItem('ubl_users') || '[]');
        const exists = users.find((u) => u.email.toLowerCase() === googleUser.email.toLowerCase());
        if (!exists) {
          users.push({ ...googleUser, password: '' });
          localStorage.setItem('ubl_users', JSON.stringify(users));
        }
        setSuccess('Google login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 900);
      } catch (err) {
        setError('Failed to fetch Google profile. Please try again.');
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed. Please try again.');
    },
  });

  return (
    <>
      <style>{styles}</style>
      <div className="ul-body">
        <div className="ul-root">

          <div className="ul-left">
            <div className="ul-grid" />
            <div className="ul-logo">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="44" height="44" rx="14" fill="url(#cabifyGrad)" />
                <circle cx="22" cy="22" r="11" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
                <circle cx="22" cy="22" r="4" fill="white" opacity="0.95" />
                <line x1="22" y1="11" x2="22" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <line x1="22" y1="26" x2="22" y2="33" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <line x1="11" y1="22" x2="18" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <line x1="26" y1="22" x2="33" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                <defs>
                  <linearGradient id="cabifyGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6c4df6" />
                    <stop offset="1" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="ul-logo-wordmark">ca<span>bify</span></div>
            </div>

            <div className="ul-hero">
              <div className="ul-hero-tag">Now in your city</div>
              <div className="ul-hero-title">
                Move smarter,<br /><em>live better.</em>
              </div>
              <div className="ul-hero-desc">
                Premium rides at honest prices. Transparent fares, no surge surprises — just seamless travel.
              </div>
            </div>
            <div />
          </div>

          <div className="ul-right">
            <div className="ul-form-eyebrow">Welcome back</div>
            <div className="ul-form-title">Sign in</div>
            <div className="ul-form-sub">Enter your credentials to continue</div>

            {error && <div className="ul-alert ul-alert-error">{error}</div>}
            {success && <div className="ul-alert ul-alert-success">{success}</div>}

            <div className="ul-field">
              <label className="ul-label" htmlFor="email">Email address</label>
              <div className="ul-input-wrap">
                <i className="ti ti-mail ul-input-icon" aria-hidden="true" />
                <input
                  className="ul-input"
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <div className="ul-forgot">
                <button
                  className="ul-forgot-btn"
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button className="ul-btn" type="button" onClick={handleLogin}>
              <i className="ti ti-arrow-right" aria-hidden="true" />
              Continue
            </button>

            <div className="ul-divider">
              <div className="ul-divider-line" />
              <div className="ul-divider-text">or sign in with</div>
              <div className="ul-divider-line" />
            </div>

            <div className="ul-social-btns">
              <button className="ul-social-btn" type="button" onClick={() => googleLogin()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              <button className="ul-social-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Apple
              </button>
            </div>

            <div className="ul-signup-row">
              New to Cabify? <a href="/register">Create an account</a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}