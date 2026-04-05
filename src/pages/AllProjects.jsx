import { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, Trash2, Pencil, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'discussions_v1';

const DEFAULTS = [
  { id: '1', title: 'Agent Universelle - Première session', preview: 'Comment créer un agent IA personnalisé ?', date: '2026-04-03', model: 'Fast' },
  { id: '2', title: 'Coach Finance - Budget mensuel', preview: 'Analyse de mes dépenses de mars...', date: '2026-04-02', model: 'Pro' },
  { id: '3', title: 'Projet CRM personnalisé', preview: 'Crée une application CRM pour mon équipe', date: '2026-04-01', model: 'Thinking' },
];

function getDiscussions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULTS;
  } catch { return DEFAULTS; }
}

function saveDiscussions(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

const modelColor = (m) => {
  if (m === 'Ultimate') return 'bg-purple-100 text-purple-700';
  if (m === 'Pro') return 'bg-blue-100 text-blue-700';
  if (m === 'Thinking') return 'bg-orange-100 text-orange-700';
  return 'bg-green-100 text-green-700';
};

export default function AllProjects() {
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState(getDiscussions);
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const contextRef = useRef(null);

  const filtered = discussions.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) || d.preview.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => { if (contextRef.current && !contextRef.current.contains(e.target)) setContextMenu(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCtx = (e, id) => { e.preventDefault(); setContextMenu({ id, x: e.clientX, y: e.clientY }); };
  const deleteItem = (id) => { const u = discussions.filter(d => d.id !== id); setDiscussions(u); saveDiscussions(u); setContextMenu(null); };
  const startRename = (id) => { const d = discussions.find(d => d.id === id); setRenameValue(d?.title || ''); setRenaming(id); setContextMenu(null); };
  const confirmRename = (id) => { const u = discussions.map(d => d.id === id ? { ...d, title: renameValue } : d); setDiscussions(u); saveDiscussions(u); setRenaming(null); };

  return (
    <div className="min-h-screen py-12 px-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-1">Toutes mes discussions</h1>
        <p className="text-sm text-muted-foreground mb-6">{discussions.length} discussion{discussions.length > 1 ? 's' : ''}</p>

        {/* Search */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 mb-6 shadow-sm">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une discussion..."
            className="flex-1 text-sm bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((disc) => (
            <motion.div
              key={disc.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              onContextMenu={(e) => openCtx(e, disc.id)}
              onClick={() => navigate(`/chat?conversationId=${disc.id}${disc.agent ? '&agent=' + disc.agent : ''}${disc.model ? '&mode=' + disc.model.toLowerCase() : ''}`)}
              className="group bg-card rounded-2xl p-4 border border-border hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4.5 h-4.5 text-primary" />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openCtx(e, disc.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"
                >
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {renaming === disc.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => confirmRename(disc.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(disc.id); if (e.key === 'Escape') setRenaming(null); }}
                  className="w-full text-sm font-semibold bg-muted rounded px-2 py-0.5 focus:outline-none border border-primary mb-1"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">{disc.title}</p>
              )}
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{disc.preview}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${modelColor(disc.model)}`}>{disc.model}</span>
                <span className="text-[10px] text-muted-foreground/60">{disc.date}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">Aucune discussion trouvée</div>
        )}
      </motion.div>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="fixed z-[200] bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button onClick={() => startRename(contextMenu.id)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left">
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Renommer
            </button>
            <button onClick={() => deleteItem(contextMenu.id)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-red-50 text-destructive transition-colors w-full text-left">
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}