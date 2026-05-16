import React from 'react';

const RideCard = ({ driver, car, fare }) => {
  return (
    <div className="ride-card">
      <div className="ride-card-header">
        <h3>Ride Details</h3>
        <span className="status status-accepted">
          ACCEPTED
        </span>
      </div>

      <div className="ride-card-content">
        <div className="driver-summary">
          <img 
            src="https://via.placeholder.com/60"
            alt="Driver"
            className="driver-avatar"
          />
          <div className="driver-info-summary">
            <h4>Sample Driver</h4>
            <div className="rating">
              ⭐⭐⭐⭐⭐
              <span className="rating-number">(4.8)</span>
            </div>
            <p className="car-info">Toyota Innova • KA01AB1234</p>
          </div>
        </div>

        <div className="ride-card-separator"></div>

        <div className="fare-section">
          <span className="label">Estimated Fare</span>
          <h3 className="fare-amount">₹350.00</h3>
          <p className="fare-note">Actual fare may vary</p>
        </div>
      </div>
    </div>
  );
};

export default RideCard;