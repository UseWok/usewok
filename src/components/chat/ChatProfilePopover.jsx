import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const CORAL = '#FF4F00';

export default function ChatProfilePopover({ open, onClose, anchorRef, user }) {
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = (user?.credits_limit || 10) + (user?.credits_bonus || 0);
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const isAdmin = user?.role === 'admin';
  const isLow = (creditsLimit - creditsUsed) <= 5 && !isAdmin;

  // Daily usage
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyUsed = (() => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0; } catch { return 0; } })();

  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  const getPos = () => {
    if (!anchorRef?.current) return { right: 16, top: 56 };
    const rect = anchorRef.current.getBoundingClientRect();
    return { right: window.innerWidth - rect.right, top: rect.bottom + 8 };
  };

  const pos = open ? getPos() : {};

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[300] w-68 bg-white font-be overflow-hidden"
          style={{ right: pos.right, top: pos.top, width: 260, border: '1px solid rgba(0,0,0,0.09)', borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}
        >
          {/* User header */}
          <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ background: FG, fontSize: 13 }}>
                {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: FG }}>{user?.full_name || 'Utilisateur'}</p>
                <p className="text-[11px] truncate" style={{ color: '#999' }}>{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>Consommation</p>
              <p className="text-xs font-black" style={{ color: isLow ? CORAL : FG }}>
                {isAdmin ? '∞ admin' : `${creditsUsed} / ${creditsLimit}`}
              </p>
            </div>
            {!isAdmin && (
              <>
                <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(0,0,0,0.07)' }}>
                  <motion.div animate={{ width: `${pct}%` }} className="h-full rounded-full"
                    style={{ background: pct >= 90 ? CORAL : pct >= 70 ? '#f59e0b' : FG }} />
                </div>
                <p className="text-[10px]" style={{ color: '#bbb' }}>{Math.max(creditsLimit - creditsUsed, 0)} restants ce mois</p>
                <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <p className="text-[10px]" style={{ color: '#aaa' }}>Aujourd'hui</p>
                  <p className="text-[10px] font-bold" style={{ color: FG }}>{dailyUsed} utilisés</p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button onClick={() => { navigate('/pricing'); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left"
              style={{ borderRadius: '5px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '4px' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: FG }} />
              </div>
              <span className="font-semibold" style={{ color: FG }}>Mettre à niveau</span>
            </button>
            <button onClick={() => base44.auth.logout()}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left"
              style={{ borderRadius: '5px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '4px' }}>
                <LogOut className="w-3.5 h-3.5" style={{ color: '#888' }} />
              </div>
              <span style={{ color: '#888' }}>Déconnexion</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}