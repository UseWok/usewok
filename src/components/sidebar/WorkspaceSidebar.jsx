import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  Settings, 
  FileText, 
  Star, 
  Bot, 
  Lock, 
  Bell, 
  Search 
} from 'lucide-react';

import { base44 } from '@/api/base44Client';
import ProfilePopover from './sidebar/ProfilePopover';
import NotificationsPopover from './sidebar/NotificationsPopover';
import FlashUsagePopover from './sidebar/FlashUsagePopover';
import { getUserPlan } from '@/lib/plans-config';
import { getUserColor } from '@/lib/user-color';

export const COLLAPSED_W = 0;
export const EXPANDED_W = 260;

export default function WorkspaceSidebar({ expanded, setExpanded, user, userPlan, hasUnread, togglePopover, activePopover, profileRef, notiRef, tensorsRef, pct }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sections, setSections] = useState({
    recent: true,
    favorites: true,
    agents: true,
    private: true,
  });

  const [draggedOverIdx, setDraggedOverIdx] = useState(null);

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const RECENT_PROJECTS = [
    { id: 1, name: "Project TopSecret ❤️", icon: FileText },
    { id: 2, name: "Project TopSecret ❤️", icon: FileText },
    { id: 3, name: "Project TopSecret ⚠️", icon: FileText }
  ];

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[#111111] border-r border-white/5 overflow-hidden font-sans text-gray-300"
        style={{ width: EXPANDED_W }}
      >
        <div className="w-[260px] flex flex-col h-full">
          
          {/* HEADER SIDEBAR: Logo & Actions */}
          <div className="px-4 pt-6 pb-2 flex items-center justify-between flex-shrink-0">
            {/* WOK Logo */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white font-black text-[10px] italic">W</div>
              <span className="text-white font-bold tracking-tight text-sm">WOK</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-white/10 text-gray-400 transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button ref={notiRef} onClick={() => togglePopover('noti')} className="relative p-1 rounded hover:bg-white/10 text-gray-400 transition-colors">
                <Bell className="w-4 h-4" />
                {hasUnread && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full" />}
              </button>
            </div>
          </div>

          {/* LISTS (Notion Style) */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 [&::-webkit-scrollbar]:hidden">
            
            {/* Recent */}
            <div>
              <div 
                className="flex items-center gap-1.5 px-1 mb-2 cursor-pointer group"
                onClick={() => toggleSection('recent')}
              >
                <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${sections.recent ? 'rotate-90' : ''}`} />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">Recent</span>
              </div>
              <AnimatePresence>
                {sections.recent && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden">
                    {RECENT_PROJECTS.map((proj, idx) => (
                      <li 
                        key={proj.id}
                        onDragOver={(e) => { e.preventDefault(); setDraggedOverIdx(idx); }}
                        onDragLeave={() => setDraggedOverIdx(null)}
                        onDrop={() => setDraggedOverIdx(null)}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-grab hover:bg-white/10 transition-colors group relative ${draggedOverIdx === idx ? 'bg-blue-900/30' : ''} text-gray-300`}
                      >
                        <proj.icon className="w-4 h-4 text-gray-500" strokeWidth={2} />
                        <span className="text-[13px] font-medium truncate">{proj.name}</span>
                        {draggedOverIdx === idx && <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-blue-500 rounded-full z-10" />}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Favorites */}
            <div>
              <div 
                className="flex items-center gap-1.5 px-1 mb-2 cursor-pointer group"
                onClick={() => toggleSection('favorites')}
              >
                <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${sections.favorites ? 'rotate-90' : ''}`} />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">Favorites</span>
              </div>
              <AnimatePresence>
                {sections.favorites && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden pl-5">
                    <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-gray-300">
                      <Star className="w-4 h-4 text-gray-500" strokeWidth={2} />
                      <span className="text-[13px] font-medium">Projects</span>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Agents */}
            <div>
              <div 
                className="flex items-center gap-1.5 px-1 mb-2 cursor-pointer group"
                onClick={() => toggleSection('agents')}
              >
                <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${sections.agents ? 'rotate-90' : ''}`} />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">Agents</span>
              </div>
              <AnimatePresence>
                {sections.agents && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden pl-5">
                     <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-gray-300">
                      <Bot className="w-4 h-4 text-gray-500" strokeWidth={2} />
                      <span className="text-[13px] font-medium">Agent Stensor</span>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Private Pages */}
            <div>
              <div 
                className="flex items-center gap-1.5 px-1 mb-2 cursor-pointer group"
                onClick={() => toggleSection('private')}
              >
                <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${sections.private ? 'rotate-90' : ''}`} />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">Private pages</span>
              </div>
              <AnimatePresence>
                {sections.private && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden pl-5">
                    <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-gray-300">
                      <Lock className="w-4 h-4 text-gray-500" strokeWidth={2} />
                      <span className="text-[13px] font-medium">Personal Finance</span>
                    </li>
                     <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-gray-300">
                      <FileText className="w-4 h-4 text-gray-500" strokeWidth={2} />
                      <span className="text-[13px] font-medium">Meeting notes</span>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            
          </div>

          {/* FOOTER SIDEBAR */}
          <div className="p-4 border-t border-white/5 flex-shrink-0">
            <button 
              ref={profileRef} onClick={() => togglePopover('profile')}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors w-full text-left"
            >
              <div className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[13px] font-bold shadow-sm" style={{ backgroundColor: getUserColor(user) }}>
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{user?.full_name || 'User'}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">{userPlan?.name || 'Free Plan'}</p>
              </div>
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </motion.aside>

      <ProfilePopover open={activePopover === 'profile'} onClose={() => togglePopover(null)} anchorRef={profileRef} user={user} userInitial={userInitial} />
      <NotificationsPopover open={activePopover === 'noti'} onClose={() => togglePopover(null)} anchorRef={notiRef} isAdmin={user?.role === 'admin'} user={user} />
      <FlashUsagePopover open={activePopover === 'tensors'} onClose={() => togglePopover(null)} anchorRef={tensorsRef} user={user} />
    </>
  );
}