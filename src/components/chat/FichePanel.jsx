import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Code2, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

// --- THE LIVE RENDER ENGINE (REACT & TAILWIND SANDBOX) ---
export function LivePreviewEngine({ content, appearance }) {
  const [isCompiling, setIsCompiling] = useState(true);
  const [viewMode, setViewMode] = useState('preview');
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '', rawComponent: '' });

  const isDark = appearance?.theme === 'midnight';
  const FG = isDark ? '#F3F4F6' : '#0A0A0A';

  useEffect(() => {
    setIsCompiling(true);

    let html = '';
    let css = '';
    let js = '';
    let rawComponent = '';

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
      
      if (!jsMatch && htmlMatch && (html.includes('export default') || html.includes('import React') || html.includes('function App'))) {
          js = html;
          html = '';
      }

      rawComponent = js || html || css || content;

      // Aggressive Import/Export Stripper for Sandbox Safety
      if (js) {
        js = js.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
        js = js.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1');
        js = js.replace(/export\s+default\s+[A-Za-z0-9_]+;?/g, '');
        js = js.replace(/export\s+(const|let|var|function)/g, '$1');
      }
    }

    setCompiledCode({ html, css, js, rawComponent });

    const timer = setTimeout(() => setIsCompiling(false), 800);
    return () => clearTimeout(timer);
  }, [content]);

  const hasComponent = compiledCode.html || compiledCode.css || compiledCode.js;

  // Global Binding with Safe Iterate: Prevents 'Infinity' read-only crashes
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
          // 1. Global Error Catcher
          window.onerror = function(msg, url, line, col, err) {
            document.getElementById('root').innerHTML = '<div style="color: #991b1b; padding: 24px; font-family: monospace; font-size: 14px; background: #fee2e2; border-bottom: 1px solid #f87171;"><strong>Runtime Crash:</strong><br/>' + msg + '</div>';
            return false;
          };

          // 2. Safe Global Binding Engine
          const { useState, useEffect, useRef, useMemo, useCallback } = React;
          
          const safeBind = (lib) => {
            if (!lib) return;
            for (let key in lib) {
              try { 
                window[key] = lib[key]; 
              } catch (e) {
                // Silently skip read-only globals like 'Infinity'
              }
            }
          };

          safeBind(window.Recharts);
          safeBind(window.Motion);
          safeBind(window.lucide);
          
          // 3. Execute AI Logic
          ${compiledCode.js}
          
          // 4. Force Mount Component
          if (typeof App !== 'undefined') {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
          } else {
            throw new Error("Wok Engine failed: The main React component must be named 'App'.");
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full relative" style={{ color: isDark ? '#E5E7EB' : '#1a1a1a', fontFamily: appearance?.font || 'inherit' }}>
      {hasComponent ? (
        <div className="w-full h-full flex flex-col bg-white">
          
          {/* Claude-Style Artifact Toggle */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50/80 border-b border-[#E5E5E5] shrink-0 z-20 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-1 p-1 bg-gray-200/50 rounded-lg">
              <button 
                onClick={() => setViewMode('preview')} 
                className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${viewMode === 'preview' ? 'bg-white text-[#0080ff] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> App Interface
              </button>
              <button 
                onClick={() => setViewMode('code')} 
                className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold rounded-md transition-colors ${viewMode === 'code' ? 'bg-white text-[#0080ff] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Code2 className="w-3.5 h-3.5" /> Source Code
              </button>
            </div>
            {isCompiling && <Loader2 className="w-4 h-4 text-gray-400 animate-spin mr-2" />}
          </div>

          <div className="flex-1 relative w-full h-full">
            {viewMode === 'preview' ? (
              <>
                <AnimatePresence>
                  {isCompiling && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
                    >
                      <Loader2 className="w-8 h-8 text-[#0080ff] animate-spin mb-3" />
                      <span className="text-[12px] font-bold text-[#0080ff] uppercase tracking-widest">Building Ecosystem...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <iframe
                  title="Wok Live Preview"
                  srcDoc={srcDoc}
                  className="w-full h-full border-none absolute inset-0 z-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </>
            ) : (
              <div className="absolute inset-0 overflow-auto bg-[#0A0A0A] p-6 text-[13px] font-mono text-gray-300">
                <pre><code>{compiledCode.rawComponent}</code></pre>
              </div>
            )}
          </div>
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