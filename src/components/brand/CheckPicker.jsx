const INK = '#1A1A1A';
const BORDER = '#E3DFD6';
const VIOLET = '#7B4FE0';

// Multi-select checkbox grid (countries) or pill toggles (languages).
export function CheckGrid({ options, selected = [], onChange, columns = 2 }) {
  const toggle = (code) => {
    onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code]);
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 6 }}>
      {options.map(o => {
        const on = selected.includes(o.code);
        return (
          <button key={o.code} onClick={() => toggle(o.code)}
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', border: `1px solid ${on ? VIOLET : BORDER}`, background: on ? 'rgba(123,79,224,0.06)' : '#fff', borderRadius: 9, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 100ms' }}>
            <span style={{ width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${on ? VIOLET : '#C9C4B8'}`, background: on ? VIOLET : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {on && <svg width="9" height="9" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
            </span>
            {o.flag && <span style={{ fontSize: 15 }}>{o.flag}</span>}
            <span style={{ fontSize: 12.5, color: INK, fontWeight: on ? 600 : 400 }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function PillToggles({ options, selected = [], onChange }) {
  const toggle = (code) => {
    onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map(o => {
        const on = selected.includes(o.code);
        return (
          <button key={o.code} onClick={() => toggle(o.code)}
            style={{ padding: '6px 14px', border: `1px solid ${on ? VIOLET : BORDER}`, background: on ? VIOLET : '#fff', color: on ? '#fff' : INK, borderRadius: 999, cursor: 'pointer', fontSize: 12.5, fontWeight: on ? 600 : 400, fontFamily: 'inherit', transition: 'all 100ms' }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}