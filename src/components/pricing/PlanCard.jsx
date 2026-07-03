import React from 'react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#15130F';
const CREAM = '#FBF8F2';
const CREAM_2 = '#F7F5F2';
const WHITE = '#FFFFFF';
const ORANGE = '#FF5A1F';
const BORDER = 'rgba(21,19,15,0.10)';
const BORDER_STRONG = 'rgba(21,19,15,0.14)';

export default function PlanCard({ plan, billing, isCurrent, onCta, loading, ctaLabel }) {
  const isReco = !!plan.badge;
  const isFree = !plan.price_monthly || plan.price_monthly === 0;
  const price = billing === 'yearly' && plan.price_yearly
    ? Math.round(plan.price_yearly / 12)
    : plan.price_monthly;

  const leftBg = isReco ? INK : WHITE;
  const leftText = isReco ? CREAM : INK;
  const leftSubtle = isReco ? 'rgba(251,248,242,0.55)' : 'rgba(21,19,15,0.5)';

  return (
    <div className="uw-pcard" style={{
      borderRadius: 16, overflow: 'hidden', display: 'flex',
      border: `1px solid ${BORDER}`, position: 'relative',
      fontFamily: F,
      boxShadow: isReco ? '0 8px 28px rgba(21,19,15,0.08)' : 'none',
    }}>
      {isReco && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2,
          background: INK, color: CREAM, textAlign: 'center',
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '7px',
          borderBottom: '1px solid rgba(251,248,242,0.1)',
        }}>{plan.badge}</div>
      )}

      {/* ── LEFT ── */}
      <div className="uw-pcard-left" style={{
        background: leftBg, color: leftText,
        padding: isReco ? '42px 24px 26px' : '26px 24px',
        flex: '0 0 36%',
        borderRight: `1px solid ${BORDER}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: leftSubtle, marginBottom: 14 }}>
          {plan.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
          {isFree ? (
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em' }}>Gratuit</span>
          ) : (
            <>
              <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em' }}>{price}€</span>
              <span style={{ fontSize: 13, color: leftSubtle, fontWeight: 500 }}>/mois</span>
            </>
          )}
        </div>
        {billing === 'yearly' && !isFree && plan.price_yearly && (
          <div style={{ fontSize: 11, color: isReco ? 'rgba(251,248,242,0.4)' : 'rgba(21,19,15,0.4)' }}>
            soit {plan.price_yearly}€ facturé annuellement
          </div>
        )}
        <p style={{ fontSize: 12.5, color: isReco ? 'rgba(251,248,242,0.55)' : 'rgba(21,19,15,0.5)', lineHeight: 1.6, marginTop: 'auto' }}>
          {plan.description || ''}
        </p>
      </div>

      {/* ── RIGHT ── */}
      <div style={{
        background: CREAM_2, padding: '26px 24px', flex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(21,19,15,0.4)', marginBottom: 14 }}>
          {plan.features_header || 'Inclus :'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {(plan.features || []).map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, fontSize: 12.5, alignItems: 'flex-start', lineHeight: 1.45, color: INK }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isReco ? ORANGE : INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {isCurrent ? (
          <div style={{
            marginTop: 20, height: 42, border: `1px solid ${BORDER_STRONG}`,
            borderRadius: 100, fontSize: 13, fontWeight: 600, textAlign: 'center',
            color: 'rgba(21,19,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>Plan actuel</div>
        ) : (
          <button onClick={onCta} disabled={loading} style={{
            marginTop: 20, height: 42, border: 'none', borderRadius: 100,
            background: INK, color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: loading ? 0.6 : 1, transition: 'opacity .15s ease',
          }}>
            {loading ? 'Chargement…' : ctaLabel}
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .uw-pcard { flex-direction: column !important; }
          .uw-pcard-left { border-right: none !important; border-bottom: 1px solid rgba(21,19,15,0.10) !important; flex: none !important; }
        }
      `}</style>
    </div>
  );
}