import { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, MoreHorizontal, Trash2, Pencil, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useDiscussions, useDeleteDiscussion, useRenameDiscussion } from '@/lib/useDiscussions';
import { getDiscussionDaysLeft } from '@/lib/discussions';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-black/6 rounded-2xl animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-black/6 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-black/6 rounded w-3/4" />
        <div className="h-2 bg-black/4 rounded w-1/2" />
      </div>
      <div className="h-2 bg-black/4 rounded w-8" />
    </div>
  );
}

function EmptyState({ onNewChat }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4" style={{ background: YUZU }}>
        <Sparkles className="w-6 h-6" style={{ color: FG }} />
      </div>
      <p className="text-sm font-black mb-1" style={{ color: FG }}>Start your financial journey</p>
      <p className="text-xs leading-relaxed max-w-xs mb-5" style={{ color: 'rgba(0,0,0,0.35)' }}>
        Ask anything about saving, investing, budgeting or getting out of debt.
      </p>
      <button onClick={onNewChat}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl transition-all hover:opacity-90"
        style={{ background: FG, color: 'white' }}>
        <Plus className="w-4 h-4" /> Start a conversation
      </button>
    </motion.div>
  );
}

export default function RecentApps({ agentId }) {
  const { data: discussions = [], isLoading } = useDiscussions();
  const deleteDiscussion = useDeleteDiscussion();
  const renameDiscussion = useRenameDiscussion();
  const [search, setSearch] = useState('');
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
  const deleteItem = (id) => { deleteDiscussion.mutate(id); setContextMenu(null); };
  const startRename = (id) => { const d = discussions.find(d => d.id === id); setRenameValue(d?.title || ''); setRenaming(id); setContextMenu(null); };
  const confirmRename = (id) => { renameDiscussion.mutate({ discId: id, title: renameValue }); setRenaming(null); };

  const handleOpen = (disc) => {
    const params = new URLSearchParams({ conversationId: disc.id });
    if (disc.agent) params.set('agent', disc.agent);
    navigate(`/chat?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <section className="max-w-2xl mx-auto mt-8 px-4 pb-6">
        <div className="h-3 w-32 bg-black/6 rounded animate-pulse mb-4" />
        <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
      </section>
    );
  }

  if (discussions.length === 0 && !search) {
    return (
      <section className="max-w-2xl mx-auto mt-8 px-4 pb-6">
        <EmptyState onNewChat={() => navigate('/chat')} />
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto mt-8 px-4 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(0,0,0,0.25)' }}>
          {t('recent_discussions')}
        </h2>
        <button onClick={() => navigate('/discussions')}
          className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-60" style={{ color: FG }}>
          {t('see_all')} <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-xl border"
        style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.07)' }}>
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(0,0,0,0.2)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          className="flex-1 text-xs bg-transparent focus:outline-none" style={{ color: FG }}/>
        {search && (
          <button onClick={() => setSearch('')} className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>✕</button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm font-semibold" style={{ color: 'rgba(0,0,0,0.3)' }}>No results</p>
          </div>
        )}
        {filtered.map((disc, i) => {
          const daysLeft = getDiscussionDaysLeft(disc);
          const expiring = daysLeft <= 7;
          return (
            <motion.div key={disc.id} layout
              initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => handleOpen(disc)}
              onContextMenu={e => openCtx(e, disc.id)}
              className="group flex items-center gap-3 p-4 bg-white border rounded-2xl cursor-pointer transition-all"
              style={{
                borderColor: 'rgba(0,0,0,0.07)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'}
            >
              {/* Icon */}
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-xl transition-colors group-hover:bg-yuzu"
                style={{ background: 'rgba(0,0,0,0.05)' }}>
                <MessageSquare className="w-4 h-4 transition-colors" style={{ color: FG }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {renaming === disc.id ? (
                  <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => confirmRename(disc.id)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmRename(disc.id); if (e.key === 'Escape') setRenaming(null); }}
                    className="w-full text-sm font-bold bg-transparent focus:outline-none border-b"
                    style={{ color: FG, borderColor: FG }}
                    onClick={e => e.stopPropagation()} />
                ) : (
                  <p className="text-sm font-bold truncate" style={{ color: FG }}>{disc.title}</p>
                )}
                <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>{disc.preview}</p>
              </div>

              {/* Right: date + expiry + options */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {expiring && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                    style={{ background: daysLeft <= 2 ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)', color: daysLeft <= 2 ? '#ef4444' : '#92400e' }}>
                    {daysLeft}d
                  </span>
                )}
                <span className="text-[10px] hidden sm:block" style={{ color: 'rgba(0,0,0,0.2)' }}>{formatDate(disc.date)}</span>
                <button
                  onClick={e => openCtx(e, disc.id)}
                  className="w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.05)' }}>
                  <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'rgba(0,0,0,0.5)' }} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div ref={contextRef}
            initial={{ opacity: 0, scale: 0.93, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.1 }}
            className="fixed z-[200] bg-white shadow-2xl overflow-hidden border rounded-xl min-w-[150px]"
            style={{ left: Math.min(contextMenu.x, window.innerWidth - 180), top: Math.min(contextMenu.y, window.innerHeight - 100), borderColor: 'rgba(0,0,0,0.08)' }}>
            <button onClick={() => startRename(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-3 text-sm w-full text-left transition-colors hover:bg-black/4"
              style={{ color: FG }}>
              <Pencil className="w-3.5 h-3.5" style={{ color: 'rgba(0,0,0,0.4)' }} /> {t('rename')}
            </button>
            <div style={{ height: 1, background: 'rgba(0,0,0,0.05)' }} />
            <button onClick={() => deleteItem(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 w-full text-left transition-colors hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}