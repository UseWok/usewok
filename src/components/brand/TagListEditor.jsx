import { useState } from 'react';
import { X } from 'lucide-react';

const INK = '#1A1A1A';
const INK3 = '#8A8A93';
const BORDER = '#E3DFD6';
const CHIP_BG = '#F3EFE6';

// Editable list of text chips (keywords, use cases, questions, objections…).
export default function TagListEditor({ items = [], onChange, placeholder = 'Add an item…', addLabel }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (!v) return;
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
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px 4px 10px', background: CHIP_BG, border: `1px solid ${BORDER}`, borderRadius: 999, fontSize: 12, color: INK, maxWidth: '100%' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>{it}</span>
              <button onClick={() => remove(i)} title="Remove"
                style={{ display: 'flex', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: INK3, flexShrink: 0 }}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{ flex: 1, boxSizing: 'border-box', padding: '9px 12px', fontSize: 13, color: INK, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, outline: 'none', fontFamily: 'inherit' }}
          onFocus={e => e.currentTarget.style.borderColor = '#B8B2A5'}
          onBlur={e => e.currentTarget.style.borderColor = BORDER} />
        <button onClick={add}
          style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, color: INK, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9, cursor: 'pointer', whiteSpace: 'nowrap' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F1E8'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          {addLabel || 'Add'}
        </button>
      </div>
    </div>
  );
}