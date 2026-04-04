import { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, MoreHorizontal, Trash2, Pencil, ChevronRight } from 'lucide-react';
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
  } catch {
    return DEFAULTS;
  }
}

function saveDiscussions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function RecentApps() {
  const [discussions, setDiscussions] = useState(getDiscussions);
  const [search, setSearch] = useState('');
  const [contextMenu, setContextMenu] = useState(null); // { id, x, y }
  const [renaming, setRenaming] = useState(null); // id
  const [renameValue, setRenameValue] = useState('');
  const contextRef = useRef(null);
  const navigate = useNavigate();

  const filtered = discussions.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.preview.toLowerCase().includes(search.toLowerCase())
  );

  const displayed = filtered.slice(0, 3);

  useEffect(() => {
    const handleClick = (e) => {
      if (contextRef.current && !contextRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openContextMenu = (e, id) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  const deleteItem = (id) => {
    const updated = discussions.filter(d => d.id !== id);
    setDiscussions(updated);
    saveDiscussions(updated);
    setContextMenu(null);
  };

  const startRename = (id) => {
    const disc = discussions.find(d => d.id === id);
    setRenameValue(disc?.title || '');
    setRenaming(id);
    setContextMenu(null);
  };

  const confirmRename = (id) => {
    const updated = discussions.map(d => d.id === id ? { ...d, title: renameValue } : d);
    setDiscussions(updated);
    saveDiscussions(updated);
    setRenaming(null);
  };

  const modelColor = (m) => {
    if (m === 'Ultimate') return 'bg-purple-100 text-purple-700';
    if (m === 'Pro') return 'bg-blue-100 text-blue-700';
    if (m === 'Thinking') return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="max-w-3xl mx-auto mt-10 px-4"
    >
      <div className="rounded-2xl bg-gradient-to-b from-orange-50 to-orange-100/30 border border-orange-200/40 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">Discussions récentes</p>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 mb-4">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une discussion..."
            className="flex-1 text-xs bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Discussions list */}
        <div className="flex flex-col gap-2">
          {displayed.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-4">Aucune discussion trouvée</p>
          )}
          {displayed.map((disc) => (
            <motion.div
              key={disc.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onContextMenu={(e) => openContextMenu(e, disc.id)}
              onTouchStart={(e) => {
                const timer = setTimeout(() => openContextMenu({ preventDefault: () => {}, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }, disc.id), 600);
                e.currentTarget._longpress = timer;
              }}
              onTouchEnd={(e) => clearTimeout(e.currentTarget._longpress)}
              className="group bg-card rounded-xl p-3.5 border border-border hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  {renaming === disc.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => confirmRename(disc.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(disc.id); if (e.key === 'Escape') setRenaming(null); }}
                      className="w-full text-sm font-medium bg-muted rounded px-2 py-0.5 focus:outline-none border border-primary"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{disc.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{disc.preview}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${modelColor(disc.model)}`}>{disc.model}</span>
                    <span className="text-[10px] text-muted-foreground/60">{disc.date}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openContextMenu(e, disc.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center flex-shrink-0"
                >
                  <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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
            <button
              onClick={() => startRename(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors w-full text-left"
            >
              <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Renommer
            </button>
            <button
              onClick={() => deleteItem(contextMenu.id)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-red-50 text-destructive transition-colors w-full text-left"
            >
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}