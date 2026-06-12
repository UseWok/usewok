import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { base44 } from '@/api/base44Client';

const LOGO_URL = 'https://media.base44.com/images/public/6a12017561bfacd95e612b0d/d38ba30f1_image.png';

function WokBadge() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 99999,
      display: 'flex', alignItems: 'center', gap: 0,
      background: '#111', borderRadius: 6,
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      overflow: 'hidden',
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
    }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet" />
      <a
        href="https://wok.so"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 10px 7px 12px',
          textDecoration: 'none',
        }}
      >
        <img
          src={LOGO_URL}
          alt="Wok"
          style={{ height: 15, width: 'auto', objectFit: 'contain', filter: 'invert(1)' }}
        />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#fff', letterSpacing: 0.1, whiteSpace: 'nowrap' }}>
          Built with Wok
        </span>
      </a>
      <button
        onClick={() => setVisible(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: '100%', minHeight: 30,
          background: 'transparent', border: 'none',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
          padding: 0,
        }}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path d="M1 1L8 8M8 1L1 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

export function PublicLiveEngine({ content }) {
  const [ready, setReady] = useState(false);

  let js = '';
  let css = '';

  if (content) {
    const bt = '```';
    const jsMatch = content.match(/```(?:jsx?|javascript|react)\n([\s\S]*?)```/i);
    const cssMatch = content.match(/```css\n([\s\S]*?)```/i);

    if (jsMatch) js = jsMatch[1];
    if (cssMatch) css = cssMatch[1];

    // If no fence matched but content looks like JSX, use raw
    if (!js && (content.includes('function App') || content.includes('export default'))) {
      js = content;
    }

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

  const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin="anonymous"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin="anonymous"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin="anonymous"><\/script>
  <script src="https://unpkg.com/recharts/umd/Recharts.min.js" crossorigin="anonymous"><\/script>
  <script src="https://unpkg.com/lucide-react/dist/umd/lucide-react.min.js" crossorigin="anonymous"><\/script>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #fff; font-family: system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    ${css}
  </style>
</head>
<body>
  <div id="root" style="width:100%;height:100%"></div>
  <script>
    window.onerror = function(msg) {
      document.getElementById('root').innerHTML = '<div style="color:#991b1b;padding:24px;font-family:monospace;font-size:13px;background:#fee2e2;border-left:4px solid #f87171;margin:20px;border-radius:4px"><strong>Error:</strong><br/>' + msg + '</div>';
      return true;
    };
  <\/script>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext } = React;
    const safe = (lib) => new Proxy(lib || {}, { get(t, p) { return p in t ? t[p] : typeof p === 'string' && /^[A-Z]/.test(p) ? () => null : undefined; } });
    window.lucideReact = safe(window.lucideReact || window.lucide || {});
    window.lucide = window.lucideReact;
    window.Recharts = safe(window.Recharts || {});
    try {
      ${js.replace(/<\/script>/gi, '<\\/script>')}
      if (typeof App !== 'undefined') {
        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
      }
    } catch(e) {
      document.getElementById('root').innerHTML = '<div style="color:#991b1b;padding:24px;font-family:monospace;font-size:13px;background:#fee2e2;border-left:4px solid #f87171;margin:20px;border-radius:4px"><strong>Error:</strong><br/>' + e.message + '</div>';
    }
  <\/script>
</body>
</html>`;

  return (
    <div style={{ width: '100%', height: '100vh', background: '#fff', position: 'relative' }}>
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', zIndex: 10 }}>
          <Loader2 style={{ width: 28, height: 28, color: '#ccc', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      <iframe
        title="Wok App"
        srcDoc={srcDoc}
        onLoad={() => setReady(true)}
        style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}

export default function PublicFiche() {
  const { id } = useParams();
  const conversationId = id?.split('--')[0];

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!conversationId) { setNotFound(true); setLoading(false); return; }

    const load = async () => {
      // Try as conv_id
      let results = await base44.entities.Conversation.filter({ conv_id: conversationId }).catch(() => []);

      const rec = results[0];

      if (!rec) { setNotFound(true); setLoading(false); return; }

      const rawContent = rec.raw_content || rec.rawContent || null;

      if (rawContent) {
        setContent(rawContent);
      } else if (rec.messages_json) {
        try {
          const msgs = JSON.parse(rec.messages_json);
          const last = [...msgs].reverse().find(m => m.role === 'assistant' && m.rawContent);
          if (last) setContent(last.rawContent);
          else setNotFound(true);
        } catch { setNotFound(true); }
      } else {
        setNotFound(true);
      }

      setLoading(false);
    };

    load();
  }, [conversationId]);

  // Force white background on body for public page
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#fff';
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <Loader2 style={{ width: 28, height: 28, color: '#ccc', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ fontSize: 15, color: '#aaa', fontWeight: 500 }}>This app is not available.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#fff' }}>
      <PublicLiveEngine content={content} />
      <WokBadge />
    </div>
  );
}