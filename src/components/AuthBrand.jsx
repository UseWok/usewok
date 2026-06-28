import React from "react";

const CORAL = '#F95738';
const BG = '#0A0A0B';

const features = [
  { icon: '🎯', text: 'Score de visibilité IA en 30 secondes' },
  { icon: '🔍', text: 'Audit précis sur 8 moteurs IA' },
  { icon: '🛠️', text: 'Plan de correction guidé étape par étape' },
];

export default function AuthBrand() {
  return (
    <div className="hidden lg:flex w-1/2 relative overflow-hidden" style={{
      background: 'linear-gradient(145deg, #F95738 0%, #e8401f 40%, #c73010 100%)',
    }}>
      {/* Noise texture overlay */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)',
      }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px]" style={{
        background: 'radial-gradient(ellipse at 80% 80%, rgba(0,0,0,0.18) 0%, transparent 60%)',
      }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Top logo */}
        <div className="flex items-center gap-2">
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L10.5 9H1.5L6 1Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>UseWok</span>
        </div>

        {/* Main content */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 20, padding: '4px 12px', marginBottom: 24
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white', opacity: 0.9 }} />
            <span style={{ fontSize: 11, color: 'white', fontWeight: 600, letterSpacing: '0.04em' }}>8 moteurs IA analysés</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 3.5vw, 40px)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            Vos clients demandent<br />
            à ChatGPT à qui faire appel.
            <br />
            <span style={{ opacity: 0.75, fontWeight: 600 }}>Votre nom sort-il ?</span>
          </h2>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, marginBottom: 36, maxWidth: 380 }}>
            UseWok analyse votre présence sur les 8 principaux moteurs IA et vous donne un plan d'action clair.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0
                }}>{f.icon}</div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            © 2026 UseWok — L'outil français de visibilité IA
          </p>
        </div>
      </div>
    </div>
  );
}