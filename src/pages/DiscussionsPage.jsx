import { useState, useEffect } from 'react';
import { Search, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useDiscussions, useDeleteDiscussion } from '@/lib/useDiscussions';
import { purgeOldFreeDiscussions } from '@/lib/discussions';
import { getUserPlan } from '@/lib/plans-config';

const FG = '#0A0A0A';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString('en', { day: 'numeric', month: 'short' });
}

export default function DiscussionsPage() {
  const { data: discussions = [], isLoading } = useDiscussions();
  const deleteDiscussion = useDeleteDiscussion();
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => {
      const plan = getUserPlan(u);
      if (!plan || plan.price_monthly === 0) purgeOldFreeDiscussions();
    }).catch(() => {});
  }, []);

  const filtered = discussions.filter(d =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.preview?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (disc) => {
    const params = new URLSearchParams({ conversationId: disc.id });
    if (disc.agent) params.set('agent', disc.agent);
    navigate(`/chat?${params.toString()}`);
  };

  return (
    <div className="min-h-screen font-open" style={{ background: 'white' }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black mb-1" style={{ color: FG }}>All conversations</h1>
            <p className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>{discussions.length} conversation{discussions.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/chat')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-black rounded-xl transition-all hover:opacity-90"
            style={{ background: FG, color: 'white' }}>
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 mb-8 rounded-xl border"
          style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.07)' }}>
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(0,0,0,0.2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 text-sm bg-transparent focus:outline-none" style={{ color: FG }} />
          {search && <button onClick={() => setSearch('')} className="text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>✕</button>}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'rgba(0,0,0,0.04)' }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-bold mb-1" style={{ color: 'rgba(0,0,0,0.25)' }}>
              {search ? 'No results' : 'No conversations yet'}
            </p>
            {!search && (
              <button onClick={() => navigate('/chat')}
                className="mt-4 px-5 py-2 text-sm font-black rounded-xl transition-all hover:opacity-90"
                style={{ background: FG, color: 'white' }}>Start a conversation →</button>
            )}
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {filtered.map((disc, i) => (
                <motion.div key={disc.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.03 }}
                  onMouseEnter={() => setHovered(disc.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleOpen(disc)}
                  className="relative p-4 bg-white border rounded-xl cursor-pointer transition-all"
                  style={{
                    borderColor: hovered === disc.id ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.07)',
                    boxShadow: hovered === disc.id ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                    minHeight: '90px',
                  }}>
                  <p className="text-xs font-bold leading-snug line-clamp-2 mb-2" style={{ color: FG }}>
                    {disc.title || 'Untitled'}
                  </p>
                  <p className="text-[10px]" style={{ color: 'rgba(0,0,0,0.25)' }}>{formatDate(disc.date)}</p>

                  {hovered === disc.id && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteDiscussion.mutate(disc.id); }}
                      className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                      style={{ background: 'rgba(0,0,0,0.04)' }}>
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}