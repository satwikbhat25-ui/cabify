import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PAST_RIDES = [
  { id: 1, from: 'Home',   to: 'T. Nagar',       date: 'Today, 3:20 PM',     type: 'cab',  distance: '5.2 km', price: 142 },
  { id: 2, from: 'Office', to: 'Marina Beach',    date: 'Yesterday, 6:45 PM', type: 'auto', distance: '3.8 km', price: 76  },
  { id: 3, from: 'Adyar',  to: 'Central Station', date: '12 May, 9:10 AM',    type: 'bike', distance: '8.1 km', price: 98  },
];

const KEYFRAMES = `
@keyframes cabify-pulse {
  0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.7; }
  100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
}`;

function injectKeyframes() {
  if (document.getElementById('cabify-kf')) return;
  const s = document.createElement('style');
  s.id = 'cabify-kf';
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

const SERVICES = [
  { id: 'cab',    emoji: '🚗', label: 'Cab'    },
  { id: 'auto',   emoji: '🛺', label: 'Auto'   },
  { id: 'bike',   emoji: '🏍️', label: 'Bike'   },
  { id: 'rental', emoji: '🔑', label: 'Rental' },
];

const TYPE_EMOJI = { cab: '🚗', auto: '🛺', bike: '🏍️', carpool: '🚙' };

const S = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#F7F7F7',
    fontFamily: "'DM Sans', sans-serif",
  },
  mapArea: {
    position: 'relative',
    height: 300,
    background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  mapGrid: {
    position: 'absolute', inset: 0,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),' +
      'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
  },
  mapRoad1: {
    position: 'absolute', top: '40%', left: 0, right: 0, height: 28,
    background: 'rgba(255,255,255,0.07)',
    borderTop: '1px solid rgba(255,255,255,0.10)',
    borderBottom: '1px solid rgba(255,255,255,0.10)',
  },
  mapRoad2: {
    position: 'absolute', top: 0, bottom: 0, left: '35%', width: 20,
    background: 'rgba(255,255,255,0.06)',
    borderLeft: '1px solid rgba(255,255,255,0.09)',
    borderRight: '1px solid rgba(255,255,255,0.09)',
  },
  mapRoad3: {
    position: 'absolute', top: '65%', left: 0, right: 0, height: 16,
    background: 'rgba(255,255,255,0.05)',
    transform: 'rotate(-5deg) scaleX(1.1)',
  },
  mapDot: (top, left, size, opacity) => ({
    position: 'absolute', top, left,
    width: size, height: size,
    borderRadius: '50%',
    background: `rgba(99,219,219,${opacity})`,
  }),
  cabIcon: (top, left, rotate) => ({
    position: 'absolute', top, left,
    fontSize: 18,
    transform: `rotate(${rotate}deg)`,
    opacity: 0.7,
  }),
  pinWrapper: {
    position: 'absolute', top: '38%', left: '48%',
    transform: 'translate(-50%, -50%)',
  },
  pinPulse: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 48, height: 48, borderRadius: '50%',
    border: '2px solid rgba(99,219,219,0.4)',
    animation: 'cabify-pulse 2s ease-out infinite',
  },
  pinDot: {
    width: 14, height: 14, borderRadius: '50%',
    background: '#63DBDB',
    boxShadow: '0 0 0 3px rgba(99,219,219,0.3)',
    position: 'relative', zIndex: 1,
  },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    padding: '16px 20px 0',
    display: 'flex', alignItems: 'center',
    zIndex: 10,
  },
  brandText: {
    fontSize: 22, fontWeight: 700,
    color: '#FFFFFF', letterSpacing: '-0.5px',
  },
  greetBlock: { flex: 1, marginLeft: 12 },
  greetText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.2 },
  nameText:  { fontSize: 16, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 },
  avatarBtn: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 700,
    cursor: 'pointer', color: '#fff',
  },
  floatingCard: {
    position: 'absolute', bottom: -36, left: 16, right: 16,
    background: '#FFFFFF', borderRadius: 20,
    padding: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    zIndex: 20,
  },
  whereToBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#F3F3F3', borderRadius: 12,
    padding: '12px 14px', cursor: 'pointer',
  },
  searchDot:  { width: 10, height: 10, borderRadius: '50%', background: '#222', flexShrink: 0 },
  searchText: { fontSize: 15, color: '#888', flex: 1 },
  scheduleBtn: {
    fontSize: 12, color: '#333', background: '#E8E8E8',
    borderRadius: 8, padding: '4px 10px',
    border: 'none', cursor: 'pointer', fontWeight: 600,
    fontFamily: 'inherit',
  },
  body: { marginTop: 52, padding: '0 16px 100px', flex: 1 },
  sectionLabel: {
    fontSize: 12, fontWeight: 600, color: '#999',
    letterSpacing: 0.8, marginBottom: 12, marginTop: 24,
    textTransform: 'uppercase',
  },
  pillRow: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' },
  pill: (active) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '14px 18px', borderRadius: 16,
    background: active ? '#1A1A2E' : '#FFFFFF',
    border: active ? '1.5px solid #1A1A2E' : '1.5px solid #E8E8E8',
    cursor: 'pointer', flexShrink: 0, minWidth: 72,
    boxShadow: active ? '0 4px 12px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.06)',
  }),
  pillEmoji: { fontSize: 22 },
  pillLabel: (active) => ({ fontSize: 12, fontWeight: 600, color: active ? '#FFFFFF' : '#333' }),
  promoBanner: {
    marginTop: 16, borderRadius: 16,
    background: 'linear-gradient(120deg, #1A1A2E 0%, #0F3460 100%)',
    padding: '16px 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  promoTitle: { fontSize: 14, fontWeight: 700, color: '#FFFFFF' },
  promoSub:   { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  promoCode: {
    background: 'rgba(99,219,219,0.15)',
    border: '1px dashed #63DBDB', borderRadius: 8,
    padding: '6px 12px', fontSize: 13, fontWeight: 700,
    color: '#63DBDB', letterSpacing: 1, cursor: 'pointer',
  },
  tripCard: {
    background: '#FFFFFF', borderRadius: 16,
    padding: '14px 16px', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 14,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer',
  },
  tripIconBox: {
    width: 42, height: 42, borderRadius: 12,
    background: '#F3F3F3',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, flexShrink: 0,
  },
  tripInfo:  { flex: 1, minWidth: 0 },
  tripRoute: { fontSize: 14, fontWeight: 600, color: '#1A1A2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tripMeta:  { fontSize: 12, color: '#999', marginTop: 2 },
  tripPrice: { fontSize: 15, fontWeight: 700, color: '#1A1A2E', flexShrink: 0 },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: '#FFFFFF', borderTop: '1px solid #F0F0F0',
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    padding: '10px 0 20px', zIndex: 100,
  },
  navItem: () => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '6px 16px', borderRadius: 12, fontFamily: 'inherit',
  }),
  navIconWrap: (active) => ({
    width: 36, height: 36, borderRadius: 10,
    background: active ? '#1A1A2E' : 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  navIcon: (active) => ({ width: 20, height: 20, color: active ? '#FFFFFF' : '#AAAAAA', fill: 'currentColor' }),
  navLabel: (active) => ({ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? '#1A1A2E' : '#AAAAAA', letterSpacing: 0.3 }),
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser]       = useState({ name: '' });
  const [rides, setRides]     = useState([]);
  const [service, setService] = useState('cab');

  useEffect(() => {
    injectKeyframes();
    const stored = localStorage.getItem('ubl_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (_) {}
    }
    setRides(PAST_RIDES);
  }, []);

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function handleLogout() {
    localStorage.removeItem('ubl_token');
    localStorage.removeItem('ubl_user');
    navigate('/');
  }

  const handleBook = () => navigate('/book');

  return (
    <div style={S.root}>

      <div style={S.mapArea}>
        <div style={S.mapGrid} />
        <div style={S.mapRoad1} />
        <div style={S.mapRoad2} />
        <div style={S.mapRoad3} />

        {[[90,60,5,0.5],[130,200,4,0.4],[60,280,6,0.35],[180,100,4,0.3],[220,300,5,0.4],[70,160,3,0.5]]
          .map(([t,l,sz,op], i) => <div key={i} style={S.mapDot(`${t}px`,`${l}px`,sz,op)} />)}

        <div style={S.cabIcon('30%','15%',45)}>🚗</div>
        <div style={S.cabIcon('60%','72%',-20)}>🚗</div>
        <div style={S.cabIcon('20%','60%',10)}>🚗</div>

        <div style={S.pinWrapper}>
          <div style={S.pinPulse} />
          <div style={S.pinDot} />
        </div>

        <div style={S.topBar}>
          <div style={S.brandText}>cabify.</div>
          <div style={S.greetBlock}>
            <div style={S.greetText}>{getGreeting()},</div>
            <div style={S.nameText}>{user.name || 'there'} 👋</div>
          </div>
          <button style={S.avatarBtn} onClick={handleLogout} title="Logout">
            {user.name?.[0]?.toUpperCase() || '?'}
          </button>
        </div>

        <div style={S.floatingCard}>
          <div style={S.whereToBar} onClick={handleBook}>
            <div style={S.searchDot} />
            <span style={S.searchText}>Where are you going?</span>
            <button style={S.scheduleBtn} onClick={(e) => e.stopPropagation()}>
              Now ▾
            </button>
          </div>
        </div>
      </div>

      <div style={S.body}>
        <div style={S.sectionLabel}>Services</div>
        <div style={S.pillRow}>
          {SERVICES.map(({ id, emoji, label }) => (
            <div key={id} style={S.pill(service === id)} onClick={() => setService(id)}>
              <span style={S.pillEmoji}>{emoji}</span>
              <span style={S.pillLabel(service === id)}>{label}</span>
            </div>
          ))}
        </div>

        <div style={S.promoBanner}>
          <div>
            <div style={S.promoTitle}>20% off your next ride</div>
            <div style={S.promoSub}>Use code at checkout</div>
          </div>
          <div style={S.promoCode}>CABIFY20</div>
        </div>

        <div style={{ ...S.sectionLabel, marginTop: 24 }}>Recent Trips</div>

        {rides.length === 0 && (
          <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
            No rides yet. Book your first ride!
          </p>
        )}

        {rides.map((ride) => (
          <div key={ride.id} style={S.tripCard} onClick={handleBook}>
            <div style={S.tripIconBox}>{TYPE_EMOJI[ride.type] || '🚗'}</div>
            <div style={S.tripInfo}>
              <div style={S.tripRoute}>{ride.from} → {ride.to}</div>
              <div style={S.tripMeta}>{ride.date} · {ride.distance}</div>
            </div>
            <div style={S.tripPrice}>₹{ride.price}</div>
          </div>
        ))}
      </div>

      <div style={S.bottomNav}>
        <button style={S.navItem(true)}>
          <div style={S.navIconWrap(true)}>
            <svg style={S.navIcon(true)} viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <span style={S.navLabel(true)}>Home</span>
        </button>

        <button style={S.navItem(false)} onClick={handleBook}>
          <div style={S.navIconWrap(false)}>
            <svg style={S.navIcon(false)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
          </div>
          <span style={S.navLabel(false)}>Rides</span>
        </button>

        <button style={S.navItem(false)}>
          <div style={S.navIconWrap(false)}>
            <svg style={S.navIcon(false)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <span style={S.navLabel(false)}>Activity</span>
        </button>

        <button style={S.navItem(false)}>
          <div style={S.navIconWrap(false)}>
            <svg style={S.navIcon(false)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span style={S.navLabel(false)}>Profile</span>
        </button>
      </div>
    </div>
  );
}