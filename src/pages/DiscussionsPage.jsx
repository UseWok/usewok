import { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Trash2, Pencil, Sparkles, X, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getDiscussions, saveDiscussions, loadDiscussionsFromCloud } from '@/lib/discussions';
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
  const [discussions, setDiscussions] = useState([]);
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
    base44.auth.me().then(u => { setUser(u); setUserPlan(getUserPlan(u)); }).catch(() => {});
    const local = getDiscussions();
    setDiscussions(local);
    loadDiscussionsFromCloud().then(cloudDiscs => {
      if (!cloudDiscs?.length) return;
      const localIds = new Set(local.map(d => d.id));
      const merged = [...local];
      cloudDiscs.forEach(c => {
        if (!localIds.has(c.conv_id)) {
          merged.push({ id: c.conv_id, title: c.title || 'Discussion', preview: c.preview || '', date: c.updated_date?.slice(0, 10) || '', updatedAt: new Date(c.updated_date || Date.now()).getTime(), model: c.model, agent: c.agent });
        }
      });
      merged.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setDiscussions(merged.slice(0, 100));
      saveDiscussions(merged.slice(0, 100));
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

  const deleteItem = (id) => { const u = discussions.filter(d => d.id !== id); setDiscussions(u); saveDiscussions(u); setContextMenu(null); };
  const startRename = (id) => { const d = discussions.find(d => d.id === id); setRenameValue(d?.title || ''); setRenaming(id); setContextMenu(null); };
  const confirmRename = (id) => { const u = discussions.map(d => d.id === id ? { ...d, title: renameValue } : d); setDiscussions(u); saveDiscussions(u); setRenaming(null); };

  const handleOpen = (disc) => {
    const params = new URLSearchParams({ conversationId: disc.id });
    if (disc.agent) params.set('agent', disc.agent);
    navigate(`/chat?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black" style={{ color: FG }}>Discussions</h1>
          <p className="text-sm mt-1" style={{ color: '#aaa' }}>{discussions.length} conversation{discussions.length !== 1 ? 's' : ''} saved</p>
        </div>

        {/* AI Search */}
        <div className="mb-6 p-4 border" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px', background: 'white' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '3px' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: FG }} />
            </div>
            <p className="text-xs font-black" style={{ color: FG }}>AI Search</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 ml-auto" style={{ background: 'rgba(0,0,0,0.06)', color: '#777', borderRadius: '3px' }}>0.3T per search</span>
          </div>
          <p className="text-[11px] mb-3" style={{ color: '#bbb' }}>Describe a theme or topic — the AI finds matching discussions.</p>
          <div className="flex gap-2">
            <input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAiSearch(); }}
              placeholder="E.g. real estate investment, monthly budget..."
              className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
              style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', color: FG }}
            />
            <button
              onClick={handleAiSearch}
              disabled={!aiQuery.trim() || aiLoading}
              className="px-4 py-2.5 text-sm font-black transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background: FG, color: 'white', borderRadius: '4px' }}>
              {aiLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: YUZU }} />
                  Searching...
                </>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Search</>
              )}
            </button>
            {aiResults !== null && (
              <button onClick={clearAiSearch} className="px-3 py-2.5 transition-all hover:bg-black/5" style={{ borderRadius: '4px' }}>
                <X className="w-4 h-4" style={{ color: '#aaa' }} />
              </button>
            )}
          </div>
          {aiError && (
            <div className="flex items-center gap-2 mt-3 px-3 py-2" style={{ background: 'rgba(239,68,68,0.06)', borderRadius: '4px' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ef4444' }} />
              <p className="text-xs" style={{ color: '#ef4444' }}>{aiError.replace('Aucune discussion trouvée pour ce thème.', 'No discussions found for this topic.').replace('Erreur lors de la recherche. Réessayez.', 'Search error. Please try again.')}</p>
            </div>
          )}
          {aiResults !== null && aiResults.length > 0 && (
            <p className="text-xs mt-2" style={{ color: '#16a34a' }}>✓ {aiResults.length} discussion{aiResults.length > 1 ? 's' : ''} found</p>
          )}
        </div>

        {/* Regular search */}
        {aiResults === null && (
          <div className="flex items-center gap-2 px-3 py-2.5 mb-4"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '4px' }}>
            <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ccc' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or content..."
              className="flex-1 text-sm bg-transparent focus:outline-none"
              style={{ color: FG }} />
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 && !aiLoading && (
            <div className="text-center py-12">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: FG }} />
              <p className="text-sm" style={{ color: '#ccc' }}>No discussions found</p>
            </div>
          )}
          <AnimatePresence>
            {filtered.map((disc, i) => (
              <motion.div key={disc.id} layout
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleOpen(disc)}
                onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ id: disc.id, x: e.clientX, y: e.clientY }); }}
                className="group flex items-center gap-4 p-4 bg-white cursor-pointer transition-all"
                style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: '4px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = FG; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
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