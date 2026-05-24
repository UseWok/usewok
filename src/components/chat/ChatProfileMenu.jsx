import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Home, LogOut, Zap, HelpCircle } from 'lucide-react';
import { getTheme, setTheme } from '@/lib/theme';
import { base44 } from '@/api/base44Client';

// Blue circle with upward arrow — Upgrade icon
const UpgradeIcon = () => (
  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 flex-shrink-0">
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M4 6.5V1.5M1.5 4L4 1.5L6.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
);

// Inline page modal for Upgrade / Support — stays inside chat context
function InlineModal({ open, onClose, src, title }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative bg-background rounded-2xl overflow-hidden"
        style={{ width: '95vw', height: '95vh', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', border: '1px solid hsl(var(--border))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
        >
          ✕
        </button>
        {/* Render the route content via iframe so we don't lose chat state */}
        <iframe
          src={src}
          className="w-full h-full border-none"
          title={title}
        />
      </motion.div>
    </div>
  );
}

export default function ChatProfileMenu({ user, userPlan }) {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const [modal, setModal] = useState(null); // null | 'upgrade' | 'support'
  const ref = useRef(null);

  const used = user?.credits_used || 0;
  const limit = userPlan?.credits_limit || user?.credits_limit || 10;
  const bonus = user?.credits_bonus || 0;
  const total = limit + bonus;
  const pct = Math.min((used / total) * 100, 100);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleTheme = (theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
  };

  const toggleTheme = () => handleTheme(currentTheme === 'dark' ? 'light' : 'dark');

  return (
    <>
      {/* Inline modals — stay within chat context */}
      <AnimatePresence>
        {modal === 'upgrade' && (
          <InlineModal open key="upgrade" onClose={() => setModal(null)} src="/pricing" title="Upgrade Plan" />
        )}
        {modal === 'support' && (
          <InlineModal open key="support" onClose={() => setModal(null)} src="/support" title="Support" />
        )}
      </AnimatePresence>

      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors shadow-sm"
          title="Menu"
        >
          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-black flex-shrink-0">W</div>
          <span className="text-[13px] font-bold text-foreground tracking-tight">Menu</span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.14 }}
              className="absolute top-[calc(100%+8px)] left-0 w-[240px] bg-card border border-border rounded-xl shadow-2xl z-[200] overflow-hidden"
            >
              {/* Header row: User info + Theme toggle pinned top-right */}
              <div className="px-4 py-3 border-b border-border flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-foreground truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{userPlan?.name || 'Free'} plan</p>
                </div>
                {/* Theme toggle — strictly top-right of menu window */}
                <button
                  onClick={toggleTheme}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors border border-border"
                  title={currentTheme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                >
                  {currentTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Credits */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="text-[11px] font-semibold text-foreground">Credits</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">{used} / {total}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#0055FF' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-1.5">
                <button
                  onClick={() => { setOpen(false); window.history.pushState({}, '', '/app'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Home className="w-4 h-4 flex-shrink-0" /> Back to Home
                </button>
                <button
                  onClick={() => { setOpen(false); setModal('upgrade'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <UpgradeIcon /> Upgrade plan
                </button>
                <button
                  onClick={() => { setOpen(false); setModal('support'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <HelpCircle className="w-4 h-4 flex-shrink-0" /> Support
                </button>
                <div className="h-px bg-border mx-2 my-1" />
                <button
                  onClick={() => base44.auth.logout('/')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-destructive hover:bg-muted rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" /> Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}