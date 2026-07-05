const INK = '#111827';
const INK3 = '#6B7280';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';

export function Section({ title, meta, children }) {
  return (
    <section style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 24px', marginBottom: 12 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
        {meta && <p style={{ fontSize: 11.5, color: INK3, margin: '4px 0 0' }}>{meta}</p>}
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children }) {
  return <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: INK3, marginBottom: 5, textTransform: 'none' }}>{children}</label>;
}

// View-only field display (shows "—" when empty)
export function FieldValue({ value }) {
  if (!value || !String(value).trim()) {
    return <span style={{ fontSize: 13, color: '#9CA3AF' }}>—</span>;
  }
  return <span style={{ fontSize: 13, color: INK, lineHeight: 1.6 }}>{value}</span>;
}

const baseInput = {
  width: '100%', boxSizing: 'border-box', padding: '8px 12px',
  fontSize: 13, color: INK, background: WHITE,
  border: `1px solid ${BORDER}`, borderRadius: 8, outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 120ms',
};

export function TextInput({ value, onChange, placeholder }) {
  return (
    <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={baseInput}
      onFocus={e => e.currentTarget.style.borderColor = '#C4B5FD'}
      onBlur={e => e.currentTarget.style.borderColor = BORDER} />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ ...baseInput, resize: 'vertical', lineHeight: 1.6 }}
      onFocus={e => e.currentTarget.style.borderColor = '#C4B5FD'}
      onBlur={e => e.currentTarget.style.borderColor = BORDER} />
  );
}

export function SelectInput({ value, onChange, options }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)}
      style={{ ...baseInput, appearance: 'none', cursor: 'pointer', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1l4 4 4-4\' stroke=\'%236B7280\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 30 }}>
      {options.map(o => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}

// Divider between fields within a section
export function FieldDivider() {
  return <div style={{ height: 1, background: BORDER, margin: '14px 0' }} />;
}