import DashCard from './DashCard';
import { ArrowUpRight } from 'lucide-react';

const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const CORAL = '#F95738';
const VIOLET = '#7C3AED';
const F = 'Inter, system-ui, sans-serif';

function initials(name) {
  const p = (name || '').trim().split(/[\s\-.]+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return (name || '??').slice(0, 2).toUpperCase();
}

export default function CompetitorsCard({ competitors, onSeeAll, onWantRank2 }) {
  const rows = (competitors || []).slice().sort((a, b) => (b.visibility_pct || 0) - (a.visibility_pct || 0));

  return (
    <DashCard title="Competitors" dot={CORAL} action="Competitors →" onAction={onSeeAll}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.map((c, i) => {
          const you = c.is_you;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '9px 8px', borderRadius: 9,
              background: you ? 'rgba(124,58,237,0.06)' : 'transparent',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: you ? VIOLET : INK3, width: 12, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: you ? VIOLET : '#EDEBE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: you ? '#fff' : INK }}>{initials(c.name)}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                {you && <div style={{ fontSize: 10.5, color: VIOLET, fontWeight: 600 }}>your brand</div>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: INK, flexShrink: 0 }}>{Math.round(c.visibility_pct || 0)}%</span>
              <span style={{ fontSize: 10, color: INK3, flexShrink: 0 }}>views</span>
            </div>
          );
        })}
      </div>

      <button onClick={onWantRank2}
        style={{ marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '11px 14px', background: 'rgba(249,87,56,0.08)', border: '1px solid rgba(249,87,56,0.2)', borderRadius: 10, cursor: 'pointer', fontFamily: F }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: CORAL }}>I want to reach #2</span>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowUpRight size={13} color="#fff" strokeWidth={2.5} />
        </span>
      </button>
    </DashCard>
  );
}