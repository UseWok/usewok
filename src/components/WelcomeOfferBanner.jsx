import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isOfferActive, getOfferExpiry, OFFER_DISMISS_KEY, OFFER_HOURS } from '@/lib/welcome-offer';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

function useCountdown(targetMs) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return remaining;
}

function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

export default function WelcomeOfferBanner() {
  const [show, setShow] = useState(false);
  const [targetMs, setTargetMs] = useState(0);
  const navigate = useNavigate();
  const remaining = useCountdown(targetMs);


  useEffect(() => {
    base44.auth.me().then(u => {
      if (isOfferActive(u)) {
        setTargetMs(getOfferExpiry(u));
        setShow(true);
      }
    }).catch(() => {});
  }, []);

  // Hide when timer expires
  useEffect(() => {
    if (show && remaining <= 0) setShow(false);
  }, [remaining, show]);

  if (!show || remaining <= 0) return null;

  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  const handleDismiss = (e) => {
    e.stopPropagation();
    localStorage.setItem(OFFER_DISMISS_KEY, '1');
    setShow(false);
  };

  return (
    <div
      onClick={() => navigate('/pricing')}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 cursor-pointer select-none"
      style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      <span className="text-[11px] font-medium" style={{ color: '#888' }}>Limited time welcome offer</span>
      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#ddd' }} />
      <span className="text-[11px] font-medium" style={{ color: '#555' }}>Get 30% off select yearly plans</span>
      <div className="flex items-center gap-0.5 font-bold tabular-nums text-[11px]" style={{ color: FG }}>
        <span>{pad(h)}</span>
        <span style={{ color: '#bbb' }}>:</span>
        <span>{pad(m)}</span>
        <span style={{ color: '#bbb' }}>:</span>
        <span>{pad(s)}</span>
      </div>
    </div>
  );
}