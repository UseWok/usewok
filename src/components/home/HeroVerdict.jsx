import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

/**
 * The single "story" header of the dashboard.
 * - ONE question: "Es-tu recommandé par les IA aujourd'hui ?"
 * - ONE dynamic answer sentence built from real scan data.
 * - ONE simple score (big number). The 3-category detail is hidden until the user asks for it.
 *
 * Props (all derived from real data, no invented copy):
 *  - score: number 0-100 (the single overall score)
 *  - appearPct: number|null — % of tested AI answers where the brand shows up
 *  - leader: { name, pct }|null — the top competitor to beat
 *  - pillars: [{ label, explain, score }] — shown only when the detail is expanded
 */
export default function HeroVerdict({ score, appearPct, leader, pillars = [] }) {
  const [showDetail, setShowDetail] = useState(false);
  const pct = appearPct ?? score;
  const t = verdictTone(pct);
  const size = 92, sw = 8, R = (size - sw) / 2, circ = 2 * Math.PI * R;

  // Build the answer sentence purely from real numbers.
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
        {/* Single score ring */}
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
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
        </div>

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

      {/* Expandable category detail — hidden by default (no forced mental math) */}
      {pillars.length > 0 && (
        <>
          <button onClick={() => setShowDetail(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 18, padding: '7px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>
            {showDetail ? 'Masquer le détail' : 'Voir le détail par catégorie'}
            <ChevronDown size={14} style={{ transform: showDetail ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
          </button>
          {showDetail && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 6 }}>
              {pillars.map(p => {
                const has = p.score !== null && p.score !== undefined;
                const pt = verdictTone(p.score ?? 0);
                return (
                  <div key={p.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 14px 13px' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: WHITE, marginBottom: 4 }}>{p.label}</div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px', lineHeight: 1.5, minHeight: 34 }}>{p.explain}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 6 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: has ? WHITE : 'rgba(255,255,255,0.3)' }}>{has ? p.score : '—'}</span>
                      {has && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>/100</span>}
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.10)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${has ? Math.min(p.score, 100) : 0}%`, background: pt.color, borderRadius: 999, transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}