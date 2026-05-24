import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, PanelLeftClose, PanelLeft,
  Plus, MoreHorizontal, Shield, Settings, CreditCard, LogOut, HelpCircle,
  Sun, Moon,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';
import { getTheme, setTheme } from '@/lib/theme';

export const COLLAPSED_W = 56;   // icon-strip width px
export const EXPANDED_W  = 240;  // full sidebar width px
export const SIDEBAR_MARGIN = 12;

export default function Sidebar({ expanded, setExpanded, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setCurrentTheme(next);
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const navItems = [
    { icon: Home, label: 'Home', path: '/app' },
    { icon: LayoutDashboard, label: 'Visual Cockpit', path: '/cockpit' },
  ];

  // Shared style for icon-only vs expanded buttons
  const btnBase = `relative flex items-center rounded-xl transition-all duration-200 overflow-hidden group`;
  const iconBtn = expanded
    ? `${btnBase} gap-3 px-2.5 py-2.5 w-full`
    : `${btnBase} justify-center w-9 h-9`; // 1:1 aspect ratio when collapsed

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="fixed z-40 flex flex-col overflow-hidden font-sans"
      style={{
        top: SIDEBAR_MARGIN,
        bottom: SIDEBAR_MARGIN,
        left: SIDEBAR_MARGIN,
        borderRadius: 14,
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      {/* ── Header: toggle + theme ── */}
      <div
        className="flex flex-shrink-0 items-center"
        style={{
          borderBottom: '1px solid hsl(var(--border))',
          padding: expanded ? '10px 10px 10px 14px' : '10px 0',
          justifyContent: expanded ? 'space-between' : 'center',
          gap: 6,
        }}
      >
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.h1
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-xl font-[900] italic tracking-tighter text-foreground whitespace-nowrap select-none"
            >
              WOK
            </motion.h1>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Theme toggle — integrated in header, always visible */}
          <button
            onClick={handleTheme}
            title={currentTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 border border-border"
          >
            {currentTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Collapse / expand toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            {expanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Nav items ── */}
      <nav
        className="flex flex-col gap-0.5 mt-3 flex-shrink-0"
        style={{ padding: expanded ? '0 8px' : '0 8px' }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={!expanded ? item.label : undefined}
              className={`${iconBtn} ${
                isActive
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
            >
              <span className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 origin-center pointer-events-none" />
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18 }}
                    className="whitespace-nowrap overflow-hidden text-[13px] font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* ── Admin ── */}
      {user?.role === 'admin' && (
        <div style={{ padding: expanded ? '0 8px 6px' : '0 8px 6px' }}>
          <button
            onClick={() => navigate('/admin')}
            title={!expanded ? 'Admin' : undefined}
            className={`${iconBtn} bg-primary/10 hover:bg-primary/20 border border-primary/20`}
            style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
          >
            <span className="absolute inset-0 rounded-xl bg-white/15 scale-0 group-active:scale-100 transition-transform duration-200 origin-center pointer-events-none" />
            <Shield className="w-4 h-4 text-primary flex-shrink-0" />
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-[13px] font-semibold text-primary whitespace-nowrap overflow-hidden"
                >
                  Admin Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      )}

      {/* ── New Chat CTA ── */}
      <div style={{ borderTop: '1px solid hsl(var(--border))', padding: expanded ? '8px 8px' : '8px 8px' }}>
        <button
          onClick={() => navigate('/chat')}
          title={!expanded ? 'New chat' : undefined}
          className={`${iconBtn} bg-[#0055FF] hover:bg-[#0044CC] text-white shadow-sm`}
          style={{ justifyContent: 'center', width: expanded ? '100%' : undefined }}
        >
          <span className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 origin-center pointer-events-none" />
          <Plus className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="whitespace-nowrap overflow-hidden text-[13px] font-bold"
              >
                New chat
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Profile Footer ── */}
      <div
        className="relative flex-shrink-0"
        ref={profileRef}
        style={{ borderTop: '1px solid hsl(var(--border))', padding: '8px 8px' }}
      >
        <button
          onClick={() => setShowProfileMenu(v => !v)}
          title={!expanded ? (user?.full_name || 'Profile') : undefined}
          className={`${expanded ? 'w-full flex items-center gap-3 px-1.5 py-1.5' : 'w-9 h-9 flex items-center justify-center'} hover:bg-muted rounded-xl transition-all duration-200 group overflow-hidden relative`}
        >
          <span className="absolute inset-0 rounded-xl bg-foreground/5 scale-0 group-active:scale-100 transition-transform duration-200 origin-center pointer-events-none" />
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
            style={{ backgroundColor: getUserColor(user) }}
          >
            {userInitial}
          </div>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="flex-1 min-w-0 text-left overflow-hidden"
              >
                <p className="text-[12px] font-bold text-foreground truncate">{user?.full_name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {expanded && <MoreHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        </button>

        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[calc(100%+4px)] left-2 right-2 bg-card border border-border rounded-xl shadow-2xl z-[999] py-1.5 overflow-hidden"
            >
              {[
                { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
                { icon: CreditCard, label: 'Upgrade plan', action: () => navigate('/pricing') },
                { icon: HelpCircle, label: 'Support', action: () => navigate('/support') },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={() => { action(); setShowProfileMenu(false); }}
                  className="relative w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-foreground/5 scale-0 group-active:scale-100 transition-transform duration-200 origin-center pointer-events-none" />
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
              <div className="h-px bg-border my-1" />
              <button onClick={() => base44.auth.logout('/')}
                className="relative w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-destructive hover:bg-muted transition-all duration-200 overflow-hidden group"
              >
                <span className="absolute inset-0 bg-destructive/10 scale-0 group-active:scale-100 transition-transform duration-200 origin-center pointer-events-none" />
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}