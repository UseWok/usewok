import { Zap, Trash2 } from 'lucide-react';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';
const ORANGE = '#F97316';
const GREEN = '#10B981';
const BLUE = '#3B8BEB';

const TYPE_COLORS = {
  'Technical': { bg: 'rgba(59,139,235,0.12)', c: BLUE }, 'Technique': { bg: 'rgba(59,139,235,0.12)', c: BLUE },
  'Content': { bg: 'rgba(16,185,129,0.12)', c: GREEN }, 'Contenu': { bg: 'rgba(16,185,129,0.12)', c: GREEN },
  'Off-site': { bg: 'rgba(124,58,237,0.12)', c: VIOLET }, 'Hors-site': { bg: 'rgba(124,58,237,0.12)', c: VIOLET },
};
const EFFORT_LABEL = { 'Low': 'Facile', 'Faible': 'Facile', 'Medium': 'Moyen', 'Moyen': 'Moyen', 'High': 'Difficile', 'Élevé': 'Difficile' };
const EFFORT_C = { 'Low': GREEN, 'Faible': GREEN, 'Medium': ORANGE, 'Moyen': ORANGE, 'High': '#EF4444', 'Élevé': '#EF4444' };

const isQuickWin = (m) => (m.impact_label === 'High' || m.impact_label === 'Fort' || m.impact_score >= 60) && (m.effort === 'Low' || m.effort === 'Faible');

export default function TaskCard({ task, meta, dragProps, dragHandle, innerRef, onRemove, isDragging }) {
  const typeC = TYPE_COLORS[meta.type] || { bg: '#F0EDE8', c: INK3 };
  const quick = isQuickWin(meta);
  return (
    <div ref={innerRef} {...dragProps} {...dragHandle}
      style={{
        background: '#fff', border: `1px solid ${quick ? ORANGE : BORDER}`, borderRadius: 12,
        padding: '12px 14px', marginBottom: 10, cursor: 'grab', fontFamily: F,
        boxShadow: isDragging ? '0 10px 30px rgba(0,0,0,0.14)' : '0 1px 2px rgba(0,0,0,0.03)',
        ...dragProps?.style,
      }}>
      {quick && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: 'rgba(249,115,22,0.12)', color: ORANGE, fontSize: 10, fontWeight: 800, marginBottom: 8 }}>
          <Zap size={10} /> Action rapide
        </div>
      )}
      <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 8px', lineHeight: 1.35 }}>{task.action_title}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {meta.type && <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: typeC.bg, color: typeC.c }}>{meta.type}</span>}
        <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, background: `${EFFORT_C[meta.effort] || ORANGE}18`, color: EFFORT_C[meta.effort] || ORANGE }}>
          {EFFORT_LABEL[meta.effort] || 'Moyen'}
        </span>
        <span style={{ flex: 1 }} />
        <button onClick={() => onRemove(task)} title="Supprimer"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3, padding: 2 }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}