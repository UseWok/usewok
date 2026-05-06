import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDiscussions } from '@/lib/useDiscussions';

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

export default function RecentApps({ agentId }) {
  const { data: discussions = [], isLoading } = useDiscussions();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = discussions.filter(d => {
    const matchSearch = !search || d.title?.toLowerCase().includes(search.toLowerCase());
    const matchAgent = agentId ? d.agent === agentId : true;
    return matchSearch && matchAgent;
  });

  const handleOpen = (disc) => {
    const params = new URLSearchParams({ conversationId: disc.id });
    if (disc.agent) params.set('agent', disc.agent);
    navigate(`/chat?${params.toString()}`);
  };

  return (
    <section className="max-w-3xl mx-auto px-6 pb-12 mt-10">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-black" style={{ color: FG }}>Recent conversations</h2>
          <button onClick={() => navigate('/discussions')}
            className="text-xs font-semibold transition-opacity hover:opacity-60"
            style={{ color: 'rgba(0,0,0,0.3)' }}>View all →</button>
        </div>
        <button onClick={() => navigate('/chat')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-lg transition-all hover:opacity-90"
          style={{ background: FG, color: 'white' }}>
          <Plus className="w-3.5 h-3.5" /> New chat
        </button>
      </div>

      {/* Search */}
      {discussions.length > 3 && (
        <div className="flex items-center gap-2 px-3 py-2 mb-5 rounded-lg border"
          style={{ background: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.07)' }}>
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(0,0,0,0.2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 text-xs bg-transparent focus:outline-none" style={{ color: FG }} />
          {search && <button onClick={() => setSearch('')} className="text-[10px]" style={{ color: 'rgba(0,0,0,0.3)' }}>✕</button>}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-24 bg-black/4 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-14 text-center">
          <p className="text-sm font-bold mb-1" style={{ color: 'rgba(0,0,0,0.25)' }}>No conversations yet</p>
          <p className="text-xs mb-4" style={{ color: 'rgba(0,0,0,0.18)' }}>Ask your first financial question</p>
          <button onClick={() => navigate('/chat')}
            className="px-4 py-2 text-xs font-black rounded-lg transition-all hover:opacity-90"
            style={{ background: FG, color: 'white' }}>Start →</button>
        </motion.div>
      )}

      {/* Cards grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.slice(0, 9).map((disc, i) => (
            <motion.button key={disc.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleOpen(disc)}
              className="text-left p-4 bg-white border rounded-xl transition-all hover:shadow-md hover:border-black/20 group"
              style={{ borderColor: 'rgba(0,0,0,0.07)', minHeight: '80px' }}>
              <p className="text-xs font-bold leading-snug line-clamp-2 mb-2" style={{ color: FG }}>{disc.title || 'Untitled'}</p>
              <p className="text-[10px]" style={{ color: 'rgba(0,0,0,0.25)' }}>{formatDate(disc.date)}</p>
            </motion.button>
          ))}
        </div>
      )}
    </section>
  );
}