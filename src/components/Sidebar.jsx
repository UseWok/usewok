import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, PanelLeftClose,
  Plus, MoreHorizontal, Shield, Settings, CreditCard, LogOut, HelpCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserColor } from '@/lib/user-color';

export const COLLAPSED_W = 0;
export const EXPANDED_W = 260;

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
      animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W, opacity: expanded ? 1 : 0 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[#1C1C1C] border-r border-[#2A2A2A] overflow-hidden font-sans"
      style={{ minHeight: '100vh' }}
    >
      <div className="w-[260px] flex flex-col h-full">

        {/* Header */}
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-[800] italic tracking-tighter text-white">WOK</h1>
          <button
            onClick={() => setExpanded(false)}
            className="p-1.5 text-gray-400 hover:bg-[#2A2A2A] rounded-md transition-colors border border-[#2A2A2A] bg-[#0F0F0F]"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="px-4 space-y-0.5 mt-3 flex-shrink-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white font-bold border border-[#2A2A2A]'
                    : 'text-gray-400 hover:bg-[#1A1A1A] border border-transparent hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Admin Button */}
        {user?.role === 'admin' && (
          <div className="px-4 pb-3">
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors group"
            >
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-[13px] font-semibold text-primary">Admin Dashboard</span>
            </button>
          </div>
        )}

        {/* New Chat */}
        <div className="px-4 py-3 border-t border-[#2A2A2A]">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center justify-center gap-2 w-full py-2 bg-[#0055FF] text-white rounded-md text-[13px] font-bold hover:bg-[#0044CC] transition-colors"
          >
            <Plus className="w-4 h-4" /> New chat
          </button>
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-[#2A2A2A] flex-shrink-0 relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(v => !v)}
            className="w-full flex items-center gap-3 hover:bg-[#1A1A1A] rounded-lg p-1.5 -mx-1.5 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
              style={{ backgroundColor: getUserColor(user) }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-bold text-white truncate">{user?.full_name || 'User'}</p>
              <p className="text-[11px] text-gray-500 truncate">{user?.email || ''}</p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                className="absolute bottom-[calc(100%-8px)] left-4 right-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl z-[999] py-1.5 overflow-hidden"
              >
                <button onClick={() => { navigate('/settings'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-[#2A2A2A] transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button onClick={() => { navigate('/pricing'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-[#2A2A2A] transition-colors">
                  <CreditCard className="w-4 h-4" /> Upgrade plan
                </button>
                <button onClick={() => { navigate('/support'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-300 hover:text-white hover:bg-[#2A2A2A] transition-colors">
                  <HelpCircle className="w-4 h-4" /> Support
                </button>
                <div className="h-px bg-[#2A2A2A] my-1" />
                <button onClick={() => base44.auth.logout('/')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-[#2A2A2A] transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}