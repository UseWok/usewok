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

// Variables de largeur
export const COLLAPSED_W = 0;
export const EXPANDED_W = 260;

export default function WorkspaceSidebar({ expanded, setExpanded, user, userPlan, hasUnread, togglePopover, activePopover, profileRef, notiRef, tensorsRef, pct }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // États de pliage des sections (Notion style)
  const [sections, setSections] = useState({
    recent: true,
    favorites: true,
    agents: true,
    private: true,
  });

  // Simulation Drag & Drop
  const [draggedOverIdx, setDraggedOverIdx] = useState(null);

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  // --- Fausses données pour la structure ---
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
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[#F9F8F6] border-r border-[#E6E6E9] overflow-hidden font-sans"
        style={{ width: EXPANDED_W }}
      >
        <div className="w-[260px] flex flex-col h-full">
          
          {/* HEADER SIDEBAR (Recherche et Notifs) */}
          <div className="px-4 py-4 flex items-center justify-between flex-shrink-0">
            <button className="flex items-center gap-2 text-[#707070] hover:text-[#333333] transition-colors w-full">
              <Search className="w-4 h-4" />
              <span className="text-[14px] font-medium">Search</span>
            </button>
            <button ref={notiRef} onClick={() => togglePopover('noti')} className="relative p-1 rounded hover:bg-black/5 text-[#707070] transition-colors">
              <Bell className="w-4 h-4" />
              {hasUnread && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />}
            </button>
          </div>

          {/* LISTES (Notion Style) */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 [&::-webkit-scrollbar]:hidden">
            
            {/* Recent */}
            <div>
              <div 
                className="flex items-center gap-1.5 px-1 mb-1 cursor-pointer group"
                onClick={() => toggleSection('recent')}
              >
                <ChevronRight className={`w-3.5 h-3.5 text-[#999999] transition-transform ${sections.recent ? 'rotate-90' : ''}`} />
                <span className="text-[12px] font-semibold text-[#707070] group-hover:text-[#333333] transition-colors">Recent</span>
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
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-grab hover:bg-black/5 transition-colors group relative ${draggedOverIdx === idx ? 'bg-blue-50/50' : ''} text-[#333333]`}
                      >
                        <proj.icon className="w-4 h-4 text-[#999999]" strokeWidth={2} />
                        <span className="text-[14px] font-medium truncate">{proj.name}</span>
                        {/* Ligne bleue Drag & Drop */}
                        {draggedOverIdx === idx && <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#2383E2] rounded-full z-10" />}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Favorites */}
            <div>
              <div 
                className="flex items-center gap-1.5 px-1 mb-1 cursor-pointer group"
                onClick={() => toggleSection('favorites')}
              >
                <ChevronRight className={`w-3.5 h-3.5 text-[#999999] transition-transform ${sections.favorites ? 'rotate-90' : ''}`} />
                <span className="text-[12px] font-semibold text-[#707070] group-hover:text-[#333333] transition-colors">Favorites</span>
              </div>
              <AnimatePresence>
                {sections.favorites && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden pl-5">
                    <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-black/5 transition-colors text-[#333333]">
                      <Star className="w-4 h-4 text-[#999999]" strokeWidth={2} />
                      <span className="text-[14px] font-medium">Projects</span>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Agents */}
            <div>
              <div 
                className="flex items-center gap-1.5 px-1 mb-1 cursor-pointer group"
                onClick={() => toggleSection('agents')}
              >
                <ChevronRight className={`w-3.5 h-3.5 text-[#999999] transition-transform ${sections.agents ? 'rotate-90' : ''}`} />
                <span className="text-[12px] font-semibold text-[#707070] group-hover:text-[#333333] transition-colors">Agents</span>
              </div>
              <AnimatePresence>
                {sections.agents && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden pl-5">
                     <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-black/5 transition-colors text-[#333333]">
                      <Bot className="w-4 h-4 text-[#999999]" strokeWidth={2} />
                      <span className="text-[14px] font-medium">Agent Stensor</span>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Private Pages */}
            <div>
              <div 
                className="flex items-center gap-1.5 px-1 mb-1 cursor-pointer group"
                onClick={() => toggleSection('private')}
              >
                <ChevronRight className={`w-3.5 h-3.5 text-[#999999] transition-transform ${sections.private ? 'rotate-90' : ''}`} />
                <span className="text-[12px] font-semibold text-[#707070] group-hover:text-[#333333] transition-colors">Private pages</span>
              </div>
              <AnimatePresence>
                {sections.private && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-0.5 overflow-hidden pl-5">
                    <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-black/5 transition-colors text-[#333333]">
                      <Lock className="w-4 h-4 text-[#999999]" strokeWidth={2} />
                      <span className="text-[14px] font-medium">Personal Finance</span>
                    </li>
                     <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-black/5 transition-colors text-[#333333]">
                      <FileText className="w-4 h-4 text-[#999999]" strokeWidth={2} />
                      <span className="text-[14px] font-medium">Meeting notes</span>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            
          </div>

          {/* FOOTER SIDEBAR (Profil Claude Style) */}
          <div className="p-3 border-t border-[#E6E6E9] flex-shrink-0 flex items-center justify-between">
            <button 
              ref={profileRef} onClick={() => togglePopover('profile')}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-colors w-full text-left"
            >
              <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[13px] font-bold" style={{ backgroundColor: getUserColor(user) }}>
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#333333] truncate">{user?.full_name || 'User'}</p>
                <p className="text-[12px] text-[#707070]">{userPlan?.name || 'Free'}</p>
              </div>
              <Settings className="w-4 h-4 text-[#999999]" />
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