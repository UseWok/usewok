import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export function LivePreviewEngine({ content, appearance }) {
  const [isCompiling, setIsCompiling] = useState(true);
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '' });

  const isDark = appearance?.theme === 'midnight';
  const FG = isDark ? '#F3F4F6' : '#0A0A0A';
  const BORDER = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  useEffect(() => {
    setIsCompiling(true);

    let html = '';
    let css = '';
    let js = '';

    if (content) {
      // BULLETPROOF REGEX: Generates three backticks mathematically to prevent copy-paste corruption
      const bt = String.fromCharCode(96, 96, 96);
      
      const htmlRegex = new RegExp(bt + '(?:html|xml)\\n([\\s\\S]*?)' + bt, 'i');
      const cssRegex = new RegExp(bt + 'css\\n([\\s\\S]*?)' + bt, 'i');
      const jsRegex = new RegExp(bt + '(?:javascript|js|jsx|react)\\n([\\s\\S]*?)' + bt, 'i');

      const htmlMatch = content.match(htmlRegex);
      const cssMatch = content.match(cssRegex);
      const jsMatch = content.match(jsRegex);

      if (htmlMatch) html = htmlMatch[1];
      if (cssMatch) css = cssMatch[1];
      if (jsMatch) js = jsMatch[1];
      
      // If the AI only provided JSX, we treat it as JS for the compiler
      if (!jsMatch && htmlMatch && content.toLowerCase().includes('export default function')) {
          js = htmlMatch[1];
          html = '';
      }
    }

    setCompiledCode({ html, css, js });

    const timer = setTimeout(() => setIsCompiling(false), 800);
    return () => clearTimeout(timer);
  }, [content]);

  const hasComponent = compiledCode.html || compiledCode.css || compiledCode.js;

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
        <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        
        <style>
          body { 
            margin: 0; 
            padding: 24px; 
            font-family: ${appearance?.font || 'system-ui, sans-serif'}; 
            color: ${FG};
            background-color: transparent;
            -webkit-font-smoothing: antialiased;
          }
          ${compiledCode.css}
        </style>
      </head>
      <body>
        <div id="root"></div>
        ${compiledCode.html}
        
        <script type="text/babel" data-type="module">
          const { useState, useEffect, useRef, useMemo, useCallback } = React;
          
          try {
            ${compiledCode.js}
            
            // Render the component if the AI defined an 'App' function
            if (typeof App !== 'undefined') {
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<App />);
            }
          } catch(err) {
            console.error("Wok Runtime Error:", err);
            document.getElementById('root').innerHTML = '<div style="color: #991b1b; padding: 20px; font-family: monospace; font-size: 13px; background: #fee2e2; border-radius: 8px; border: 1px solid #f87171;"><strong>Compilation Error:</strong><br/>' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full flex flex-col" style={{ color: isDark ? '#E5E7EB' : '#1a1a1a', fontFamily: appearance?.font || 'inherit' }}>
      {hasComponent ? (
        <div className="flex-1 flex flex-col w-full h-full border rounded-xl overflow-hidden bg-white shadow-sm" style={{ borderColor: BORDER }}>
           <div className="bg-gray-50 border-b px-4 py-2.5 flex items-center justify-between" style={{ borderColor: BORDER }}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Live Execution Engine</span>
              <div className="flex items-center gap-2">
                 {isCompiling ? (
                   <>
                     <Loader2 className="w-3.5 h-3.5 text-[#0080ff] animate-spin" />
                     <span className="text-[11px] text-[#0080ff] font-bold">Compiling...</span>
                   </>
                 ) : (
                   <>
                     <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                     <span className="text-[11px] text-green-600 font-bold">Live</span>
                   </>
                 )}
              </div>
           </div>

           <div className="flex-1 relative bg-[#F9F9F9]">
             <AnimatePresence>
               {isCompiling && (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm"
                 >
                   <Loader2 className="w-8 h-8 text-[#0080ff] animate-spin" />
                 </motion.div>
               )}
             </AnimatePresence>
             
             <iframe
               title="Wok Live Preview"
               srcDoc={srcDoc}
               className="w-full h-full border-none absolute inset-0 z-0"
               sandbox="allow-scripts allow-same-origin"
             />
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
    <div className="flex flex-col h-full w-full p-4 md:p-8 overflow-y-auto" ref={scrollRef}>
      {content ? (
        <LivePreviewEngine content={content} appearance={appearance} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="relative w-24 h-24 mb-6"
          >
            <div className="absolute inset-0 border-[1px] border-gray-300 rounded-full" />
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-2 border-[1px] border-gray-400 rounded-full border-dashed"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#0080ff] rounded-full shadow-[0_0_10px_#0080ff]" />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}