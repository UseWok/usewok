import { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, Trash2, Pencil, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';

import { getDiscussions, saveDiscussions } from '@/lib/discussions';
const PURPLE = '#3A0088';
const YUZU = '#DDFF00';

const FG = '#0A0A0A';
const MODE_COLORS = {
  Fast: { bg: 'rgba(0,0,0,0.05)', text: FG },
  Standard: { bg: 'rgba(0,0,0,0.05)', text: FG },
  Advanced: { bg: 'rgba(0,0,0,0.08)', text: FG },
  Expert: { bg: '#DDFF00', text: FG },
};

export default function AllProjects() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [discussions, setDiscussions] = useState(getDiscussions);
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const contextRef = useRef(null);

  const filtered = discussions.filter(d =>
    d.title?.toLowerCase().includes(search.toLowerCase()) || d.preview?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const h = (e) => { if (contextRef.current && !contextRef.current.contains(e.target)) setContextMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openCtx = (e, id) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ id, x: e.clientX, y: e.clientY }); };
  const deleteItem = (id) => { const u = discussions.filter(d => d.id !== id); setDiscussions(u); saveDiscussions(u); setContextMenu(null); };
  const startRename = (id) => { const d = discussions.find(d => d.id === id); setRenameValue(d?.title || ''); setRenaming(id); setContextMenu(null); };
  const confirmRename = (id) => { const u = discussions.map(d => d.id === id ? { ...d, title: renameValue } : d); setDiscussions(u); saveDiscussions(u); setRenaming(null); };

  return (
    <div className="min-h-screen py-10 px-6" style={{ background: '#1F1F1F' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate('/')}
              className="w-8 h-8 flex items-center justify-center transition-colors"
              style={{ borderRadius: '999px', background: 'rgba(255,255,255,0.07)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
              <ArrowLeft className="w-4 h-4" style={{ color: '#ccc' }} />
            </button>
            <div>
              <h1 className="text-2xl font-black" style={{ color: '#fff' }}>{t('recent_discussions')}</h1>
              <p className="text-sm" style={{ color: '#666' }}>{discussions.length} conversation{discussions.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-4 py-2.5 mb-6"
            style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#bbb' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_placeholder')}
              className="flex-1 text-sm bg-transparent focus:outline-none" style={{ color: '#fff' }} />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((disc) => {
              const modelStyle = MODE_COLORS[disc.model] || MODE_COLORS.Fast;
              return (
                <motion.div key={disc.id} layout
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  onContextMenu={(e) => openCtx(e, disc.id)}
                  onClick={() => navigate(`/chat?conversationId=${disc.id}${disc.agent ? '&agent=' + disc.agent : ''}${disc.model ? '&mode=' + disc.model.toLowerCase() : ''}`)}
                  className="group cursor-pointer p-4 transition-all"
                  style={{ background: '#242424', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = '#2A2A2A'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#242424'; }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '8px' }}>
                      <MessageSquare className="w-4 h-4" style={{ color: '#888' }} />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openCtx(e, disc.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '8px' }}>
                      <MoreHorizontal className="w-4 h-4" style={{ color: '#888' }} />
                    </button>
                  </div>
                  {renaming === disc.id ? (
                    <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => confirmRename(disc.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(disc.id); if (e.key === 'Escape') setRenaming(null); }}
                      className="w-full text-sm font-semibold bg-white focus:outline-none border-b mb-1"
                      style={{ borderColor: PURPLE }}
                      onClick={(e) => e.stopPropagation()} />
                  ) : (
                    <p className="text-sm font-bold line-clamp-2 mb-1" style={{ color: '#fff' }}>{disc.title}</p>
                  )}
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: '#999' }}>{disc.preview}</p>
                  <div className="flex items-center gap-2">
                    {disc.model && <span className="text-[9px] font-bold px-1.5 py-0.5" style={{ background: modelStyle.bg, color: modelStyle.text, borderRadius: '2px' }}>{disc.model}</span>}
                    <span className="text-[10px]" style={{ color: '#ccc' }}>{disc.date}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-sm" style={{ color: '#bbb' }}>{t('no_discussions')}</div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div ref={contextRef}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.08 }}
            className="fixed z-[200] overflow-hidden shadow-xl"
            style={{ left: contextMenu.x, top: contextMenu.y, background: '#1E1E1E', border: '1px solid #333', minWidth: 160, borderRadius: '10px' }}>
            <button onClick={() => startRename(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left transition-colors"
              style={{ color: '#ccc' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Pencil className="w-3.5 h-3.5" /> Rename
            </button>
            <button onClick={() => deleteItem(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 w-full text-left transition-colors"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}