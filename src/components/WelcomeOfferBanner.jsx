import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';
const OFFER_HOURS = 48;
const DISMISS_KEY = 'stensor_welcome_dismissed';

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
    if (localStorage.getItem(DISMISS_KEY)) return;
    base44.auth.me().then(u => {
      if (!u?.created_date) return;
      const created = new Date(u.created_date).getTime();
      const expiresAt = created + OFFER_HOURS * 3600 * 1000;
      if (Date.now() < expiresAt) {
        setTargetMs(expiresAt);
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
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  };

  return (
    <div
      onClick={() => navigate('/pricing')}
      className="w-full flex items-center justify-center gap-4 px-4 py-2.5 cursor-pointer select-none"
      style={{ background: FG, borderBottom: `2px solid ${YUZU}` }}>
      <span className="text-xs font-bold text-white/70 hidden sm:block">Offre de bienvenue limitée</span>
      <div className="flex items-center gap-2 px-3 py-1.5"
        style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px' }}>
        <span className="text-xs font-black" style={{ color: YUZU }}>
          Profitez de -30% sur les plans sélectionnés →
        </span>
      </div>
      <div className="flex items-center gap-1 font-black tabular-nums text-lg" style={{ color: YUZU }}>
        <span>{pad(h)}</span>
        <span className="opacity-50 text-base">:</span>
        <span>{pad(m)}</span>
        <span className="opacity-50 text-base">:</span>
        <span>{pad(s)}</span>
      </div>
      <button
        onClick={handleDismiss}
        className="ml-2 text-white/30 hover:text-white/70 transition-colors text-xs font-bold">
        ✕
      </button>
    </div>
  );
}