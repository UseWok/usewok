import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Home, LogOut, Zap } from 'lucide-react';
import { getTheme, setTheme } from '@/lib/theme';
import { base44 } from '@/api/base44Client';

export default function ChatProfileMenu({ user, userPlan }) {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const ref = useRef(null);
  const navigate = useNavigate();

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

  return (
    <div ref={ref} className="relative">
      {/* "Wok" branded trigger box */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-center px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
        title="Profile & Settings"
      >
        <span className="text-[13px] font-bold text-foreground tracking-tight">Wok</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute top-[calc(100%+8px)] left-0 w-[220px] bg-card border border-border rounded-xl shadow-2xl z-[200] overflow-hidden"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[13px] font-bold text-foreground truncate">{user?.full_name || 'User'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userPlan?.name || 'Free'} plan</p>
            </div>

            {/* Credits */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-[11px] font-semibold text-foreground">Credits</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{used} / {total}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#0055FF',
                  }}
                />
              </div>
            </div>

            {/* Theme */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Theme</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    currentTheme === 'light'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Light
                </button>
                <button
                  onClick={() => handleTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    currentTheme === 'dark'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Dark
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-1.5">
              <button
                onClick={() => { setOpen(false); navigate('/app'); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
              <button
                onClick={() => base44.auth.logout('/')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}