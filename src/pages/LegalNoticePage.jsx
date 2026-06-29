import React from "react";
import { Link } from "react-router-dom";

const CORAL = '#F95738';

function Section({ number, title, children }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: CORAL,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'rgba(249,87,56,0.10)', border: '1px solid rgba(249,87,56,0.2)',
          borderRadius: 6, padding: '3px 9px', flexShrink: 0,
        }}>{number}</span>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function P({ children, style = {} }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.85, color: '#374151', marginBottom: 14, ...style }}>
      {children}
    </p>
  );
}

function InfoCard({ children }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: '22px 26px', marginBottom: 16,
      fontSize: 14, color: '#374151', lineHeight: 2,
    }}>
      {children}
    </div>
  );
}

const TOC = [
  [1, "Éditeur du site"],
  [2, "Directeur de la publication"],
  [3, "Hébergement du site"],
  [4, "Hébergement des données (infrastructure complémentaire)"],
  [5, "Propriété intellectuelle"],
  [6, "Données personnelles"],
  [7, "Cookies"],
  [8, "Limitation de responsabilité"],
  [9, "Droit applicable"],
  [10, "Médiation à la consommation"],
  [11, "Contact"],
];

export default function LegalNoticePage() {
  return (
    <div style={{ background: '#F8F9FA', fontFamily: "'Inter', -apple-system, system-ui, sans-serif", minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        background: 'white', borderBottom: '1px solid #E5E7EB',
        height: 58, display: 'flex', alignItems: 'center',
        padding: '0 clamp(20px, 5vw, 60px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L10.5 9H1.5L6 1Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>UseWok</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link to="/" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>← Retour au site</Link>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 60px)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(249,87,56,0.15)', border: '1px solid rgba(249,87,56,0.3)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 11, color: CORAL, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>LCEN – Loi n°2004-575</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Mentions Légales
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
            Dernière mise à jour : <strong style={{ color: 'rgba(255,255,255,0.8)' }}>29 juin 2026</strong>
            <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
            <strong style={{ color: 'rgba(255,255,255,0.8)' }}>usewok.com</strong>
          </p>
        </div>
      </div>

      {/* Intro */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px clamp(20px, 3vw, 40px) 0' }}>
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '24px 28px' }}>
          <P style={{ marginBottom: 0 }}>
            Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), il est précisé aux utilisateurs du site <strong>usewok.com</strong> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
          </P>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px, 5vw, 48px) clamp(20px, 3vw, 40px)', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }}>
        <main>
          <Section number="1" title="Éditeur du site">
            <P>Le site <strong>usewok.com</strong> est édité par :</P>
            <InfoCard>
              <div>👤 <strong>Nom :</strong> Antoine Valton</div>
              <div>📋 <strong>Statut :</strong> En cours d'immatriculation</div>
              <div>📍 <strong>Adresse :</strong> Gironde, France</div>
              <div>📧 <strong>Email :</strong> <a href="mailto:support@usewok.com" style={{ color: CORAL }}>support@usewok.com</a></div>
              <div>📞 <strong>Téléphone :</strong> 07.49.80.07.74</div>
            </InfoCard>
          </Section>

          <Section number="2" title="Directeur de la publication">
            <InfoCard>
              <div>👤 Valton Antoine</div>
            </InfoCard>
          </Section>

          <Section number="3" title="Hébergement du site">
            <P>Le site <strong>usewok.com</strong> est hébergé par :</P>
            <InfoCard>
              <div>🏢 <strong>IONOS SARL</strong></div>
              <div>📍 7 Place de la Gare, BP 70109, 57200 Sarreguemines Cedex, France</div>
              <div>📞 0970 808 911</div>
              <div>🌐 <a href="https://www.ionos.fr" target="_blank" rel="noopener noreferrer" style={{ color: CORAL }}>www.ionos.fr</a></div>
            </InfoCard>
          </Section>

          <Section number="4" title="Hébergement des données (infrastructure complémentaire)">
            <P>Certaines données peuvent également être traitées ou stockées par nos prestataires techniques tiers, notamment <strong>Stripe Payments Europe Ltd</strong> (traitement des paiements) et <strong>Google LLC</strong> (Google Analytics, authentification). Pour plus de détails sur ces traitements, consultez notre <Link to="/privacy" style={{ color: CORAL }}>Politique de Confidentialité</Link>.</P>
          </Section>

          <Section number="5" title="Propriété intellectuelle">
            <P>L'ensemble du contenu du site usewok.com (textes, images, logos, code source, base de données, design) est protégé par le droit de la propriété intellectuelle et demeure la propriété exclusive de UseWok, sauf mention contraire. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite et constitue une contrefaçon sanctionnable.</P>
          </Section>

          <Section number="6" title="Données personnelles">
            <P>Le traitement des données personnelles collectées sur le site est décrit dans notre <Link to="/privacy" style={{ color: CORAL }}>Politique de Confidentialité</Link>. Vous pouvez exercer vos droits (accès, rectification, suppression, etc.) en nous contactant à <a href="mailto:compliance@usewok.com" style={{ color: CORAL }}>compliance@usewok.com</a>, et introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: CORAL }}>www.cnil.fr</a>).</P>
          </Section>

          <Section number="7" title="Cookies">
            <P>Le site utilise des cookies techniques et analytiques. Pour en savoir plus, consultez la section « Cookies » de notre <Link to="/privacy" style={{ color: CORAL }}>Politique de Confidentialité</Link>.</P>
          </Section>

          <Section number="8" title="Limitation de responsabilité">
            <P>UseWok s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site, mais ne peut garantir l'exhaustivité, l'exactitude ou l'actualité de ces informations. UseWok décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site.</P>
          </Section>

          <Section number="9" title="Droit applicable">
            <P>Les présentes mentions légales sont soumises au <strong>droit français</strong>. En cas de litige, et à défaut de résolution amiable, les tribunaux français compétents seront saisis, sous réserve des dispositions impératives protectrices applicables aux consommateurs (voir nos <Link to="/terms" style={{ color: CORAL }}>Conditions Générales d'Utilisation</Link>, section 13).</P>
          </Section>

          <Section number="10" title="Médiation à la consommation">
            <P>Conformément à l'article L616-1 du Code de la consommation, tout consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige. Voir les coordonnées du médiateur désigné dans nos <Link to="/terms" style={{ color: CORAL }}>Conditions Générales d'Utilisation</Link>, section 14.</P>
          </Section>

          <Section number="11" title="Contact">
            <P>Pour toute question relative au site ou aux présentes mentions légales :</P>
            <InfoCard>
              <div>📧 <a href="mailto:support@usewok.com" style={{ color: CORAL }}>support@usewok.com</a></div>
            </InfoCard>
          </Section>
        </main>

        {/* Sidebar TOC */}
        <aside style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Sommaire</div>
            <nav>
              {TOC.map(([num, label]) => (
                <div key={num} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: CORAL, flexShrink: 0, marginTop: 2 }}>{num}.</span>
                  <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{label}</span>
                </div>
              ))}
            </nav>
          </div>
          <div style={{ background: 'rgba(249,87,56,0.06)', border: '1px solid rgba(249,87,56,0.15)', borderRadius: 12, padding: '16px', fontSize: 13, color: '#374151', lineHeight: 1.65 }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: 6 }}>Contact</div>
            <a href="mailto:support@usewok.com" style={{ color: CORAL, fontWeight: 500, wordBreak: 'break-all' }}>support@usewok.com</a>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: '24px clamp(20px, 5vw, 60px)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
          © 2026 UseWok ·{' '}
          <Link to="/privacy" style={{ color: '#6B7280', textDecoration: 'none' }}>Confidentialité</Link>
          {' '}·{' '}
          <Link to="/terms" style={{ color: '#6B7280', textDecoration: 'none' }}>CGU</Link>
          {' '}·{' '}
          <Link to="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Accueil</Link>
        </p>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          aside { display: none !important; }
          main { grid-column: 1 / -1 !important; }
        }
      `}</style>
    </div>
  );
}