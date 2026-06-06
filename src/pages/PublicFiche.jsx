import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { loadConversationFromCloud } from '@/lib/discussions';
import { base44 } from '@/api/base44Client';

const LOGO_URL = 'https://media.base44.com/images/public/6a12017561bfacd95e612b0d/d38ba30f1_image.png';

function WokBadge() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!closing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            position: 'fixed', bottom: 16, right: 16, zIndex: 99999,
            display: 'flex', alignItems: 'center', gap: 0,
            background: '#111', borderRadius: 8,
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <a
            href="https://wok.so"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 10px 6px 12px',
              textDecoration: 'none',
            }}
          >
            <img
              src={LOGO_URL}
              alt="Wok"
              style={{ height: 16, width: 'auto', objectFit: 'contain', filter: 'invert(1)' }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: 0.1, whiteSpace: 'nowrap' }}>
              Edit with Wok
            </span>
          </a>
          <button
            onClick={handleClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: '100%', minHeight: 32,
              background: 'transparent', border: 'none',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- THE PUBLIC LIVE RENDER ENGINE ---
export function PublicLiveEngine({ content }) {
  const [isCompiling, setIsCompiling] = useState(true);
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '', rawComponent: '' });

  // Default to Wok Sand / Inter for public pages if no appearance object is passed
  const font = 'Inter, system-ui, sans-serif';
  const FG = '#0A0A0A';

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

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/recharts/umd/Recharts.min.js" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/lucide-react/dist/umd/lucide-react.min.js" crossorigin="anonymous"></script>
        
        <style>
          html, body { 
            margin: 0; 
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: ${font}; 
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
        <div id="root" style="width:100%; height:100%; padding: 0;"></div>
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
              throw new Error("Wok Engine failed: The main React component must be named 'App'.");
            }
          } catch(err) {
            document.getElementById('root').innerHTML = '<div style="color: #991b1b; padding: 24px; font-family: monospace; font-size: 13px; background: #fee2e2; border-left: 4px solid #f87171; margin: 20px; border-radius: 4px;"><strong>Compilation Error:</strong><br/>' + err.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;

  if (hasComponent) {
    return (
      <div className="w-full h-screen relative bg-white">
        <AnimatePresence>
          {isCompiling && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
            >
              <Loader2 className="w-8 h-8 text-[#0080ff] animate-spin mb-3" />
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
    );
  }

  // Fallback to Markdown if the AI generated pure text
  return (
    <div className="prose prose-sm max-w-2xl mx-auto p-10 w-full" style={{ fontSize: '15px', lineHeight: '1.8' }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export default function PublicFiche() {
  const { id } = useParams();
  
  // Backwards compatibility with the `--` splitting logic
  const parts = id?.split('--') || [];
  const conversationId = parts[0];
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    const loadConv = async () => {
      // Try by conv_id first, then by slug
      let results = await base44.entities.Conversation.filter({ conv_id: conversationId }).catch(() => []);
      if (results.length === 0) {
        results = await base44.entities.Conversation.filter({ slug: conversationId }).catch(() => []);
      }

      const rec = results[0];
      if (rec) {
        // Require explicit is_public = true
        if (!rec.is_public) { setIsPrivate(true); setLoading(false); return; }

        // Preferred: rawContent stored directly on the Conversation record (fastest, no extra query)
        if (rec.raw_content || rec.rawContent) {
          const content = rec.raw_content || rec.rawContent;
          setMessages([{ role: 'assistant', content: '', rawContent: content }]);
          setLoading(false);
          return;
        }

        // Fallback: reconstruct from messages_json if available
        if (rec.messages_json) {
          try {
            const msgs = JSON.parse(rec.messages_json);
            if (Array.isArray(msgs) && msgs.length > 0) { setMessages(msgs); setLoading(false); return; }
          } catch {}
        }

        // Last resort: load from cloud storage
        const realConvId = rec.conv_id || conversationId;
        const msgs = await loadConversationFromCloud(realConvId).catch(() => null);
        if (msgs?.length > 0) setMessages(msgs);
        setLoading(false);
      } else {
        setIsPrivate(true);
        setLoading(false);
      }
    };

    loadConv();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-[#0080ff] animate-spin" />
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-white font-bold text-xl">Page non publiée</h2>
        <p className="text-white/40 text-sm text-center max-w-xs">Cette page n'a pas encore été publiée. Utilisez le bouton "Publish" dans l'éditeur pour la rendre publique.</p>
      </div>
    );
  }

  // Get the last generated rawContent — also check top-level field saved by syncToCloud
  const assistantMessages = messages.filter((m) => m.role === 'assistant' && m.rawContent);
  const finalContent = assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1].rawContent : null;

  if (!finalContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-lg font-semibold text-gray-400">Intelligence not found or not published.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-white relative">
      <PublicLiveEngine content={finalContent} />
      <WokBadge />
    </div>
  );
}