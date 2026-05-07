import { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const FG = '#0A0A0A';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

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
            : <pre style={{ background: '#f6f6f4', borderRadius: '6px', padding: '14px', overflowX: 'auto', margin: '10px 0' }}><code style={{ fontSize: '12px', fontFamily: 'monospace' }}>{children}</code></pre>,
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.07)', margin: '20px 0' }} />,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '14px 0', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.08)' }}>
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

function LoadingSkeleton() {
  return (
    <div className="space-y-4 px-10 py-10">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 rounded-sm animate-pulse" style={{ background: 'rgba(0,0,0,0.07)', width: `${60 + i * 10}%` }} />
          <div className="h-4 rounded-sm animate-pulse" style={{ background: 'rgba(0,0,0,0.05)', width: `${80 + i * 5}%` }} />
          <div className="h-4 rounded-sm animate-pulse" style={{ background: 'rgba(0,0,0,0.04)', width: '70%' }} />
        </div>
      ))}
      <div className="h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 rounded-sm animate-pulse" style={{ background: 'rgba(0,0,0,0.07)', width: `${50 + i * 15}%` }} />
          <div className="h-4 rounded-sm animate-pulse" style={{ background: 'rgba(0,0,0,0.05)', width: `${75 + i * 5}%` }} />
        </div>
      ))}
    </div>
  );
}

export default function FichePanel({ content = null, loading = false }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (content && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [content]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}>
              <LoadingSkeleton />
            </motion.div>
          ) : content ? (
            <motion.div key={content.slice(0, 40)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="px-10 py-10"
            >
              <FicheContent content={content} />
            </motion.div>
          ) : (
            <motion.div key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-10 py-10"
            >
              {/* Builder-style empty template */}
              <div className="flex items-center gap-3 mb-8">
                <img src={LOGO_URL} alt="Stensor" className="w-5 h-5 object-contain opacity-30" />
                <div className="h-3 rounded-sm animate-none" style={{ width: '140px', background: 'rgba(0,0,0,0.07)' }} />
              </div>
              <div className="h-8 rounded-sm mb-3" style={{ width: '65%', background: 'rgba(0,0,0,0.07)' }} />
              <div className="h-8 rounded-sm mb-8" style={{ width: '45%', background: 'rgba(0,0,0,0.05)' }} />
              <div className="space-y-2 mb-8">
                <div className="h-3.5 rounded-sm" style={{ width: '100%', background: 'rgba(0,0,0,0.05)' }} />
                <div className="h-3.5 rounded-sm" style={{ width: '92%', background: 'rgba(0,0,0,0.05)' }} />
                <div className="h-3.5 rounded-sm" style={{ width: '78%', background: 'rgba(0,0,0,0.04)' }} />
              </div>
              <div className="h-px mb-8" style={{ background: 'rgba(0,0,0,0.06)' }} />
              <div className="h-4 rounded-sm mb-4" style={{ width: '30%', background: 'rgba(0,0,0,0.07)' }} />
              <div className="space-y-2 mb-8">
                {[100, 88, 94, 72].map((w, i) => (
                  <div key={i} className="h-3.5 rounded-sm" style={{ width: `${w}%`, background: 'rgba(0,0,0,0.04)' }} />
                ))}
              </div>
              <div className="flex gap-3">
                <div className="h-8 rounded-sm" style={{ width: '100px', background: 'rgba(0,0,0,0.07)' }} />
                <div className="h-8 rounded-sm" style={{ width: '80px', background: 'rgba(0,0,0,0.05)' }} />
              </div>
              <p className="text-xs mt-10 text-center" style={{ color: 'rgba(0,0,0,0.18)' }}>Lance une analyse pour afficher le résultat ici</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}