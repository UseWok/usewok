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
    // Added mb-8 for larger spacing between messages
    <div className="flex justify-end items-start gap-3 group w-full mb-8 relative z-10">
      
      <div className="flex flex-col max-w-[85%] rounded-[24px] px-4 pt-3 pb-8 relative border-none shadow-sm" 
        style={{ background: '#F0F4F8', color: '#000000' }}>
        
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
          {msg.content}
        </p>

        {/* COPY BUTTON INSIDE (Bottom right) */}
        <button 
          onClick={handleCopyClick}
          className="absolute bottom-2 right-2 p-1.5 rounded-lg transition-none opacity-0 group-hover:opacity-100 hover:bg-black/5 text-slate-400"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
        </button>
      </div>

      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 mt-0.5"
           style={{ background: '#8DA4C8' }}>
        {userInitial}
      </div>

    </div>
  );
}