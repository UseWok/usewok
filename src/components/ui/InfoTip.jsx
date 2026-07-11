import { useState } from 'react';

/** Small (i) icon that reveals an ultra-simple explanation on hover/tap. */
export default function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen(v => !v)} aria-label="More info"
        style={{ width: 15, height: 15, borderRadius: '50%', border: '1.4px solid #B4AFA4', background: 'transparent', color: '#8B857A', fontSize: 9.5, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1, fontFamily: 'inherit' }}>
        i
      </button>
      {open && (
        <span style={{ position: 'absolute', bottom: 'calc(100% + 7px)', left: '50%', transform: 'translateX(-50%)', zIndex: 200, width: 210, background: '#1A1814', color: '#fff', fontSize: 11.5, fontWeight: 500, lineHeight: 1.5, padding: '9px 12px', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.22)', pointerEvents: 'none', textAlign: 'left' }}>
          {text}
        </span>
      )}
    </span>
  );
}