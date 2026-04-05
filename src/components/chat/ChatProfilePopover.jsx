import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getCreditsUsed, getCreditsLimit } from '@/lib/credits';

export default function ChatProfilePopover({ open, onClose, anchorRef, user }) {
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  const creditsUsed = getCreditsUsed();
  const creditsLimit = getCreditsLimit();
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const isAdmin = user?.role === 'admin';

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
          className="fixed z-[300] w-72 rounded-2xl overflow-hidden shadow-2xl bg-card border border-border"
          style={{ right: pos.right, top: pos.top }}
        >
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1E0050, #3b0080)' }}>
                {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user?.full_name || 'Utilisateur'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground/60">Consommation</p>
              <p className="text-xs font-bold text-foreground">
                {isAdmin ? '∞ admin' : `${creditsUsed} crédit${creditsUsed !== 1 ? 's' : ''} consommé${creditsUsed !== 1 ? 's' : ''}`}
              </p>
            </div>
            {!isAdmin && (
              <>
                <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(0,0,0,0.06)' }}>
                  <motion.div animate={{ width: `${pct}%` }} className="h-full rounded-full"
                    style={{ background: pct >= 90 ? '#ef4444' : 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                </div>
                <p className="text-[10px] text-muted-foreground">{Math.max(creditsLimit - creditsUsed, 0)} restant{Math.max(creditsLimit - creditsUsed, 0) !== 1 ? 's' : ''} / {creditsLimit} total</p>
              </>
            )}
          </div>

          <div className="p-2">
            <button onClick={() => { navigate('/pricing'); onClose(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-foreground/5 transition-colors text-left">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Mettre à niveau</span>
            </button>
            <button onClick={() => base44.auth.logout()}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm hover:bg-foreground/5 transition-colors text-left">
              <LogOut className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground/70">Déconnexion</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}