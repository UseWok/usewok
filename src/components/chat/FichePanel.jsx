import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export default function FichePanel({ content = null, onError, onSuccess, isPublic = false, viewMode = 'preview' }) {
  return <LivePreviewEngine content={content} onError={onError} onSuccess={onSuccess} isPublic={isPublic} viewMode={viewMode} />;
}

// --- THE NATIVE ESM RENDER ENGINE ---
export function LivePreviewEngine({ content, onError, onSuccess, isPublic, viewMode }) {
  const [isCompiling, setIsCompiling] = useState(true);
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '', rawComponent: '' });

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
      let componentLogic = js || html || content;

      if (componentLogic) {
        const btCode = String.fromCharCode(96);
        const btPattern = new RegExp(`${btCode}{3}(?:jsx|javascript|react)?\\n?`, 'gi');
        componentLogic = componentLogic.replace(btPattern, '').replace(new RegExp(`${btCode}{3}`, 'g'), '');

        componentLogic = componentLogic.replace(/export\s+default\s+function/g, 'function');
        componentLogic = componentLogic.replace(/export\s+default\s+class/g, 'class');
        componentLogic = componentLogic.replace(/export\s+default\s+[a-zA-Z0-9_]+;?/g, '');
        componentLogic = componentLogic.replace(/export\s+(const|let|var|function|class)/g, '$1');
      }

      setCompiledCode({ html, css, js: componentLogic, rawComponent });
    } else {
      setCompiledCode({ html: '', css: '', js: '', rawComponent: '' });
    }

    const timer = setTimeout(() => setIsCompiling(false), 800);
    return () => clearTimeout(timer);
  }, [content]);

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

  const hasComponent = compiledCode.html || compiledCode.css || compiledCode.js;

  const watermarkHTML = isPublic ? `
    <div style="position: fixed; bottom: 16px; right: 16px; z-index: 99999; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.8); backdrop-filter: blur(12px); padding: 6px 12px; border-radius: 9999px; border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-decoration: none; color: #000; font-family: system-ui, sans-serif; transition: transform 0.2s ease, opacity 0.2s ease; cursor: pointer; opacity: 0.6;" onmouseover="this.style.opacity='1'; this.style.transform='translateY(-2px)';" onmouseout="this.style.opacity='0.6'; this.style.transform='none';" onclick="window.open('https://wok.com', '_blank')">
      <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.5px; opacity: 0.5;">BUILT WITH</span>
      <span style="font-size: 13px; font-weight: 900; font-style: italic; letter-spacing: -0.5px;">WOK</span>
    </div>
  ` : '';

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:wght@300;400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <script type="importmap">
        {
          "imports": {
            "react": "https://esm.sh/react@18.2.0",
            "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
            "lucide-react": "https://esm.sh/lucide-react@0.263.0?deps=react@18.2.0",
            "framer-motion": "https://esm.sh/framer-motion@10.16.4?deps=react@18.2.0,react-dom@18.2.0",
            "recharts": "https://esm.sh/recharts@2.10.3?deps=react@18.2.0,react-dom@18.2.0"
          }
        }
        </script>
        
        <style>
          html, body, #root { 
            margin: 0; 
            padding: 0;
            width: 100%;
            height: 100%;
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
        <div id="root"></div>
        ${watermarkHTML}
        ${compiledCode.html}
        
        <script>
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: message }, '*');
            return true;
          };
          window.addEventListener('unhandledrejection', function(event) {
            window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: 'Unhandled Promise: ' + event.reason }, '*');
          });
        </script>

        <script type="text/babel" data-type="module" data-presets="react">
          import { createRoot as __WokCreateRoot__ } from 'react-dom/client';
          
          ${compiledCode.js}
          
          class ErrorBoundary extends React.Component {
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
    <div className="w-full h-full relative font-sans">
      {hasComponent ? (
        <div className="w-full h-full flex flex-col overflow-hidden">
          <div className="flex-1 relative w-full h-full">
            {viewMode === 'preview' ? (
              <>
                <AnimatePresence>
                  {isCompiling && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/5 backdrop-blur-md"
                    >
                      <div className="p-4 bg-white/90 rounded-2xl shadow-xl flex flex-col items-center border border-white/20">
                         <Loader2 className="w-6 h-6 text-[#0080ff] animate-spin mb-2" />
                         <span className="text-[11px] font-bold text-[#0080ff] uppercase tracking-widest">Building</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <iframe
                  title="Wok Live Preview"
                  srcDoc={srcDoc}
                  className="w-full h-full border-none absolute inset-0 z-0 bg-transparent"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </>
            ) : (
               <div className="absolute inset-0 overflow-auto bg-[#0A0A0A] p-8 text-[13px] font-mono text-gray-300 leading-relaxed rounded-tl-xl border-t border-l border-white/10">
                 <pre><code>{compiledCode.rawComponent}</code></pre>
               </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full opacity-30">
           <LayoutTemplate className="w-16 h-16 text-gray-400" />
        </div>
      )}
    </div>
  );
}