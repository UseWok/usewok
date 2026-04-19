import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isOfferActive, getOfferExpiry } from '@/lib/welcome-offer';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

function pad(n) {return String(Math.floor(n)).padStart(2, '0');}

function useCountdown(targetMs) {
  const [rem, setRem] = useState(() => Math.max(0, targetMs - Date.now()));
  useEffect(() => {
    if (!targetMs) return;
    const id = setInterval(() => setRem(Math.max(0, targetMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  return rem;
}

export default function HomeEventBanner({ large = false }) {
  return null;

  const h = Math.floor(rem / 3600000);
  const m = Math.floor(rem % 3600000 / 60000);
  const s = Math.floor(rem % 60000 / 1000);

  if (large) {
    // ManagePlanPage variant — more discrete
    return (
      <div
        className="flex items-center justify-between px-4 py-3 mb-4 cursor-pointer"
        style={{ background: 'rgba(221,255,0,0.08)', border: '1px solid rgba(221,255,0,0.3)', borderRadius: '6px' }}
        onClick={() => navigate('/pricing')}>
        <div>
          <p className="text-xs font-semibold" style={{ color: FG }}>Offre de bienvenue — 30% sur les plans annuels</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#888' }}>Advanced, Expert & Supreme uniquement</p>
        </div>
        <div className="flex items-center gap-0.5 font-black tabular-nums text-base" style={{ color: FG }}>
          <span>{pad(h)}</span>
          <span style={{ color: '#bbb' }}>:</span>
          <span>{pad(m)}</span>
          <span style={{ color: '#bbb' }}>:</span>
          <span>{pad(s)}</span>
        </div>
      </div>);

  }

  return (
    <div className="max-w-2xl mx-auto px-4 mb-4">
      


























      
    </div>);

}