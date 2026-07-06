import { useState } from 'react';
import { X, Plus } from 'lucide-react';

const INK = '#1A1A1A';
const INK3 = '#8A8A93';
const BORDER = '#E5E7EB';
const PILL_BG = '#EDE9FE';
const PILL_TEXT = '#4C1D95';

// View-only pill display — capped at `max` pastilles (default 5), with a "+N" indicator.
export function PillList({ items = [], max = 5 }) {
  if (!items || items.length === 0) return <span style={{ color: INK3, fontSize: 13 }}>—</span>;
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {shown.map((it, i) => (
        <span key={i} style={{
          display: 'inline-block', padding: '6px 14px',
          background: PILL_BG, color: PILL_TEXT,
          borderRadius: 999, fontSize: 13, fontWeight: 500,
          maxWidth: '100%',
        }}>
          {it}
        </span>
      ))}
      {extra > 0 && (
        <span style={{ display: 'inline-block', padding: '6px 14px', background: '#F3F4F6', color: INK3, borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
          +{extra}
        </span>
      )}
    </div>
  );
}

// Editable list of text chips (keywords, use cases, questions, objections…). Capped at `max` items.
export default function TagListEditor({ items = [], onChange, placeholder = 'Ajouter…', max = 5 }) {
  const [draft, setDraft] = useState('');
  const full = items.length >= max;

  const add = () => {
    const v = draft.trim();
    if (!v || full) return;
    if (items.includes(v)) { setDraft(''); return; }
    onChange([...items, v]);
    setDraft('');
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div>
      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {items.map((it, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 8px 5px 12px',
              background: PILL_BG, color: PILL_TEXT,
              borderRadius: 999, fontSize: 12.5, fontWeight: 500, maxWidth: '100%',
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>{it}</span>
              <button onClick={() => remove(i)} title="Retirer"
                style={{ display: 'flex', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: PILL_TEXT, flexShrink: 0, opacity: 0.6 }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {full ? (
        <p style={{ fontSize: 12, color: INK3, margin: '4px 0 0' }}>Maximum {max} éléments — retirez-en un pour en ajouter un autre.</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder={placeholder}
            style={{ flex: 1, boxSizing: 'border-box', padding: '8px 12px', fontSize: 13, color: INK, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.currentTarget.style.borderColor = '#C4B5FD'}
            onBlur={e => e.currentTarget.style.borderColor = BORDER} />
          <button onClick={add}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', fontSize: 13, fontWeight: 600, color: PILL_TEXT, background: PILL_BG, border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Plus size={13} /> Ajouter
          </button>
        </div>
      )}
    </div>
  );
}