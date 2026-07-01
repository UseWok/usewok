import { useState, useEffect } from 'react';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.35)';
const CORAL = '#F95738';
const BG = '#111113';
const BORDER = 'rgba(255,255,255,0.08)';

const PRODUIT_ITEMS = [
  ['Score de Visibilité IA', 'https://usewok.com/score'],
  ['Audit IA', 'https://usewok.com/produit'],
  ["Plan d'Action", 'https://usewok.com/produit'],
  ['Comparatif Concurrents', 'https://usewok.com/produit'],
  ['Assistant IA Contextuel', 'https://usewok.com/produit'],
];
const POUR_QUI_ITEMS = [
  ['Entreprises Digitales', '#pourquoi'],
  ['Équipes Sans Marketing Interne', '#pourquoi'],
];
const RESSOURCES_ITEMS = [
  ['Analyseur de Visibilité IA Gratuit', 'https://usewok.com/analyseur-gratuit'],
  ['Base de Connaissances', 'https://usewok.com/aide'],
  ['Témoignages Clients', 'https://usewok.com/temoignages'],
  ['Mises à jour Produit', 'https://usewok.com/produit'],
];

function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button style={{ background: 'none', border: 'none', fontFamily: F, fontSize: 13, color: T2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
        {label}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 22, left: 0, minWidth: 220, background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
          {items.map(([l, h]) => (
            <a key={l} href={h} style={{ display: 'block', padding: '8px 12px', fontSize: 12.5, color: T2, textDecoration: 'none', borderRadius: 6, whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = T1; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T2; }}>
              {l}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LandingNavbar({ onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      height: 58, display: 'flex', alignItems: 'center',
      padding: '0 clamp(20px, 5vw, 60px)', fontFamily: F,
      background: scrolled ? 'rgba(10,10,11,0.9)' : 'rgba(10,10,11,0.5)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
      transition: 'background 300ms, border-color 300ms',
    }}>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L10.5 9H1.5L6 1Z" fill="white" /></svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: T1, letterSpacing: '-0.02em' }}>UseWok</span>
      </a>

      <div style={{ flex: 1 }} />

      <nav style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        <NavDropdown label="Produit" items={PRODUIT_ITEMS} />
        <NavDropdown label="Pour qui" items={POUR_QUI_ITEMS} />
        <a href="https://usewok.com/tarifs" style={{ fontSize: 13, color: T2, textDecoration: 'none' }}>Tarifs</a>
        <a href="https://usewok.com/blog" style={{ fontSize: 13, color: T2, textDecoration: 'none' }}>Blog</a>
        <NavDropdown label="Ressources" items={RESSOURCES_ITEMS} />
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'flex-end' }}>
        <button onClick={onSignup} style={{ background: 'none', border: 'none', fontFamily: F, fontSize: 13, color: T2, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Se connecter
        </button>
        <button onClick={onSignup} style={{
          fontFamily: F, fontSize: 13, fontWeight: 500,
          color: '#0A0A0B', background: T1,
          border: 'none', borderRadius: 20, padding: '6px 18px',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Démarrer Gratuitement
        </button>
      </div>
    </header>
  );
}