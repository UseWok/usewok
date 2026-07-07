import React from 'react';

const F = "'Wix Madefor Text', 'Inter', system-ui, sans-serif";
const INK = '#15130F';
const WHITE = '#FFFFFF';
const ORANGE_BTN = '#FF7A33';
const GREEN = '#1E9E5A';
const BORDER = 'rgba(21,19,15,0.10)';
const BORDER_STRONG = 'rgba(21,19,15,0.14)';

const ENGINE_LOGOS = {
  chatgpt:    'https://media.base44.com/images/public/6a2edc91082e534601118582/67cb277ed_image.png',
  gemini:     'https://media.base44.com/images/public/6a2edc91082e534601118582/f37dc5b5a_image.png',
  claude:     'https://media.base44.com/images/public/6a2edc91082e534601118582/d67c08a4b_image.png',
  perplexity: 'https://media.base44.com/images/public/6a2edc91082e534601118582/8e9ccea01_image.png',
  mistral:    'https://media.base44.com/images/public/6a2edc91082e534601118582/3a3745646_image.png',
  grok:       'https://media.base44.com/images/public/6a2edc91082e534601118582/ddf7fe28b_image.png',
  copilot:    'https://media.base44.com/images/public/6a2edc91082e534601118582/92bb51643_image.png',
  llama:      'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/116d6a5ab_generated_image.png',
};

const ENGINE_ORDER = ['chatgpt', 'gemini', 'claude', 'perplexity', 'copilot', 'grok', 'mistral', 'llama'];

export default function PlanCard({ plan, billing, isCurrent, onCta, loading, ctaLabel }) {
  const isReco = !!plan.badge;
  const isFree = !plan.price_monthly || plan.price_monthly === 0;
  const price = billing === 'yearly' && plan.price_yearly
    ? Math.round(plan.price_yearly / 12)
    : plan.price_monthly;

  const engines = [...(plan.engines || [])].sort((a, b) => {
    const ia = ENGINE_ORDER.indexOf(a), ib = ENGINE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const scanLabel = plan.scans_per_period
    ? plan.scans_per_period === -1
      ? 'Unlimited scans'
      : `${plan.scans_per_period} scan${plan.scans_per_period > 1 ? 's' : ''} /${plan.scan_period === 'day' ? 'day' : plan.scan_period === 'week' ? 'week' : 'month'}`
    : null;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Wix+Madefor+Text:wght@400;500;600;700;800&display=swap');`}</style>
      <div style={{
        borderRadius: 16, overflow: 'hidden',
        border: isReco ? `1px solid ${BORDER_STRONG}` : '1px solid rgba(21,19,15,0.06)',
        background: WHITE,
        fontFamily: F,
        boxShadow: isReco ? '0 4px 20px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', height: '100%',
      }}>

        {/* ── Badge (text only, no orange bg) ── */}
        {isReco && (
          <div style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: ORANGE_BTN, padding: '10px 0 0',
          }}>{plan.badge}</div>
        )}

        {/* ── Header ── */}
        <div style={{ padding: isReco ? '4px 20px 16px' : '20px 20px 16px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: INK, marginBottom: 8, letterSpacing: '-0.01em' }}>
            {plan.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
            {isFree ? (
              <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', color: INK }}>Free</span>
            ) : (
              <>
                <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', color: INK }}>${price}</span>
                <span style={{ fontSize: 12.5, color: 'rgba(21,19,15,0.5)', fontWeight: 500 }}>/mo</span>
              </>
            )}
          </div>
          {/* ── AI engines + scans ── */}
          {engines.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 0' }}>
                {engines.map((eng, i) => (
                  <div key={eng} style={{
                    width: 26, height: 26, borderRadius: '50%', background: WHITE,
                    border: `2px solid ${WHITE}`, boxShadow: `0 0 0 1px ${BORDER}`, marginLeft: i > 0 ? -5 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                  }}>
                    <img src={ENGINE_LOGOS[eng]} alt={eng}
                      width={eng === 'llama' ? 22 : 18} height={eng === 'llama' ? 22 : 18}
                      style={{ objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
              {scanLabel && (
                <div style={{ fontSize: 11.5, color: 'rgba(21,19,15,0.5)', marginTop: 7 }}>{scanLabel}</div>
              )}
            </>
          )}

          {isCurrent ? (
            <div style={{
              marginTop: 16, height: 42, border: `1px solid ${BORDER_STRONG}`,
              borderRadius: 10, fontSize: 12.5, fontWeight: 600, textAlign: 'center',
              color: 'rgba(21,19,15,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>Current plan</div>
          ) : (
            <button onClick={onCta} disabled={loading} style={{
              marginTop: 16, height: 42, borderRadius: 10,
              border: isReco ? 'none' : `1px solid ${BORDER_STRONG}`,
              background: isReco ? INK : WHITE, color: isReco ? WHITE : INK, fontSize: 12.5, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: loading ? 0.6 : 1, transition: 'opacity .15s ease', width: '100%',
            }}>
              {loading ? 'Loading…' : ctaLabel}
            </button>
          )}
        </div>

        {/* ── Features (no delimiter line) ── */}
        <div style={{ background: WHITE, padding: '4px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(21,19,15,0.4)', marginBottom: 12 }}>
            {plan.features_header || 'Plan highlights:'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
            {(plan.features || []).map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, fontSize: 12, alignItems: 'flex-start', lineHeight: 1.45, color: INK }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}