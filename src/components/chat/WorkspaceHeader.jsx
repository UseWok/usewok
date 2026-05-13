import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function PublishPopover({ conversationId, isPublishing, setIsPublishing }) {
  const [isPublic, setIsPublic] = useState(false);
  const appLink = `stensor.base44.app/p/${conversationId || 'xyz123'}`;
  const fullUrl = `https://${appLink}`;

  const togglePublish = async () => {
    setIsPublishing(true);
    const newState = !isPublic;
    if (conversationId) {
      try {
        const convs = await base44.entities.Conversation.filter({ conv_id: conversationId });
        if (convs.length > 0) {
          await base44.entities.Conversation.update(convs[0].id, { is_public: newState });
        }
      } catch {}
    }
    setIsPublic(newState);
    setIsPublishing(false);
    if (newState) toast.success("Live on the web");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute top-full mt-2 right-0 bg-white z-50 w-[300px] rounded-[12px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-[#E6E6E9] overflow-hidden font-sans"
    >
      <div className="p-4 border-b border-[#E6E6E9] bg-white">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-[14px] font-semibold text-[#333333]">Share to web</h4>
          <button 
            onClick={togglePublish} disabled={isPublishing}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isPublic ? 'bg-[#2383E2]' : 'bg-[#E6E6E9]'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
        </div>
        <p className="text-[12px] text-[#707070]">Publish this workspace online to share it with anyone.</p>
      </div>

      <AnimatePresence>
        {isPublic && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 bg-[#F9F8F6]">
              <div className="flex gap-2">
                <div className="flex-1 bg-white border border-[#E6E6E9] rounded-md px-3 py-1.5 flex items-center overflow-hidden">
                  <span className="text-[12px] text-[#707070] truncate">{appLink}</span>
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(fullUrl); toast.success("Link copied!"); }}
                  className="bg-[#2383E2] text-white px-3 py-1.5 rounded-md text-[12px] font-bold hover:bg-[#1e70c1] transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WorkspaceHeader({ title, conversationId, onToggleSidebar, isSidebarOpen }) {
  const [showPublish, setShowPublish] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const publishRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (publishRef.current && !publishRef.current.contains(e.target) && !isPublishing) setShowPublish(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, [isPublishing]);

  return (
    <header className="flex items-center justify-between px-4 h-[56px] flex-shrink-0 bg-white border-b border-[#E6E6E9] z-30 font-sans">
      
      {/* LEFT: Toggle Sidebar + Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        
        {/* Toggle Sidebar Button (Claude style) */}
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 text-[#999999] hover:text-[#333333] hover:bg-[#F9F8F6] rounded-md transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 hover:bg-[#F9F8F6] px-2 py-1 rounded-md cursor-pointer transition-colors max-w-[400px]">
          <span className="text-[14px] font-semibold truncate text-[#333333]">
            {title || 'Untitled workspace'}
          </span>
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-3 flex-shrink-0">
        
        {/* Notion Style Share Button */}
        <div ref={publishRef} className="relative flex-shrink-0">
          <button
            onClick={() => setShowPublish(!showPublish)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-all text-[#707070] hover:text-[#333333] hover:bg-[#F9F8F6]"
          >
            Share
          </button>
          <AnimatePresence>
            {showPublish && <PublishPopover conversationId={conversationId} isPublishing={isPublishing} setIsPublishing={setIsPublishing} />}
          </AnimatePresence>
        </div>
        
        {/* Options */}
        <button className="p-1.5 text-[#999999] hover:text-[#333333] hover:bg-[#F9F8F6] rounded-md transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>
    </header>
  );
}