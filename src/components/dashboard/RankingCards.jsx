import DashCard from './DashCard';
import { Globe } from 'lucide-react';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const ORANGE = '#FF5A1F';
const ORANGE_PALE = '#FFE7D6';
const ORANGE_DEEP = '#C43E14';
const GREEN = '#1E7A4C';
const GREEN_PALE = '#EBF6F0';
const CREAM2 = '#F3EEE3';

const FLAGS = {
  'us': '🇺🇸', 'usa': '🇺🇸', 'états-unis': '🇺🇸', 'etats-unis': '🇺🇸', 'united states': '🇺🇸',
  'fr': '🇫🇷', 'france': '🇫🇷',
  'uk': '🇬🇧', 'gb': '🇬🇧', 'royaume-uni': '🇬🇧', 'united kingdom': '🇬🇧',
  'de': '🇩🇪', 'allemagne': '🇩🇪', 'germany': '🇩🇪',
  'es': '🇪🇸', 'espagne': '🇪🇸', 'spain': '🇪🇸',
  'it': '🇮🇹', 'italie': '🇮🇹', 'italy': '🇮🇹',
  'ca': '🇨🇦', 'canada': '🇨🇦',
  'be': '🇧🇪', 'belgique': '🇧🇪', 'belgium': '🇧🇪',
  'ch': '🇨🇭', 'suisse': '🇨🇭', 'switzerland': '🇨🇭',
  'europe': '🇪🇺', 'amérique du nord': '🌎', 'amerique du nord': '🌎', 'north america': '🌎',
  'asie': '🌏', 'asia': '🌏', 'monde': '🌍', 'world': '🌍',
};

function zoneFlag(zone) {
  const key = (zone || '').toLowerCase().trim();
  return FLAGS[key] || '🌎';
}

function ScoreBar({ score, color }) {
  return (
    <div style={{ flex: 1, height: 8, borderRadius: 100, background: CREAM2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, score || 0)}%`, background: color, borderRadius: 100 }} />
    </div>
  );
}

export function ZoneRankingCard({ zones, onDetail }) {
  const best = (zones || []).find(z => z.is_best) || (zones || [])[0];
  if (!best) return (
    <DashCard title="Tes meilleurs pays" dot={ORANGE_DEEP} action="Voir le détail →" onAction={onDetail}>
      <p style={{ fontSize: 12.5, color: INK3, margin: 0 }}>Pas encore de données par pays.</p>
    </DashCard>
  );
  return (
    <DashCard title="Tes meilleurs pays" dot={ORANGE_DEEP} action="Voir le détail →" onAction={onDetail}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: CREAM2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {zoneFlag(best.zone)}
        </div>
        <div style={{ flexShrink: 0, width: 150 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <b style={{ fontSize: 14, fontWeight: 700, color: INK }}>{best.zone}</b>
            <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: ORANGE_PALE, color: ORANGE_DEEP }}>Ton meilleur pays</span>
          </div>
          <div style={{ fontSize: 11.5, color: INK3 }}>Pays</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <ScoreBar score={best.score} color={ORANGE} />
          <span style={{ fontSize: 14, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{best.score || 0}<span style={{ fontSize: 11, fontWeight: 700, color: INK3 }}>/100 · {best.rank || 1}er</span></span>
        </div>
      </div>
    </DashCard>
  );
}

export function LanguageRankingCard({ languages, onDetail }) {
  const top = (languages || [])[0];
  if (!top) return (
    <DashCard title="Tes meilleures langues" dot={INK} action="Voir le détail →" onAction={onDetail}>
      <p style={{ fontSize: 12.5, color: INK3, margin: 0 }}>Pas encore de données par langue.</p>
    </DashCard>
  );
  return (
    <DashCard title="Tes meilleures langues" dot={INK} action="Voir le détail →" onAction={onDetail}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: CREAM2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {top.flag || '🌐'}
        </div>
        <div style={{ flexShrink: 0, width: 150 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <b style={{ fontSize: 14, fontWeight: 700, color: INK }}>{top.language}</b>
            <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: GREEN_PALE, color: GREEN }}>Modéré</span>
          </div>
          <div style={{ fontSize: 11.5, color: INK3 }}>{top.prompts || 0} questions posées</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <ScoreBar score={top.score} color={INK} />
          <span style={{ fontSize: 14, fontWeight: 800, color: INK, whiteSpace: 'nowrap' }}>{top.score || 0}<span style={{ fontSize: 11, fontWeight: 700, color: INK3 }}>/100</span></span>
        </div>
      </div>
    </DashCard>
  );
}