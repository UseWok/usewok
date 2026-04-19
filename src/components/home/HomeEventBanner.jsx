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
  const [show, setShow] = useState(null); // null=loading, true=show, false=hide
  const [expiryMs, setExpiryMs] = useState(0);
  const navigate = useNavigate();
  const rem = useCountdown(expiryMs);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (isOfferActive(u)) {
        setExpiryMs(getOfferExpiry(u));
        setShow(true);
      } else {
        setShow(false);
      }
    }).catch(() => {setShow(false);});
  }, []);

  // Reserve space while loading to prevent layout shift
  if (show === null) return <div className={large ? 'h-16 mb-4' : 'max-w-2xl mx-auto px-4 mb-4'} style={large ? {} : {}}><div className={large ? 'h-16' : 'h-14'} /></div>;
  if (!show || rem <= 0) return null;

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
      <div
        onClick={() => navigate('/pricing')} className="w-full flex items-center justify-between px-4 py-3 cursor-pointer transition-all hover:opacity-90 hidden"

        style={{
          background: 'white',
          border: `1.5px solid ${YUZU}`,
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(221,255,0,0.12)'
        }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: YUZU }} />
          <div>
            <p className="text-sm font-black" style={{ color: FG }}>
              Offre de bienvenue — 30% de réduction
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>
              Plans Advanced, Expert & Supreme annuels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 font-black tabular-nums text-lg flex-shrink-0 ml-4" style={{ color: FG }}>
          <span>{pad(h)}</span>
          <span style={{ color: '#bbb' }}>:</span>
          <span>{pad(m)}</span>
          <span style={{ color: '#bbb' }}>:</span>
          <span>{pad(s)}</span>
        </div>
      </div>
    </div>);

}