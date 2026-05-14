import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, MessageSquare, Cpu, BookOpen, ChevronsLeft, 
  FileText, Bot, Plus, Settings, LifeBuoy, ArrowUpCircle, Key, Briefcase, ChevronDown, Check, MoreHorizontal
} from 'lucide-react';
import { getUserColor } from '@/lib/user-color';

const AGENTS = [
  { id: 'global', label: "Global Asset Strategy" },
  { id: 'emotions-depenses', label: 'Spend without guilt' },
  { id: 'wealth-strategy', label: 'Becoming financially free' },
];

export default function WorkspaceSidebar({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  user, 
  userPlan, 
  workspaces, 
  currentWorkspace, 
  handleSwitchWorkspace, 
  setShowWorkspaceModal, 
  discussions, 
  navigate,
  setIframeModal
}) {
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileMenuOpen(false);
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) setShowWorkspaceSwitcher(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isSidebarOpen) return null;

  const isAdmin = user?.role === 'admin';
  const navItems = [
    { icon: Home, label: 'Home', path: '/app', active: window.location.pathname === '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions', active: window.location.pathname === '/discussions' },
    { icon: Cpu, label: 'DNA Stensor', path: '/ai-dna', active: window.location.pathname === '/ai-dna' },
  ];

  return (
    <aside className="w-[260px] flex-shrink-0 h-full bg-white border-r border-[#E5E5E5] flex flex-col z-40">
      
      {/* WORKSPACE SWITCHER */}
      <div className="p-3 border-b border-[#E5E5E5] relative" ref={workspaceRef}>
        <button 
          onClick={() => setShowWorkspaceSwitcher(!showWorkspaceSwitcher)}
          className="flex items-center justify-between w-full px-3 py-2 bg-white border border-[#E5E5E5] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-[13px] font-bold text-[#333333] truncate">
              {currentWorkspace?.name || 'My Workspace'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </button>

        {showWorkspaceSwitcher && (
          <div className="absolute top-[calc(100%+6px)] left-3 right-3 bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 p-1">
            {workspaces.map(w => (
              <button key={w.id} onClick={() => handleSwitchWorkspace(w.id)} className="w-full text-left px-3 py-2 text-[13px] font-medium text-[#333333] hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-md">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="flex-1 truncate">{w.name}</span>
                {w.current && <Check className="w-4 h-4 text-[#0080ff]" />}
              </button>
            ))}
            <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
            <button onClick={() => { setShowWorkspaceSwitcher(false); setShowWorkspaceModal(true); }} className="w-full text-left px-3 py-2 text-[13px] font-bold text-[#0080ff] hover:bg-gray-50 flex items-center gap-2 transition-colors rounded-md">
              <Plus className="w-4 h-4" /> Create workspace
            </button>
          </div>
        )}
      </div>

      <div className="px-3 pt-4 pb-2">
        <button onClick={() => { navigate('/'); }} className="flex items-center justify-center gap-2 w-full py-2 bg-[#0080ff] rounded-lg text-[13px] font-bold text-white hover:bg-[#0066cc] transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New chat
        </button>
      </div>

      <div className="px-3 space-y-0.5 mt-2">
        {navItems.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${item.active ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 mt-6">
          <div className="text-[11px] font-bold text-gray-400 mb-2 px-1 tracking-wider">RECENTS</div>
          <ul className="space-y-0.5">
            {discussions.slice(0, 5).map((d) => (
              <li key={d.id} onClick={() => navigate(`/chat?conversationId=${d.id}`)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 transition-colors truncate">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[13px] font-medium truncate">{d.title || d.preview || 'New chat'}</span>
              </li>
            ))}
          </ul>
      </div>
      
      {/* BOTTOM PROFILE AREA */}
      <div className="p-3 border-t border-[#E5E5E5] relative" ref={profileMenuRef}>
        {isProfileMenuOpen && (
          <div className="absolute bottom-[calc(100%+8px)] left-3 w-[240px] bg-white border border-[#E5E5E5] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1.5 z-50 font-sans p-1">
            <div className="px-3 py-2 border-b border-[#E5E5E5] mb-1">
              <p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p>
              <p className="text-[11.5px] text-[#707070] truncate">Plan: {userPlan?.name || 'Free'}</p>
            </div>
            <button onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
              <Settings className="w-4 h-4 text-gray-400" /> Settings
            </button>
            <button onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
              <LifeBuoy className="w-4 h-4 text-gray-400" /> Support tickets
            </button>
            <div className="h-px bg-[#E5E5E5] my-1 mx-2"></div>
            <button onClick={() => { setIsProfileMenuOpen(false); setIframeModal({open:true, url:'/pricing'}) }} className="w-full text-left px-3 py-2 text-[13px] text-[#333333] font-semibold hover:bg-gray-50 flex items-center gap-2.5 transition-colors group rounded-md">
              <ArrowUpCircle className="w-4 h-4 text-[#0080ff]" /> Upgrade plan
            </button>
            <button onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-3 py-2 text-[13px] text-[#707070] hover:bg-gray-50 flex items-center gap-2.5 transition-colors rounded-md">
              <Key className="w-4 h-4 text-gray-400" /> I have a code...
            </button>
          </div>
        )}
        <button 
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
        >
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ backgroundColor: getUserColor(user) }}>
            {(user?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#333333] truncate">{user?.full_name || 'User'}</p>
            <p className="text-[11px] text-[#707070]">Free Plan</p>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </aside>
  );
}