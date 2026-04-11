import { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, MoreHorizontal, Trash2, Pencil, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';

import { getDiscussions, saveDiscussions, loadDiscussionsFromCloud } from '@/lib/discussions';
const FG = '#0A0A0A';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default function RecentApps({ agentId }) {
  const [discussions, setDiscussions] = useState(getDiscussions);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDiscussionsFromCloud().then(cloudDiscs => {
      if (!cloudDiscs || cloudDiscs.length === 0) return;
      const local = getDiscussions();
      const localIds = new Set(local.map(d => d.id));
      const merged = [...local];
      cloudDiscs.forEach(c => {
        if (!localIds.has(c.conv_id)) {
          merged.push({ id: c.conv_id, title: c.title || 'Discussion', preview: c.preview || '', date: c.updated_date?.slice(0, 10) || '', updatedAt: new Date(c.updated_date || Date.now()).getTime(), model: c.model, agent: c.agent });
        }
      });
      merged.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setDiscussions(merged.slice(0, 50));
      saveDiscussions(merged.slice(0, 50));
    }).catch(() => {});
  }, []);
  const [contextMenu, setContextMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const contextRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const filtered = discussions.filter(d => {
    const matchSearch = !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.preview?.toLowerCase().includes(search.toLowerCase());
    const matchAgent = agentId ? (d.agent === agentId) : true;
    return matchSearch && matchAgent;
  }).slice(0, 4);

  useEffect(() => {
    const h = (e) => { if (contextRef.current && !contextRef.current.contains(e.target)) setContextMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openCtx = (e, id) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ id, x: e.clientX, y: e.clientY }); };
  const deleteItem = (id) => { const u = discussions.filter(d => d.id !== id); setDiscussions(u); saveDiscussions(u); setContextMenu(null); };
  const startRename = (id) => { const d = discussions.find(d => d.id === id); setRenameValue(d?.title || ''); setRenaming(id); setContextMenu(null); };
  const confirmRename = (id) => { const u = discussions.map(d => d.id === id ? { ...d, title: renameValue } : d); setDiscussions(u); saveDiscussions(u); setRenaming(null); };

  const handleOpen = (disc) => {
    const params = new URLSearchParams({ conversationId: disc.id });
    if (disc.agent) params.set('agent', disc.agent);
    navigate(`/chat?${params.toString()}`);
  };

  if (discussions.length === 0 && !search) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="max-w-2xl mx-auto mt-8 px-4 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: '#aaa' }}>{t('recent_discussions')}</h2>
        <button onClick={() => navigate('/projects')}
          className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-60"
          style={{ color: FG }}>
          {t('see_all')} <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 mb-3"
        style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ccc' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          className="flex-1 text-xs bg-transparent focus:outline-none"
          style={{ color: FG }} />
      </div>

      {/* Discussion list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: '#ccc' }}>{t('no_discussions')}</p>
        )}
        {filtered.map(disc => (
          <motion.div key={disc.id} layout
            onClick={() => handleOpen(disc)}
            onContextMenu={e => openCtx(e, disc.id)}
            className="group flex items-center gap-4 p-4 bg-white cursor-pointer transition-all"
            style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: '5px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = FG; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}>

            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
              <MessageSquare className="w-4 h-4" style={{ color: FG }} />
            </div>

            <div className="flex-1 min-w-0">
              {renaming === disc.id ? (
                <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => confirmRename(disc.id)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmRename(disc.id); if (e.key === 'Escape') setRenaming(null); }}
                  className="w-full text-sm font-semibold bg-white focus:outline-none border-b border-black"
                  onClick={e => e.stopPropagation()} />
              ) : (
                <p className="text-sm font-semibold truncate" style={{ color: FG }}>{disc.title}</p>
              )}
              <p className="text-xs truncate mt-0.5" style={{ color: '#aaa' }}>{disc.preview}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px]" style={{ color: '#ccc' }}>{formatDate(disc.date)}</span>
              <button onClick={e => openCtx(e, disc.id)}
                className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '3px' }}>
                <MoreHorizontal className="w-3.5 h-3.5" style={{ color: '#999' }} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div ref={contextRef}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.08 }}
            className="fixed z-[200] bg-white shadow-xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y, border: '1px solid rgba(0,0,0,0.09)', minWidth: 160, borderRadius: '4px' }}>
            <button onClick={() => startRename(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left transition-colors"
              style={{ color: FG }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Pencil className="w-3.5 h-3.5" style={{ color: '#aaa' }} /> {t('rename')}
            </button>
            <button onClick={() => deleteItem(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 w-full text-left transition-colors"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}