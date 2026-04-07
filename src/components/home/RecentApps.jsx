import { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, MoreHorizontal, Trash2, Pencil, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';

const STORAGE_KEY = 'discussions_v1';
const PURPLE = '#3A0088';
const YUZU = '#DDFF00';

function getDiscussions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveDiscussions(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

const MODE_COLORS = {
  Fast: { bg: 'rgba(58,0,136,0.08)', text: PURPLE },
  Standard: { bg: 'rgba(58,0,136,0.08)', text: PURPLE },
  Advanced: { bg: 'rgba(58,0,136,0.12)', text: PURPLE },
  Expert: { bg: '#DDFF00', text: PURPLE },
};

export default function RecentApps({ agentId }) {
  const [discussions, setDiscussions] = useState(getDiscussions);
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const contextRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const filtered = discussions.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.preview?.toLowerCase().includes(search.toLowerCase());
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
    if (disc.model) params.set('mode', disc.model.toLowerCase());
    navigate(`/chat?${params.toString()}`);
  };

  if (discussions.length === 0 && !search) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }}
      className="max-w-2xl mx-auto mt-6 px-4 pb-6">
      <div className="bg-white overflow-hidden"
        style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-4 py-3.5"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-sm font-bold" style={{ color: PURPLE }}>{t('recent_discussions')}</p>
          <button onClick={() => navigate('/projects')}
            className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-70"
            style={{ color: PURPLE }}>
            {t('see_all')} <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '4px' }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#bbb' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('search_placeholder')}
              className="flex-1 text-xs bg-transparent focus:outline-none" style={{ color: '#333' }} />
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          {filtered.length === 0 && (
            <p className="text-center text-xs py-6" style={{ color: '#bbb' }}>{t('no_discussions')}</p>
          )}
          {filtered.map(disc => {
            const modelStyle = MODE_COLORS[disc.model] || MODE_COLORS.Fast;
            return (
              <motion.div key={disc.id} layout
                onClick={() => handleOpen(disc)}
                onContextMenu={(e) => openCtx(e, disc.id)}
                className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(58,0,136,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(58,0,136,0.06)', borderRadius: '4px' }}>
                  <MessageSquare className="w-3.5 h-3.5" style={{ color: 'rgba(58,0,136,0.35)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  {renaming === disc.id ? (
                    <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => confirmRename(disc.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(disc.id); if (e.key === 'Escape') setRenaming(null); }}
                      className="w-full text-xs font-medium bg-white focus:outline-none border-b"
                      style={{ borderColor: PURPLE }}
                      onClick={(e) => e.stopPropagation()} />
                  ) : (
                    <p className="text-xs font-semibold truncate" style={{ color: PURPLE }}>{disc.title}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#ccc' }} />
                    <p className="text-[10px] truncate" style={{ color: '#bbb' }}>{disc.date}</p>
                    {disc.model && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5" style={{ background: modelStyle.bg, color: modelStyle.text, borderRadius: '2px' }}>
                        {disc.model}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={(e) => openCtx(e, disc.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '3px' }}>
                  <MoreHorizontal className="w-3 h-3" style={{ color: '#888' }} />
                </button>
              </motion.div>
            );
          })}
        </div>
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
              style={{ color: '#444' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Pencil className="w-3.5 h-3.5" /> Rename
            </button>
            <button onClick={() => deleteItem(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 w-full text-left transition-colors"
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}