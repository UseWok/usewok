import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, PanelLeftClose, PanelLeft,
  Plus, MoreHorizontal, Shield, Settings, CreditCard, HelpCircle,
  Sun, Moon, MessageSquare,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';
import { getTheme, setTheme } from '@/lib/theme';

export const COLLAPSED_W = 56;
export const EXPANDED_W  = 220;
export const SIDEBAR_MARGIN = 10;

// Ripple fill effect for all buttons
const Btn = ({ onClick, active, title, expanded, children, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={!expanded ? title : undefined}
    className={`
      relative overflow-hidden group flex items-center rounded-xl
      transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
      focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
      ${active ? 'bg-primary text-primary-foreground shadow-sm font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
      ${expanded ? 'gap-3 px-2.5 py-2.5 w-full' : 'w-9 h-9 justify-center'}
      ${className}
    `}
  >
    {/* Tactile fill ripple */}
    <span className="absolute inset-0 rounded-xl bg-foreground/[0.07] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 origin-center pointer-events-none" />
    {children}
  </button>
);

export default function Sidebar({ expanded, setExpanded, user, userPlan }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getTheme);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setCurrentTheme(next);
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const navItems = [
    { icon: Home, label: 'Home', path: '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions' },
    { icon: LayoutDashboard, label: 'Visual Cockpit', path: '/cockpit' },
  ];

  const Label = ({ text }) => (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.span
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.18 }}
          className="whitespace-nowrap overflow-hidden text-[13px] font-medium"
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="fixed z-40 flex flex-col overflow-hidden font-sans select-none"
      style={{
        top: SIDEBAR_MARGIN,
        bottom: SIDEBAR_MARGIN,
        left: SIDEBAR_MARGIN,
        borderRadius: 14,
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Header: Logo + Theme + Collapse ── */}
      <div
        className="flex flex-shrink-0 items-center"
        style={{
          borderBottom: '1px solid hsl(var(--border))',
          padding: expanded ? '9px 8px 9px 12px' : '9px 8px',
          justifyContent: expanded ? 'space-between' : 'center',
        }}
      >
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-[18px] font-[900] italic tracking-tighter text-foreground whitespace-nowrap"
            >
              WOK
            </motion.span>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Theme toggle — top right of sidebar header */}
          <button
            onClick={toggleTheme}
            title={currentTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="relative overflow-hidden group w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all duration-200"
          >
            <span className="absolute inset-0 rounded-lg bg-foreground/[0.07] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
            {currentTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="relative overflow-hidden group w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
          >
            <span className="absolute inset-0 rounded-lg bg-foreground/[0.07] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
            {expanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex flex-col gap-0.5 mt-2 px-2 flex-shrink-0">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Btn key={item.path} onClick={() => navigate(item.path)} active={isActive} title={item.label} expanded={expanded}>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <Label text={item.label} />
            </Btn>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* ── Admin ── */}
      {user?.role === 'admin' && (
        <div className="px-2 pb-1.5">
          <Btn onClick={() => navigate('/admin')} title="Admin" expanded={expanded}
            className="bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary hover:text-primary"
          >
            <Shield className="w-4 h-4 flex-shrink-0 text-primary" />
            <Label text="Admin" />
          </Btn>
        </div>
      )}

      {/* ── New chat CTA ── */}
      <div className="px-2 pb-2" style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 8 }}>
        <button
          onClick={() => navigate('/chat')}
          title={!expanded ? 'New chat' : undefined}
          className={`
            relative overflow-hidden group flex items-center justify-center rounded-xl
            bg-[#0055FF] hover:bg-[#1A6BFF] text-white shadow-sm
            transition-all duration-200
            ${expanded ? 'w-full gap-2.5 px-3 py-2.5' : 'w-9 h-9'}
          `}
        >
          <span className="absolute inset-0 rounded-xl bg-white/15 scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
          <Plus className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="text-[13px] font-bold whitespace-nowrap overflow-hidden"
              >
                New chat
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Profile footer ── */}
      <div
        className="relative flex-shrink-0 px-2 pb-2"
        ref={profileRef}
        style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: 8 }}
      >
        <button
          onClick={() => setShowProfileMenu(v => !v)}
          title={!expanded ? (user?.full_name || 'Profile') : undefined}
          className={`
            relative overflow-hidden group rounded-xl hover:bg-muted
            transition-all duration-200 flex items-center
            ${expanded ? 'w-full gap-2.5 px-2 py-2' : 'w-9 h-9 justify-center'}
          `}
        >
          <span className="absolute inset-0 rounded-xl bg-foreground/[0.05] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
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
                <p className="text-[12px] font-bold text-foreground truncate leading-tight">{user?.full_name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{userPlan?.name || 'Free'}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {expanded && <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
        </button>

        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[calc(100%+4px)] left-2 right-2 bg-card border border-border rounded-xl shadow-xl z-[999] py-1.5 overflow-hidden"
            >
              {[
                { icon: Settings, label: 'Settings', action: () => navigate('/settings') },
                { icon: CreditCard, label: 'Upgrade plan', action: () => navigate('/pricing') },
                { icon: HelpCircle, label: 'Support', action: () => navigate('/support') },
              ].map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  onClick={() => { action(); setShowProfileMenu(false); }}
                  className="relative overflow-hidden group w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                >
                  <span className="absolute inset-0 bg-foreground/[0.05] scale-0 opacity-0 group-active:scale-100 group-active:opacity-100 transition-all duration-150 pointer-events-none" />
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}