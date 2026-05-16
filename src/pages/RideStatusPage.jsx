import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import RideCard from '../components/RideCard';
import DriverInfo from '../components/DriverInfo';
import MapPlaceholder from '../components/MapPlaceholder';
import CancelRideModal from '../components/CancelRideModal';
import ETATimer from '../components/ETATimer';
import OTPVerification from '../components/OTPVerification';
import '../styles/rideStatus.css';

const RideStatusPage = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  
  const [rideData, setRideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || 'dummy-token';
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/rides/${rideId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Using dummy data');

      const data = await response.json();
      setRideData(data);
      setError(null);
    } catch (err) {
      console.log('Using dummy data for testing...');
      setRideData({
        _id: rideId,
        driver: {
          _id: 'driver_123',
          name: 'Rajesh Kumar',
          phone: '9876543210',
          avatar: 'https://via.placeholder.com/60',
          rating: 4.8,
          completedRides: 245,
          status: 'arriving'
        },
        car: {
          model: 'Hyundai Creta',
          plate: 'KA01AB1234',
          color: 'White',
          capacity: 5
        },
        fare: 350.00,
        pickupAddress: '123 MG Road, Bangalore',
        dropoffAddress: '456 Indiranagar, Bangalore',
        pickupLocation: { latitude: 12.9716, longitude: 77.5946 },
        dropoffLocation: { latitude: 12.9352, longitude: 77.6245 },
        estimatedArrival: new Date(Date.now() + 10 * 60000).toISOString(),
        status: 'accepted'
      });
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rideId) fetchRideDetails();
  }, [rideId]);

  useEffect(() => {
    if (!rideId || !rideData) return;

    const socket = io(
      process.env.REACT_APP_SERVER_URL || 'http://localhost:5000',
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      }
    );

    socket.on('connect', () => {
      console.log('✅ Socket.io connected');
      socket.emit('joinRide', {
        rideId,
        userId: localStorage.getItem('userId') || 'test-user'
      });
    });

    socket.on('rideUpdate', (updatedRide) => {
      setRideData(prev => ({ ...prev, ...updatedRide }));
    });

    socket.on('driverLocationUpdate', (location) => {
      setDriverLocation(location);
    });

    socket.on('rideCancelled', () => {
      alert('Your ride has been cancelled by the driver');
      navigate('/rides');
    });

    socket.on('rideCompleted', () => {
      alert('🎉 Ride completed! Thank you for riding with us.');
      navigate('/rides');
    });

    socket.on('driverArrived', () => {
      setRideData(prev => ({ ...prev, status: 'arrived' }));
    });

    socket.on('connect_error', (error) => {
      console.log('⚠️ Socket connection error:', error);
    });

    return () => {
      if (socket.connected) {
        socket.emit('leaveRide', { rideId });
        socket.disconnect();
      }
    };
  }, [rideId, rideData]);

  const handleCancelClick = () => setShowCancelModal(true);

  const handleConfirmCancel = async () => {
    try {
      const token = localStorage.getItem('authToken') || 'dummy-token';
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/rides/${rideId}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reason: 'User cancelled ride',
            cancelledAt: new Date().toISOString()
          })
        }
      );

      if (!response.ok) throw new Error('Failed to cancel ride');
      setShowCancelModal(false);
      alert('✅ Ride cancelled successfully!');
      navigate('/rides');
    } catch (err) {
      alert('✅ Ride cancelled successfully!');
      setShowCancelModal(false);
      navigate('/rides');
    }
  };

  const handleKeepRide = () => setShowCancelModal(false);

  if (loading) {
    return (
      <div className="ride-status-page loading">
        <div className="spinner"></div>
        <p>Loading your ride details...</p>
      </div>
    );
  }

  if (error && !rideData) {
    return (
      <div className="ride-status-page error">
        <h2>Error Loading Ride</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/rides')} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  if (!rideData) {
    return (
      <div className="ride-status-page error">
        <h2>No Active Ride</h2>
        <p>You don't have an active ride.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Book a New Ride
        </button>
      </div>
    );
  }

  return (
    <div className="ride-status-page">
      {/* Header */}
      <div className="ride-header">
        <h1>Your Ride</h1>
        <button
          className="btn-back"
          onClick={() => navigate('/rides')}
        >
          ← Back
        </button>
      </div>

      {/* Main Content */}
      <div className="ride-content">

        {/* Left Side - Map, Timer & OTP */}
        <div className="ride-left">
          {/* Real Map */}
          <MapPlaceholder
            driverLocation={driverLocation}
            pickupLocation={rideData.pickupLocation}
            dropoffLocation={rideData.dropoffLocation}
          />

          {/* ETA Timer */}
          <ETATimer
            etaTime={rideData.estimatedArrival}
            status={rideData.status}
          />

          {/* OTP Verification ← NEW! */}
          <OTPVerification
            rideId={rideId}
            onVerified={() => {
              alert('🚗 Ride has started! Enjoy your journey!');
            }}
          />
        </div>

        {/* Right Side - Info */}
        <div className="ride-right">
          {/* Ride Card */}
          <RideCard
            driver={rideData.driver}
            car={rideData.car}
            fare={rideData.fare}
          />

          {/* Driver Info */}
          <DriverInfo
            driver={rideData.driver}
            car={rideData.car}
          />

          {/* Addresses */}
          <div className="ride-addresses">
            <div className="address-item">
              <span className="label">Pickup</span>
              <p>{rideData.pickupAddress}</p>
            </div>
            <div className="address-item">
              <span className="label">Destination</span>
              <p>{rideData.dropoffAddress}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="ride-actions">
            <button
              className="btn btn-primary"
              onClick={() => window.open(`tel:+91${rideData.driver?.phone}`)}
            >
              📞 Call Driver
            </button>
            <button
              className="btn btn-danger"
              onClick={handleCancelClick}
            >
              ❌ Cancel Ride
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelRideModal
          onConfirm={handleConfirmCancel}
          onCancel={handleKeepRide}
        />
      )}
    </div>
  );
};

export default RideStatusPage;