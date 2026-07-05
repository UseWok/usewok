import DashCard from './DashCard';
import { Globe } from 'lucide-react';

const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const CORAL = '#F95738';
const BLUE = '#3B8BEB';
const GREEN = '#22A87A';

function ScoreBar({ score, color }) {
  return (
    <div style={{ flex: 1, height: 7, background: '#F0EEE9', borderRadius: 999, overflow: 'hidden', maxWidth: 120 }}>
      <div style={{ height: '100%', width: `${Math.min(100, score)}%`, background: color, borderRadius: 999 }} />
    </div>
  );
}

export function ZoneRankingCard({ zones, onDetail }) {
  const best = (zones || []).find(z => z.is_best) || (zones || [])[0];
  if (!best) return (
    <DashCard title="Ranking by zone" dot={CORAL} action="Detail →" onAction={onDetail}>
      <p style={{ fontSize: 12.5, color: INK3, margin: 0 }}>No zone data yet.</p>
    </DashCard>
  );
  return (
    <DashCard title="Ranking by zone" dot={CORAL} action="Detail →" onAction={onDetail}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F5F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Globe size={17} color={INK} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>{best.zone}</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: CORAL, borderRadius: 5, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Best zone</span>
          </div>
          <span style={{ fontSize: 11, color: INK3 }}>Continent</span>
        </div>
        <ScoreBar score={best.score || 0} color={CORAL} />
        <span style={{ fontSize: 15, fontWeight: 800, color: INK, flexShrink: 0 }}>{best.score || 0}<span style={{ fontSize: 10, color: INK3 }}>/100</span></span>
        <span style={{ fontSize: 13, fontWeight: 700, color: INK3, flexShrink: 0, width: 24, textAlign: 'right' }}>{best.rank || 1}<sup>er</sup></span>
      </div>
    </DashCard>
  );
}

export function LanguageRankingCard({ languages, onDetail }) {
  const top = (languages || [])[0];
  if (!top) return (
    <DashCard title="Ranking by language" dot={BLUE} action="Detail →" onAction={onDetail}>
      <p style={{ fontSize: 12.5, color: INK3, margin: 0 }}>No language data yet.</p>
    </DashCard>
  );
  return (
    <DashCard title="Ranking by language" dot={BLUE} action="Detail →" onAction={onDetail}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>{top.flag || '🌐'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>{top.language}</span>
            {top.strength_label && <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: GREEN, borderRadius: 5, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{top.strength_label}</span>}
          </div>
          <span style={{ fontSize: 11, color: INK3 }}>{top.prompts || 0} prompts</span>
        </div>
        <ScoreBar score={top.score || 0} color={BLUE} />
        <span style={{ fontSize: 15, fontWeight: 800, color: INK, flexShrink: 0 }}>{top.score || 0}<span style={{ fontSize: 10, color: INK3 }}>/100</span></span>
      </div>
    </DashCard>
  );
}