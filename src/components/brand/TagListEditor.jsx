import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

const INK = '#1A1A1A';
const INK3 = '#8A8A93';
const BORDER = '#E5E7EB';
const VIOLET = '#7B4FE0';
const PILL_BG = '#F3F0FB';
const PILL_TEXT = '#4C1D95';

// Affichage lecture seule — plafonné à `max` pastilles, avec indicateur "+N".
export function PillList({ items = [], max = 8 }) {
  if (!items || items.length === 0) return <span style={{ color: INK3, fontSize: 13 }}>—</span>;
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {shown.map((it, i) => (
        <span key={i} style={{ display: 'inline-block', padding: '5px 12px', background: PILL_BG, color: PILL_TEXT, borderRadius: 999, fontSize: 12.5, fontWeight: 500, maxWidth: '100%' }}>
          {it}
        </span>
      ))}
      {extra > 0 && (
        <span style={{ display: 'inline-block', padding: '5px 12px', background: '#F3F4F6', color: INK3, borderRadius: 999, fontSize: 12.5, fontWeight: 600 }}>+{extra}</span>
      )}
    </div>
  );
}

// Éditeur de pastilles : options pré-faites cliquables + ajout libre. Plafonné à `max`.
export default function TagListEditor({ items = [], onChange, placeholder = 'Ajouter…', max = 5, chipOptions = [] }) {
  const [draft, setDraft] = useState('');
  const full = items.length >= max;

  const toggle = (v) => {
    if (items.includes(v)) { onChange(items.filter(x => x !== v)); return; }
    if (full) return;
    onChange([...items, v]);
  };
  const add = () => {
    const v = draft.trim();
    if (!v || full || items.includes(v)) { setDraft(''); return; }
    onChange([...items, v]);
    setDraft('');
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));

  // Options pré-faites pas encore sélectionnées
  const available = chipOptions.filter(o => !items.includes(o));

  return (
    <div>
      {/* Pastilles sélectionnées */}
      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {items.map((it, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 8px 6px 13px', background: PILL_BG, color: PILL_TEXT, borderRadius: 999, fontSize: 12.5, fontWeight: 500, maxWidth: '100%' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>{it}</span>
              <button onClick={() => remove(i)} title="Retirer"
                style={{ display: 'flex', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: PILL_TEXT, flexShrink: 0, opacity: 0.55 }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggestions pré-faites à cliquer */}
      {available.length > 0 && !full && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {available.map((o) => (
            <button key={o} onClick={() => toggle(o)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#fff', color: INK, border: `1px solid ${BORDER}`, borderRadius: 999, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = VIOLET; e.currentTarget.style.color = VIOLET; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = INK; }}>
              <Plus size={12} /> {o}
            </button>
          ))}
        </div>
      )}

      {/* Ajout libre */}
      {full ? (
        <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Maximum {max} éléments — retirez-en un pour en ajouter un autre.</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder={placeholder}
            style={{ flex: 1, boxSizing: 'border-box', padding: '9px 12px', fontSize: 13, color: INK, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.currentTarget.style.borderColor = VIOLET}
            onBlur={e => e.currentTarget.style.borderColor = BORDER} />
          <button onClick={add}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 14px', fontSize: 13, fontWeight: 600, color: '#fff', background: VIOLET, border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <Plus size={13} /> Ajouter
          </button>
        </div>
      )}
    </div>
  );
}