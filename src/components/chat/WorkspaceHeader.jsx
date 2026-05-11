import { motion } from 'framer-motion';

// Générateur de couleur dynamique pour l'avatar
const getAvatarColor = (name) => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function WorkspaceHeader({ user, onUpgrade, isSidebarOpen, onToggleSidebar }) {
  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Xihipe6397';
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(userName);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100 font-open z-30 shadow-sm">
      
      {/* LEFT SIDE : Logos, Title & Publish */}
      <div className="flex items-center gap-3">
        {/* Orange Logo */}
        <div className="w-8 h-8 rounded-full bg-[#FF5722] flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
        </div>
        
        <span className="text-gray-200 text-2xl font-light leading-none">/</span>
        
        {/* App Icon + Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-[10px] flex items-center justify-center shadow-md flex-shrink-0">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[14px] font-bold text-gray-900 leading-tight truncate max-w-[180px]">AI-powered personal fin...</span>
            <span className="text-[12px] text-gray-500 leading-none">{userName}'s Workspace Wor...</span>
          </div>
        </div>

        {/* Publish Button */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="ml-2 px-4 py-1.5 bg-[#0F1115] text-white text-[13px] font-semibold rounded-lg shadow-md transition-colors hover:bg-black">
          Publier
        </motion.button>
      </div>

      {/* RIGHT SIDE : Tools & Upgrade */}
      <div className="flex items-center gap-2.5">
        
        {/* History Icon */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
        </motion.button>

        {/* TOGGLE SIDEBAR (|<) */}
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className="p-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-[10px] transition-colors shadow-sm ml-1"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" style={{ transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}>
             <path d="M19 12H5M12 19l-7-7 7-7M21 5v14"/>
          </svg>
        </motion.button>

        {/* Segmented Control */}
        <div className="flex items-center bg-gray-50 p-1 rounded-[10px] border border-gray-200/60 ml-1 shadow-inner">
           <button className="px-3 py-1 text-[13px] font-medium bg-white text-gray-800 rounded-md shadow-sm border border-gray-200/50">Aperçu</button>
           <button className="px-3 py-1 text-[13px] font-medium text-gray-500 hover:text-gray-800 rounded-md transition-colors">Tableau de bord</button>
        </div>

        {/* Profile Avatars */}
        <div className="flex items-center ml-2">
           <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[12px] font-bold z-10 shadow-sm" style={{ backgroundColor: avatarColor }}>
             {userInitial}
           </div>
           <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-gray-500 text-[14px] font-medium -ml-2.5 z-0 hover:bg-gray-100 cursor-pointer shadow-sm">
             +
           </motion.div>
        </div>

        {/* Dots & Github */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-[10px] shadow-sm ml-2 text-gray-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-1.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-[10px] shadow-sm text-gray-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
        </motion.button>

        {/* Upgrade Button Yuzu */}
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onUpgrade} 
          className="flex items-center gap-1.5 px-3.5 py-1.5 ml-1 text-[13px] font-bold rounded-[10px] shadow-sm border" 
          style={{ background: 'linear-gradient(90deg, #DDFF00 0%, #FFFFFF 100%)', borderColor: '#DDFF00', color: '#E85D04' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          Mettre à niveau
        </motion.button>

      </div>
    </div>
  );
}