import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

function FicheContent({ content, appearance }) {
  const isDark = appearance?.theme === 'midnight';
  const FG = isDark ? '#F3F4F6' : '#0A0A0A';
  const MUTED = isDark ? '#9CA3AF' : '#555555';
  const CODE_BG = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const PRE_BG = isDark ? 'rgba(255,255,255,0.05)' : '#F9F8F6';
  const BORDER = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="prose prose-sm max-w-none" style={{ fontSize: '15px', lineHeight: '1.75', color: isDark ? '#E5E7EB' : '#1a1a1a', fontFamily: appearance?.font || 'inherit' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '20px 0 10px', color: FG, letterSpacing: '-0.02em' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '18px 0 8px', color: FG, letterSpacing: '-0.01em' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '14px 0 6px', color: FG }}>{children}</h3>,
          p: ({ children }) => <p style={{ margin: '0 0 14px', lineHeight: '1.8' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: '8px 0 14px', paddingLeft: '20px', listStyleType: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: '8px 0 14px', paddingLeft: '20px' }}>{children}</ol>,
          li: ({ children }) => <li style={{ margin: '4px 0', lineHeight: '1.7' }}>{children}</li>,
          strong: ({ children }) => <strong style={{ fontWeight: 700, color: FG }}>{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid #0080ff', paddingLeft: '14px', margin: '12px 0', color: MUTED, fontStyle: 'italic' }}>
              {children}
            </blockquote>
          ),
          code: ({ inline, children }) => inline
            ? <code style={{ background: CODE_BG, borderRadius: '4px', padding: '1px 6px', fontSize: '12px', fontFamily: 'monospace', color: FG }}>{children}</code>
            : <pre style={{ background: PRE_BG, borderRadius: '6px', padding: '14px', overflowX: 'auto', margin: '10px 0', border: `1px solid ${BORDER}` }}><code style={{ fontSize: '12px', fontFamily: 'monospace', color: FG }}>{children}</code></pre>,
          hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${BORDER}`, margin: '20px 0' }} />,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '14px 0', borderRadius: '4px', border: `1px solid ${BORDER}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead style={{ background: isDark ? '#1F2937' : FG }}>{children}</thead>,
          th: ({ children }) => <th style={{ textAlign: 'left', padding: '10px 14px', color: 'white', fontWeight: 700, fontSize: '12px' }}>{children}</th>,
          td: ({ children }) => <td style={{ padding: '9px 14px', borderBottom: `1px solid ${BORDER}` }}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function FichePanel({ content = null, appearance }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (content && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [content]);

  return (
    <div className="flex flex-col h-full w-full p-6 md:p-10 overflow-y-auto" ref={scrollRef}>
      {content ? (
        <FicheContent content={content} appearance={appearance} />
      ) : (
        <div className="opacity-40 flex flex-col items-center justify-center h-full">
          <img src={LOGO_URL} alt="Wok" className="w-8 h-8 object-contain mb-4 grayscale" />
          <p className="text-[13px] font-medium text-gray-500">Awaiting synthesis execution...</p>
        </div>
      )}
    </div>
  );
}