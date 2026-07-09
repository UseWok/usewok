import { ArrowRight, Target } from 'lucide-react';

const F = '"Wix Madefor Text", "Wix Madefor Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const WHITE = '#FFFFFF';
const CORAL = '#FF5A1F';
const CARD_BG = '#15130F';

/**
 * Single priority action + gamified progress bar.
 * Everything here is derived from real scan data passed in props — no invented copy.
 * - currentScore / targetScore: real numbers (target = next milestone).
 * - actionsLeft: number of open issues from the real scan.
 * - action: the single most critical real issue text (or null → generic prompt).
 */
export default function NextStepCard({ currentScore, targetScore, actionsLeft, action, onClick }) {
  const span = Math.max(targetScore - currentScore, 1);
  // Progress toward the next milestone, shown as how far along the current band we are.
  const pct = Math.min(Math.max(((currentScore % 50) / 50) * 100, 4), 100);

  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', background: CARD_BG, border: 'none', borderRadius: 14,
      padding: '16px 18px', cursor: 'pointer', fontFamily: F, marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,90,31,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Target size={16} color={CORAL} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Prochaine étape recommandée
        </span>
      </div>

      <p style={{ fontSize: 16, fontWeight: 600, color: WHITE, margin: '0 0 16px', lineHeight: 1.5 }}>
        {action || 'Lancez une analyse complète pour révéler votre action prioritaire.'}
      </p>

      {/* Barre de progression gamifiée */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          {actionsLeft > 0
            ? `Encore ${actionsLeft} action${actionsLeft > 1 ? 's' : ''} pour passer de ${currentScore} à ${targetScore}`
            : `Vous êtes à ${currentScore}/100`}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: CORAL }}>{currentScore} → {targetScore}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.10)', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: CORAL, borderRadius: 999, transition: 'width 0.9s cubic-bezier(0.22,1,0.36,1)' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: CORAL }}>Voir comment corriger</span>
        <ArrowRight size={13} color={CORAL} strokeWidth={1.8} />
      </div>
    </button>
  );
}