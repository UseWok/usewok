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

const Icon = {
  gift: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="1" /><path d="M3 12h18" /><path d="M12 8v13" /><path d="M12 8c-1.5-4-6-4-6-1s3 1 6 1z" /><path d="M12 8c1.5-4 6-4 6-1s-3 1-6 1z" />
    </svg>
  ),
  scale: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B4740E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" /><path d="M5 7h14" /><path d="M5 7l-3 6a3 3 0 006 0l-3-6z" /><path d="M19 7l-3 6a3 3 0 006 0l-3-6z" /><path d="M8 21h8" />
    </svg>
  ),
  mail: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
  web: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" /></svg>,
};

function Section({ number, title, children }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: ORANGE_DEEP,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: ORANGE_PALE, border: '1px solid rgba(196,62,20,0.18)',
          borderRadius: 6, padding: '3px 9px', flexShrink: 0,
        }}>{number}</span>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function P({ children, style = {} }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.85, color: INK_SOFT, marginBottom: 16, ...style }}>
      {children}
    </p>
  );
}

function SubSection({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoBox({ icon, children }) {
  return (
    <div style={{
      background: ORANGE_PALE, border: '1px solid rgba(196,62,20,0.16)',
      borderRadius: 10, padding: '16px 20px', marginBottom: 16, marginTop: 8,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: INK_SOFT }}>{children}</div>
    </div>
  );
}

function WarningBox({ icon, children }) {
  return (
    <div style={{
      background: '#FDF3E3', border: '1px solid rgba(180,116,14,0.22)',
      borderRadius: 10, padding: '16px 20px', marginBottom: 16, marginTop: 8,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: INK_SOFT }}>{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 16 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 15, lineHeight: 1.75, color: INK_SOFT }}>
          <span style={{ marginTop: 8, flexShrink: 0, width: 5, height: 5, borderRadius: '50%', background: ORANGE, display: 'inline-block' }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const TOC = [
  [1, "Definitions"],
  [2, "Purpose of the Service"],
  [3, "Account creation and access"],
  [4, "Subscriptions and financial terms"],
  [5, "Intellectual property"],
  [6, "Acceptable use rules"],
  [7, "Suspension and termination by UseWok"],
  [8, "Termination by the User"],
  [9, "Warranties and disclaimer"],
  [10, "Limitation of liability"],
  [11, "Personal data"],
  [12, "Modification of these Terms"],
  [13, "Governing law and jurisdiction"],
  [14, "Consumer mediation"],
  [15, "Miscellaneous provisions"],
  [16, "Contact"],
];

export default function TermsOfServicePage() {
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
            <span style={{ fontSize: 11, color: ORANGE_DEEP, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Terms of Service</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 800, color: INK, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 15, color: INK_SOFT, margin: 0, lineHeight: 1.6 }}>
            Last updated: <strong style={{ color: INK }}>June 28, 2026</strong>
          </p>
        </div>
      </div>

      {/* Intro block */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px clamp(20px, 3vw, 40px) 0' }}>
        <div style={{
          background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12,
          padding: '28px 32px',
        }}>
          <P>These Terms of Service (the "Terms" or "Terms of Service") constitute a contract between <strong>UseWok</strong> [legal form to be completed upon registration], whose registered office is located [full address to be completed — Gironde, France] ("we", "UseWok", "the Company"), and any person using the service accessible at <a href="https://usewok.com" style={{ color: ORANGE_DEEP }}>https://usewok.com</a> (the "Service", the "User", "you").</P>
          <P style={{ marginBottom: 0 }}>By creating an account or using the Service, you fully and unreservedly accept these Terms as well as our <Link to="/privacy" style={{ color: ORANGE_DEEP }}>Privacy Policy</Link>. If you do not accept these Terms, you must not use the Service.</P>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px, 5vw, 48px) clamp(20px, 3vw, 40px)', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }}>
        <main>
          <Section number="1" title="Definitions">
            <BulletList items={[
              <><strong>"Service"</strong>: the UseWok platform accessible via the website usewok.com and any associated application.</>,
              <><strong>"Account"</strong>: the personal space created by the User to access the Service.</>,
              <><strong>"Subscription"</strong>: the paid plan subscribed to by the User to access extended features of the Service.</>,
              <><strong>"Content"</strong>: any text, data, file or element transmitted or generated by the User via the Service.</>,
            ]} />
          </Section>

          <Section number="2" title="Purpose of the Service">
            <P>UseWok is an online platform offered under a freemium model with paid subscriptions. The Company reserves the right to modify, evolve or withdraw all or part of the Service's features at any time, with or without notice, in particular for technical, legal or commercial reasons.</P>
          </Section>

          <Section number="3" title="Account creation and access">
            <SubSection title="3.1 Registration methods">
              <P>Access to the Service requires the creation of an Account, either by email registration or via login with a third-party account (Google or Facebook — "SSO"). By registering via Google or Facebook, you authorize UseWok to access your name, email address and profile picture, in accordance with our <Link to="/privacy" style={{ color: ORANGE_DEEP }}>Privacy Policy</Link>.</P>
            </SubSection>
            <SubSection title="3.2 Minimum age">
              <P>Use of the Service is reserved for persons aged at least <strong>16 years</strong>, or who have the consent of their legal representative if required by applicable law.</P>
            </SubSection>
            <SubSection title="3.3 Accuracy of information">
              <P>You agree to provide accurate, complete and up-to-date information upon registration, and to keep it current.</P>
            </SubSection>
            <SubSection title="3.4 Account security">
              <P>You are solely responsible for the confidentiality of your login credentials and for any activity conducted from your Account. You must notify us immediately at <a href="mailto:support@usewok.com" style={{ color: ORANGE_DEEP }}>support@usewok.com</a> in the event of suspected unauthorized access.</P>
            </SubSection>
          </Section>

          <Section number="4" title="Subscriptions and financial terms">
            <SubSection title="4.1 Plans">
              <P>The Service is offered under a freemium model: a free plan with limited features, and paid subscription plans that provide access to extended features.</P>
            </SubSection>
            <SubSection title="4.2 Free trial">
              <InfoBox icon={Icon.gift}>
                The <strong>"Starter"</strong> subscription plan includes a <strong>7-day</strong> free trial. At the end of this trial period, the subscription is automatically billed to the registered payment method, unless the User cancels beforehand from their Account settings.
              </InfoBox>
            </SubSection>
            <SubSection title="4.3 Payment">
              <P>Payments are processed by our third-party provider <strong>Stripe</strong>. UseWok does not have access to any bank card data, as this is managed directly by Stripe according to its own terms and security standards (PCI-DSS).</P>
            </SubSection>
            <SubSection title="4.4 No refunds">
              <P>Unless otherwise required by mandatory law, amounts paid for a subscription are neither refundable nor cancelable, including in the event of non-use of the Service during the subscription period.</P>
              <WarningBox icon={Icon.scale}>
                <strong>Important legal note:</strong> in accordance with French consumer law (Article L221-18 of the French Consumer Code), any consumer is in principle entitled to a 14-day withdrawal period for an online purchase. If the User is a consumer (and not a professional), they may exercise this right of withdrawal within 14 days of subscribing, unless they have expressly waived this right before the end of the period by requesting immediate access to the Service.
              </WarningBox>
            </SubSection>
            <SubSection title="4.5 Automatic renewal">
              <P>Paid subscriptions renew automatically at the end of their period, unless the User cancels before the renewal date from their Account settings.</P>
            </SubSection>
            <SubSection title="4.6 Price changes">
              <P>UseWok may change its prices at any time. Any price change will be communicated to the User before it takes effect and will only apply to the next renewal of the current Subscription.</P>
            </SubSection>
          </Section>

          <Section number="5" title="Intellectual property">
            <SubSection title="5.1 Ownership by UseWok">
              <P>All elements of the Service — source code, design, interface, logos, trademarks, texts, database — are the exclusive property of UseWok or its licensors, and are protected by intellectual property law. No provision of these Terms grants the User any ownership rights over these elements.</P>
            </SubSection>
            <SubSection title="5.2 License to use">
              <P>UseWok grants you a personal, non-exclusive, non-transferable and revocable right to use the Service, for the duration of your Account, exclusively for your personal needs consistent with the purpose of the Service.</P>
            </SubSection>
            <SubSection title="5.3 Prohibitions">
              <P>It is strictly prohibited to copy, reproduce, decompile, disassemble, reverse engineer, extract source code, or attempt to extract the Service's database through automated means (scraping, crawling or otherwise).</P>
            </SubSection>
          </Section>

          <Section number="6" title="Acceptable use rules">
            <P>By using the Service, you agree not to:</P>
            <BulletList items={[
              "Publish or transmit unlawful, hateful, defamatory content, or content that infringes the rights of a third party",
              "Use the Service for spam, fraud, phishing or identity theft",
              "Attempt to gain unauthorized access to the systems, accounts or data of other users",
              "Use bots, automated scripts or any other unauthorized means to interact with the Service",
              "Disrupt or intentionally overload the Service's infrastructure",
              "Circumvent any security or limitation measures put in place by UseWok",
            ]} />
          </Section>

          <Section number="7" title="Suspension and termination by UseWok">
            <P>UseWok reserves the right to suspend, restrict or terminate, at any time and without notice, any User's access to the Service, in particular in the event of a breach of these Terms, fraudulent behavior, or a risk to the security of the Service or other users. Such termination does not entitle the User to any refund of amounts already paid, unless otherwise required by law.</P>
          </Section>

          <Section number="8" title="Termination by the User">
            <P>You can delete your Account at any time from the Service settings. Deleting your Account results in the deletion of your personal data in accordance with our <Link to="/privacy" style={{ color: ORANGE_DEEP }}>Privacy Policy</Link>, subject to data that we are legally required to retain (in particular billing data, retained for 10 years).</P>
          </Section>

          <Section number="9" title="Warranties and disclaimer">
            <div style={{
              background: CREAM_2, border: '1px solid rgba(21,19,15,0.10)', borderRadius: 10,
              padding: '20px 24px', marginBottom: 16,
            }}>
              <P style={{ fontSize: 13, fontFamily: 'monospace', color: INK_SOFT, marginBottom: 0, lineHeight: 1.7, letterSpacing: '0.01em' }}>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." USEWOK DOES NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR PERFECTLY SECURE. TO THE EXTENT PERMITTED BY LAW, USEWOK DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
              </P>
            </div>
          </Section>

          <Section number="10" title="Limitation of liability">
            <div style={{
              background: CREAM_2, border: '1px solid rgba(21,19,15,0.10)', borderRadius: 10,
              padding: '20px 24px', marginBottom: 16,
            }}>
              <P style={{ fontSize: 13, fontFamily: 'monospace', color: INK_SOFT, marginBottom: 0, lineHeight: 1.7, letterSpacing: '0.01em' }}>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, USEWOK SHALL NOT BE LIABLE FOR ANY INDIRECT DAMAGES, LOSS OF DATA, LOSS OF REVENUE OR FINANCIAL LOSS SUFFERED BY THE USER AS A RESULT OF USING OR BEING UNABLE TO USE THE SERVICE. USEWOK'S TOTAL LIABILITY, FROM ALL CAUSES, SHALL BE LIMITED TO THE TOTAL AMOUNT PAID BY THE USER FOR THEIR SUBSCRIPTION DURING THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE DAMAGE.
              </P>
            </div>
            <P>This limitation does not apply in cases of gross negligence, willful misconduct, or bodily injury, in accordance with the mandatory provisions of French law.</P>
          </Section>

          <Section number="11" title="Personal data">
            <P>The processing of your personal data is governed by our <Link to="/privacy" style={{ color: ORANGE_DEEP }}>Privacy Policy</Link>, which is an integral part of these Terms.</P>
          </Section>

          <Section number="12" title="Modification of these Terms">
            <P>UseWok may modify these Terms at any time. Any material change will be communicated to you by email or via a notification on the Service, before it takes effect. Continued use of the Service after notification constitutes acceptance of the modified Terms.</P>
          </Section>

          <Section number="13" title="Governing law and jurisdiction">
            <P>These Terms are governed by <strong>French law</strong>.</P>
            <InfoBox icon={Icon.scale}>
              <strong>Legal note:</strong> if you are a consumer residing in France, you benefit from the mandatory right to bring any dispute before either the court of your place of residence or that of UseWok's registered office, in accordance with Article 46 of the French Code of Civil Procedure and the protective provisions of consumer law. No clause of these Terms may limit this right.<br /><br />
              If you are acting as a professional, the courts of the jurisdiction of UseWok's registered office shall have sole jurisdiction.
            </InfoBox>
          </Section>

          <Section number="14" title="Consumer mediation">
            <P>In accordance with Articles L611-1 et seq. of the French Consumer Code, in the event of a dispute not resolved directly with our support service, any consumer has the right to use a consumer mediator free of charge. [Name and contact details of the mediator to be designated before the official launch — a legal requirement in France for any B2C website].</P>
            <P>You can also use the European Online Dispute Resolution platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: ORANGE_DEEP }}>ec.europa.eu/consumers/odr</a>.</P>
          </Section>

          <Section number="15" title="Miscellaneous provisions">
            <BulletList items={[
              <><strong>Entire agreement:</strong> these Terms and the Privacy Policy constitute the entire agreement between you and UseWok regarding the use of the Service.</>,
              <><strong>Severability:</strong> if any clause of these Terms is found to be invalid or unenforceable, the remaining clauses shall remain in full force and effect.</>,
              <><strong>No waiver:</strong> the failure of UseWok to enforce a right provided in these Terms does not constitute a waiver of that right.</>,
              <><strong>Assignment:</strong> UseWok may assign these Terms to any third party in the context of a transfer of its business. The User may not assign their rights without prior written consent from UseWok.</>,
            ]} />
          </Section>

          <Section number="16" title="Contact">
            <P>For any questions regarding these Terms, contact us at:</P>
            <div style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12, padding: '24px 28px' }}>
              <div style={{ fontSize: 14, color: INK_SOFT, lineHeight: 2.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.mail} <a href="mailto:support@usewok.com" style={{ color: ORANGE_DEEP }}>support@usewok.com</a></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.web} <a href="https://usewok.com" style={{ color: ORANGE_DEEP }}>https://usewok.com</a></div>
              </div>
            </div>
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
            <div style={{ fontWeight: 700, color: INK, marginBottom: 6 }}>Questions?</div>
            <a href="mailto:support@usewok.com" style={{ color: ORANGE_DEEP, fontWeight: 600 }}>support@usewok.com</a>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1px solid rgba(21,19,15,0.10)', padding: '24px clamp(20px, 5vw, 60px)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: INK_SOFT, margin: 0 }}>
          © 2026 UseWok — The AI visibility platform ·{' '}
          <Link to="/privacy" style={{ color: INK_SOFT, textDecoration: 'none' }}>Privacy Policy</Link>
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