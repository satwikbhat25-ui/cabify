import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

const RIDE_TYPES = [
  { id: 'cab',    icon: '🚗', label: 'Cab',    baseRate: 14, minFare: 80,  desc: 'Comfortable sedan' },
  { id: 'auto',   icon: '🛺', label: 'Auto',   baseRate: 9,  minFare: 50,  desc: 'Quick & affordable' },
  { id: 'bike',   icon: '🏍️', label: 'Bike',   baseRate: 6,  minFare: 30,  desc: 'Beat the traffic' },
  { id: 'rental', icon: '🔑', label: 'Rental', baseRate: 180,minFare: 300, desc: 'Hourly rental' },
];

const RECENT_TRIPS = [
  { id: 1, from: 'Home',    to: 'T. Nagar',    time: 'Today, 3:20 PM',     dist: '5.2 km', amount: '₹142', icon: '🚗' },
  { id: 2, from: 'Office',  to: 'Marina Beach', time: 'Yesterday, 6:45 PM', dist: '3.8 km', amount: '₹76',  icon: '🛺' },
  { id: 3, from: 'MG Road', to: 'Koramangala',  time: 'May 7, 9:15 AM',    dist: '4.1 km', amount: '₹98',  icon: '🚗' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function searchPlaces(query) {
  if (!query || query.length < 3) return [];
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  return data.map(d => ({
    label: d.display_name,
    shortLabel: d.display_name.split(',').slice(0, 2).join(','),
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
  }));
}

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  const addr = data.address;
  return addr.road || addr.suburb || addr.neighbourhood || addr.city || 'Your location';
}

function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 13, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

const STEP_HOME    = 'home';
const STEP_SEARCH  = 'search';
const STEP_OPTIONS = 'options';
const STEP_CONFIRM = 'confirm';
const STEP_BOOKED  = 'booked';

const C = {
  bg: '#0a0a0f',
  card: '#13131a',
  card2: '#1a1a24',
  border: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  textSub: 'rgba(255,255,255,0.45)',
  textMuted: 'rgba(255,255,255,0.25)',
  purple: '#7c3aed',
  purpleLight: '#a78bfa',
  purpleDim: 'rgba(124,58,237,0.15)',
  red: '#ef4444',
  redDim: 'rgba(239,68,68,0.1)',
  green: '#22c55e',
  greenDim: 'rgba(34,197,94,0.1)',
  blue: '#3b82f6',
  blueDim: 'rgba(59,130,246,0.1)',
};

export default function DashBoardpage() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('ubl_user');
  const user = userJson ? JSON.parse(userJson) : { name: 'User', email: '' };

  const [activeTab, setActiveTab]         = useState('home');
  const [activeService, setActiveService] = useState('cab');
  const [step, setStep]                   = useState(STEP_HOME);

  const [pickup, setPickup]               = useState('');
  const [dropoff, setDropoff]             = useState('');
  const [pickupPos, setPickupPos]         = useState(null);
  const [dropoffPos, setDropoffPos]       = useState(null);
  const [pickupSuggestions, setPickupSuggestions]   = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [activeField, setActiveField]     = useState(null);
  const [loadingGps, setLoadingGps]       = useState(false);
  const pickupTimer = useRef(null);
  const dropoffTimer = useRef(null);

  const [userPos, setUserPos]     = useState([12.9716, 77.5946]);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);

  const [rideOptions, setRideOptions]   = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [loadingRides, setLoadingRides] = useState(false);
  const [apiError, setApiError]         = useState('');
  const [tripInfo, setTripInfo]         = useState(null);

  useEffect(() => {
    setLoadingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(coords);
          setMapCenter(coords);
          try {
            const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            setPickup(name);
            setPickupPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          } catch (_) {}
          setLoadingGps(false);
        },
        () => { setLoadingGps(false); }
      );
    } else {
      setLoadingGps(false);
    }
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handlePickupChange = (val) => {
    setPickup(val);
    setPickupPos(null);
    clearTimeout(pickupTimer.current);
    if (val.length < 3) { setPickupSuggestions([]); return; }
    pickupTimer.current = setTimeout(async () => {
      const results = await searchPlaces(val);
      setPickupSuggestions(results);
    }, 400);
  };

  const handleDropoffChange = (val) => {
    setDropoff(val);
    setDropoffPos(null);
    clearTimeout(dropoffTimer.current);
    if (val.length < 3) { setDropoffSuggestions([]); return; }
    dropoffTimer.current = setTimeout(async () => {
      const results = await searchPlaces(val);
      setDropoffSuggestions(results);
    }, 400);
  };

  const selectPickup = (place) => {
    setPickup(place.shortLabel);
    setPickupPos({ lat: place.lat, lon: place.lon });
    setPickupSuggestions([]);
    setMapCenter([place.lat, place.lon]);
  };

  const selectDropoff = (place) => {
    setDropoff(place.shortLabel);
    setDropoffPos({ lat: place.lat, lon: place.lon });
    setDropoffSuggestions([]);
    if (pickupPos) setMapCenter([(pickupPos.lat + place.lat) / 2, (pickupPos.lon + place.lon) / 2]);
  };

  const useGpsForPickup = async () => {
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      setPickup(name);
      setPickupPos({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      setPickupSuggestions([]);
      setMapCenter([pos.coords.latitude, pos.coords.longitude]);
      setLoadingGps(false);
    }, () => setLoadingGps(false));
  };

  const handleFindRide = async () => {
    if (!pickupPos || !dropoffPos) {
      setApiError('Please select locations from the suggestions list.');
      return;
    }
    setApiError('');
    setLoadingRides(true);
    setStep(STEP_OPTIONS);

    const distKm   = haversine(pickupPos.lat, pickupPos.lon, dropoffPos.lat, dropoffPos.lon) * 1.35;
    const durMin   = Math.ceil((distKm / 25) * 60);
    const distText = `${distKm.toFixed(1)} km`;
    const durText  = durMin >= 60 ? `${Math.floor(durMin / 60)}h ${durMin % 60}min` : `${durMin} min`;

    setMapCenter([(pickupPos.lat + dropoffPos.lat) / 2, (pickupPos.lon + dropoffPos.lon) / 2]);
    setTripInfo({ distance: distText, duration: durText, distKm });

    const isPeak = (() => { const h = new Date().getHours(); return (h >= 8 && h <= 10) || (h >= 17 && h <= 20); })();

    const options = RIDE_TYPES.map((type, i) => {
      let fare = Math.max(type.minFare, Math.round(distKm * type.baseRate));
      if (isPeak) fare = Math.round(fare * 1.2);
      return { ...type, fare, fareStr: `₹${fare}`, eta: 2 + i * 2 + Math.floor(Math.random() * 3), distText, durText };
    });

    setRideOptions(options);
    setSelectedRide(options[0]);
    setLoadingRides(false);
  };

  const handleConfirm = () => setStep(STEP_CONFIRM);
  const handleBook    = () => setStep(STEP_BOOKED);

  const resetFlow = () => {
    setStep(STEP_HOME);
    setDropoff(''); setDropoffPos(null);
    setRideOptions([]); setSelectedRide(null);
    setTripInfo(null); setApiError('');
    setDropoffSuggestions([]); setPickupSuggestions([]);
  };

  // ── Track My Ride handler ──────────────────────────
  const handleTrackRide = () => {
    const token = localStorage.getItem('ubl_token');
    localStorage.setItem('authToken', token);
    localStorage.setItem('activeRideId', 'test123');
    navigate('/ride/test123');
  };

  const isPeak = (() => { const h = new Date().getHours(); return (h >= 8 && h <= 10) || (h >= 17 && h <= 20); })();

  const SuggestionList = ({ items, onSelect }) => (
    items.length > 0 ? (
      <div style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', marginTop: '6px' }}>
        {items.map((item, i) => (
          <div key={i}
            style={{ padding: '12px 14px', borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
            onMouseDown={() => onSelect(item)}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>📍</span>
            <div>
              <div style={{ fontSize: '13px', color: C.text, fontWeight: '500' }}>{item.shortLabel}</div>
              <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    ) : null
  );

  const s = {
    fullScreen: { position: 'fixed', inset: 0, background: C.bg, zIndex: 200, overflowY: 'auto', color: C.text },
    pad: { padding: '1.2rem' },
    header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.4rem' },
    backBtn: { width: '36px', height: '36px', borderRadius: '50%', background: C.card2, border: `1px solid ${C.border}`, color: C.text, fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    primaryBtn: { width: '100%', height: '52px', background: `linear-gradient(135deg, ${C.purple}, #9333ea)`, border: 'none', borderRadius: '14px', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' },
    card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '16px', marginBottom: '12px' },
    inputWrap: (focused) => ({ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: C.card2, borderRadius: '12px', border: `1px solid ${focused ? C.purple : C.border}`, transition: 'border 0.2s' }),
    inp: { flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '15px', color: C.text, fontFamily: 'Inter, sans-serif' },
    dot: (c) => ({ width: '10px', height: '10px', borderRadius: '50%', background: c, flexShrink: 0 }),
    sectionLabel: { fontSize: '11px', fontWeight: '600', letterSpacing: '1px', color: C.textMuted, textTransform: 'uppercase', marginBottom: '0.8rem' },
    errorMsg: { background: C.redDim, color: C.red, padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '1rem', border: `1px solid rgba(239,68,68,0.2)` },
    rideCard: (sel) => ({ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '14px', marginBottom: '10px', cursor: 'pointer', border: sel ? `2px solid ${C.purple}` : `1.5px solid ${C.border}`, background: sel ? C.purpleDim : C.card, transition: 'all 0.15s' }),
    spinner: { width: '32px', height: '32px', border: `3px solid ${C.card2}`, borderTop: `3px solid ${C.purple}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    badge: (bg, color) => ({ fontSize: '11px', background: bg, borderRadius: '6px', padding: '2px 8px', color, fontWeight: '500' }),
  };

  // ── SEARCH SCREEN ─────────────────────────────────
  const SearchScreen = () => (
    <div style={s.fullScreen}>
      <div style={s.pad}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => { setStep(STEP_HOME); setApiError(''); }}>←</button>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>Plan your ride</div>
        </div>

        {apiError && <div style={s.errorMsg}>{apiError}</div>}

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '14px', marginBottom: '12px' }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Pickup</div>
            <div style={s.inputWrap(activeField === 'pickup')}>
              <div style={s.dot('#22c55e')} />
              <input
                style={s.inp}
                placeholder="Enter pickup location"
                value={pickup}
                onChange={e => handlePickupChange(e.target.value)}
                onFocus={() => setActiveField('pickup')}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
              />
              <button onClick={useGpsForPickup} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}>
                {loadingGps ? '⏳' : '🎯'}
              </button>
            </div>
            {activeField === 'pickup' && <SuggestionList items={pickupSuggestions} onSelect={selectPickup} />}
            {pickupPos && <div style={{ fontSize: '11px', color: C.green, marginTop: '4px', paddingLeft: '4px' }}>✓ Location selected</div>}
          </div>

          <div style={{ height: '1px', background: C.border, margin: '4px 0' }} />

          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '6px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Drop-off</div>
            <div style={s.inputWrap(activeField === 'dropoff')}>
              <div style={s.dot(C.purple)} />
              <input
                style={s.inp}
                placeholder="Where to?"
                value={dropoff}
                onChange={e => handleDropoffChange(e.target.value)}
                onFocus={() => setActiveField('dropoff')}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
                onKeyDown={e => e.key === 'Enter' && handleFindRide()}
              />
              {dropoff && <button onClick={() => { setDropoff(''); setDropoffPos(null); setDropoffSuggestions([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: '16px' }}>✕</button>}
            </div>
            {activeField === 'dropoff' && <SuggestionList items={dropoffSuggestions} onSelect={selectDropoff} />}
            {dropoffPos && <div style={{ fontSize: '11px', color: C.green, marginTop: '4px', paddingLeft: '4px' }}>✓ Location selected</div>}
          </div>
        </div>

        <button
          style={{ ...s.primaryBtn, opacity: pickupPos && dropoffPos ? 1 : 0.5 }}
          onClick={handleFindRide}
          disabled={!pickupPos || !dropoffPos}
        >
          {!pickupPos || !dropoffPos ? 'Select both locations first' : 'Search Rides →'}
        </button>

        <div style={{ marginTop: '1.5rem' }}>
          <div style={s.sectionLabel}>Recent trips</div>
          {RECENT_TRIPS.map(trip => (
            <div key={trip.id}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}
              onClick={() => { setPickup(trip.from); setDropoff(trip.to); }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{trip.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>{trip.from} → {trip.to}</div>
                <div style={{ fontSize: '12px', color: C.textSub }}>{trip.dist}</div>
              </div>
              <span style={{ color: C.textMuted, fontSize: '16px' }}>↗</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── OPTIONS SCREEN ────────────────────────────────
  const OptionsScreen = () => (
    <div style={s.fullScreen}>
      <div style={s.pad}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => setStep(STEP_SEARCH)}>←</button>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>Choose a ride</div>
            <div style={{ fontSize: '12px', color: C.textSub }}>{pickup} → {dropoff}</div>
          </div>
        </div>

        {tripInfo && !loadingRides && (
          <div style={{ background: C.purpleDim, border: `1px solid rgba(124,58,237,0.3)`, borderRadius: '14px', padding: '14px 16px', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: C.purpleLight }}>{tripInfo.distance}</div>
              <div style={{ fontSize: '11px', color: C.textSub }}>Distance</div>
            </div>
            <div style={{ borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: C.purpleLight }}>{tripInfo.duration}</div>
              <div style={{ fontSize: '11px', color: C.textSub }}>Est. time</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: isPeak ? '#f97316' : C.green }}>{isPeak ? '🔥' : '✅'}</div>
              <div style={{ fontSize: '11px', color: C.textSub }}>{isPeak ? 'Peak hrs' : 'Normal'}</div>
            </div>
          </div>
        )}

        {loadingRides ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '12px' }}>
            <div style={s.spinner} />
            <div style={{ fontSize: '14px', color: C.textSub }}>Searching rides...</div>
          </div>
        ) : (
          <>
            <div style={s.sectionLabel}>Available rides</div>
            {rideOptions.map(option => (
              <div key={option.id} style={s.rideCard(selectedRide?.id === option.id)} onClick={() => setSelectedRide(option)}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: selectedRide?.id === option.id ? `6px solid ${C.purple}` : `2px solid ${C.border}`, flexShrink: 0, transition: 'all 0.15s' }} />
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: C.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>{option.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: C.text }}>{option.label}</div>
                  <div style={{ fontSize: '12px', color: C.textSub, marginTop: '2px' }}>{option.desc}</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={s.badge(C.card2, C.textSub)}>🕐 {option.eta} min</span>
                    <span style={s.badge(C.card2, C.textSub)}>📍 {option.distText}</span>
                    {isPeak && <span style={s.badge('rgba(249,115,22,0.1)', '#f97316')}>🔥 Peak</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: C.text }}>{option.fareStr}</div>
                  <div style={{ fontSize: '11px', color: C.textSub }}>{option.durText}</div>
                </div>
              </div>
            ))}

            <div style={{ position: 'sticky', bottom: 0, background: C.bg, paddingTop: '12px', borderTop: `1px solid ${C.border}`, marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: C.textSub }}>Selected</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: C.text }}>{selectedRide?.label} · {selectedRide?.fareStr}</div>
                </div>
                <div style={{ fontSize: '12px', color: C.textSub, textAlign: 'right' }}>{selectedRide?.distText}<br />{selectedRide?.durText}</div>
              </div>
              <button style={s.primaryBtn} onClick={handleConfirm}>Confirm {selectedRide?.label} →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── CONFIRM SCREEN ────────────────────────────────
  const ConfirmScreen = () => (
    <div style={s.fullScreen}>
      <div style={s.pad}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => setStep(STEP_OPTIONS)}>←</button>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>Confirm booking</div>
        </div>

        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '14px', borderBottom: `1px solid ${C.border}`, marginBottom: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: C.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>{selectedRide?.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: C.text }}>{selectedRide?.label}</div>
              <div style={{ fontSize: '13px', color: C.textSub }}>{selectedRide?.desc}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: C.purpleLight }}>{selectedRide?.fareStr}</div>
              <div style={{ fontSize: '11px', color: C.textSub }}>est. fare</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', paddingTop: '3px' }}>
              <div style={s.dot('#22c55e')} />
              <div style={{ width: '1px', flex: 1, background: C.border, minHeight: '20px' }} />
              <div style={s.dot(C.purple)} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pickup</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>{pickup}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Drop-off</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>{dropoff}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          {[
            { label: 'Distance', value: selectedRide?.distText },
            { label: 'Duration', value: selectedRide?.durText },
            { label: 'ETA',      value: `${selectedRide?.eta} min` },
          ].map((d, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: C.purpleLight }}>{d.value}</div>
              <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '3px' }}>{d.label}</div>
            </div>
          ))}
        </div>

        <div style={{ ...s.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>💵</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>Cash</div>
              <div style={{ fontSize: '12px', color: C.textSub }}>Pay after ride</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: C.purpleLight, fontWeight: '600', cursor: 'pointer' }}>Change ›</div>
        </div>

        <button style={s.primaryBtn} onClick={handleBook}>Book {selectedRide?.label} · {selectedRide?.fareStr}</button>
        <button style={{ width: '100%', height: '46px', marginTop: '10px', background: 'none', border: `1px solid ${C.border}`, borderRadius: '14px', color: C.textSub, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }} onClick={() => setStep(STEP_OPTIONS)}>← Back to options</button>
      </div>
    </div>
  );

  // ── BOOKED SCREEN ─────────────────────────────────
  const BookedScreen = () => (
    <div style={s.fullScreen}>
      <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '0.5rem', marginTop: '2rem' }}>🎉</div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: C.text, marginBottom: '6px' }}>Ride Booked!</div>
        <div style={{ fontSize: '14px', color: C.textSub, marginBottom: '1.5rem' }}>Your {selectedRide?.label} is on the way</div>

        <div style={{ ...s.card, width: '100%', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.purpleDim, border: `1px solid ${C.purple}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: C.text }}>Rajan Kumar</div>
              <div style={{ fontSize: '12px', color: C.textSub }}>⭐ 4.8 · KA 01 AB 1234</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: C.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}>📞</div>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: C.card2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}>💬</div>
            </div>
          </div>
          <div style={{ background: C.card2, borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>{selectedRide?.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: C.text }}>Arriving in {selectedRide?.eta} min</div>
              <div style={{ fontSize: '12px', color: C.textSub }}>{pickup}</div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: C.purpleLight }}>{selectedRide?.fareStr}</div>
          </div>
        </div>

        <div style={{ ...s.card, width: '100%', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={s.dot('#22c55e')} />
              <div style={{ width: '1px', height: '24px', background: C.border }} />
              <div style={s.dot(C.purple)} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: C.text, marginBottom: '12px' }}>{pickup}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: C.purpleLight }}>{dropoff}</div>
            </div>
            <div style={{ fontSize: '12px', color: C.textSub, textAlign: 'right' }}>
              <div>{selectedRide?.distText}</div>
              <div style={{ marginTop: '10px' }}>{selectedRide?.durText}</div>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Track My Ride Button */}
        <button
          style={{ ...s.primaryBtn, marginBottom: '10px', width: '100%' }}
          onClick={handleTrackRide}
        >
          🗺️ Track My Ride
        </button>

        <button
          style={{ ...s.primaryBtn, background: C.redDim, color: C.red, border: `1px solid rgba(239,68,68,0.3)`, marginBottom: '10px', width: '100%' }}
          onClick={resetFlow}
        >
          Cancel Ride
        </button>

        <button
          style={{ width: '100%', height: '46px', background: 'none', border: `1px solid ${C.border}`, borderRadius: '14px', color: C.textSub, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          onClick={resetFlow}
        >
          Done
        </button>
      </div>
    </div>
  );

  // ── PROFILE SCREEN ────────────────────────────────
  const ProfileScreen = () => (
    <div style={{ ...s.fullScreen, zIndex: 150 }}>
      <div style={s.pad}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: C.text, marginBottom: '1.5rem' }}>Profile</div>
        <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.purple}, #9333ea)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: '#fff' }}>{getInitials(user.name)}</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: C.text }}>{user.name}</div>
            <div style={{ fontSize: '13px', color: C.textSub }}>{user.email}</div>
          </div>
        </div>
        {[
          { icon: '👤', label: 'Personal Info',     sub: 'Name, email, phone' },
          { icon: '📍', label: 'Saved Addresses',    sub: 'Home, work, favourites' },
          { icon: '💳', label: 'Payment Methods',    sub: 'Cards, UPI, wallet' },
          { icon: '🔔', label: 'Notifications',      sub: 'Ride alerts, offers' },
          { icon: '🔒', label: 'Privacy & Security', sub: 'Password, 2FA' },
          { icon: '❓', label: 'Help & Support',     sub: 'FAQs, contact us' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: C.text }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: C.textMuted }}>{item.sub}</div>
            </div>
            <span style={{ color: C.textMuted }}>›</span>
          </div>
        ))}
        <button onClick={handleLogout} style={{ width: '100%', height: '50px', marginTop: '1rem', background: C.redDim, border: `1px solid rgba(239,68,68,0.2)`, borderRadius: '14px', color: C.red, fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Sign out</button>
        <button onClick={() => setActiveTab('home')} style={{ width: '100%', height: '50px', marginTop: '10px', background: C.card2, border: `1px solid ${C.border}`, borderRadius: '14px', color: C.text, fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Back to Home</button>
      </div>
    </div>
  );

  // ── MAIN RENDER ───────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.card2}; border-radius: 4px; }
        .leaflet-container { height: 55vh; width: 100%; }
        .leaflet-tile { filter: brightness(0.6) saturate(0.8); }
      `}</style>

      <div style={{ fontFamily: "'Inter', sans-serif", background: C.bg, minHeight: '100vh', color: C.text, position: 'relative', overflow: 'hidden' }}>

        {/* DARK MAP */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '55vh', zIndex: 0 }}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '55vh', width: '100%' }} zoomControl={false} attributionControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapFlyTo center={mapCenter} zoom={pickupPos && dropoffPos ? 11 : 14} />
            <Marker position={userPos}><Popup>You are here</Popup></Marker>
            {pickupPos  && <Marker position={[pickupPos.lat,  pickupPos.lon]}  icon={pickupIcon}><Popup>{pickup}</Popup></Marker>}
            {dropoffPos && <Marker position={[dropoffPos.lat, dropoffPos.lon]} icon={dropoffIcon}><Popup>{dropoff}</Popup></Marker>}
          </MapContainer>
        </div>

        {/* TOPBAR */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.2rem' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>cabify.</div>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, ${C.purple}, #9333ea)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} onClick={() => setActiveTab('profile')}>
            {getInitials(user.name)}
          </div>
        </div>

        {/* GREETING */}
        <div style={{ position: 'fixed', top: '3.8rem', left: '1.2rem', zIndex: 50 }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{getGreeting()}</div>
          <div style={{ fontSize: '17px', fontWeight: '700', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{user.name} 👋</div>
        </div>

        {/* HOME BOTTOM SHEET */}
        {step === STEP_HOME && (
          <div style={{ position: 'fixed', bottom: '60px', left: 0, right: 0, zIndex: 40, background: C.bg, borderRadius: '20px 20px 0 0', minHeight: '50vh', maxHeight: '75vh', overflowY: 'auto', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', border: `1px solid ${C.border}`, borderBottom: 'none' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 1.2rem', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }} onClick={() => setStep(STEP_SEARCH)}>
              <div style={s.dot('#22c55e')} />
              <div style={{ fontSize: '15px', color: C.textSub, flex: 1 }}>Where are you going?</div>
              <div style={{ fontSize: '13px', color: C.text, fontWeight: '500' }}>Now ▾</div>
            </div>

            <div style={{ padding: '1rem 1.2rem 0.5rem' }}>
              <div style={s.sectionLabel}>Services</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {RIDE_TYPES.map(type => (
                  <button key={type.id}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 18px', borderRadius: '14px', background: activeService === type.id ? C.purple : C.card, border: `1px solid ${activeService === type.id ? C.purple : C.border}`, cursor: 'pointer', minWidth: '70px' }}
                    onClick={() => setActiveService(type.id)}>
                    <span style={{ fontSize: '24px' }}>{type.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: activeService === type.id ? '#fff' : C.textSub }}>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ margin: '0.8rem 1.2rem', padding: '14px 16px', background: C.purpleDim, border: `1px solid rgba(124,58,237,0.3)`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>20% off your next ride</div>
                <div style={{ fontSize: '11px', color: C.textSub, marginTop: '2px' }}>Use code at checkout</div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: C.purpleLight, border: `1px dashed ${C.purpleLight}`, padding: '4px 10px', borderRadius: '8px' }}>CABIFY20</div>
            </div>

            <div style={{ padding: '0.5rem 1.2rem 1.2rem' }}>
              <div style={s.sectionLabel}>Recent Trips</div>
              {RECENT_TRIPS.map(trip => (
                <div key={trip.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}
                  onClick={() => { setPickup(trip.from); setDropoff(trip.to); setStep(STEP_SEARCH); }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.card, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{trip.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: C.text }}>{trip.from} → {trip.to}</div>
                    <div style={{ fontSize: '12px', color: C.textSub }}>{trip.time} · {trip.dist}</div>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: C.purpleLight }}>{trip.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM NAV */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-around', borderTop: `1px solid ${C.border}`, zIndex: 100 }}>
          {[
            { id: 'home',     icon: '🏠', label: 'Home'     },
            { id: 'rides',    icon: '🚗', label: 'Rides'    },
            { id: 'activity', icon: '📋', label: 'Activity' },
            { id: 'profile',  icon: '👤', label: 'Profile'  },
          ].map(nav => (
            <div key={nav.id}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', padding: '8px 16px', borderRadius: '12px', background: activeTab === nav.id ? C.purple : 'transparent' }}
              onClick={() => setActiveTab(nav.id)}>
              <span style={{ fontSize: '18px' }}>{nav.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: '600', color: activeTab === nav.id ? '#fff' : C.textSub }}>{nav.label}</span>
            </div>
          ))}
        </div>

        {/* STEP SCREENS */}
        {step === STEP_SEARCH  && <SearchScreen  />}
        {step === STEP_OPTIONS && <OptionsScreen />}
        {step === STEP_CONFIRM && <ConfirmScreen />}
        {step === STEP_BOOKED  && <BookedScreen  />}
        {activeTab === 'profile' && step === STEP_HOME && <ProfileScreen />}
      </div>
    </>
  );
}