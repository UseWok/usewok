import React from 'react';

const WIX_FONT = "'Madefor Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/**
 * PlanCard — Carte de forfait avec design image 1 :
 * gauche blanc (ou foncé si recommandé), droite crème,
 * ligne de séparation verticale, bouton pill foncé (#222).
 */
export default function PlanCard({ plan, billing, isCurrent, onCta, loading, ctaLabel }) {
  const isReco = !!plan.badge;
  const isFree = !plan.price_monthly || plan.price_monthly === 0;
  const price = billing === 'yearly' && plan.price_yearly
    ? Math.round(plan.price_yearly / 12)
    : plan.price_monthly;

  const leftBg = isReco ? '#15130F' : '#FFFFFF';
  const leftText = isReco ? '#FBF8F2' : '#15130F';
  const leftSubtle = isReco ? 'rgba(251,248,242,0.6)' : 'rgba(21,19,15,0.55)';

  return (
    <div className="uw-pcard" style={{
      borderRadius: 22, overflow: 'hidden', display: 'flex',
      border: '1px solid rgba(21,19,15,0.10)', position: 'relative',
      fontFamily: WIX_FONT,
    }}>
      {isReco && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2,
          background: '#FF5A1F', color: '#fff', textAlign: 'center',
          fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em',
          textTransform: 'uppercase', padding: '10px',
        }}>{plan.badge}</div>
      )}

      {/* ── LEFT: blanc ou foncé ── */}
      <div className="uw-pcard-left" style={{
        background: leftBg, color: leftText,
        padding: isReco ? '48px 28px 32px' : '32px 28px',
        flex: '0 0 38%',
        borderRight: '1px solid rgba(21,19,15,0.10)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: leftSubtle, marginBottom: 14 }}>
          {plan.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
          {isFree ? (
            <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em' }}>Gratuit</span>
          ) : (
            <>
              <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em' }}>{price}€</span>
              <span style={{ fontSize: 13.5, color: leftSubtle }}>/mois</span>
            </>
          )}
        </div>
        {billing === 'yearly' && !isFree && plan.price_yearly && (
          <div style={{ fontSize: 11.5, color: isReco ? 'rgba(251,248,242,0.5)' : 'rgba(21,19,15,0.45)' }}>
            soit {plan.price_yearly}€ facturé annuellement
          </div>
        )}
        <p style={{ fontSize: 13.5, color: isReco ? 'rgba(251,248,242,0.65)' : 'rgba(21,19,15,0.55)', lineHeight: 1.55, marginTop: 'auto' }}>
          {plan.description || ''}
        </p>
      </div>

      {/* ── RIGHT: crème ── */}
      <div className="uw-pcard-right" style={{
        background: '#F7F5F2', padding: '32px 28px', flex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(21,19,15,0.5)', marginBottom: 14 }}>
          {plan.features_header || 'Inclus :'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {(plan.features || []).map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, alignItems: 'flex-start', lineHeight: 1.4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isReco ? '#FFCB6B' : '#C43E14'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        {isCurrent ? (
          <div style={{
            marginTop: 24, height: 46, border: '1px solid rgba(21,19,15,0.14)',
            borderRadius: 100, fontSize: 13.5, fontWeight: 600, textAlign: 'center',
            color: 'rgba(21,19,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>Plan actuel</div>
        ) : (
          <button onClick={onCta} disabled={loading} style={{
            marginTop: 24, height: 46, border: 'none', borderRadius: 100,
            background: '#222222', color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: loading ? 0.6 : 1, transition: 'background .15s ease, transform .1s ease',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#15130F'; }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#222222'; }}
          onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
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