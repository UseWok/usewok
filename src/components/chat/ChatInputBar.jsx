import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Mic, X, FileText,
  Wifi, WifiOff, Send, Brain, MessageCircle } from
'lucide-react';
import AISettingsModal from '@/components/settings/AISettingsModal';
import DragDropOverlay from '@/components/DragDropOverlay';
import FilePreviewPanel from '@/components/chat/FilePreviewPanel';
import { FG, YUZU } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';

const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;
const MAX_VISIBLE_FILES = 1;

const popUp = {
  initial: { opacity: 0, y: 6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
  transition: { duration: 0.1 }
};

export default function ChatInputBar({ input, setInput, onSend, isLoading, blocked, mode, setMode, currentAgent, setCurrentAgent, userPlan, useWebSearch, setUseWebSearch, files, setFiles, onUpgradeRequest, discussMode, setDiscussMode }) {
  
  const handleSendMessage = () => {
    if (!input.trim() || isLoading || blocked) return;
    onSend(input);
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-[24px]">
      
      {/* TEXTAREA ZONE */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-50">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          placeholder="Message..."
          className="w-full bg-transparent text-sm text-gray-700 focus:outline-none resize-none leading-relaxed"
          rows={2}
          style={{ minHeight: '38px', maxHeight: '120px' }}
        />
      </div>

      {/* BUTTONS ZONE */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1.5 relative">
        
        {/* LEFT GROUP */}
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
          <button className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-100 text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
            Edit
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-gray-500 hover:bg-gray-50 border border-transparent">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Discuss
          </button>
        </div>

        {/* RIGHT GROUP */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
          </button>
          <button onClick={handleSendMessage} disabled={!input.trim()} className="flex items-center justify-center w-8 h-8 bg-[#8C98A4] hover:bg-[#7A8590] disabled:opacity-50 text-white rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
}