import React from 'react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#15130F';
const CREAM = '#FAF9F6';
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

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      border: isReco ? `1px solid ${INK}` : `1px solid ${BORDER}`,
      background: WHITE,
      fontFamily: F,
      boxShadow: isReco ? '0 8px 28px rgba(21,19,15,0.10)' : 'none',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {isReco && (
        <div style={{
          background: INK, color: CREAM, textAlign: 'center',
          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '7px',
        }}>{plan.badge}</div>
      )}

      {/* ── Header: name + price ── */}
      <div style={{ padding: '22px 22px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 10 }}>
          {plan.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
          {isFree ? (
            <span style={{ fontSize: 29, fontWeight: 700, letterSpacing: '-0.03em', color: INK }}>Gratuit</span>
          ) : (
            <>
              <span style={{ fontSize: 29, fontWeight: 700, letterSpacing: '-0.03em', color: INK }}>{price}€</span>
              <span style={{ fontSize: 12.5, color: 'rgba(21,19,15,0.5)', fontWeight: 500 }}>/mois</span>
            </>
          )}
        </div>
        {billing === 'yearly' && !isFree && plan.price_yearly && (
          <div style={{ fontSize: 11, color: 'rgba(21,19,15,0.4)' }}>
            soit {plan.price_yearly}€ facturé annuellement
          </div>
        )}
        {plan.description && (
          <p style={{ fontSize: 12.5, color: 'rgba(21,19,15,0.5)', lineHeight: 1.6, margin: '10px 0 0' }}>
            {plan.description}
          </p>
        )}
      </div>

      {/* ── Features ── */}
      <div style={{ background: CREAM, padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
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
    </div>
  );
}