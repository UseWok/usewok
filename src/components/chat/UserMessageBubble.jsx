import { useState } from 'react';
import { FileText, Image, FileCode, Copy, Pencil, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserColor } from '@/lib/user-color';

const FG = '#0A0A0A';
const MAX_INLINE = 3;

function getFileIcon(name = '') {
  const ext = name.split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return Image;
  if (['js','ts','jsx','tsx','py','java','json','html','css'].includes(ext)) return FileCode;
  return FileText;
}

import { useState } from 'react';
export default function UserMessageBubble({ msg, userName, user }) {
  const [copied, setCopied] = useState(false);
  const handleCopyClick = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';
  return (
    <div className="flex justify-end items-start gap-3 group w-full mb-4">
      
      {/* HIGHLY CURVED USER BUBBLE (rounded-[24px]) */}
      <div className="flex flex-col max-w-[85%] rounded-[24px] px-4 pt-3 pb-8 shadow-sm border border-[#DCE4EC] relative" 
        style={{ background: '#F0F4F8', color: '#000000' }}>
        
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {msg.content}
        </p>
        {/* COPY BUTTON INSIDE (Bottom right) */}
        <button 
          onClick={handleCopyClick}
          className="absolute bottom-2 right-2 p-1.5 rounded-lg transition-none opacity-0 group-hover:opacity-100 hover:bg-white text-slate-400"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
        </button>
      </div>
      {/* TOP-ALIGNED AVATAR */}
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-1 bg-slate-800 shadow-sm">
        {userInitial}
      </div>
    </div>
  );
}