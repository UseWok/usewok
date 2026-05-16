import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export function LivePreviewEngine({ content, appearance }) {
  const [isCompiling, setIsCompiling] = useState(true);
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '', hasCode: false });

  const isDark = appearance?.theme === 'midnight';
  const FG = isDark ? '#F3F4F6' : '#0A0A0A';

  useEffect(() => {
    setIsCompiling(true);

    let html = '';
    let css = '';
    let js = '';

    if (content) {
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
      
      if (!jsMatch && htmlMatch && (html.includes('export default') || html.includes('import React'))) {
          js = html;
          html = '';
      }

      if (js) {
        js = js.replace(/export\s+default\s+(?:function\s+App|App)/g, 'function App');
        js = js.replace(/export\s+default\s+/g, '');
        js = js.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
      }
    }

    const hasCode = !!(html || css || js);
    setCompiledCode({ html, css, js, hasCode });

    const timer = setTimeout(() => setIsCompiling(false), 800);
    return () => clearTimeout(timer);
  }, [content]);

  // FULL BLEED SANDBOX - Zero borders, full height/width
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
          html, body { 
            margin: 0; 
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: ${appearance?.font || 'system-ui, sans-serif'}; 
            color: ${FG};
            background-color: transparent;
            -webkit-font-smoothing: antialiased;
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
          ${compiledCode.css}
        </style>
      </head>
      <body>
        <div id="root" style="width:100%; height:100%;"></div>
        ${compiledCode.html}
        
        <script type="text/babel" data-type="module">
          const { useState, useEffect, useRef, useMemo, useCallback } = React;
          
          try {
            ${compiledCode.js}
            
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
    <div className="w-full h-full relative" style={{ color: isDark ? '#E5E7EB' : '#1a1a1a', fontFamily: appearance?.font || 'inherit' }}>
      {compiledCode.hasCode ? (
        <div className="w-full h-full relative">
          <AnimatePresence>
            {isCompiling && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent backdrop-blur-sm"
              >
                <Loader2 className="w-8 h-8 text-[#0080ff] animate-spin mb-3" />
                <span className="text-[12px] font-bold text-[#0080ff] uppercase tracking-widest">Constructing UI...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <iframe
            title="Wok Live Preview"
            srcDoc={srcDoc}
            className="w-full h-full border-none absolute inset-0 z-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      ) : (
        <div className="prose prose-sm max-w-none p-10 w-full" style={{ fontSize: '15px', lineHeight: '1.75' }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 20px', color: FG, letterSpacing: '-0.02em' }}>{children}</h1>,
              h2: ({ children }) => <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '24px 0 12px', color: FG, letterSpacing: '-0.01em' }}>{children}</h2>,
              h3: ({ children }) => <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '16px 0 8px', color: FG }}>{children}</h3>,
              p: ({ children }) => <p style={{ margin: '0 0 16px', lineHeight: '1.8', color: isDark ? '#D1D5DB' : '#4B5563' }}>{children}</p>,
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
    <div className="flex flex-col h-full w-full overflow-hidden" ref={scrollRef}>
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