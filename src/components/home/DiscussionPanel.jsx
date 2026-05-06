import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { getConversationMessages, loadConversationFromCloud } from '@/lib/discussions';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const FG = '#0A0A0A';

export default function DiscussionPanel({ discussion }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!discussion) { setMessages([]); return; }
    setLoading(true);
    const local = getConversationMessages(discussion.id);
    if (local?.length > 0) { setMessages(local); setLoading(false); }
    loadConversationFromCloud(discussion.id).then(cloudMsgs => {
      if (cloudMsgs?.length > 0) setMessages(cloudMsgs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [discussion?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [discussion?.id]);

  if (!discussion) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-5" style={{ opacity: 0.18 }}>
        <img src={LOGO_URL} alt="Stensor" className="w-14 h-14 object-contain" />
        <p className="text-sm font-semibold tracking-tight" style={{ color: FG }}>Select a discussion</p>
      </div>
    );
  }

  const visibleMsgs = messages.filter(m => m.role === 'user' || m.role === 'assistant');

  return (
    <motion.div
      key={discussion.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full w-full"
    >
      {/* Header */}
      <div className="px-7 py-5 flex items-start justify-between gap-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="min-w-0">
          <p className="text-base font-black leading-tight truncate" style={{ color: FG }}>{discussion.title}</p>
          <p className="text-[11px] mt-1 font-medium" style={{ color: 'rgba(0,0,0,0.3)' }}>{discussion.date}</p>
        </div>
        <button
          onClick={() => {
            const params = new URLSearchParams({ conversationId: discussion.id });
            if (discussion.agent) params.set('agent', discussion.agent);
            navigate(`/chat?${params.toString()}`);
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-lg flex-shrink-0 transition-opacity hover:opacity-80"
          style={{ background: FG, color: 'white' }}>
          <ExternalLink className="w-3 h-3" /> Open
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        )}

        {!loading && visibleMsgs.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 opacity-20">
            <MessageSquare className="w-8 h-8" style={{ color: FG }} />
            <p className="text-sm font-medium" style={{ color: FG }}>No messages yet</p>
          </div>
        )}

        {!loading && visibleMsgs.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <img src={LOGO_URL} alt="Stensor" className="w-5 h-5 object-contain flex-shrink-0 mt-1 opacity-60" />
            )}
            <div
              className="max-w-[82%] px-4 py-3 text-sm"
              style={{
                background: msg.role === 'user' ? FG : 'rgba(0,0,0,0.04)',
                color: msg.role === 'user' ? 'white' : '#1a1a1a',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                lineHeight: 1.65,
              }}
            >
              {msg.role === 'assistant' ? (
                <div style={{ fontSize: '13px', lineHeight: '1.7' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                    p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                    ul: ({ children }) => <ul style={{ margin: '6px 0 6px 14px', listStyleType: 'disc' }}>{children}</ul>,
                    li: ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
                  }}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}