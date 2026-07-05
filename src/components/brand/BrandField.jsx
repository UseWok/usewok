// Shared field primitives for the Brand Knowledge form — matches the reference design.
const INK = '#1A1A1A';
const INK3 = '#8A8A93';
const BORDER = '#E3DFD6';
const WHITE = '#FFFFFF';

export function Section({ title, hint, right, children }) {
  return (
    <section style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
          {hint && <p style={{ fontSize: 11.5, color: INK3, margin: '3px 0 0', lineHeight: 1.5 }}>{hint}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children }) {
  return <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#5B5B62', marginBottom: 6 }}>{children}</label>;
}

const baseInput = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  fontSize: 13, color: INK, background: WHITE,
  border: `1px solid ${BORDER}`, borderRadius: 9, outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 120ms',
};

export function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={baseInput}
      onFocus={e => e.currentTarget.style.borderColor = '#B8B2A5'}
      onBlur={e => e.currentTarget.style.borderColor = BORDER} />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ ...baseInput, resize: 'vertical', lineHeight: 1.6 }}
      onFocus={e => e.currentTarget.style.borderColor = '#B8B2A5'}
      onBlur={e => e.currentTarget.style.borderColor = BORDER} />
  );
}

export function SelectInput({ value, onChange, options }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)}
      style={{ ...baseInput, appearance: 'none', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%238A8A93\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 30 }}>
      {options.map(o => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}