const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.3)';
const CORAL = '#F95738';
const BORDER = 'rgba(255,255,255,0.07)';

const LINKS = [
  ['Produit', 'https://usewok.com/produit'],
  ['Tarifs', 'https://usewok.com/pricing'],
  ['Score de Visibilité IA', 'https://usewok.com/score'],
  ['Blog', 'https://usewok.com/blog'],
  ['Témoignages', 'https://usewok.com/temoignages'],
  ['Analyseur gratuit', 'https://usewok.com/analyseur-gratuit'],
  ['Base de connaissances', 'https://usewok.com/aide'],
  ['Contact', 'https://usewok.com/contact'],
  ['Politique de confidentialité', 'https://usewok.com/politique-de-confidentialite'],
  ['CGU', 'https://usewok.com/cgu'],
];

export default function LandingFooterSection() {
  return (
    <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(40px, 5vw, 56px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M6 1L10.5 9H1.5L6 1Z" fill="white" /></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: T1, letterSpacing: '-0.02em' }}>UseWok</span>
        </div>

        <p style={{ fontSize: 13, color: T2, lineHeight: 1.7, maxWidth: 560, margin: '0 0 28px' }}>
          UseWok aide les entreprises à comprendre leur visibilité dans les assistants IA, à identifier ce qui bloque leur présence, et à agir dessus sans expertise technique préalable.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', marginBottom: 24 }}>
          {LINKS.map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: T3, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = T2}
              onMouseLeave={e => e.currentTarget.style.color = T3}>{l}</a>
          ))}
        </div>

        <div style={{ height: 1, background: BORDER, margin: '0 0 20px' }} />

        <span style={{ fontSize: 12, color: T3 }}>UseWok © 2026 · Langue : FR</span>
      </div>
    </footer>
  );
}