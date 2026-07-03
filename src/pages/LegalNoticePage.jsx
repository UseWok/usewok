import React from "react";
import { Link } from "react-router-dom";

const ORANGE = '#FF5A1F';
const ORANGE_DEEP = '#C43E14';
const ORANGE_PALE = '#FFE7D6';
const CREAM = '#FBF8F2';
const CREAM_2 = '#F3EEE3';
const INK = '#15130F';
const INK_SOFT = '#4A453B';
const F = "'Inter', -apple-system, system-ui, sans-serif";

function Section({ number, title, children }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: ORANGE_DEEP,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: ORANGE_PALE, border: '1px solid rgba(196,62,20,0.18)',
          borderRadius: 6, padding: '3px 9px', flexShrink: 0,
        }}>{number}</span>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function P({ children, style = {} }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.85, color: INK_SOFT, marginBottom: 14, ...style }}>
      {children}
    </p>
  );
}

function InfoCard({ children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12,
      padding: '22px 26px', marginBottom: 16,
      fontSize: 14, color: INK_SOFT, lineHeight: 2,
    }}>
      {children}
    </div>
  );
}

const TOC = [
  [1, "Site publisher"],
  [2, "Publication director"],
  [3, "Website hosting"],
  [4, "Data hosting (additional infrastructure)"],
  [5, "Intellectual property"],
  [6, "Personal data"],
  [7, "Cookies"],
  [8, "Limitation of liability"],
  [9, "Governing law"],
  [10, "Consumer mediation"],
  [11, "Contact"],
];

export default function LegalNoticePage() {
  return (
    <div style={{ background: CREAM, fontFamily: F, minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        background: CREAM, borderBottom: '1px solid rgba(21,19,15,0.10)',
        height: 62, display: 'flex', alignItems: 'center',
        padding: '0 clamp(20px, 5vw, 60px)', position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(14px)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L10.5 9H1.5L6 1Z" fill={CREAM} />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: INK, letterSpacing: '-0.02em' }}>UseWok</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link to="/" style={{ fontSize: 13, color: INK_SOFT, textDecoration: 'none', fontWeight: 500 }}>&larr; Back to site</Link>
      </nav>

      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: `radial-gradient(70% 90% at 15% 10%, #FFD9BE 0%, transparent 55%),
                     radial-gradient(70% 90% at 88% 15%, #FFB98F 0%, transparent 55%),
                     linear-gradient(180deg, #FBF8F2 0%, #FFF3E9 100%)`,
        padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 60px)',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(196,62,20,0.08) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(ellipse 60% 70% at 50% 30%, black 0%, transparent 70%)',
        }} />
        <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#fff', border: '1px solid rgba(196,62,20,0.2)',
            borderRadius: 20, padding: '5px 14px', marginBottom: 22,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: ORANGE, display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: ORANGE_DEEP, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>LCEN — French Law No. 2004-575</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 800, color: INK, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            Legal Notice
          </h1>
          <p style={{ fontSize: 15, color: INK_SOFT, margin: 0, lineHeight: 1.6 }}>
            Last updated: <strong style={{ color: INK }}>June 29, 2026</strong>
            <span style={{ margin: '0 8px', opacity: 0.35 }}>·</span>
            <strong style={{ color: INK }}>usewok.com</strong>
          </p>
        </div>
      </div>

      {/* Intro */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px clamp(20px, 3vw, 40px) 0' }}>
        <div style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12, padding: '24px 28px' }}>
          <P style={{ marginBottom: 0 }}>
            In accordance with the provisions of French Law No. 2004-575 of June 21, 2004 for confidence in the digital economy (LCEN), users of the site <strong>usewok.com</strong> are informed of the identity of the various parties involved in its creation and maintenance.
          </P>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px, 5vw, 48px) clamp(20px, 3vw, 40px)', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }}>
        <main>
          <Section number="1" title="Site publisher">
            <P>The site <strong>usewok.com</strong> is published by:</P>
            <InfoCard>
              <div><strong>Name:</strong> Antoine Valton</div>
              <div><strong>Status:</strong> Registration in progress</div>
              <div><strong>Address:</strong> Gironde, France</div>
              <div><strong>Email:</strong> <a href="mailto:support@usewok.com" style={{ color: ORANGE_DEEP }}>support@usewok.com</a></div>
              <div><strong>Phone:</strong> +33 7 49 80 07 74</div>
            </InfoCard>
          </Section>

          <Section number="2" title="Publication director">
            <InfoCard>
              <div>Antoine Valton</div>
            </InfoCard>
          </Section>

          <Section number="3" title="Website hosting">
            <P>The site <strong>usewok.com</strong> is hosted by:</P>
            <InfoCard>
              <div><strong>IONOS SARL</strong></div>
              <div>7 Place de la Gare, BP 70109, 57200 Sarreguemines Cedex, France</div>
              <div>+33 970 808 911</div>
              <div><a href="https://www.ionos.fr" target="_blank" rel="noopener noreferrer" style={{ color: ORANGE_DEEP }}>www.ionos.fr</a></div>
            </InfoCard>
          </Section>

          <Section number="4" title="Data hosting (additional infrastructure)">
            <P>Some data may also be processed or stored by our third-party technical providers, including <strong>Stripe Payments Europe Ltd</strong> (payment processing) and <strong>Google LLC</strong> (Google Analytics, authentication). For more details on these processing activities, please consult our <Link to="/privacy" style={{ color: ORANGE_DEEP }}>Privacy Policy</Link>.</P>
          </Section>

          <Section number="5" title="Intellectual property">
            <P>All content on the usewok.com site (texts, images, logos, source code, databases, design) is protected by intellectual property law and remains the exclusive property of UseWok, unless otherwise stated. Any reproduction, representation, modification or exploitation, in whole or in part, without prior written authorization, is prohibited and constitutes infringement subject to penalties.</P>
          </Section>

          <Section number="6" title="Personal data">
            <P>The processing of personal data collected on the site is described in our <Link to="/privacy" style={{ color: ORANGE_DEEP }}>Privacy Policy</Link>. You may exercise your rights (access, rectification, deletion, etc.) by contacting us at <a href="mailto:compliance@usewok.com" style={{ color: ORANGE_DEEP }}>compliance@usewok.com</a>, and file a complaint with the CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: ORANGE_DEEP }}>www.cnil.fr</a>).</P>
          </Section>

          <Section number="7" title="Cookies">
            <P>The site uses technical and analytical cookies. For more information, please refer to the "Cookies" section of our <Link to="/privacy" style={{ color: ORANGE_DEEP }}>Privacy Policy</Link>.</P>
          </Section>

          <Section number="8" title="Limitation of liability">
            <P>UseWok strives to ensure the accuracy and timeliness of the information published on the site, but cannot guarantee the completeness, accuracy or currency of such information. UseWok disclaims any liability for any imprecision, inaccuracy or omission regarding information available on the site.</P>
          </Section>

          <Section number="9" title="Governing law">
            <P>These legal notices are governed by <strong>French law</strong>. In the event of a dispute, and failing an amicable resolution, the competent French courts shall have jurisdiction, subject to mandatory consumer protection provisions (see our <Link to="/terms" style={{ color: ORANGE_DEEP }}>Terms of Service</Link>, section 13).</P>
          </Section>

          <Section number="10" title="Consumer mediation">
            <P>In accordance with Article L616-1 of the French Consumer Code, any consumer has the right to use a consumer mediator free of charge for the amicable resolution of a dispute. See the mediator's contact details in our <Link to="/terms" style={{ color: ORANGE_DEEP }}>Terms of Service</Link>, section 14.</P>
          </Section>

          <Section number="11" title="Contact">
            <P>For any question regarding the site or these legal notices:</P>
            <InfoCard>
              <div><a href="mailto:support@usewok.com" style={{ color: ORANGE_DEEP }}>support@usewok.com</a></div>
            </InfoCard>
          </Section>
        </main>

        {/* Sidebar TOC */}
        <aside style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: INK_SOFT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Table of contents</div>
            <nav>
              {TOC.map(([num, label]) => (
                <div key={num} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE_DEEP, flexShrink: 0, marginTop: 2 }}>{num}.</span>
                  <span style={{ fontSize: 12, color: INK_SOFT, lineHeight: 1.4 }}>{label}</span>
                </div>
              ))}
            </nav>
          </div>
          <div style={{ background: ORANGE_PALE, border: '1px solid rgba(196,62,20,0.16)', borderRadius: 12, padding: '16px', fontSize: 13, color: INK_SOFT, lineHeight: 1.65 }}>
            <div style={{ fontWeight: 700, color: INK, marginBottom: 6 }}>Contact</div>
            <a href="mailto:support@usewok.com" style={{ color: ORANGE_DEEP, fontWeight: 600, wordBreak: 'break-all' }}>support@usewok.com</a>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1px solid rgba(21,19,15,0.10)', padding: '24px clamp(20px, 5vw, 60px)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: INK_SOFT, margin: 0 }}>
          © 2026 UseWok ·{' '}
          <Link to="/privacy" style={{ color: INK_SOFT, textDecoration: 'none' }}>Privacy</Link>
          {' '}·{' '}
          <Link to="/terms" style={{ color: INK_SOFT, textDecoration: 'none' }}>Terms</Link>
          {' '}·{' '}
          <Link to="/" style={{ color: INK_SOFT, textDecoration: 'none' }}>Home</Link>
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