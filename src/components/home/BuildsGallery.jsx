import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Layout } from 'lucide-react';
import { loadDiscussionsFromCloud, getLocalDiscussions } from '@/lib/chat-storage';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
}

// Render an actual live preview inside a scaled iframe
function BuildPreview({ build }) {
  const rawContent = (() => {
    try { return localStorage.getItem(`fiche_${build.id}`) || null; } catch { return null; }
  })();

  if (!rawContent) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F7F7F5', gap: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EBEBEA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Layout size={16} color="#BBBBBB" />
        </div>
        <span style={{ fontSize: 11, color: '#CCCCCC' }}>No preview</span>
      </div>
    );
  }

  // Strip code fences if any, wrap in a full HTML doc
  const code = rawContent
    .replace(/^```(?:jsx|javascript|react|html)?\n?/m, '')
    .replace(/\n?```$/m, '');

  const htmlDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; overflow: hidden; font-family: Inter, system-ui, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel" data-type="module">
    try {
      const { useState, useEffect, useRef, useCallback, useMemo } = React;
      const { motion, AnimatePresence } = window.Motion || {};
      ${code}
      const rootEl = document.getElementById('root');
      if (typeof App !== 'undefined') {
        const root = ReactDOM.createRoot(rootEl);
        root.render(React.createElement(App));
      }
    } catch(e) {
      document.getElementById('root').innerHTML = '<div style="padding:20px;color:#999;font-size:12px">Preview unavailable</div>';
    }
  </script>
</body>
</html>`;

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <iframe
        srcDoc={htmlDoc}
        style={{
          width: '300%',
          height: '300%',
          border: 'none',
          transformOrigin: 'top left',
          transform: 'scale(0.333)',
          pointerEvents: 'none',
          background: '#fff',
        }}
        sandbox="allow-scripts"
        title={build.title}
      />
    </div>
  );
}

function BuildCard({ build, index }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const initial = (build.title || build.preview || 'U').charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => navigate(`/chat?conversationId=${build.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {/* Thumbnail */}
      <div style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: hovered ? '1px solid #D0D0CE' : '1px solid #E8E8E6',
        aspectRatio: '16/10',
        background: '#F7F7F5',
        position: 'relative',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'border-color 200ms ease, transform 200ms ease',
      }}>
        <BuildPreview build={build} />

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 180ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#1A1A1A', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            Open <ArrowRight size={12} />
          </div>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Avatar */}
        <div style={{ width: 26, height: 26, borderRadius: 999, background: '#8B9EB0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
            {build.title || 'Untitled build'}
          </p>
          <p style={{ fontSize: 11, color: '#999', margin: 0, marginTop: 1 }}>
            Edited {timeAgo(build.date || build.updatedAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function BuildsGallery() {
  const navigate = useNavigate();
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiscussionsFromCloud().then(cloudBuilds => {
      if (cloudBuilds.length > 0) {
        setBuilds(cloudBuilds.slice(0, 6));
      } else {
        const ws = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
        const wsId = ws.find(w => w.current)?.id || 'default';
        setBuilds((getLocalDiscussions(wsId) || []).slice(0, 6));
      }
    }).catch(() => {
      const ws = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
      const wsId = ws.find(w => w.current)?.id || 'default';
      setBuilds((getLocalDiscussions(wsId) || []).slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  if (loading || builds.length === 0) return null;

  return (
    <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: '0 24px 48px' }}>
      {/* Encadré card */}
      <div style={{
        background: '#fff',
        border: '1px solid #E8E8E6',
        borderRadius: 20,
        padding: '20px 20px 24px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>My projects</h2>
          <button
            onClick={() => navigate('/discussions')}
            style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0, fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1A1A1A'}
            onMouseLeave={e => e.currentTarget.style.color = '#888'}
          >
            Browse all <ArrowRight size={13} />
          </button>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {builds.map((build, i) => (
            <BuildCard key={build.id} build={build} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}