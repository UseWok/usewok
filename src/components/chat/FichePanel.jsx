import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Palette } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Oswald', 'Raleway', 'PT Sans', 'Nunito', 'Merriweather', 'Playfair Display', 'Rubik', 'Work Sans', 'Quicksand', 'Fira Sans', 'Barlow', 'Inconsolata', 'IBM Plex Sans', 'System UI'];

const THEMES = [
  { id: 'classic', color: '#FFFFFF', name: 'Classic' },
  { id: 'aurora', color: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', name: 'Aurora' },
  { id: 'sand', color: '#FDFBF7', name: 'Sand' },
  { id: 'rose', color: 'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)', name: 'Rose' },
  { id: 'midnight', color: '#0B0F19', name: 'Midnight' },
  { id: 'grid', color: '#FAFAFA', name: 'Grid' }
];

const EDGES = [
  { id: 'square', radius: '0px' },
  { id: 'soft', radius: '8px' },
  { id: 'round', radius: '24px' },
  { id: 'glass', radius: '32px' } 
];

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

export default function FichePanel({ content = null, appearance, setAppearance, onAskAI }) {
  const scrollRef = useRef(null);
  const [showAmbiance, setShowAmbiance] = useState(false);
  const appRef = useRef(null);

  useEffect(() => {
    if (content && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [content]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (appRef.current && !appRef.current.contains(e.target)) setShowAmbiance(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = appearance?.theme === 'midnight';

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* AMBIANCE ENGINE HEADER - Fixed at top center of preview */}
      {content && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40" ref={appRef}>
          <button 
            onClick={() => setShowAmbiance(!showAmbiance)} 
            className={`px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-2 shadow-md transition-colors border ${isDark ? 'bg-[#1F2937] border-white/10 text-white hover:bg-[#374151]' : 'bg-white border-[#E5E5E5] text-[#333333] hover:bg-gray-50'}`}
          >
            <Palette className="w-3.5 h-3.5" /> Ambiance
          </button>

          {showAmbiance && (
            <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[340px] bg-white border border-[#E5E5E5] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 p-1 text-left font-sans">
              
              <div className="p-3 pb-1">
                <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Themes</p>
                <div className="flex gap-2 mb-4">
                  {THEMES.map(t => (
                    <button 
                      key={t.id} onClick={() => setAppearance({...appearance, theme: t.id})}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${appearance.theme === t.id ? 'border-[#0080ff] scale-110' : 'border-gray-200 hover:scale-105 shadow-sm'}`}
                      style={{ background: t.color }} title={t.name}
                    />
                  ))}
                </div>

                <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Typography</p>
                <div className="grid grid-cols-4 gap-1.5 mb-4 max-h-[140px] overflow-y-auto pr-1">
                  {FONTS.map(f => (
                    <button 
                      key={f} onClick={() => setAppearance({...appearance, font: f})}
                      className={`flex flex-col items-center justify-center p-2 rounded-md border transition-colors ${appearance.font === f ? 'border-[#0080ff] bg-[#F4F8FE]' : 'border-[#E5E5E5] hover:border-gray-300 bg-white'}`}
                    >
                      <span style={{fontFamily: f}} className="text-[16px] text-gray-800 leading-none mb-1">Aa</span>
                      <span className="text-[8px] text-gray-500 truncate w-full text-center">{f}</span>
                    </button>
                  ))}
                </div>

                <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Edge Style</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {EDGES.map(e => (
                    <button 
                      key={e.id}
                      onClick={() => setAppearance({...appearance, edges: e.id})}
                      className={`relative w-full aspect-square border-2 transition-all flex items-start justify-end p-1 ${appearance.edges === e.id ? 'border-[#0080ff] bg-[#F4F8FE]' : 'border-[#E5E5E5] hover:border-gray-300 bg-white'}`}
                    >
                      {/* Visualizer showing the top-right corner only */}
                      <div 
                        className="w-1/2 h-1/2 border-t-2 border-r-2 border-gray-400"
                        style={{ borderTopRightRadius: e.radius, background: e.id === 'glass' ? 'linear-gradient(to bottom left, rgba(0,128,255,0.2), transparent)' : 'transparent' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2 border-t border-[#E5E5E5] bg-[#F9F9F9] rounded-b-lg">
                <button onClick={() => { onAskAI(); setShowAmbiance(false); }} className="w-full py-2 bg-[#0080ff] text-white text-[12px] font-bold rounded-md hover:bg-[#0066cc] transition-colors shadow-sm">
                  Ask AI to customize
                </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* SCROLLING CONTENT */}
      <div className="flex-1 w-full p-6 md:p-12 overflow-y-auto" ref={scrollRef}>
        {content ? (
          <FicheContent content={content} appearance={appearance} />
        ) : (
          <div className="opacity-40 flex flex-col items-center justify-center h-full">
            <img src={LOGO_URL} alt="Wok" className="w-10 h-10 object-contain mb-4 grayscale" />
            <p className="text-[14px] font-bold text-[#333333]" style={{ color: isDark ? '#9CA3AF' : undefined }}>Awaiting synthesis execution...</p>
          </div>
        )}
      </div>
    </div>
  );
}