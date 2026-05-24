import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, PanelLeftClose, PanelLeft,
  Plus, MoreHorizontal, Shield, Settings, CreditCard, LogOut, HelpCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';

export const COLLAPSED_W = 64;  // icon-strip width (px)
export const EXPANDED_W  = 240; // full sidebar width (px)
export const SIDEBAR_MARGIN = 12; // gap from screen edges (px)

export default function Sidebar({ expanded, setExpanded, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const navItems = [
    { icon: Home, label: 'Home', path: '/app' },
    { icon: LayoutDashboard, label: 'Visual Cockpit', path: '/cockpit' },
  ];

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
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 overflow-hidden"
        style={{ padding: expanded ? '14px 14px 14px 16px' : '14px 0', justifyContent: expanded ? 'space-between' : 'center', borderBottom: '1px solid hsl(var(--border))' }}>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.h1
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-xl font-[900] italic tracking-tighter text-foreground whitespace-nowrap"
            >
              WOK
            </motion.h1>
          )}
        </AnimatePresence>
        <button
          onClick={() => setExpanded(v => !v)}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200 flex-shrink-0"
        >
          {expanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-0.5 mt-3 px-2 flex-shrink-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={!expanded ? item.label : undefined}
              className={`relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 overflow-hidden group ${
                isActive
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
            >
              {/* ripple on click */}
              <span className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 origin-center" />
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18 }}
                    className="whitespace-nowrap overflow-hidden"
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

      {/* Admin */}
      {user?.role === 'admin' && (
        <div className="px-2 pb-2">
          <button
            onClick={() => navigate('/admin')}
            title={!expanded ? 'Admin' : undefined}
            className="relative w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-200 group overflow-hidden"
            style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
          >
            <span className="absolute inset-0 rounded-xl bg-white/15 scale-0 group-active:scale-100 transition-transform duration-200 origin-center" />
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

      {/* New Chat CTA */}
      <div className="px-2 pb-2" style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 8 }}>
        <button
          onClick={() => navigate('/chat')}
          title={!expanded ? 'New chat' : undefined}
          className="relative flex items-center gap-2 w-full py-2.5 bg-[#0055FF] text-white rounded-xl text-[13px] font-bold hover:bg-[#0044CC] transition-all duration-200 shadow-sm group overflow-hidden"
          style={{ justifyContent: expanded ? 'center' : 'center' }}
        >
          <span className="absolute inset-0 rounded-xl bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200 origin-center" />
          <Plus className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="whitespace-nowrap overflow-hidden"
              >
                New chat
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Profile Footer */}
      <div
        className="relative flex-shrink-0"
        ref={profileRef}
        style={{ borderTop: '1px solid hsl(var(--border))', padding: expanded ? '10px 10px' : '10px 6px' }}
      >
        <button
          onClick={() => setShowProfileMenu(v => !v)}
          title={!expanded ? (user?.full_name || 'Profile') : undefined}
          className="relative w-full flex items-center gap-3 hover:bg-muted rounded-xl p-1.5 transition-all duration-200 group overflow-hidden"
          style={{ justifyContent: expanded ? 'flex-start' : 'center' }}
        >
          <span className="absolute inset-0 rounded-xl bg-foreground/5 scale-0 group-active:scale-100 transition-transform duration-200 origin-center" />
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
              <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="relative w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 overflow-hidden group">
                <span className="absolute inset-0 bg-foreground/5 scale-0 group-active:scale-100 transition-transform duration-200 origin-center" />
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button onClick={() => { navigate('/pricing'); setShowProfileMenu(false); }} className="relative w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 overflow-hidden group">
                <span className="absolute inset-0 bg-foreground/5 scale-0 group-active:scale-100 transition-transform duration-200 origin-center" />
                <CreditCard className="w-4 h-4" /> Upgrade plan
              </button>
              <button onClick={() => { navigate('/support'); setShowProfileMenu(false); }} className="relative w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 overflow-hidden group">
                <span className="absolute inset-0 bg-foreground/5 scale-0 group-active:scale-100 transition-transform duration-200 origin-center" />
                <HelpCircle className="w-4 h-4" /> Support
              </button>
              <div className="h-px bg-border my-1" />
              <button onClick={() => base44.auth.logout('/')} className="relative w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-destructive hover:bg-muted transition-all duration-200 overflow-hidden group">
                <span className="absolute inset-0 bg-destructive/10 scale-0 group-active:scale-100 transition-transform duration-200 origin-center" />
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}