import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Plus, BookOpen, Clock, X, Globe, Lock, ExternalLink } from 'lucide-react';
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
  return days < 30 ? `${days}d ago` : new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
}

function BuildRow({ build, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const rowRef = useRef(null);

  const initial = (build.title || 'U').charAt(0).toUpperCase();

  const handleMouseMove = (e) => {
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left + 16, y: e.clientY - rect.top - 60 });
  };

  return (
    <div
      ref={rowRef}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
        borderRadius: 8, cursor: 'pointer', position: 'relative',
        background: hovered ? '#F7F7F7' : 'transparent',
        transition: 'background 120ms',
      }}
    >
      {/* Avatar */}
      <div style={{ width: 30, height: 30, borderRadius: 999, background: '#8B9EB0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {build.title || 'Untitled build'}
        </p>
        <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
          Modifié {timeAgo(build.updatedAt || build.date)}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {build.is_public ? (
          <Globe style={{ width: 12, height: 12, color: '#22C55E' }} />
        ) : (
          <Lock style={{ width: 12, height: 12, color: '#999' }} />
        )}
        <span style={{ fontSize: 11, color: '#999' }}>{build.is_public ? 'Public' : 'Privé'}</span>
      </div>

      {/* Hover tooltip card */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)',
              marginLeft: 10, zIndex: 9999, pointerEvents: 'none',
              background: '#fff', border: '1px solid #E8E8E6', borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 14, width: 220,
            }}
          >
            {/* Thumbnail placeholder */}
            <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: 8, background: '#F5F5F5', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EBEBEB' }}>
              <span style={{ fontSize: 10, color: '#CCC' }}>Preview</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#111', margin: '0 0 6px' }}>{build.title || 'Untitled'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {[
                ['Statut', 'Actif'],
                ['Visibilité', build.is_public ? 'Public' : 'Privé'],
                ['Créé le', build.date ? new Date(build.date).toLocaleDateString('fr-FR') : '—'],
                ['Modifié', timeAgo(build.updatedAt || build.date)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#999' }}>{k}</span>
                  <span style={{ fontSize: 11, color: '#333', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const QUICK_LINKS = [
  { icon: Home, label: 'Home', path: '/app' },
  { icon: Plus, label: 'Create a new build', path: '/app' },
  { icon: BookOpen, label: 'Documentation', path: null, action: () => window.open('https://docs.wok.app', '_blank') },
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
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = query.trim()
    ? builds.filter(b => (b.title || '').toLowerCase().includes(query.toLowerCase()))
    : builds.slice(0, 8);

  const go = (path) => { navigate(path); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — very light blur, no dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, backdropFilter: 'blur(2px)', background: 'rgba(255,255,255,0.4)' }}
          />

          {/* Modal */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, pointerEvents: 'none' }}>
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              style={{
                width: '100%', maxWidth: 600, maxHeight: '75vh',
                background: '#fff', borderRadius: 16,
                border: '1px solid #E8E8E6',
                boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                pointerEvents: 'auto',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Search input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
                <Search style={{ width: 18, height: 18, color: '#AAAAAA', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search builds…"
                  style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: '#111', background: 'transparent', fontFamily: 'Inter, sans-serif' }}
                />
                <button onClick={onClose}
                  style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid #E8E8E6', background: 'transparent', cursor: 'pointer', color: '#999', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <X style={{ width: 13, height: 13 }} />
                </button>
              </div>

              {/* Body — scrollable */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Recent builds */}
                <div style={{ padding: '12px 12px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Clock style={{ width: 13, height: 13, color: '#AAAAAA' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {query ? 'Résultats' : 'Mes builds récents'}
                    </span>
                  </div>
                  {filtered.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#CCC', padding: '8px 12px' }}>Aucun build trouvé</p>
                  ) : (
                    filtered.map(b => (
                      <BuildRow
                        key={b.id}
                        build={b}
                        onClick={() => go(`/chat?conversationId=${b.id}`)}
                      />
                    ))
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#F0F0F0', margin: '8px 0' }} />

                {/* Quick nav */}
                <div style={{ padding: '4px 12px 12px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#AAAAAA', letterSpacing: '0.04em', textTransform: 'uppercase', margin: '8px 0 6px 12px' }}>Navigation rapide</p>
                  {QUICK_LINKS.map(({ icon: Icon, label, path, action }) => (
                    <button
                      key={label}
                      onClick={() => { if (action) { action(); onClose(); } else go(path); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'background 100ms' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F7F7F7'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ width: 30, height: 30, borderRadius: 8, background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon style={{ width: 14, height: 14, color: '#555' }} />
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#222' }}>{label}</span>
                      <ExternalLink style={{ width: 12, height: 12, color: '#CCC', marginLeft: 'auto' }} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}