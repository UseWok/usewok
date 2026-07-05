import { useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';
const GREEN = '#10B981';

function Row({ p }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: '12px 16px', alignItems: 'center', cursor: 'pointer' }}>
        <span style={{ fontSize: 13, color: INK, lineHeight: 1.5 }}>{p.text}</span>
        <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, background: p.type === 'authority' ? 'rgba(124,58,237,0.10)' : 'rgba(249,115,22,0.10)', color: p.type === 'authority' ? VIOLET : '#F97316' }}>
          {p.type === 'authority' ? 'Authority' : 'Narrative'}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', border: `2px solid ${p.cited ? GREEN : '#EF4444'}`, color: p.cited ? GREEN : '#EF4444' }}>
          {p.cited ? <Check size={13} strokeWidth={2.5} /> : <X size={13} strokeWidth={2.5} />}
        </span>
      </div>
      {open && p.answer && (
        <div style={{ padding: '0 16px 14px 16px' }}>
          <div style={{ background: '#FAF9F6', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 12.5, color: '#3D3D3D', margin: 0, lineHeight: 1.6 }}>{p.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrandPromptTable({ prompts }) {
  const [filter, setFilter] = useState('all');
  const rows = prompts.filter(p => filter === 'all' || p.type === filter);
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', fontFamily: F }}>
      <div style={{ display: 'flex', gap: 6, padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
        {[{ id: 'all', label: 'Tous' }, { id: 'narrative', label: 'Narrative' }, { id: 'authority', label: 'Authority' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding: '5px 12px', border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: F, fontSize: 11.5, fontWeight: 700, background: filter === f.id ? INK : '#F0EDE8', color: filter === f.id ? '#fff' : INK3 }}>
            {f.label}
          </button>
        ))}
      </div>
      {rows.length === 0 && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0', margin: 0 }}>Aucun prompt.</p>}
      {rows.map((p, i) => <Row key={i} p={p} />)}
    </div>
  );
}