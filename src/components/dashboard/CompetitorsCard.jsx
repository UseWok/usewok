import DashCard from './DashCard';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const ORANGE = '#FF5A1F';
const ORANGE_PALE = '#FFF3EC';
const GREEN = '#1E7A4C';
const RED = '#E53E3E';
const CREAM2 = '#F5F1E8';
const F = '"Wix Madefor Text", "Wix Madefor Display", system-ui, sans-serif';

const RANK_COLORS = ['#FF5A1F', '#7C3AED', '#3B8BEB', '#22A87A'];

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
  return `https://logo.clearbit.com/${host}?size=128`;
}

function CompetitorLogo({ c, you, rank }) {
  const url = faviconUrl(c);
  const bg = you ? ORANGE : '#fff';
  const ringColor = you ? ORANGE : RANK_COLORS[rank % RANK_COLORS.length];
  return (
    <div style={{ width: 34, height: 34, borderRadius: '50%', background: bg, border: `2px solid ${ringColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
      {url ? (
        <img src={url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
      ) : null}
      <span style={{ display: url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 11, fontWeight: 700, color: you ? '#fff' : '#4A453B' }}>{initials(c.name)}</span>
    </div>
  );
}

function TrendBadge({ current, previous }) {
  if (previous === undefined || previous === null) return null;
  const delta = Math.round((current - previous) * 10) / 10;
  if (delta === 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: INK3 }}>
      <Minus size={11} />
    </span>
  );
  if (delta > 0) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: GREEN }}>
      <TrendingUp size={11} /> +{delta}
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: RED }}>
      <TrendingDown size={11} /> {delta}
    </span>
  );
}

export default function CompetitorsCard({ competitors, previousCompetitors = [], onSeeAll, onWantRank2 }) {
  const rows = (competitors || []).slice().sort((a, b) => (b.visibility_pct || 0) - (a.visibility_pct || 0));
  const prevMap = {};
  (previousCompetitors || []).forEach(c => { prevMap[c.name?.toLowerCase() || c.domain] = c.visibility_pct || 0; });
  const max = Math.max(1, ...rows.map(r => r.visibility_pct || 0));

  return (
    <DashCard title="Tes concurrents" dot={ORANGE} action="Voir tout →" onAction={onSeeAll}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.map((c, i) => {
          const you = c.is_you;
          const pct = Math.round(c.visibility_pct || 0);
          const prev = prevMap[c.name?.toLowerCase() || c.domain];
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: you ? '12px 14px' : '11px 4px',
              borderRadius: you ? 14 : 0,
              background: you ? ORANGE_PALE : 'transparent',
              borderBottom: i === rows.length - 1 ? 'none' : '1px solid rgba(21,19,15,0.06)',
            }}>
              <span style={{ width: 18, fontSize: 12, fontWeight: 800, color: you ? ORANGE : RANK_COLORS[i % RANK_COLORS.length], flexShrink: 0, textAlign: 'center' }}>{i + 1}</span>
              <CompetitorLogo c={c} you={you} rank={i} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</b>
                {you && <span style={{ fontSize: 11, color: ORANGE, fontWeight: 600 }}>toi</span>}
              </div>
              <div style={{ width: 60, height: 4, borderRadius: 100, background: CREAM2, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ height: '100%', width: `${(pct / max) * 100}%`, background: you ? ORANGE : RANK_COLORS[i % RANK_COLORS.length], borderRadius: 100, transition: 'width 0.6s ease' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: INK, flexShrink: 0, width: 36, textAlign: 'right' }}>{pct}%</span>
              <span style={{ width: 40, flexShrink: 0, textAlign: 'right' }}>
                <TrendBadge current={pct} previous={prev} />
              </span>
            </div>
          );
        })}
      </div>

      <button onClick={onWantRank2}
        style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: CREAM2, borderRadius: 12, padding: '12px 16px', border: 'none', cursor: 'pointer', fontFamily: F, transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = ORANGE_PALE}
        onMouseLeave={e => e.currentTarget.style.background = CREAM2}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Je veux les dépasser</span>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowUpRight size={13} color="#fff" strokeWidth={2.6} />
        </span>
      </button>
    </DashCard>
  );
}