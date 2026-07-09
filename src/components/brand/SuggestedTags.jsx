import { Plus, Sparkles } from 'lucide-react';

const VIOLET = '#7B4FE0';
const INK3 = '#6B7280';

// AI-suggested clickable chips. Click one to add it to the list.
// `suggestions` come from the AI draft; already-added ones are hidden.
export default function SuggestedTags({ suggestions = [], current = [], onAdd, max = 5 }) {
  const available = suggestions.filter(s => s && !current.includes(s));
  if (available.length === 0) return null;
  const full = current.length >= max;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
        <Sparkles size={12} color={VIOLET} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: INK3 }}>Suggested for you — tap to add</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {available.map((s, i) => (
          <button key={i} onClick={() => !full && onAdd(s)} disabled={full}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
              background: '#fff', color: VIOLET, border: `1px dashed ${VIOLET}`,
              borderRadius: 999, fontSize: 12.5, fontWeight: 500, cursor: full ? 'default' : 'pointer',
              opacity: full ? 0.4 : 1, fontFamily: 'inherit', transition: 'background 120ms',
            }}
            onMouseEnter={e => { if (!full) e.currentTarget.style.background = '#F5F0FF'; }}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            <Plus size={11} /> {s}
          </button>
        ))}
      </div>
    </div>
  );
}