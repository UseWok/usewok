import DashCard from './DashCard';
import { ArrowRight } from 'lucide-react';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const ORANGE_DEEP = '#C43E14';
const ORANGE_PALE = '#FFE7D6';
const F = 'Inter, system-ui, sans-serif';

const PRIORITY = {
  urgent: { label: 'À faire en premier', color: '#fff', bg: '#FF5A1F' },
  high: { label: 'Important', color: ORANGE_DEEP, bg: ORANGE_PALE },
  medium: { label: 'Utile', color: ORANGE_DEEP, bg: ORANGE_PALE },
  low: { label: 'Quand tu peux', color: INK3, bg: '#F3EEE3' },
};

export default function TasksCard({ tasks, onSeeAll, onLaunch }) {
  const list = tasks || [];
  return (
    <DashCard title="Ce que tu dois faire" dot={ORANGE_DEEP} action="Tout voir →" onAction={onSeeAll}>
      {list.length === 0 ? (
        <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>
          Rien à faire pour l'instant. Lance une analyse pour recevoir tes conseils.
        </p>
      ) : (
        <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 2 }}>
          {list.map((t, i) => {
            const p = PRIORITY[t.priority] || PRIORITY.medium;
            return (
              <div key={i} style={{ border: '1px solid rgba(21,19,15,0.09)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: p.color, background: p.bg, padding: '3px 9px', borderRadius: 100, flexShrink: 0 }}>{p.label}</span>
                  <button onClick={() => onLaunch?.(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: INK, fontFamily: F, padding: 0, flexShrink: 0 }}>
                    Lancer <ArrowRight size={12} />
                  </button>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, lineHeight: 1.35, marginBottom: 4 }}>{t.title}</div>
                {t.impact && <div style={{ fontSize: 12, color: INK3, lineHeight: 1.5 }}>{t.impact}</div>}
              </div>
            );
          })}
        </div>
      )}
    </DashCard>
  );
}