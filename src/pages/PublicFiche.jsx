import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { base44 } from '@/api/base44Client';
import { loadConversationFromCloud } from '@/lib/discussions';

const FG = '#0A0A0A';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

function FicheContent({ content }) {
  return (
    <div style={{ fontSize: '15px', lineHeight: '1.85', color: '#1a1a1a' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '28px 0 12px', color: FG, letterSpacing: '-0.02em' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '22px 0 10px', color: FG }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '18px 0 8px', color: FG }}>{children}</h3>,
          p: ({ children }) => <p style={{ margin: '0 0 16px', lineHeight: '1.85' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: '10px 0 16px', paddingLeft: '22px', listStyleType: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: '10px 0 16px', paddingLeft: '22px' }}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: '5px 0', lineHeight: '1.75' }}>{children}</li>,
          strong: ({ children }) => <strong style={{ fontWeight: 700, color: FG }}>{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid #DDFF00', paddingLeft: '16px', margin: '14px 0', color: '#555', fontStyle: 'italic' }}>
              {children}
            </blockquote>
          ),
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.07)', margin: '24px 0' }} />,
          code: ({ inline, children }) => inline
            ? <code style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '4px', padding: '2px 7px', fontSize: '13px', fontFamily: 'monospace' }}>{children}</code>
            : <pre style={{ background: '#f6f6f4', borderRadius: '12px', padding: '16px', overflowX: 'auto', margin: '12px 0' }}><code style={{ fontSize: '13px', fontFamily: 'monospace' }}>{children}</code></pre>,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '16px 0', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead style={{ background: FG }}>{children}</thead>,
          th: ({ children }) => <th style={{ textAlign: 'left', padding: '12px 16px', color: 'white', fontWeight: 700, fontSize: '13px' }}>{children}</th>,
          td: ({ children }) => <td style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function PublicFiche() {
  const { id } = useParams();
  const parts = id?.split('--') || [];
  const conversationId = parts[0];
  const msgIdx = parts.length > 1 ? parseInt(parts[1]) : null;

  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    if (!conversationId) { setLoading(false); return; }
    loadConversationFromCloud(conversationId).then(msgs => {
      if (msgs?.length > 0) setMessages(msgs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [conversationId]);

  const ficheMessages = msgIdx !== null
    ? messages.filter((m, i) => m.role === 'assistant' && i === msgIdx && m.content?.length > 40)
    : messages.filter(m => m.role === 'assistant' && m.content?.length > 40);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter">


      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-14">
        {ficheMessages.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg font-semibold text-zinc-300">Fiche introuvable ou non publiée.</p>
          </div>
        ) : (
          ficheMessages.map((msg, i) => (
            <div key={i} className={i < ficheMessages.length - 1 ? 'mb-14 pb-14' : ''}
              style={i < ficheMessages.length - 1 ? { borderBottom: '1px solid rgba(0,0,0,0.06)' } : {}}>
              <FicheContent content={msg.content} />
            </div>
          ))
        )}
      </main>

      {/* Floating badge */}
      {showBadge && (
        <div
          className="fixed bottom-6 right-6 flex items-center gap-2 px-3 py-2"
          style={{ background: FG, borderRadius: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 100 }}>
          <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain" />
          <a href="/" className="text-xs font-bold text-white whitespace-nowrap">Edit with Stensor</a>
          <span className="text-white text-xs font-bold">→</span>
          <button onClick={() => setShowBadge(false)}
            className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/20">
            <X className="w-2.5 h-2.5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}