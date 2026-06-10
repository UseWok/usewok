import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadDiscussionsFromCloud } from '@/lib/chat-storage';
import { saveDiscussions } from '@/lib/discussions';
import BuildCard from '../components/BuildCard';

export default function AllProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.auth.me().catch(() => null),
      loadDiscussionsFromCloud().catch(() => []),
    ]).then(([u, discs]) => {
      setUser(u);
      setProjects(discs);
      setLoading(false);
    });
  }, []);

  const filtered = projects.filter(d =>
    (d.title || d.ai_title || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.preview || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    const updated = projects.filter(d => d.id !== id);
    setProjects(updated);
  };

  const handleRename = (id, newTitle) => {
    const updated = projects.map(d => d.id === id ? { ...d, ai_title: newTitle, title: newTitle } : d);
    setProjects(updated);
    // Persist to Conversation entity
    const conv = projects.find(d => d.id === id);
    if (conv?.conv_id) {
      base44.entities.Conversation.filter({ conv_id: conv.conv_id }).then(r => {
        if (r[0]) base44.entities.Conversation.update(r[0].id, { title: newTitle });
      }).catch(() => {});
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0E', fontFamily: 'Inter, system-ui, sans-serif', color: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>All Projects</h1>
            <p style={{ fontSize: 13, color: '#555', margin: '4px 0 0' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/chat')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: '#fff', color: '#111', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> New project
          </button>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#161618', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', marginBottom: 28 }}>
          <Search size={15} color="#555" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#fff', fontFamily: 'Inter, sans-serif' }}
            className="placeholder:text-[#444]" />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden', background: '#161618', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ paddingTop: '56.25%', background: '#1E1E1E', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #1E1E1E 25%, #242424 50%, #1E1E1E 75%)', backgroundSize: '400% 100%', animation: 'shimmer 1.6s ease-in-out infinite' }} />
                </div>
                <div style={{ padding: '12px 14px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#2A2A2A', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, width: '70%', background: '#2A2A2A', borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ height: 9, width: '45%', background: '#222', borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>
            <p style={{ fontSize: 15 }}>{search ? 'No results found' : 'No projects yet. Start building!'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {filtered.map(p => (
              <BuildCard
                key={p.id}
                conv={p}
                user={user}
                onClick={() => navigate(`/chat?conversationId=${p.id}`)}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:-400% 0} 100%{background-position:400% 0} }`}</style>
    </div>
  );
}