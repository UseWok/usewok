import DashCard from './DashCard';
import { ArrowUpRight } from 'lucide-react';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const ORANGE = '#FF5A1F';
const ORANGE_PALE = '#FFE7D6';
const CREAM2 = '#F3EEE3';
const F = 'Inter, system-ui, sans-serif';

function initials(name) {
  const p = (name || '').trim().split(/[\s\-.]+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return (name || '??').slice(0, 2).toUpperCase();
}

function faviconUrl(c) {
  const raw = c.domain || c.url || c.website || '';
  if (!raw) return null;
  const host = raw.replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (!host || !host.includes('.')) return null;
  // Clearbit returns sharp, high-res square logos (better than favicons for a round crop)
  return `https://logo.clearbit.com/${host}?size=128`;
}

function CompetitorLogo({ c, you }) {
  const url = faviconUrl(c);
  const bg = you ? ORANGE : '#fff';
  return (
    <div style={{ width: 30, height: 30, borderRadius: '50%', background: bg, border: you ? `2px solid ${ORANGE}` : `1px solid ${CREAM2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', boxShadow: '0 1px 3px rgba(21,19,15,0.08)' }}>
      {url ? (
        <img src={url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
      ) : null}
      <span style={{ display: url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 10.5, fontWeight: 700, color: you ? '#fff' : '#4A453B' }}>{initials(c.name)}</span>
    </div>
  );
}

export default function CompetitorsCard({ competitors, onSeeAll, onWantRank2 }) {
  const rows = (competitors || []).slice().sort((a, b) => (b.visibility_pct || 0) - (a.visibility_pct || 0));

  return (
    <DashCard title="Tes concurrents" dot={ORANGE} action="Tout voir →" onAction={onSeeAll}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((c, i) => {
          const you = c.is_you;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: you ? '10px' : '10px 0',
              borderRadius: you ? 10 : 0,
              background: you ? ORANGE_PALE : 'transparent',
              borderTop: i === 0 ? 'none' : '1px solid rgba(21,19,15,0.09)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: INK3, width: 14, flexShrink: 0 }}>{i + 1}</span>
              <CompetitorLogo c={c} you={you} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</b>
                {you && <span style={{ fontSize: 11, color: INK3 }}>ta marque</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: INK, flexShrink: 0 }}>{Math.round(c.visibility_pct || 0)}%</span>
            </div>
          );
        })}
      </div>

      <button onClick={onWantRank2}
        style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: CREAM2, borderRadius: 10, padding: '11px 14px', border: 'none', cursor: 'pointer', fontFamily: F }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>Je veux passer devant eux</span>
        <span style={{ width: 26, height: 26, borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowUpRight size={12} color="#fff" strokeWidth={2.6} />
        </span>
      </button>
    </DashCard>
  );
}