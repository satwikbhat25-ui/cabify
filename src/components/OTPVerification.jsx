import React, { useState, useEffect } from 'react';

const OTPVerification = ({ rideId, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate 4-digit OTP
  const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const [currentOTP] = useState(generateOTP);

  // OTP expiry countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Copy OTP to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(currentOTP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Refresh OTP
  const handleRefresh = () => {
    window.location.reload();
  };

  // Verify OTP entered by user
  const handleVerify = () => {
    if (otp === currentOTP) {
      alert('✅ OTP Verified! Ride starting...');
      if (onVerified) onVerified();
    } else {
      alert('❌ Wrong OTP! Please try again.');
      setOtp('');
    }
  };

  return (
    <div className="otp-container">
      {/* Header */}
      <div className="otp-header">
        <span className="otp-icon">🔐</span>
        <div>
          <h3>Ride Verification</h3>
          <p>Share this OTP with your driver</p>
        </div>
      </div>

      {/* OTP Display */}
      {!isExpired ? (
        <>
          <div className="otp-display">
            {currentOTP.split('').map((digit, index) => (
              <div key={index} className="otp-digit">
                {digit}
              </div>
            ))}
          </div>

          {/* Timer */}
          <div className="otp-timer">
            <span className="timer-icon">⏱️</span>
            <span>Expires in </span>
            <span className={`timer-count ${timeLeft < 60 ? 'urgent' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Copy Button */}
          <button
            className="btn-copy"
            onClick={handleCopy}
          >
            {copied ? '✅ Copied!' : '📋 Copy OTP'}
          </button>

          {/* Divider */}
          <div className="otp-divider">
            <span>or enter OTP to verify yourself</span>
          </div>

          {/* OTP Input */}
          <div className="otp-input-section">
            <input
              type="number"
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={(e) => {
                if (e.target.value.length <= 4) {
                  setOtp(e.target.value);
                }
              }}
              className="otp-input"
              maxLength={4}
            />
            <button
              className="btn-verify"
              onClick={handleVerify}
              disabled={otp.length !== 4}
            >
              Verify
            </button>
          </div>
        </>
      ) : (
        // Expired State
        <div className="otp-expired">
          <span style={{ fontSize: '48px' }}>⌛</span>
          <h4>OTP Expired!</h4>
          <p>Your OTP has expired. Please generate a new one.</p>
          <button
            className="btn-refresh"
            onClick={handleRefresh}
          >
            🔄 Generate New OTP
          </button>
        </div>
      )}

      {/* Security Note */}
      <div className="otp-security-note">
        <span>🛡️</span>
        <p>Never share this OTP with anyone other than your driver</p>
      </div>
    </div>
  );
};

export default OTPVerification;