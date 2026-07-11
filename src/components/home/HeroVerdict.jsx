import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ScoreDetailPanel from './ScoreDetailPanel';

const F = '"Wix Madefor Text", "Wix Madefor Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const WHITE = '#FFFFFF';
const CORAL = '#FF5A1F';
const CARD_BG = '#15130F';
const GREEN = '#22A87A';
const AMBER = '#D97706';
const RED = '#F0533A';

function verdictTone(pct) {
  if (pct >= 60) return { color: GREEN, word: 'Oui', label: 'Bon' };
  if (pct >= 30) return { color: AMBER, word: 'En partie', label: 'Correct' };
  return { color: RED, word: 'Non', label: 'À améliorer' };
}

export default function HeroVerdict({ score, appearPct, leader, pillars = [], overview }) {
  const [showDetail, setShowDetail] = useState(false);
  const pct = appearPct ?? score;
  const t = verdictTone(pct);
  const size = 92, sw = 8, R = (size - sw) / 2, circ = 2 * Math.PI * R;

  let answer;
  if (appearPct === null || appearPct === undefined) {
    answer = "Lance une analyse complète pour savoir si les IA te recommandent.";
  } else if (leader?.name) {
    answer = `${t.word} — tu apparais dans ${appearPct}% des réponses testées, derrière ${leader.name}${leader.pct ? ` (${leader.pct}%)` : ''}.`;
  } else {
    answer = `${t.word} — tu apparais dans ${appearPct}% des réponses que nous avons testées.`;
  }

  return (
    <div style={{ background: CARD_BG, borderRadius: 18, padding: '26px 26px 22px', marginBottom: 20, fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {/* Score ring — clickable */}
        <button onClick={() => setShowDetail(v => !v)}
          style={{ position: 'relative', width: size, height: size, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={sw} />
            <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={t.color} strokeWidth={sw}
              strokeDasharray={circ} strokeDashoffset={circ * (1 - score/100)} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: WHITE, lineHeight: 1, letterSpacing: '-0.03em' }}>{score}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>/100</span>
          </div>
        </button>

        {/* Question + dynamic answer */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Es-tu recommandé par les IA aujourd'hui ?
          </div>
          <p style={{ fontSize: 20, fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.4, letterSpacing: '-0.01em' }}>
            <span style={{ color: t.color }}>{answer.split(' — ')[0]}</span>
            {answer.includes(' — ') && <span> — {answer.split(' — ').slice(1).join(' — ')}</span>}
          </p>
        </div>
      </div>

      {/* Expandable detail */}
      {(pillars.length > 0 || overview) && (
        <>
          <button onClick={() => setShowDetail(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18, padding: '7px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
            {showDetail ? 'Masquer le détail' : 'Voir le détail'}
            <ChevronDown size={14} style={{ transform: showDetail ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
          </button>
          {showDetail && <ScoreDetailPanel overview={overview} pillars={pillars} />}
        </>
      )}
    </div>
  );
}