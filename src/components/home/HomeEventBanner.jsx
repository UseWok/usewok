import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { isOfferActive, getOfferExpiry } from '@/lib/welcome-offer';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

export default function HomeEventBanner() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => {
      if (isOfferActive(u)) setShow(true);
    }).catch(() => {});
  }, []);

  if (!show) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 mb-6">
      <button
        onClick={() => navigate('/pricing')}
        className="w-full flex items-center justify-between px-5 py-4 transition-all hover:opacity-90 text-left"
        style={{
          background: 'white',
          border: `1.5px solid ${YUZU}`,
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(221,255,0,0.15)',
        }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: YUZU }} />
          <div>
            <p className="text-sm font-black" style={{ color: FG }}>
              Offre de bienvenue — 30% de réduction
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>
              Sur les plans Advanced, Expert & Supreme (annuel). Valable 48h.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold flex-shrink-0 px-3 py-1.5"
          style={{ background: YUZU, color: FG, borderRadius: '4px' }}>
          Voir les offres →
        </span>
      </button>
    </div>
  );
}