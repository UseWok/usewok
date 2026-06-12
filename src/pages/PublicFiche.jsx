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

    // If no fence matched, use raw content directly
    if (!js) {
      js = content;
    }

    if (js) {
      js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/g, 'const { $1 } = window.lucideReact;');
      js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]recharts['"];?/g, 'const { $1 } = window.Recharts;');
      js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]framer-motion['"];?/g, 'const { $1 } = window.Motion;');
      js = js.replace(/import\s+React.*?from\s+['"]react['"];?/g, '');
      js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]react['"];?/g, 'const { $1 } = React;');
      js = js.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
      // Track default export name before stripping it
      var defaultExportMatch = js.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
      if (!defaultExportMatch) defaultExportMatch = js.match(/export\s+default\s+([A-Za-z0-9_]+)\s*;/);
      var defaultExportName = defaultExportMatch ? defaultExportMatch[1] : null;

      js = js.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1');
      js = js.replace(/export\s+default\s+[A-Za-z0-9_]+;?\n?/g, '');
      js = js.replace(/export\s+(const|let|var|function)/g, '$1');

      // Re-expose as App if it had a different name
      if (defaultExportName && defaultExportName !== 'App') {
        js += '\nvar App = ' + defaultExportName + ';';
      }
    }
  }

  const usesRecharts = js.includes('Recharts') || js.includes('recharts');

  const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.10/babel.min.js"><\/script>
  ${usesRecharts ? `<script src="https://cdn.jsdelivr.net/npm/prop-types@15.8.1/prop-types.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/recharts@2.1.9/umd/Recharts.min.js"><\/script>` : ''}
  <script>
    // Lucide stub — proxy that returns a valid React component for any icon name
    window.lucideReact = new Proxy({}, {
      get: function(_, name) {
        if (typeof name !== 'string' || name === 'then') return undefined;
        return function(props) {
          var p = props || {};
          return React.createElement('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: p.size || 24, height: p.size || 24,
            viewBox: '0 0 24 24', fill: 'none',
            stroke: p.color || 'currentColor',
            strokeWidth: p.strokeWidth || 2,
            strokeLinecap: 'round', strokeLinejoin: 'round',
            className: p.className || '', style: p.style
          }, React.createElement('circle', { cx: 12, cy: 12, r: 9 }));
        };
      }
    });
    window.lucide = window.lucideReact;
  <\/script>
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #fff; font-family: system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    ${css}
  </style>
</head>
<body>
  <div id="root" style="width:100%;height:100%"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, Component } = React;
    const Recharts = window.Recharts || {};

    class ErrorBoundary extends Component {
      constructor(p) { super(p); this.state = { err: null }; }
      static getDerivedStateFromError(e) { return { err: e }; }
      render() {
        if (this.state.err) return React.createElement('div', {
          style: { color:'#991b1b', padding:24, fontFamily:'monospace', fontSize:13,
            background:'#fee2e2', borderLeft:'4px solid #f87171', margin:20, borderRadius:4 }
        }, React.createElement('strong', null, 'Error: '), this.state.err.message);
        return this.props.children;
      }
    }

    try {
      ${js.replace(/<\/script>/gi, '<\\/script>')}
      var rootComponent = typeof App !== 'undefined' ? App
        : typeof default_export !== 'undefined' ? default_export
        : null;
      if (rootComponent) {
        ReactDOM.createRoot(document.getElementById('root')).render(
          React.createElement(ErrorBoundary, null, React.createElement(rootComponent))
        );
      } else {
        document.getElementById('root').innerHTML =
          '<div style="padding:40px;font-family:system-ui;color:#666;text-align:center"><p style="font-size:15px">No App component found.<br/>Make sure your code exports a default <strong>App</strong> function.</p></div>';
      }
    } catch(e) {
      document.getElementById('root').innerHTML =
        '<div style="color:#991b1b;padding:24px;font-family:monospace;font-size:13px;background:#fee2e2;border-left:4px solid #f87171;margin:20px;border-radius:4px"><strong>Runtime Error:</strong><br/>' + e.message + '<br/><br/><pre style="white-space:pre-wrap;font-size:11px;color:#7f1d1d">' + (e.stack || '') + '</pre></div>';
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
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (!conversationId) { setNotFound(true); setLoading(false); return; }

    const load = async () => {
      let rec = null;
      try {
        // Filter by conv_id — RLS allows public reads via is_public: true
        const results = await base44.entities.Conversation.filter({ conv_id: conversationId });
        if (results.length > 0) rec = results[0];
      } catch (e) {
        console.error('Load failed:', e);
      }

      if (!rec || !rec.is_public) { setNotFound(true); setLoading(false); return; }

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

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/functions/regeneratePublicApp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });
      const result = await response.json();
      if (result.success) {
        // Reload page to fetch fresh content
        window.location.reload();
      }
    } catch (err) {
      console.error('Regeneration failed:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (notFound || !content) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 15, color: '#aaa', fontWeight: 500, marginBottom: 20 }}>This app is not available yet.</p>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            style={{
              padding: '10px 20px', borderRadius: 8, background: '#111', color: '#fff',
              border: 'none', cursor: isRegenerating ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 500, opacity: isRegenerating ? 0.6 : 1
            }}
          >
            {isRegenerating ? 'Generating...' : 'Generate Now'}
          </button>
        </div>
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