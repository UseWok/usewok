import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function PublishPopover({ conversationId, isPublishing, setIsPublishing, onClose }) {
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
      className="absolute top-full mt-2 right-0 bg-white z-50 w-[320px] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden font-open"
    >
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-[14px] font-semibold text-gray-900">Share to web</h4>
          <button 
            onClick={togglePublish} disabled={isPublishing}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isPublic ? 'bg-[#0A0A0A]' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
        </div>
        <p className="text-[12px] text-gray-500">Publish this workspace online to share it with anyone.</p>
      </div>

      <AnimatePresence>
        {isPublic && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 flex items-center overflow-hidden">
                  <span className="text-[12px] text-gray-600 truncate">{appLink}</span>
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(fullUrl); toast.success("Link copied!"); }}
                  className="bg-gray-900 text-white px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-black transition-colors"
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

export default function WorkspaceHeader({ title, conversationId }) {
  const [showPublish, setShowPublish] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const publishRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (publishRef.current && !publishRef.current.contains(e.target) && !isPublishing) setShowPublish(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, [isPublishing]);

  return (
    <header className="flex items-center justify-between px-5 h-[52px] flex-shrink-0 bg-white border-b border-gray-200 z-30">
      
      {/* MAC DOTS + TITLE */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Apple 3 Dots */}
        <div className="flex gap-2 items-center group cursor-default pl-1">
           <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] transition-transform group-hover:scale-105"></div>
           <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] transition-transform group-hover:scale-105 delay-75"></div>
           <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] transition-transform group-hover:scale-105 delay-150"></div>
        </div>
        
        {/* Notion-style Title */}
        <div className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-md cursor-pointer transition-colors -ml-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <p className="text-[13px] font-medium truncate max-w-[360px] text-gray-700">
            {title || 'Untitled workspace'}
          </p>
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* Notion Style Share Button */}
        <div ref={publishRef} className="relative flex-shrink-0">
          <button
            onClick={() => setShowPublish(!showPublish)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-all text-gray-700 hover:bg-gray-100"
          >
            Share
          </button>
          <AnimatePresence>
            {showPublish && <PublishPopover conversationId={conversationId} isPublishing={isPublishing} setIsPublishing={setIsPublishing} onClose={() => setShowPublish(false)} />}
          </AnimatePresence>
        </div>
        
        {/* Top Right Options (Where Upgrade lives now conceptually) */}
        <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ml-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>
    </header>
  );
}