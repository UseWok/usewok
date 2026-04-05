import { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, MoreHorizontal, Trash2, Pencil, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'discussions_v1';

const DEFAULTS = [
  { id: '1', title: 'Agent Global - Première session', preview: 'Comment bien démarrer ?', date: '2026-04-03', model: 'Fast', agent: 'global' },
  { id: '2', title: 'Émotions & Dépenses', preview: 'Analyse de mes habitudes...', date: '2026-04-02', model: 'Pro', agent: 'emotions-depenses' },
  { id: '3', title: 'Stratégie Wealth', preview: 'Plan d\'investissement...', date: '2026-04-01', model: 'Thinking', agent: 'wealth-strategy' },
];

function getDiscussions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULTS; }
  catch { return DEFAULTS; }
}
function saveDiscussions(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

export default function RecentApps({ agentId }) {
  const [discussions, setDiscussions] = useState(getDiscussions);
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const contextRef = useRef(null);
  const navigate = useNavigate();

  // Filter by agent if one is selected
  const filtered = discussions.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) || d.preview.toLowerCase().includes(search.toLowerCase());
    const matchAgent = agentId ? (d.agent === agentId) : true;
    return matchSearch && matchAgent;
  }).slice(0, 3);

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="max-w-2xl mx-auto mt-8 px-4 pb-8"
    >
      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">
            {agentId ? `Discussions — ${agentId}` : 'Discussions récentes'}
          </p>
          <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Voir tout <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-foreground/4 rounded-lg px-3 py-1.5 mb-3">
          <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          {filtered.length === 0 && <p className="text-center text-xs text-muted-foreground py-3">Aucune discussion trouvée</p>}
          {filtered.map(disc => (
            <motion.div
              key={disc.id}
              layout
              onClick={() => handleOpen(disc)}
              onContextMenu={(e) => openCtx(e, disc.id)}
              className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-foreground/4 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-foreground/6 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-foreground/40" />
              </div>
              <div className="flex-1 min-w-0">
                {renaming === disc.id ? (
                  <input
                    autoFocus value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => confirmRename(disc.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(disc.id); if (e.key === 'Escape') setRenaming(null); }}
                    className="w-full text-xs font-medium bg-muted rounded px-1 focus:outline-none border border-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="text-xs font-medium text-foreground truncate">{disc.title}</p>
                )}
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{disc.preview}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[9px] text-muted-foreground/50">{disc.date}</span>
                <button
                  onClick={(e) => openCtx(e, disc.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center hover:bg-foreground/8"
                >
                  <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.08 }}
            className="fixed z-[200] bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button onClick={() => startRename(contextMenu.id)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-foreground/5 w-full text-left text-foreground/80">
              <Pencil className="w-3.5 h-3.5" /> Renommer
            </button>
            <button onClick={() => deleteItem(contextMenu.id)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-destructive/5 text-destructive w-full text-left">
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}