import React from 'react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#15130F';

const ISO_LOGO = 'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/098088bd6_generated_image.png';
const RGPD_LOGO = 'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/caaf4215e_generated_image.png';

function Badge({ logo, flag, title, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#F2F1ED', borderRadius: 12, padding: '16px 20px', flex: '1 1 240px', maxWidth: 300 }}>
      {flag ? (
        <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', display: 'flex', boxShadow: '0 0 0 1px rgba(21,19,15,0.08)' }}>
          <div style={{ flex: 1, background: '#0055A4' }} />
          <div style={{ flex: 1, background: '#FFFFFF' }} />
          <div style={{ flex: 1, background: '#EF4135' }} />
        </div>
      ) : (
        <img src={logo} alt={title} width={40} height={40} style={{ borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} />
      )}
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(21,19,15,0.55)', lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function SecurityBadges() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch', gap: 16, fontFamily: F }}>
      <Badge logo={ISO_LOGO} title="ISO 27001" desc="ISO security management" />
      <Badge flag title="Made in France" desc="Designed & hosted in France" />
      <Badge logo={RGPD_LOGO} title="GDPR" desc="Data protection & privacy regulation" />
    </div>
  );
}