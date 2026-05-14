import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Home, MessageSquare, Cpu, FileText, Plus, Settings, 
  LifeBuoy, ArrowUpCircle, Key, Briefcase, ChevronDown, 
  Check, MoreHorizontal, ChevronsLeft
} from 'lucide-react';
import { getUserColor } from '@/lib/user-color';

export default function WorkspaceSidebar({
  isSidebarOpen, setIsSidebarOpen,
  user, userPlan,
  workspaces, currentWorkspace,
  handleSwitchWorkspace, setShowWorkspaceModal,
  discussions, navigate, setIframeModal
}) {
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setIsProfileMenuOpen(false);
      if (workspaceRef.current && !workspaceRef.current.contains(e.target)) setShowWorkspaceSwitcher(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const location = { pathname: window.location.pathname };

  const navItems = [
    { icon: Home, label: 'Home', path: '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions' },
    { icon: Cpu, label: 'DNA Stensor', path: '/ai-dna' },
  ];

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-[260px] flex-shrink-0 h-full bg-white border-r border-[#E5E5E5] flex flex-col z-40 font-sans">

      {/* WORKSPACE SWITCHER */}
      <div className="p-3 border-b border-[#E5E5E5] relative" ref={workspaceRef}>
        <button
          onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
          className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span className="text-[13px] font-bold text-[#333333] truncate">
              {currentWorkspace?.name || 'My Workspace'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        <AnimatePresence>
          {showWorkspaceSwitcher && (
            <motion.div
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.1 }}
              className="absolute top-[calc(100%+6px)] left-3 right-3 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 p-1"
            >
              <p className="text-[10px] text-gray-400 mb-1 px-3 mt-1 uppercase tracking-wider font-bold">Your Workspaces</p>
              {workspaces.map(w => (
                <button key={w.id} onClick={() => { handleSwitchWorkspace(w.id); setShowWorkspaceSwitcher(false); }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#333333] hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-md">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 truncate">{w.name}</span>
                  {w.current && <Check className="w-4 h-4 text-[#0080ff]" />}
                </button>
              ))}
              <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
              <button onClick={() => { setShowWorkspaceSwitcher(false); setShowWorkspaceModal(true); }} className="w-full text-left px-3 py-2 text-[13px] font-bold text-[#0080ff] hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-md">
                <Plus className="w-4 h-4" /> Create workspace
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NEW CHAT */}
      <div className="px-3 pt-4 pb-2">
        <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 w-full py-2 bg-[#0080ff] rounded-lg text-[13px] font-bold text-white hover:bg-[#0066cc] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New chat
        </button>
      </div>

      {/* NAV ITEMS */}
      <div className="px-3 space-y-0.5 mt-2">
        {navItems.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${location.pathname === item.path ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* RECENTS */}
      <div className="flex-1 overflow-y-auto px-3 mt-6">
        <div className="text-[11px] font-bold text-gray-400 mb-2 px-1 tracking-wider">RECENTS</div>
        <ul className="space-y-0.5">
          {discussions.slice(0, 5).map((d) => (
            <li
              key={d.id}
              onClick={() => navigate(`/chat?conversationId=${d.id}`)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-[13px] font-medium truncate">{d.title || d.preview || 'Discussion'}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* PROFILE */}
      <div className="p-3 border-t border-[#E5E5E5] relative" ref={profileMenuRef}>
        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.1 }}
              className="absolute bottom-[calc(100%+8px)] left-3 w-[240px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 p-1"
            >
              <div className="px-3 py-2 border-b border-[#E5E5E5] mb-1">
                <p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p>
                <p className="text-[11.5px] text-[#707070] truncate">Plan: {userPlan?.name || 'Free'}</p>
              </div>
              <button onClick={() => { setIsProfileMenuOpen(false); navigate('/settings'); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button onClick={() => { setIsProfileMenuOpen(false); navigate('/support'); }} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
                <LifeBuoy className="w-4 h-4" /> Support tickets
              </button>
              <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
              <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({ open: true, url: '/pricing' }); }} className="w-full text-left px-3 py-2 text-[13px] text-[#333333] font-semibold hover:bg-gray-50 flex items-center gap-2.5 transition-colors group rounded-md">
                <ArrowUpCircle className="w-4 h-4 text-[#0080ff]" /> Upgrade plan
              </button>
              <button onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
                <Key className="w-4 h-4" /> I have a code...
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
        >
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ backgroundColor: getUserColor(user) }}>
            {(user?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p>
            <p className="text-[11px] text-[#707070]">{userPlan?.name || 'Free Plan'}</p>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </aside>
  );
}