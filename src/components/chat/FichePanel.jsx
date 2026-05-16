import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Code2, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export default function FichePanel({ content = null, appearance }) {
  return <LivePreviewEngine content={content} appearance={appearance} />;
}

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

      if (js) {
        js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/g, 'const { $1 } = window.lucideReact;');
        js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]recharts['"];?/g, 'const { $1 } = window.Recharts;');
        js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]framer-motion['"];?/g, 'const { $1 } = window.Motion;');
        js = js.replace(/import\s+React.*?from\s+['"]react['"];?/g, '');
        js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]react['"];?/g, 'const { $1 } = React;');
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

  // Swapped to stable JSDelivr CDNs to completely prevent "not defined" errors
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.6/babel.min.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/recharts@2.12.0/umd/Recharts.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/framer-motion@10.18.0/dist/framer-motion.js" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/lucide-react@0.330.0/dist/umd/lucide-react.min.js" crossorigin="anonymous"></script>
        
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
            -moz-osx-font-smoothing: grayscale;
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
          ${compiledCode.css}
        </style>
      </head>
      <body>
        <div id="root" style="width:100%; height:100%; padding: 24px;"></div>
        ${compiledCode.html}
        
        <script>
          window.onerror = function(message) {
            const root = document.getElementById('root');
            if(root) {
               root.innerHTML = '<div style="color: #991b1b; padding: 24px; font-family: monospace; font-size: 13px; background: #fee2e2; border-left: 4px solid #f87171; margin: 20px; border-radius: 4px;"><strong>Execution Crash:</strong><br/>' + (message || 'Script error.') + '</div>';
            }
            return true;
          };
        </script>

        <script type="text/babel" data-type="module">
          const { useState, useEffect, useRef, useMemo, useCallback } = React;
          
          const createSafeLibrary = (libObj, libName) => {
            return new Proxy(libObj || {}, {
              get(target, prop) {
                if (prop in target) return target[prop];
                if (prop === '__esModule') return true;
                
                if (typeof prop === 'string' && prop.match(/^[A-Z]/)) {
                  console.warn(libName + ": Component '" + prop + "' is missing. Rendering fallback.");
                  return function FallbackComponent() {
                    return React.createElement(
                      "span",
                      { style: { color: '#ef4444', fontSize: '11px', border: '1px dashed #ef4444', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef2f2', fontWeight: 'bold' } },
                      String(prop)
                    );
                  };
                }
                return undefined;
              }
            });
          };

          window.lucideReact = createSafeLibrary(window.lucideReact || window.lucide || {}, 'lucide-react');
          window.lucide = window.lucideReact;
          
          window.Recharts = createSafeLibrary(window.Recharts || window.recharts || {}, 'recharts');
          
          window.Motion = createSafeLibrary(window.Motion || window.framerMotion || {}, 'framer-motion');
          window.framerMotion = window.Motion;

          try {
            ${compiledCode.js.replace(/<\/script>/gi, '<\\/script>')}
            
            if (typeof App !== 'undefined') {
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(React.createElement(App));
            } else {
              throw new Error("Wok failed: The main React component must be named 'App'.");
            }
          } catch(err) {
            document.getElementById('root').innerHTML = '<div style="color: #991b1b; padding: 24px; font-family: monospace; font-size: 13px; background: #fee2e2; border-left: 4px solid #f87171; margin: 20px; border-radius: 4px;"><strong>Compilation Error:</strong><br/>' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full relative" style={{ color: isDark ? '#E5E7EB' : '#1a1a1a', fontFamily: appearance?.font || 'inherit' }}>
      {hasComponent ? (
        <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-sm border border-[#E5E5E5] overflow-hidden">
          
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
              <div className="absolute inset-0 overflow-auto bg-[#0A0A0A] p-6 text-[13px] font-mono text-gray-300 leading-relaxed">
                <pre><code>{compiledCode.rawComponent}</code></pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none p-10 w-full" style={{ fontSize: '15px', lineHeight: '1.8' }}>
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