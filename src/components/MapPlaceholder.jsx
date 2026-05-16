import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapPlaceholder = ({ driverLocation, pickupLocation, dropoffLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const defaultPickup = {
    lat: pickupLocation?.latitude || 12.9716,
    lng: pickupLocation?.longitude || 77.5946
  };

  const defaultDropoff = {
    lat: dropoffLocation?.latitude || 12.9352,
    lng: dropoffLocation?.longitude || 77.6245
  };

  const driverStart = {
    lat: 12.9850,
    lng: 77.5800
  };

  // Fetch real road route from OSRM
  const fetchRoute = async (startLat, startLng, endLat, endLng) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      }
      return null;
    } catch (err) {
      console.log('Route fetch failed:', err);
      return null;
    }
  };

  // Animate driver along route
  const animateDriver = (marker, routeCoords) => {
    let step = 0;
    const interval = setInterval(() => {
      if (step >= routeCoords.length) {
        clearInterval(interval);
        return;
      }
      marker.setLatLng(routeCoords[step]);
      step += 2;
    }, 500);
    return interval;
  };

  useEffect(() => {
    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      setMapReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only initialize when mapRef is ready and mapReady is true
    if (!mapReady || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Create map
      const map = L.map(mapRef.current, {
        center: [12.9600, 77.5900],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Dark Cabify theme tiles
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '© OpenStreetMap © CARTO',
          maxZoom: 19,
        }
      ).addTo(map);

      // Pickup Icon
      const pickupIcon = L.divIcon({
        html: `<div style="
          background: #10B981;
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(16,185,129,0.6);
          display: flex; align-items: center;
          justify-content: center; font-size: 18px;">
          📍
        </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Dropoff Icon
      const dropoffIcon = L.divIcon({
        html: `<div style="
          background: #EF4444;
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(239,68,68,0.6);
          display: flex; align-items: center;
          justify-content: center; font-size: 18px;">
          🏁
        </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Driver Icon
      const driverIcon = L.divIcon({
        html: `<div style="
          background: #7C3AED;
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 20px rgba(124,58,237,0.7);
          display: flex; align-items: center;
          justify-content: center; font-size: 24px;">
          🚗
        </div>`,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      // Add Pickup Marker
      const pickupMarker = L.marker(
        [defaultPickup.lat, defaultPickup.lng],
        { icon: pickupIcon }
      ).addTo(map);

      pickupMarker.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:8px;min-width:160px;">
          <strong style="color:#10B981;">📍 Pickup</strong>
          <p style="margin:6px 0 0;color:#333;font-size:13px;">
            123 MG Road, Bangalore
          </p>
        </div>
      `);

      // Add Dropoff Marker
      const dropoffMarker = L.marker(
        [defaultDropoff.lat, defaultDropoff.lng],
        { icon: dropoffIcon }
      ).addTo(map);

      dropoffMarker.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:8px;min-width:160px;">
          <strong style="color:#EF4444;">🏁 Dropoff</strong>
          <p style="margin:6px 0 0;color:#333;font-size:13px;">
            456 Indiranagar, Bangalore
          </p>
        </div>
      `);

      // Add Driver Marker
      const driverMarker = L.marker(
        [driverStart.lat, driverStart.lng],
        { icon: driverIcon }
      ).addTo(map);

      driverMarker.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:8px;min-width:160px;">
          <strong style="color:#7C3AED;">🚗 Your Driver</strong>
          <p style="margin:6px 0 0;color:#333;font-size:13px;">
            Rajesh Kumar • Hyundai Creta
          </p>
          <p style="margin:4px 0 0;color:#666;font-size:12px;">
            KA01AB1234 • ⭐ 4.8
          </p>
        </div>
      `);

      // Fit bounds to show all markers
      const bounds = L.latLngBounds([
        [defaultPickup.lat, defaultPickup.lng],
        [defaultDropoff.lat, defaultDropoff.lng],
        [driverStart.lat, driverStart.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      // Save references
      mapInstanceRef.current = map;
      driverMarkerRef.current = driverMarker;

      // Draw real road routes
      const drawRoutes = async () => {
        // Driver → Pickup route (purple dashed)
        const driverRoute = await fetchRoute(
          driverStart.lat, driverStart.lng,
          defaultPickup.lat, defaultPickup.lng
        );

        if (driverRoute && map) {
          L.polyline(driverRoute, {
            color: '#7C3AED',
            weight: 5,
            opacity: 0.9,
            dashArray: '12, 8',
          }).addTo(map);

          // Animate driver along real roads
          animateDriver(driverMarker, driverRoute);
        }

        // Pickup → Dropoff route (white)
        const mainRoute = await fetchRoute(
          defaultPickup.lat, defaultPickup.lng,
          defaultDropoff.lat, defaultDropoff.lng
        );

        if (mainRoute && map) {
          L.polyline(mainRoute, {
            color: '#FFFFFF',
            weight: 4,
            opacity: 0.4,
          }).addTo(map);
        }
      };

      drawRoutes();

    } catch (err) {
      console.error('Map initialization error:', err);
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapReady]);

  // Update driver from socket.io
  useEffect(() => {
    if (!driverMarkerRef.current || !driverLocation) return;
    driverMarkerRef.current.setLatLng([
      driverLocation.latitude,
      driverLocation.longitude
    ]);
  }, [driverLocation]);

  return (
    <div className="map-placeholder">
      <div
        ref={mapRef}
        id="cabify-map"
        style={{
          width: '100%',
          height: '380px',
          borderRadius: '20px',
          zIndex: 1,
          position: 'relative',
        }}
      />
    </div>
  );
};

export default MapPlaceholder;