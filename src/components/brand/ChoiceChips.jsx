const INK = '#1A1A1A';
const BORDER = '#E5E7EB';
const VIOLET = '#7B4FE0';

// Sélecteur à choix multiple — plusieurs pastilles cliquables (toggle on/off).
export function MultiChoiceChips({ selected = [], onChange, options = [] }) {
  const toggle = (code) => {
    if (selected.includes(code)) onChange(selected.filter(c => c !== code));
    else onChange([...selected, code]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const label = typeof opt === 'string' ? opt : opt.label;
        const code = typeof opt === 'string' ? opt : opt.code;
        const active = selected.includes(code);
        return (
          <button key={code} onClick={() => toggle(code)}
            style={{
              padding: '9px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 120ms',
              background: active ? VIOLET : '#fff',
              color: active ? '#fff' : INK,
              border: `1px solid ${active ? VIOLET : BORDER}`,
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = VIOLET; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = BORDER; }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Sélecteur à choix unique — réponses pré-faites cliquables (pastilles).
export default function ChoiceChips({ value, onChange, options = [] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button key={opt} onClick={() => onChange(active ? '' : opt)}
            style={{
              padding: '9px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 120ms',
              background: active ? VIOLET : '#fff',
              color: active ? '#fff' : INK,
              border: `1px solid ${active ? VIOLET : BORDER}`,
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = VIOLET; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = BORDER; }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}