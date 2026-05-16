import React from 'react';

const CancelRideModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Cancel Ride?</h2>
        
        <div className="modal-body">
          <p>Are you sure you want to cancel this ride?</p>
          <p className="modal-warning">⚠️ A cancellation fee may apply</p>
        </div>

        <div className="modal-actions">
          <button 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Keep Ride
          </button>
          <button 
            className="btn btn-danger"
            onClick={onConfirm}
          >
            Cancel Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRideModal;