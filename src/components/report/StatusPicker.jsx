import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { STATUS_CFG, BORDER, WHITE, SURFACE, INK2, CORAL, GREEN, INK, F } from '@/lib/report-constants';

export default function StatusPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[value] || STATUS_CFG.todo;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: `1px solid ${cfg.border}`, background: cfg.bg, cursor: 'pointer', fontSize: 11.5, fontWeight: 600, color: cfg.color, fontFamily: F, whiteSpace: 'nowrap' }}>
        {cfg.label}
        <ChevronDown size={10} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', opacity: 0.5 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden', zIndex: 50, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 120 }}>
          {Object.entries(STATUS_CFG).map(([k, c]) => (
            <button key={k} onClick={(e) => { e.stopPropagation(); onChange(k); setOpen(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '9px 12px', background: value === k ? SURFACE : WHITE, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: value === k ? 600 : 400, color: k === 'done' ? GREEN : k === 'in_progress' ? CORAL : INK2, fontFamily: F, textAlign: 'left' }}>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}