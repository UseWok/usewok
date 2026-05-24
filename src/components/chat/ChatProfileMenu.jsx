import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Home, Zap } from 'lucide-react';
import { getTheme, setTheme } from '@/lib/theme';
import { base44 } from '@/api/base44Client';
import PricingPage from '@/pages/PricingPage';
import SupportPage from '@/pages/SupportPage';

// Blue circle with upward arrow — Upgrade icon
const UpgradeIcon = () => (
  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#0055FF] flex-shrink-0">
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M4 6.5V1.5M1.5 4L4 1.5L6.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
);

// 95% modal rendering a page component inline (no iframe, no navigation)
function InlineModal({ onClose, title, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(10,10,15,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="relative bg-background rounded-2xl overflow-hidden overflow-y-auto"
        style={{ width: '95vw', height: '95vh', boxShadow: '0 40px 100px rgba(0,0,0,0.45)', border: '1px solid hsl(var(--border))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all text-[18px] font-light"
        >
          ✕
        </button>
        {children}
      </motion.div>
    </div>
  );
}

export default function ChatProfileMenu({ user, userPlan }) {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getTheme);
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

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setCurrentTheme(next);
  };

  return (
    <>
      {/* Inline modals — stay within chat context, no navigation */}
      <AnimatePresence>
        {modal === 'upgrade' && (
          <InlineModal key="upgrade" onClose={() => setModal(null)} title="Upgrade Plan">
            <PricingPage />
          </InlineModal>
        )}
        {modal === 'support' && (
          <InlineModal key="support" onClose={() => setModal(null)} title="Support">
            <SupportPage />
          </InlineModal>
        )}
      </AnimatePresence>

      <div ref={ref} className="relative">
        {/* Trigger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="relative overflow-hidden group flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-xl hover:bg-muted hover:shadow-md active:scale-95 transition-all duration-150 shadow-sm"
        >
          <span className="absolute inset-0 rounded-xl bg-foreground/[0.06] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-black flex-shrink-0">W</div>
          <span className="text-[12px] font-semibold text-foreground tracking-tight">Wok</span>
          <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
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
              {/* Header row — user info left, theme toggle pinned top-right */}
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-foreground truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{userPlan?.name || 'Free'} plan</p>
                </div>
                {/* Theme toggle — strictly top-right corner of popup */}
                <button
                  onClick={toggleTheme}
                  className="relative overflow-hidden group flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-all duration-200"
                >
                  <span className="absolute inset-0 rounded-lg bg-foreground/[0.07] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
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
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#0055FF' }}
                  />
                </div>
              </div>

              {/* Actions — no "Sign out" in chat context */}
              <div className="p-1.5">
                <button
                  onClick={() => { setOpen(false); window.location.href = '/app'; }}
                  className="relative overflow-hidden group w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all duration-200"
                >
                  <span className="absolute inset-0 bg-foreground/[0.05] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
                  <Home className="w-4 h-4 flex-shrink-0" /> Back to Home
                </button>
                <button
                  onClick={() => { setOpen(false); setModal('upgrade'); }}
                  className="relative overflow-hidden group w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all duration-200"
                >
                  <span className="absolute inset-0 bg-foreground/[0.05] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
                  <UpgradeIcon /> Upgrade plan
                </button>
                <button
                  onClick={() => { setOpen(false); setModal('support'); }}
                  className="relative overflow-hidden group w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all duration-200"
                >
                  <span className="absolute inset-0 bg-foreground/[0.05] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                  Support
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}