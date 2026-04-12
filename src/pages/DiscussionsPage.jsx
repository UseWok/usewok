import { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Trash2, Pencil, Sparkles, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useDiscussions, useDeleteDiscussion, useRenameDiscussion } from '@/lib/useDiscussions';
import { getUserPlan } from '@/lib/plans-config';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const AI_SEARCH_COST = 0.3;

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) return `Il y a ${diff}j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function DiscussionsPage() {
  const { data: discussions = [], isLoading } = useDiscussions();
  const deleteDiscussion = useDeleteDiscussion();
  const renameDiscussion = useRenameDiscussion();
  const [search, setSearch] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [renaming, setRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const contextRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => { if (contextRef.current && !contextRef.current.contains(e.target)) setContextMenu(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = aiResults !== null
    ? discussions.filter(d => aiResults.includes(d.id))
    : discussions.filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.preview?.toLowerCase().includes(search.toLowerCase()));

  const handleAiSearch = async () => {
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    setAiResults(null);
    try {
      const corpus = discussions.slice(0, 60).map(d => `ID:${d.id} | Titre: ${d.title} | Aperçu: ${d.preview}`).join('\n');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un moteur de recherche intelligent. Voici une liste de discussions:\n${corpus}\n\nThème recherché: "${aiQuery}"\n\nRetourne UNIQUEMENT un JSON avec les IDs des discussions pertinentes. Format: {"ids":["id1","id2"]}. Si aucune ne correspond, retourne {"ids":[]}.`,
        model: 'gpt_5_mini',
        response_json_schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'string' } } } }
      });
      const ids = result?.ids || [];
      setAiResults(ids);
      if (ids.length === 0) setAiError('Aucune discussion trouvée pour ce thème.');
      // Deduct 0.3T
      if (user) {
        const newUsed = (user.credits_used || 0) + AI_SEARCH_COST;
        await base44.entities.User.update(user.id, { credits_used: newUsed });
        setUser(prev => ({ ...prev, credits_used: newUsed }));
      }
    } catch {
      setAiError('Erreur lors de la recherche. Réessayez.');
    }
    setAiLoading(false);
  };

  const clearAiSearch = () => { setAiResults(null); setAiQuery(''); setAiError(''); };

  const deleteItem = (id) => { deleteDiscussion.mutate(id); setContextMenu(null); };
  const startRename = (id) => { const d = discussions.find(d => d.id === id); setRenameValue(d?.title || ''); setRenaming(id); setContextMenu(null); };
  const confirmRename = (id) => { renameDiscussion.mutate({ discId: id, title: renameValue }); setRenaming(null); };

  const handleOpen = (disc) => {
    const params = new URLSearchParams({ conversationId: disc.id });
    if (disc.agent) params.set('agent', disc.agent);
    navigate(`/chat?${params.toString()}`);
  };

  // Skeleton loaders
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-be">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="mb-8 animate-pulse">
            <div className="h-7 w-40 bg-black/8 rounded-sm mb-2" />
            <div className="h-3 w-24 bg-black/5 rounded-sm" />
          </div>
          <div className="mb-6 p-4 border border-black/8 rounded-md animate-pulse">
            <div className="h-3 w-24 bg-black/8 rounded-sm mb-3" />
            <div className="h-10 bg-black/5 rounded-md" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 border border-black/8 rounded-md animate-pulse">
                <div className="w-9 h-9 bg-black/8 rounded-md flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-black/8 rounded-sm w-3/4" />
                  <div className="h-2.5 bg-black/5 rounded-sm w-1/2" />
                </div>
                <div className="h-2.5 w-10 bg-black/5 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, filter: 'blur(10px)', y: 4 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }} className="mb-10">
          <h1 className="text-3xl font-black mb-1.5" style={{ color: FG }}>Discussions</h1>
          <p className="text-sm" style={{ color: '#aaa' }}>{discussions.length} conversation{discussions.length !== 1 ? 's' : ''} saved</p>
        </motion.div>

        {/* AI Search */}
        <motion.div initial={{ opacity: 0, filter: 'blur(8px)', y: 4 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} transition={{ duration: 0.5, delay: 0.07, ease: [0.22,1,0.36,1] }}
          className="mb-6 p-5 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#DDFF00', filter: 'drop-shadow(0 0 4px #DDFF00)' }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#aaa' }}>AI Search</p>
            {aiResults !== null && (
              <button onClick={clearAiSearch} className="ml-auto flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-sm" style={{ background: 'rgba(0,0,0,0.05)', color: '#aaa' }}>
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAiSearch(); }}
              placeholder="Search by theme, topic, or concept…"
              className="flex-1 text-sm bg-transparent focus:outline-none py-2 px-3 rounded-lg"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)', color: '#0A0A0A' }}
            />
            <button
              onClick={handleAiSearch}
              disabled={aiLoading || !aiQuery.trim()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-black rounded-lg transition-all disabled:opacity-40"
              style={{ background: '#0A0A0A', color: 'white' }}>
              {aiLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              {aiLoading ? 'Searching…' : 'Search'}
            </button>
          </div>
          {aiError && (
            <div className="flex items-center gap-2 mt-3 px-3 py-2" style={{ background: 'rgba(239,68,68,0.06)', borderRadius: '4px' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ef4444' }} />
              <p className="text-xs" style={{ color: '#ef4444' }}>{aiError}</p>
            </div>
          )}
          {aiResults !== null && aiResults.length > 0 && (
            <p className="text-xs mt-2" style={{ color: '#16a34a' }}>✓ {aiResults.length} discussion{aiResults.length > 1 ? 's' : ''} found</p>
          )}
        </motion.div>

        {/* Regular search */}
        {aiResults === null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="flex items-center gap-2 px-4 py-3 mb-4"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px' }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ccc' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or content..."
              className="flex-1 text-sm bg-transparent focus:outline-none"
              style={{ color: FG }} />
          </motion.div>
        )}

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 && !aiLoading && discussions.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 flex items-center justify-center bg-yuzu rounded-xl mb-4">
                <MessageSquare className="w-6 h-6" style={{ color: FG }} />
              </div>
              <p className="text-sm font-black text-fg mb-1">No conversations yet</p>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-5">
                Start a conversation with your AI financial coach and it will appear here.
              </p>
              <button onClick={() => navigate('/chat')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-black text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ background: FG }}>
                Start a conversation
              </button>
            </motion.div>
          )}
          {filtered.length === 0 && !aiLoading && discussions.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-sm font-semibold text-zinc-400 mb-1">No results</p>
              <p className="text-xs text-zinc-300">Try a different search term</p>
            </motion.div>
          )}
          <AnimatePresence>
            {filtered.map((disc, i) => (
              <motion.div key={disc.id} layout
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleOpen(disc)}
                onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ id: disc.id, x: e.clientX, y: e.clientY }); }}
                className="group flex items-center gap-4 p-5 bg-white cursor-pointer transition-all"
                style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = FG; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
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
                  <button onClick={e => { e.stopPropagation(); setContextMenu({ id: disc.id, x: e.clientX, y: e.clientY }); }}
                    className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '3px' }}>
                    <Pencil className="w-3 h-3" style={{ color: '#999' }} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
              style={{ color: FG }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Pencil className="w-3.5 h-3.5" style={{ color: '#aaa' }} /> Rename
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
    </div>
  );
}