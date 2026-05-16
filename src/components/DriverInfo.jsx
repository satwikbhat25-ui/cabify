import React from 'react';

const DriverInfo = ({ driver, car }) => {
  return (
    <div className="driver-info-section">
      <h3>Driver & Vehicle</h3>
      
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Driver Name</span>
          <p className="info-value">{driver?.name || 'Rajesh Kumar'}</p>
        </div>

        <div className="info-item">
          <span className="info-label">Vehicle</span>
          <p className="info-value">{car?.model || 'Hyundai Creta'}</p>
        </div>

        <div className="info-item">
          <span className="info-label">License Plate</span>
          <p className="info-value">{car?.plate || 'KA01AB1234'}</p>
        </div>

        <div className="info-item">
          <span className="info-label">Phone</span>
          <p className="info-value">
            <a href={`tel:+91${driver?.phone}`}>
              {driver?.phone || '9876543210'}
            </a>
          </p>
        </div>

        <div className="info-item">
          <span className="info-label">Driver Rating</span>
          <p className="info-value">⭐ {driver?.rating || 4.8}</p>
        </div>

        <div className="info-item">
          <span className="info-label">Rides Completed</span>
          <p className="info-value">{driver?.completedRides || 245}</p>
        </div>
      </div>
    </div>
  );
};

export default DriverInfo;