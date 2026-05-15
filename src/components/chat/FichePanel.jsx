import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2 } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

// Upgraded component prepared for Live UI rendering
function LivePreviewEngine({ content, appearance }) {
  const isDark = appearance?.theme === 'midnight';
  const FG = isDark ? '#F3F4F6' : '#0A0A0A';
  const MUTED = isDark ? '#9CA3AF' : '#555555';
  const BORDER = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  // Logic to detect if the AI returned a code block meant to be rendered as an interface.
  // This is the foundation for step 3. If it's a generic response, it falls back to markdown.
  const isComponentCode = content?.includes('```jsx') || content?.includes('```html');

  return (
    <div className="w-full h-full flex flex-col" style={{ color: isDark ? '#E5E7EB' : '#1a1a1a', fontFamily: appearance?.font || 'inherit' }}>
      
      {isComponentCode ? (
        <div className="flex-1 flex flex-col w-full h-full border rounded-md overflow-hidden bg-white" style={{ borderColor: BORDER }}>
           {/* Future iframe/sandpack injection point for Live Component Rendering */}
           <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between" style={{ borderColor: BORDER }}>
              <span className="text-[12px] font-mono text-gray-500">Live Component Preview</span>
              <div className="flex items-center gap-2">
                 <Loader2 className="w-3.5 h-3.5 text-[#0080ff] animate-spin" />
                 <span className="text-[11px] text-[#0080ff] font-bold">Compiling...</span>
              </div>
           </div>
           <div className="flex-1 p-8 flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZTVlNWU1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')]">
             <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                {/* Fallback to markdown rendering the code block until compiler is attached */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
             </div>
           </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none" style={{ fontSize: '15px', lineHeight: '1.75' }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '20px 0 10px', color: FG, letterSpacing: '-0.02em' }}>{children}</h1>,
              h2: ({ children }) => <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '18px 0 8px', color: FG, letterSpacing: '-0.01em' }}>{children}</h2>,
              h3: ({ children }) => <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '14px 0 6px', color: FG }}>{children}</h3>,
              p: ({ children }) => <p style={{ margin: '0 0 14px', lineHeight: '1.8' }}>{children}</p>,
              code: ({ inline, children }) => inline
                ? <code style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', borderRadius: '4px', padding: '1px 6px', fontSize: '12px', fontFamily: 'monospace', color: FG }}>{children}</code>
                : <pre style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F9F8F6', borderRadius: '6px', padding: '14px', overflowX: 'auto', margin: '10px 0', border: `1px solid ${BORDER}` }}><code style={{ fontSize: '12px', fontFamily: 'monospace', color: FG }}>{children}</code></pre>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function FichePanel({ content = null, appearance }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (content && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [content]);

  return (
    <div className="flex flex-col h-full w-full p-6 md:p-10 overflow-y-auto" ref={scrollRef}>
      {content ? (
        <LivePreviewEngine content={content} appearance={appearance} />
      ) : (
        <div className="opacity-40 flex flex-col items-center justify-center h-full">
          <img src={LOGO_URL} alt="Wok" className="w-8 h-8 object-contain mb-4 grayscale" />
          <p className="text-[13px] font-medium text-gray-500" style={{ color: appearance?.theme === 'midnight' ? '#9CA3AF' : undefined }}>Awaiting synthesis execution...</p>
        </div>
      )}
    </div>
  );
}