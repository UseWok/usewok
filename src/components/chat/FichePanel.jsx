import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Code2, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export default function FichePanel({ content = null, appearance, onError, onSuccess }) {
  return <LivePreviewEngine content={content} appearance={appearance} onError={onError} onSuccess={onSuccess} />;
}

// --- THE NATIVE ESM RENDER ENGINE ---
export function LivePreviewEngine({ content, appearance, onError, onSuccess }) {
  const [isCompiling, setIsCompiling] = useState(true);
  const [viewMode, setViewMode] = useState('preview');
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '', imports: '', rawComponent: '' });

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

      let extractedImports = '';
      let componentLogic = js;

      if (componentLogic) {
        // DOUBLE-SANITIZATION: Strip any stray markdown that leaked into the JS block
        componentLogic = componentLogic.replace(/```jsx/g, '').replace(/```javascript/g, '').replace(/```/g, '');

        // SURGICALLY EXTRACT IMPORTS
        const importRegex = /import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g;
        const matchedImports = componentLogic.match(importRegex);
        
        if (matchedImports) {
          extractedImports = matchedImports.join('\n');
          componentLogic = componentLogic.replace(importRegex, ''); 
        }

        // Clean exports so React can mount the App cleanly
        componentLogic = componentLogic.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1');
        componentLogic = componentLogic.replace(/export\s+default\s+[A-Za-z0-9_]+;?/g, '');
        componentLogic = componentLogic.replace(/export\s+(const|let|var|function)/g, '$1');
      }

      setCompiledCode({ html, css, js: componentLogic, imports: extractedImports, rawComponent });
    } else {
      setCompiledCode({ html: '', css: '', js: '', imports: '', rawComponent: '' });
    }

    const timer = setTimeout(() => setIsCompiling(false), 800);
    return () => clearTimeout(timer);
  }, [content]);

  // Listen for runtime errors from the iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'WOK_RUNTIME_ERROR') {
        if (onError) onError(e.data.message);
      } else if (e.data?.type === 'WOK_RUNTIME_SUCCESS') {
        if (onSuccess) onSuccess();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onError, onSuccess]);

  const hasComponent = compiledCode.html || compiledCode.css || compiledCode.js || compiledCode.imports;

  // React Error Boundary is injected natively with namespaced imports to prevent SyntaxErrors
  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
        <script src="[https://unpkg.com/@babel/standalone/babel.min.js](https://unpkg.com/@babel/standalone/babel.min.js)"></script>
        
        <script type="importmap">
        {
          "imports": {
            "react": "[https://esm.sh/react@18.2.0](https://esm.sh/react@18.2.0)",
            "react-dom/client": "[https://esm.sh/react-dom@18.2.0/client](https://esm.sh/react-dom@18.2.0/client)",
            "lucide-react": "[https://esm.sh/lucide-react@0.378.0?deps=react@18.2.0](https://esm.sh/lucide-react@0.378.0?deps=react@18.2.0)",
            "framer-motion": "[https://esm.sh/framer-motion@11.2.10?deps=react@18.2.0,react-dom@18.2.0](https://esm.sh/framer-motion@11.2.10?deps=react@18.2.0,react-dom@18.2.0)",
            "recharts": "[https://esm.sh/recharts@2.12.7?deps=react@18.2.0,react-dom@18.2.0](https://esm.sh/recharts@2.12.7?deps=react@18.2.0,react-dom@18.2.0)"
          }
        }
        </script>
        
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
        <div id="root" style="width:100%; height:100%; padding: 24px;"></div>
        ${compiledCode.html}
        
        <script>
          const oldError = console.error;
          console.error = function(...args) {
            const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
            window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: 'Compilation Error: ' + msg }, '*');
            oldError.apply(console, args);
          };

          window.onerror = function(message) {
            window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: message }, '*');
            return true;
          };
          window.addEventListener('unhandledrejection', function(event) {
            window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: 'Unhandled Promise: ' + event.reason }, '*');
          });
        </script>

        <script type="text/babel" data-type="module" data-presets="react">
          import * as __WokReact__ from 'react';
          import { createRoot as __WokCreateRoot__ } from 'react-dom/client';
          
          // --- HOISTED AI IMPORTS ---
          ${compiledCode.imports}
          
          class ErrorBoundary extends __WokReact__.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false, errorMessage: '' };
            }
            static getDerivedStateFromError(error) {
              return { hasError: true, errorMessage: error.toString() };
            }
            componentDidCatch(error, errorInfo) {
              window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: error.toString() }, '*');
            }
            render() {
              if (this.state.hasError) {
                return null;
              }
              return this.props.children;
            }
          }

          try {
            // --- ISOLATED AI COMPONENT LOGIC ---
            ${compiledCode.js}
            
            if (typeof App !== 'undefined') {
              const root = __WokCreateRoot__(document.getElementById('root'));
              root.render(<ErrorBoundary><App /></ErrorBoundary>);
              window.parent.postMessage({ type: 'WOK_RUNTIME_SUCCESS' }, '*');
            } else {
              throw new Error("Wok Engine failed: The main React component must be named 'App'.");
            }
          } catch(err) {
            window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: err.message }, '*');
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