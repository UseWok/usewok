import DashCard from './DashCard';
import { ArrowRight } from 'lucide-react';

const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const CORAL = '#F95738';

const PRIORITY = {
  urgent: { label: 'Urgent', color: '#fff', bg: CORAL },
  high: { label: 'High', color: CORAL, bg: 'rgba(249,87,56,0.12)' },
  medium: { label: 'Medium', color: '#8A6D1F', bg: '#FBF0D6' },
  low: { label: 'Low', color: INK3, bg: '#F0EEE9' },
};

export default function TasksCard({ tasks, onSeeAll, onLaunch }) {
  const list = tasks || [];
  return (
    <DashCard title="Tasks to do" dot={CORAL} action="See all →" onAction={onSeeAll}>
      {list.length === 0 ? (
        <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>
          No open task. Launch an audit to generate recommendations.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((t, i) => {
            const p = PRIORITY[t.priority] || PRIORITY.medium;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', border: '1px solid #E9E5DD', borderRadius: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: p.color, background: p.bg, borderRadius: 999, padding: '3px 9px', flexShrink: 0 }}>{p.label}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{t.title}</div>
                  {t.impact && <div style={{ fontSize: 11.5, color: INK3, marginTop: 2 }}>{t.impact}</div>}
                </div>
                <button onClick={() => onLaunch?.(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: CORAL, flexShrink: 0 }}>
                  Launch <ArrowRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashCard>
  );
}