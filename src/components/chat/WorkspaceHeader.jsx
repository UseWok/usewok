import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
    // PLUS DE BORDURE NI D'OMBRE. Ultra flat façon Notion.
    <div className="flex items-center justify-between px-5 py-3 bg-white font-open z-30">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <motion.div whileHover={{ scale: 1.05 }} className="w-8 h-8 rounded-full bg-[#FF5722] flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={() => toast('Retour à l\'accueil')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>
        </motion.div>
        
        <span className="text-gray-200 text-2xl font-light leading-none">/</span>
        
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => toast('Paramètres du Workspace')}>
          <div className="w-8 h-8 bg-gray-900 rounded-[8px] flex items-center justify-center flex-shrink-0">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[14px] font-bold text-gray-900 leading-tight truncate max-w-[180px]">AI-powered personal fin...</span>
            <span className="text-[12px] text-gray-500 leading-none">{userName}'s Workspace Wor...</span>
          </div>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => toast.success('Workspace publié avec succès !')} className="ml-2 px-4 py-1.5 bg-[#0F1115] text-white text-[13px] font-semibold rounded-[8px] transition-colors hover:bg-black">
          Publier
        </motion.button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-1.5">
        
        <motion.button whileHover={{ scale: 1.05, backgroundColor: '#F3F4F6' }} whileTap={{ scale: 0.95 }} onClick={() => toast('Historique ouvert')} className="p-1.5 text-gray-500 rounded-md transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
        </motion.button>

        <motion.button whileHover={{ scale: 1.05, backgroundColor: '#F3F4F6' }} whileTap={{ scale: 0.95 }} onClick={onToggleSidebar} className="p-1.5 text-gray-500 rounded-[8px] transition-colors ml-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}>
             <path d="M19 12H5M12 19l-7-7 7-7M21 5v14"/>
          </svg>
        </motion.button>

        <div className="flex items-center bg-gray-100/80 p-1 rounded-[8px] ml-1">
           <button className="px-3 py-1 text-[13px] font-medium bg-white text-gray-800 rounded-[6px] shadow-sm">Aperçu</button>
           <button onClick={() => toast('Ouverture du Dashboard')} className="px-3 py-1 text-[13px] font-medium text-gray-500 hover:text-gray-800 rounded-md transition-colors">Tableau de bord</button>
        </div>

        <div className="flex items-center ml-2 mr-2">
           <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[12px] font-bold z-10" style={{ backgroundColor: avatarColor }}>{userInitial}</div>
           <motion.div whileHover={{ scale: 1.1 }} onClick={() => toast('Inviter un membre')} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 text-[14px] font-medium -ml-2.5 z-0 hover:bg-gray-200 cursor-pointer">
             +
           </motion.div>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onUpgrade} className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-bold rounded-[8px] border" style={{ background: 'linear-gradient(90deg, #DDFF00 0%, #FFFFFF 100%)', borderColor: '#DDFF00', color: '#111827' }}>
          <span className="text-[13px] leading-none text-[#FF5722]">♦</span>
          Mettre à niveau
        </motion.button>

        {/* LES 3 POINTS TOUT EN HAUT À DROITE */}
        <motion.button whileHover={{ scale: 1.05, backgroundColor: '#F3F4F6' }} whileTap={{ scale: 0.95 }} onClick={() => toast('Menu des options du document')} className="p-1.5 ml-2 text-gray-500 rounded-md transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </motion.button>

      </div>
    </div>
  );
}