import React, { useEffect, useState } from 'react';

const ETATimer = ({ etaTime, status }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    if (!etaTime) return;

    const calculateTimeLeft = () => {
      const targetTime = new Date(etaTime);
      const now = new Date();
      const difference = targetTime - now;

      if (difference > 0) {
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ minutes, seconds });
        setHasArrived(false);
      } else {
        setTimeLeft(null);
        setHasArrived(true);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Then update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [etaTime]);

  if (hasArrived) {
    return (
      <div className="eta-timer arrived">
        <p className="eta-label">Driver Status</p>
        <h2>🎉 Driver has arrived!</h2>
        <p className="eta-text">Please come to the pickup location</p>
      </div>
    );
  }

  if (!timeLeft) {
    return null;
  }

  return (
    <div className="eta-timer">
      <p className="eta-label">Estimated Arrival</p>
      <div className="eta-time">
        <span className="minutes">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="separator">:</span>
        <span className="seconds">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
      <p className="eta-text">minutes remaining</p>
    </div>
  );
};

export default ETATimer;