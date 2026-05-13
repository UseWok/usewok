import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WorkspaceSidebar({ isOpen, onClose }) {
  // Simulation de l'état de drag & drop
  const [draggedOverIdx, setDraggedOverIdx] = useState(null);

  const RECENT_PROJECTS = [
    { id: 1, name: "Project TopSecret ❤️" },
    { id: 2, name: "Project TopSecret ❤️" },
    { id: 3, name: "Project TopSecret ⚠️" }
  ];

  return (
    <motion.div 
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: isOpen ? 260 : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex-shrink-0 h-full bg-[#F9FAFB] border-r border-gray-200 overflow-y-auto flex flex-col font-sans"
    >
      <div className="p-4 flex-1">
        
        {/* Section: Recent */}
        <div className="mb-6">
          <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Recent</h3>
          <ul className="space-y-0.5">
            {RECENT_PROJECTS.map((proj, idx) => (
              <li 
                key={proj.id}
                onDragOver={(e) => { e.preventDefault(); setDraggedOverIdx(idx); }}
                onDragLeave={() => setDraggedOverIdx(null)}
                onDrop={() => setDraggedOverIdx(null)}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-grab hover:bg-gray-100 transition-colors group relative ${draggedOverIdx === idx ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <svg className="text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  <span className="text-[14px] font-medium text-gray-700 truncate">{proj.name}</span>
                </div>
                {/* Ligne bleue de drop (Simulation Notion) */}
                {draggedOverIdx === idx && (
                  <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#2383E2] rounded-full z-10"></div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Section: Favorites */}
        <div className="mb-6">
          <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Favorites
          </h3>
          <ul className="space-y-0.5">
            <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-gray-700">
              <span className="text-[14px] font-medium pl-6">+ Add</span>
            </li>
          </ul>
        </div>

        {/* Section: Agents */}
        <div className="mb-6">
          <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Agents</h3>
          <ul className="space-y-0.5">
            <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-gray-700">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>
              <span className="text-[14px] font-medium">Agent Stensor</span>
            </li>
          </ul>
        </div>

        {/* Section: Private Pages */}
        <div>
          <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Private pages</h3>
          <ul className="space-y-0.5">
            <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-gray-700">
               <svg className="text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              <span className="text-[14px] font-medium">Projects</span>
            </li>
            <li className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-gray-700">
               <svg className="text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span className="text-[14px] font-medium">Meeting notes</span>
            </li>
          </ul>
        </div>

      </div>
    </motion.div>
  );
}