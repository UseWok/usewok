import { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, MoreHorizontal, Trash2, Pencil, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useDiscussions, useDeleteDiscussion, useRenameDiscussion } from '@/lib/useDiscussions';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/8 rounded-md animate-pulse">
      <div className="w-10 h-10 rounded-md bg-black/8 dark:bg-white/8 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-black/8 dark:bg-white/8 rounded-sm w-3/4" />
        <div className="h-2.5 bg-black/5 dark:bg-white/5 rounded-sm w-1/2" />
      </div>
      <div className="h-2.5 bg-black/5 dark:bg-white/5 rounded-sm w-10 flex-shrink-0" />
    </div>
  );
}

function EmptyState({ onNewChat }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
    >
      <div className="w-14 h-14 flex items-center justify-center bg-yuzu rounded-xl mb-4">
        <Sparkles className="w-6 h-6 text-fg" />
      </div>
      <p className="text-sm font-black text-fg dark:text-white mb-1">Start your financial journey</p>
      <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mb-5">
        Ask anything about saving, investing, budgeting or getting out of debt. Your coach is ready.
      </p>
      <button onClick={onNewChat}
        className="flex items-center gap-2 px-4 py-2.5 bg-fg dark:bg-yuzu text-white dark:text-fg text-sm font-bold rounded-md hover:opacity-90 transition-opacity">
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
  }).slice(0, 3);

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

  // Show skeleton while loading
  if (isLoading) {
    return (
      <section className="max-w-2xl mx-auto mt-8 px-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-32 bg-black/8 dark:bg-white/8 rounded-sm animate-pulse" />
          <div className="h-3 w-12 bg-black/5 dark:bg-white/5 rounded-sm animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
        </div>
      </section>
    );
  }

  // Empty state — no discussions at all
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('recent_discussions')}</h2>
        <button onClick={() => navigate('/discussions')}
          className="flex items-center gap-1 text-xs font-semibold text-fg dark:text-white transition-opacity hover:opacity-60">
          {t('see_all')} <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-black/4 dark:bg-white/5 border border-black/6 dark:border-white/8 rounded-md">
        <Search className="w-3.5 h-3.5 flex-shrink-0 text-zinc-300 dark:text-zinc-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          className="flex-1 text-xs bg-transparent focus:outline-none text-fg dark:text-white placeholder:text-zinc-400" />
        {search && (
          <button onClick={() => setSearch('')} className="text-zinc-300 hover:text-fg transition-colors text-xs">✕</button>
        )}
      </div>

      {/* Discussion list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center py-8 text-center">
            <p className="text-sm font-semibold text-zinc-400 mb-1">No results</p>
            <p className="text-xs text-zinc-300">Try a different search term</p>
          </motion.div>
        )}
        {filtered.map((disc, i) => (
          <motion.div key={disc.id} layout
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => handleOpen(disc)}
            onContextMenu={e => openCtx(e, disc.id)}
            className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-black/8 dark:border-white/8 rounded-xl cursor-pointer transition-all hover:border-fg dark:hover:border-yuzu hover:shadow-md active:scale-[0.99]">

            <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 bg-black/5 dark:bg-white/8 rounded-md">
              <MessageSquare className="w-4 h-4 text-fg dark:text-white" />
            </div>

            <div className="flex-1 min-w-0">
              {renaming === disc.id ? (
                <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => confirmRename(disc.id)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmRename(disc.id); if (e.key === 'Escape') setRenaming(null); }}
                  className="w-full text-sm font-semibold bg-transparent focus:outline-none border-b border-fg dark:border-white text-fg dark:text-white"
                  onClick={e => e.stopPropagation()} />
              ) : (
                <p className="text-sm font-semibold truncate text-fg dark:text-white">{disc.title}</p>
              )}
              <p className="text-xs truncate mt-0.5 text-zinc-400">{disc.preview}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-zinc-300 dark:text-zinc-600 hidden sm:block">{formatDate(disc.date)}</span>
              <button
                onClick={e => openCtx(e, disc.id)}
                className="w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-black/5 dark:bg-white/8 rounded-md"
                aria-label="Options">
                <MoreHorizontal className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div ref={contextRef}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.08 }}
            className="fixed z-[200] bg-white dark:bg-zinc-900 shadow-xl overflow-hidden border border-black/10 dark:border-white/10 min-w-40 rounded-md"
            style={{ left: Math.min(contextMenu.x, window.innerWidth - 180), top: Math.min(contextMenu.y, window.innerHeight - 100) }}>
            <button onClick={() => startRename(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm w-full text-left text-fg dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <Pencil className="w-3.5 h-3.5 text-zinc-400" /> {t('rename')}
            </button>
            <button onClick={() => deleteItem(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}