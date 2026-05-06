import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, BarChart2, Edit3, BookOpen, Layers } from 'lucide-react';

const FG = '#0A0A0A';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const SIDE_ICONS = [
  { icon: Search, label: 'Recherche' },
  { icon: BarChart2, label: 'Graphiques' },
  { icon: Edit3, label: 'Éditer' },
  { icon: BookOpen, label: 'Lire' },
  { icon: Layers, label: 'Sections' },
];

function FicheContent({ content }) {
  return (
    <div className="prose prose-sm max-w-none" style={{ fontSize: '16px', lineHeight: '1.85', color: '#1a1a1a' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '24px 0 10px', color: FG, letterSpacing: '-0.02em' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '20px 0 8px', color: FG, letterSpacing: '-0.01em' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '16px 0 6px', color: FG }}>{children}</h3>,
          p: ({ children }) => <p style={{ margin: '0 0 16px', lineHeight: '1.9', fontSize: '16px' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: '8px 0 14px', paddingLeft: '20px', listStyleType: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: '8px 0 14px', paddingLeft: '20px' }}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: '4px 0', lineHeight: '1.7' }}>{children}</li>,
          strong: ({ children }) => <strong style={{ fontWeight: 700, color: FG }}>{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid #DDFF00', paddingLeft: '14px', margin: '12px 0', color: '#555', fontStyle: 'italic' }}>
              {children}
            </blockquote>
          ),
          code: ({ inline, children }) => inline
            ? <code style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '4px', padding: '1px 6px', fontSize: '12px', fontFamily: 'monospace' }}>{children}</code>
            : <pre style={{ background: '#f6f6f4', borderRadius: '10px', padding: '14px', overflowX: 'auto', margin: '10px 0' }}><code style={{ fontSize: '12px', fontFamily: 'monospace' }}>{children}</code></pre>,
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.07)', margin: '20px 0' }} />,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '14px 0', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead style={{ background: FG }}>{children}</thead>,
          th: ({ children }) => <th style={{ textAlign: 'left', padding: '10px 14px', color: 'white', fontWeight: 700, fontSize: '12px' }}>{children}</th>,
          td: ({ children }) => <td style={{ padding: '9px 14px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function FichePanel({ messages = [] }) {
  const scrollRef = useRef(null);

  // Extract last substantive assistant message as the fiche
  const ficheMessages = messages.filter(m => m.role === 'assistant' && m.content?.length > 40);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left icon rail */}
      <div className="w-10 flex-shrink-0 flex flex-col items-center gap-1 py-4"
        style={{ borderRight: '1px solid rgba(0,0,0,0.05)' }}>
        {SIDE_ICONS.map(({ icon: Icon, label }) => (
          <button key={label} title={label}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-black/6"
            style={{ color: '#bbb' }}>
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Main fiche content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-10">
        <AnimatePresence mode="wait">
          {ficheMessages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4"
              style={{ opacity: 0.15 }}
            >
              <img src={LOGO_URL} alt="Stensor" className="w-12 h-12 object-contain" />
              <p className="text-sm font-semibold" style={{ color: FG }}>
                La fiche apparaîtra ici
              </p>
              <p className="text-xs text-center max-w-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>
                Posez une question dans le chat pour générer votre analyse financière.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {ficheMessages.map((msg, i) => (
                <div key={i} className={i < ficheMessages.length - 1 ? 'mb-10 pb-10' : ''}
                  style={i < ficheMessages.length - 1 ? { borderBottom: '1px solid rgba(0,0,0,0.06)' } : {}}>
                  <FicheContent content={msg.content} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}