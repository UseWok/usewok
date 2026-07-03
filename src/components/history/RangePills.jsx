import { Lock } from 'lucide-react';

const INK = '#15130F';
const BORDER = 'rgba(21,19,15,0.10)';

export const RANGES = [
  { id: '7d', label: '7D', days: 7 },
  { id: '30d', label: '30D', days: 30 },
  { id: '3m', label: '3M', days: 90 },
  { id: '6m', label: '6M', days: 180 },
  { id: '1y', label: '1Y', days: 365 },
];

export default function RangePills({ value, onChange, maxDays, onLockedClick }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: '#F0EFEB', borderRadius: 100 }}>
      {RANGES.map(r => {
        const locked = r.days > maxDays;
        const active = value === r.id;
        return (
          <button key={r.id}
            onClick={() => locked ? onLockedClick(r) : onChange(r.id)}
            title={locked ? 'Upgrade your plan to unlock this range' : ''}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px',
              borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 700,
              background: active ? INK : 'transparent',
              color: active ? '#FAF9F6' : locked ? 'rgba(21,19,15,0.35)' : 'rgba(21,19,15,0.6)',
            }}>
            {locked && <Lock size={10} />}
            {r.label}
          </button>
        );
      })}
    </div>
  );
}