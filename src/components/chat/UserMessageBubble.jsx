import { useState } from 'react';

const getAvatarColor = (name) => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function UserMessageBubble({ msg, userName }) {
  const [copied, setCopied] = useState(false);
  const handleCopyClick = () => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';
  const bgColor = getAvatarColor(userName);

  return (
    <div className="flex justify-end items-start gap-3 group w-full mb-8 relative z-10 font-open">
      <div className="flex flex-col max-w-[85%] rounded-2xl px-4 pt-3 pb-4 relative" style={{ background: '#F3F4F6', color: '#111827' }}>
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
        <button onClick={handleCopyClick} className="absolute bottom-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all text-gray-400">
          {copied ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
        </button>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: bgColor }}>
        {userInitial}
      </div>
    </div>
  );
}