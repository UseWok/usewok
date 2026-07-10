import { Sparkles, Wrench, ArrowRight, CheckCircle2 } from 'lucide-react';
import { humanizeIssue } from '@/lib/humanize-issue';

const F = '"Wix Madefor Text", "Wix Madefor Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const WHITE = '#FFFFFF';
const INK = '#1A1814';
const INK2 = '#857E6E';
const BORDER = 'rgba(21,19,15,0.12)';
const CORAL = '#FF5A1F';
const ORANGE_DEEP = '#C43E14';

/**
 * THE visual priority of the dashboard: one recommended action at a time.
 * "Aujourd'hui, fais ça" — never a list of 4.
 *
 * Props:
 *  - issues: raw scan issues array (we pick issues[0] as the single action)
 *  - remaining: how many other actions are queued (shown as a small note only)
 *  - onFix: () => void — "Corriger automatiquement" / "Voir comment faire"
 */
export default function TodayAction({ issues = [], remaining = 0, onFix }) {
  // All caught up.
  if (!issues.length) {
    return (
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '28px 26px', marginBottom: 24, fontFamily: F, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(34,168,122,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CheckCircle2 size={24} color="#22A87A" strokeWidth={2} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: INK, letterSpacing: '-0.01em' }}>Tu es à jour 🎉</div>
          <p style={{ fontSize: 14, color: INK2, margin: '3px 0 0' }}>Aucune action prioritaire pour aujourd'hui. Reviens après ta prochaine analyse.</p>
        </div>
      </div>
    );
  }

  const action = humanizeIssue(issues[0]);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '26px', marginBottom: 24, fontFamily: F, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,90,31,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={16} color={CORAL} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: CORAL, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Aujourd'hui, fais ça
        </span>
      </div>

      <h2 style={{ fontSize: 23, fontWeight: 800, color: INK, margin: '0 0 10px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
        {action.title}
      </h2>
      <p style={{ fontSize: 15.5, color: INK2, margin: '0 0 22px', lineHeight: 1.6, maxWidth: 620 }}>
        {action.explain}
        {action.page && action.page !== '/' && (
          <span style={{ color: INK, fontWeight: 600 }}> (page&nbsp;: {action.page})</span>
        )}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button onClick={onFix}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', background: action.autoFix ? CORAL : INK, color: WHITE, border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
          {action.autoFix ? <Wrench size={16} strokeWidth={2.2} /> : <ArrowRight size={16} strokeWidth={2.2} />}
          {action.autoFix ? 'Corriger automatiquement' : 'Voir comment faire'}
        </button>
        {remaining > 0 && (
          <span style={{ fontSize: 13.5, color: INK2 }}>
            {remaining} autre{remaining > 1 ? 's' : ''} action{remaining > 1 ? 's' : ''} après celle-ci
          </span>
        )}
      </div>
    </div>
  );
}