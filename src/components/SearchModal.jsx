import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Plus, BookOpen, Clock, X, Globe, Lock } from 'lucide-react';
import { loadDiscussionsFromCloud, getLocalDiscussions } from '@/lib/chat-storage';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}j` : new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
}

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return Math.abs(h); }
const COLORS = ['#F95738', '#7B4FE0', '#3B8BEB', '#22c55e', '#f59e0b', '#e879f9'];

function BuildRow({ build, onClick }) {
  const [hovered, setHovered] = useState(false);
  const color = COLORS[hashStr(build.id || build.title || '') % COLORS.length];
  const initial = (build.title || 'U').charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
        borderRadius: 8, cursor: 'pointer', width: '100%', textAlign: 'left', border: 'none',
        background: hovered ? '#2A2A2A' : 'transparent',
        transition: 'background 120ms',
      }}
    >
      <div style={{ width: 30, height: 30, borderRadius: 8, background: color + '22', border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {build.title || 'Untitled build'}
        </p>
        <p style={{ fontSize: 11, color: '#555', margin: 0 }}>
          {timeAgo(build.updatedAt || build.date)}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {build.is_public ? (
          <Globe style={{ width: 11, height: 11, color: '#22c55e' }} />
        ) : (
          <Lock style={{ width: 11, height: 11, color: '#444' }} />
        )}
      </div>
    </button>
  );
}

const QUICK_LINKS = [
  { icon: Home, label: 'Home', path: '/app' },
  { icon: Plus, label: 'Créer un nouveau build', path: '/app' },
  { icon: BookOpen, label: 'Documentation', path: null, action: () => window.open('https://docs.wok.so', '_blank') },
];

export default function SearchModal({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [builds, setBuilds] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 80);
    loadDiscussionsFromCloud().then(d => setBuilds(d)).catch(() => {
      const ws = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
      const wsId = ws.find(w => w.current)?.id || 'default';
      setBuilds(getLocalDiscussions(wsId) || []);
    });
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const filtered = query.trim()
    ? builds.filter(b => (b.title || '').toLowerCase().includes(query.toLowerCase()))
    : builds.slice(0, 8);

  const go = (path) => { navigate(path); onClose(); };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 24px 24px', pointerEvents: 'none' }}>
        <div
          style={{
            width: '100%', maxWidth: 560, maxHeight: '70vh',
            background: '#141414', borderRadius: 14,
            border: '1px solid #2A2A2A',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            pointerEvents: 'auto',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Search input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid #2A2A2A', flexShrink: 0 }}>
            <Search style={{ width: 16, height: 16, color: '#555', flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un build…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#fff', background: 'transparent', fontFamily: 'Inter, sans-serif' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <kbd style={{ fontSize: 10, color: '#444', background: '#222', border: '1px solid #333', borderRadius: 4, padding: '2px 5px', fontFamily: 'monospace' }}>ESC</kbd>
              <button onClick={onClose}
                style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, border: '1px solid #2A2A2A', background: 'transparent', cursor: 'pointer', color: '#555', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <X style={{ width: 11, height: 11 }} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Recent builds */}
            <div style={{ padding: '10px 10px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, padding: '0 4px' }}>
                <Clock style={{ width: 11, height: 11, color: '#444' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#444', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {query ? 'Résultats' : 'Builds récents'}
                </span>
              </div>
              {filtered.length === 0 ? (
                <p style={{ fontSize: 13, color: '#444', padding: '8px 12px' }}>Aucun build trouvé</p>
              ) : (
                filtered.map(b => (
                  <BuildRow key={b.id} build={b} onClick={() => go(`/chat?conversationId=${b.id}`)} />
                ))
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#2A2A2A', margin: '6px 0' }} />

            {/* Quick nav */}
            <div style={{ padding: '4px 10px 10px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#444', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '6px 0 4px 4px' }}>Navigation</p>
              {QUICK_LINKS.map(({ icon: Icon, label, path, action }) => (
                <button
                  key={label}
                  onClick={() => { if (action) { action(); onClose(); } else go(path); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'background 100ms', color: '#ccc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2A2A2A'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: 28, height: 28, borderRadius: 7, background: '#1E1E1E', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 13, height: 13, color: '#666' }} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#ccc' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}