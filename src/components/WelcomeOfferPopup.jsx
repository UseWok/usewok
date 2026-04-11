import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { isOfferActive, getOfferExpiry, OFFER_DISMISS_KEY } from '@/lib/welcome-offer';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

function Countdown({ expiryMs }) {
  const [rem, setRem] = useState(() => Math.max(0, expiryMs - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setRem(Math.max(0, expiryMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [expiryMs]);
  const h = Math.floor(rem / 3600000);
  const m = Math.floor((rem % 3600000) / 60000);
  const s = Math.floor((rem % 60000) / 1000);
  return (
    <div className="flex items-center gap-1 font-black tabular-nums text-2xl" style={{ color: YUZU }}>
      <span>{pad(h)}</span><span className="opacity-40">:</span>
      <span>{pad(m)}</span><span className="opacity-40">:</span>
      <span>{pad(s)}</span>
    </div>
  );
}

export default function WelcomeOfferPopup() {
  const [show, setShow] = useState(false);
  const [expiryMs, setExpiryMs] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem(OFFER_DISMISS_KEY)) return;
    // Only show once per session
    const shownThisSession = sessionStorage.getItem('offer_popup_shown');
    if (shownThisSession) return;
    base44.auth.me().then(u => {
      if (isOfferActive(u)) {
        setExpiryMs(getOfferExpiry(u));
        setShow(true);
        sessionStorage.setItem('offer_popup_shown', '1');
      }
    }).catch(() => {});
  }, []);

  const dismiss = () => {
    localStorage.setItem(OFFER_DISMISS_KEY, '1');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => { navigate('/pricing'); setShow(false); }}>
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md relative overflow-hidden"
            style={{ background: FG, borderRadius: '12px', border: `2px solid ${YUZU}` }}>
            {/* Close */}
            <button onClick={dismiss}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-60"
              style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="p-8 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6"
                style={{ background: YUZU, borderRadius: '6px' }}>
                <span className="text-xs font-black tracking-widest uppercase" style={{ color: FG }}>
                  Offre de bienvenue exclusive
                </span>
              </div>

              <h2 className="font-black text-4xl text-white mb-2">-30% sur les plans</h2>
              <p className="text-white/50 text-sm mb-6">
                Advanced, Expert & Supreme — annuel uniquement
              </p>

              {/* Countdown */}
              <div className="flex flex-col items-center gap-1 mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Expire dans
                </p>
                <Countdown expiryMs={expiryMs} />
              </div>

              <button
                onClick={() => { navigate('/pricing'); setShow(false); }}
                className="w-full py-4 font-black text-sm tracking-wide transition-all hover:opacity-90"
                style={{ background: YUZU, color: FG, borderRadius: '8px' }}>
                Profiter de l'offre →
              </button>
              <button onClick={dismiss}
                className="mt-3 text-xs font-medium transition-opacity hover:opacity-60"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                Non merci
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}