import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, MessageSquare, Trash2 } from 'lucide-react';

const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#6B6660';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.09)';
const SURFACE = '#F8F7F4';
const CORAL = '#FF5A1F';

const RATING_META = {
  bad:   { emoji: '👎', label: 'Bad',   color: '#EF4444', bg: 'rgba(239,68,68,0.10)' },
  okay:  { emoji: '😐', label: 'Okay',  color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
  good:  { emoji: '😊', label: 'Good',  color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  great: { emoji: '🤩', label: 'Great', color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
};
const RATING_ORDER = ['great', 'good', 'okay', 'bad'];

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    base44.entities.Feedback.list('-created_date', 500)
      .then(f => { setFeedback(f || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const counts = RATING_ORDER.reduce((acc, k) => {
    acc[k] = feedback.filter(f => f.rating === k).length;
    return acc;
  }, {});

  const avgScore = (() => {
    if (!feedback.length) return null;
    const map = { bad: 1, okay: 2, good: 3, great: 4 };
    const sum = feedback.reduce((a, f) => a + (map[f.rating] || 0), 0);
    return (sum / feedback.length).toFixed(1);
  })();

  const filtered = feedback.filter(f => {
    if (filter !== 'all' && f.rating !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (f.message || '').toLowerCase().includes(q) ||
             (f.user_email || '').toLowerCase().includes(q) ||
             (f.user_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    await base44.entities.Feedback.delete(id);
    setFeedback(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div style={{ padding: '32px 28px', fontFamily: F, maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Feedback</h1>
        <p style={{ fontSize: 13, color: INK2, margin: 0 }}>All user feedback and ratings in one place.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: INK3, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: INK, margin: 0 }}>{feedback.length}</p>
        </div>
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: INK3, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg score</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: CORAL, margin: 0 }}>{avgScore || '–'}<span style={{ fontSize: 13, color: INK3, fontWeight: 500 }}>/4</span></p>
        </div>
        {RATING_ORDER.map(k => {
          const m = RATING_META[k];
          return (
            <div key={k} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: INK3, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.emoji} {m.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: m.color, margin: 0 }}>{counts[k] || 0}</p>
            </div>
          );
        })}
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter('all')}
          style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 7, border: 'none', cursor: 'pointer', background: filter === 'all' ? INK : '#fff', color: filter === 'all' ? '#fff' : INK2, border: `1px solid ${filter === 'all' ? INK : BORDER}` }}>
          All ({feedback.length})
        </button>
        {RATING_ORDER.map(k => {
          const m = RATING_META[k];
          const isActive = filter === k;
          return (
            <button key={k} onClick={() => setFilter(k)}
              style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: 'pointer', background: isActive ? INK : '#fff', color: isActive ? '#fff' : INK2, border: `1px solid ${isActive ? INK : BORDER}` }}>
              {m.emoji} {m.label} ({counts[k] || 0})
            </button>
          );
        })}
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={13} color={INK3} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by message or user…"
            style={{ width: '100%', padding: '7px 12px 7px 30px', fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 7, outline: 'none', fontFamily: F, color: INK, background: '#fff', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 22, height: 22, border: '2px solid #E5E5E0', borderTopColor: CORAL, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, gap: 12, border: `1px solid ${BORDER}`, borderRadius: 12, background: '#fff' }}>
          <MessageSquare size={28} color="#CCC" />
          <p style={{ fontSize: 13, color: INK3, margin: 0 }}>No feedback yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(f => {
            const m = RATING_META[f.rating] || RATING_META.okay;
            return (
              <div key={f.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {m.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.color, padding: '2px 8px', borderRadius: 5, background: m.bg }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: INK3 }}>{new Date(f.created_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {f.message ? (
                    <p style={{ fontSize: 13, color: INK, margin: '0 0 6px', lineHeight: 1.55, overflowWrap: 'anywhere' }}>{f.message}</p>
                  ) : (
                    <p style={{ fontSize: 12, color: INK3, margin: '0 0 6px', fontStyle: 'italic' }}>No message</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: INK2, fontWeight: 500 }}>{f.user_name || 'Unknown'}</span>
                    {f.user_email && <span style={{ fontSize: 11, color: INK3 }}>· {f.user_email}</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(f.id)}
                  style={{ width: 28, height: 28, borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK3, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color = INK3}>
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}