import React from "react";
import { Link } from "react-router-dom";

const ORANGE = '#FF5A1F';
const ORANGE_DEEP = '#C43E14';
const ORANGE_PALE = '#FFE7D6';
const AMBER = '#FFCB6B';
const CREAM = '#FBF8F2';
const CREAM_2 = '#F3EEE3';
const INK = '#15130F';
const INK_SOFT = '#4A453B';
const F = "'Inter', -apple-system, system-ui, sans-serif";

/* ---------- minimal icon set (replaces emoji) ---------- */
const Icon = {
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="8" r="0.5" fill={ORANGE_DEEP} />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B4740E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 16H3l9-16z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.5" fill="#B4740E" />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E7A4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.3 2.3L16 10" />
    </svg>
  ),
  google: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M8 12h8M12 8v8" />
    </svg>
  ),
  apple: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C7 21 4 16 4 12a5 5 0 018-4 5 5 0 018 4c0 4-3 9-8 9z" />
    </svg>
  ),
  pin: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK_SOFT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-6.5 7-11a7 7 0 10-14 0c0 4.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>,
  mail: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>,
  web: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" /></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK_SOFT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v4a2 2 0 01-2 2C9 21 3 15 3 6a2 2 0 011-2z" /></svg>,
  access: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>,
  rectify: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></svg>,
  erase: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /></svg>,
  block: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M5.5 5.5l13 13" /></svg>,
  pause: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>,
  portable: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ORANGE_DEEP} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.3 7L12 12l8.7-5M12 22V12" /></svg>,
};

function Section({ number, title, children }) {
  return (
    <section style={{ marginBottom: 72 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: ORANGE_DEEP,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: ORANGE_PALE, border: '1px solid rgba(196,62,20,0.18)',
          borderRadius: 6, padding: '3px 9px', flexShrink: 0,
        }}>{number}</span>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em' }}>{title}</h2>
      </div>
      <div>{children}</div>
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
      <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>{title}</h3>
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

function SuccessBox({ icon, children }) {
  return (
    <div style={{
      background: '#EBF6F0', border: '1px solid rgba(30,122,76,0.2)',
      borderRadius: 10, padding: '16px 20px', marginBottom: 16, marginTop: 8,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: INK_SOFT }}>{children}</div>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 20, marginTop: 8, borderRadius: 10, border: `1px solid ${'rgba(21,19,15,0.10)'}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: F }}>
        <thead>
          <tr style={{ background: CREAM_2 }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '12px 16px', textAlign: 'left', fontWeight: 700,
                color: INK, borderBottom: '1px solid rgba(21,19,15,0.10)',
                fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(21,19,15,0.06)' : 'none' }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '13px 16px', color: INK_SOFT, lineHeight: 1.6,
                  verticalAlign: 'top',
                  background: i % 2 === 0 ? '#fff' : CREAM_2,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 16 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 15, lineHeight: 1.75, color: INK_SOFT }}>
          <span style={{ color: ORANGE, marginTop: 8, flexShrink: 0, width: 5, height: 5, borderRadius: '50%', background: ORANGE, display: 'inline-block' }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RightCard({ icon, title, desc }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12,
      padding: '24px', marginBottom: 12, display: 'flex', gap: 16, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 44, height: 44, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: CREAM_2, borderRadius: 10, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

const TOC = [
  [1, "Introduction and updates"],
  [2, "Identity of the data controller"],
  [3, "Data collected"],
  [4, "Legal basis for processing"],
  [5, "Purposes of processing"],
  [6, "Data sharing with third parties"],
  [7, "International data transfers"],
  [8, "Data retention period"],
  [9, "Data security"],
  [10, "Cookies and tracking technologies"],
  [11, "Your rights regarding personal data"],
  [12, "Contact and complaints"],
];

export default function PrivacyPolicyPage() {
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
            <span style={{ fontSize: 11, color: ORANGE_DEEP, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>GDPR Compliance</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: 800, color: INK, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.08 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: INK_SOFT, margin: 0, lineHeight: 1.6 }}>
            Last updated: <strong style={{ color: INK }}>June 28, 2026</strong>
            <span style={{ margin: '0 8px', opacity: 0.35 }}>·</span>
            Applies to <strong style={{ color: INK }}>usewok.com</strong>
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(20px, 3vw, 40px)', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }}>
        <main>
          <Section number="1" title="Introduction and updates">
            <P>This privacy policy describes how <strong>UseWok, Inc.</strong> and its affiliates (hereinafter "UseWok", "we", "our" or "us") process personal information collected through our website accessible at <a href="https://usewok.com" style={{ color: ORANGE_DEEP }}>https://usewok.com</a> (the "Site") and our online service platform (the "Platform").</P>
            <P>This policy has been drafted in accordance with Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data ("GDPR") and the French law No. 78-17 of 6 January 1978 on data processing, files and civil liberties ("Data Protection Act"), as amended by law No. 2018-493 of 20 June 2018.</P>
            <P>We may update this policy at any time by posting a new version on this page and changing the "Last updated" date. We recommend that you review it regularly. In the event of a material change, we will notify you by email or via a notification on the Platform.</P>
          </Section>

          <Section number="2" title="Identity of the data controller">
            <P>The data controller of your personal data, within the meaning of the GDPR, is:</P>
            <div style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12, padding: '24px 28px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: INK, marginBottom: 12 }}>UseWok, Inc.</div>
              <div style={{ fontSize: 14, color: INK_SOFT, lineHeight: 2.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.pin} Libourne, Gironde, France</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.mail} <a href="mailto:compliance@usewok.com" style={{ color: ORANGE_DEEP }}>compliance@usewok.com</a></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.web} <a href="https://usewok.com" style={{ color: ORANGE_DEEP }}>https://usewok.com</a></div>
              </div>
            </div>
            <P>For any questions regarding this policy or your personal data, please contact us at the email address indicated above. We are committed to responding within a reasonable timeframe.</P>
          </Section>

          <Section number="3" title="Data collected">
            <P>We collect different categories of personal data depending on how you interact with the Platform.</P>

            <SubSection title="3.1 Data actively provided by the user">
              <BulletList items={[
                <><strong>Identity:</strong> First and last name provided during direct email registration, or transmitted automatically by your third-party authentication provider (Google, Apple).</>,
                <><strong>Email address:</strong> Used as your primary account identifier and as a means of communication with you.</>,
                <><strong>Password:</strong> Only for accounts created via email. Stored exclusively as a hashed and irreversible value (bcrypt). UseWok never has access to your plaintext password.</>,
                <><strong>Support content:</strong> Any message, problem description or other information you transmit via our customer support ticketing system.</>,
              ]} />
            </SubSection>

            <SubSection title="3.2 Google Data — Specific Clause (Google OAuth Requirement)">
              <InfoBox icon={Icon.google}>
                <strong>Authentication via "Continue with Google"</strong><br />
                When you choose to sign in or create an account via the "Continue with Google" button, UseWok accesses the following data from your Google account, within the limited permissions (scopes) you authorize:
              </InfoBox>
              <BulletList items={[
                <><strong>Access:</strong> Name, email address, Google profile picture. The scopes used are strictly limited to: openid, email, profile.</>,
                <><strong>Use:</strong> This data is used exclusively to create your UseWok account and authenticate you during subsequent logins. It is not used for any other purpose.</>,
                <><strong>Storage:</strong> Your name and email address are stored in our secure database. Your Google profile picture is not stored on our servers: it is loaded dynamically from Google's servers at the time of display in the interface.</>,
                <><strong>Sharing:</strong> We do not transfer, sell or share your Google data with third parties, with the exception of the technical subprocessors listed in Article 6, strictly for the provision of the service and their contractual obligations.</>,
              ]} />
              <P style={{ fontSize: 13, color: INK_SOFT, fontStyle: 'italic' }}>UseWok does not request access to your Google services (Drive, Gmail, Calendar, Contacts, etc.). Only basic profile information is requested, in accordance with the principle of least privilege.</P>
            </SubSection>

            <SubSection title="3.3 Apple Data — Specific Clause">
              <InfoBox icon={Icon.apple}>
                <strong>Authentication via "Continue with Apple"</strong>
              </InfoBox>
              <BulletList items={[
                <><strong>Access:</strong> Email address (real or anonymized via Apple's "Hide My Email" feature), first and last name (only during the first connection, if you choose to share them).</>,
                <><strong>Use:</strong> This data is used exclusively to create and authenticate your UseWok account.</>,
                <><strong>Storage:</strong> Only your unique Apple identifier and email address are stored in our secure database.</>,
                <><strong>Sharing:</strong> We do not transfer or sell your Apple data to any third party for commercial purposes.</>,
              ]} />
            </SubSection>

            <SubSection title="3.4 Data collected passively">
              <BulletList items={[
                <><strong>Connection logs:</strong> IP address, timestamps of logins and logouts, session identifier.</>,
                <><strong>Behavioral data:</strong> Pages visited on the Platform, actions performed (clicks, navigation), session duration. This data is collected through our analytics tools (see Article 10).</>,
                <><strong>Technical data:</strong> Browser type and version, operating system, screen resolution, browser language.</>,
                <><strong>Cookies and similar technologies:</strong> See Article 10 of this policy.</>,
              ]} />
            </SubSection>
          </Section>

          <Section number="4" title="Legal basis for processing">
            <P>In accordance with Article 6 of the GDPR, each processing of personal data carried out by UseWok is based on one of the following legal bases:</P>
            <Table
              headers={['Purpose of processing', 'GDPR legal basis']}
              rows={[
                ['Creation and management of user account', 'Performance of contract — Art. 6.1.b'],
                ['Authentication (Google, Apple, email)', 'Performance of contract — Art. 6.1.b'],
                ['Subscription and payment processing (Stripe)', 'Performance of contract — Art. 6.1.b'],
                ['Fraud prevention, security, logging', 'Legitimate interest — Art. 6.1.f'],
                ['Audience analytics and service improvement', 'Legitimate interest / Consent (cookies) — Art. 6.1.a & f'],
                ['Customer support', 'Performance of contract / Legitimate interest — Art. 6.1.b & f'],
                ['Marketing communications and newsletters', 'Explicit consent — Art. 6.1.a'],
                ['Retention of billing data', 'Legal obligation (accounting) — Art. L123-22 French Commercial Code'],
                ['Response to competent authorities', 'Legal obligation — Art. 6.1.c'],
              ]}
            />
          </Section>

          <Section number="5" title="Purposes of processing">
            <P>UseWok processes your personal data for the following purposes, each justified by an appropriate legal basis (see Article 4):</P>
            <BulletList items={[
              <><strong>Provision of the service:</strong> Create and manage your account, authenticate you, and give you access to the Platform features you have subscribed to.</>,
              <><strong>Subscription management and billing:</strong> Process your payments, manage your monthly or annual subscriptions (the Starter subscription includes a 7-day free trial), issue payment receipts, via our provider Stripe, Inc.</>,
              <><strong>Customer support:</strong> Respond to your support requests via our ticketing system, resolve technical issues and handle disputes related to the use of the service.</>,
              <><strong>Security and fraud prevention:</strong> Detect, prevent and address unauthorized access attempts, fraudulent behavior, cyberattacks and any activity likely to compromise the integrity of the Platform or the security of users.</>,
              <><strong>Service improvement:</strong> Analyze the use of the Platform to identify areas for improvement, correct malfunctions and develop new features.</>,
              <><strong>Transactional communications:</strong> Send you notifications related to your account (registration confirmation, security alerts, payment receipts, subscription expiration).</>,
              <><strong>Marketing communications:</strong> With your prior explicit consent, send you promotional communications, newsletters or information about new features. You can unsubscribe at any time.</>,
              <><strong>Legal obligations:</strong> Comply with our legal and regulatory obligations, respond to orders from competent authorities and court decisions.</>,
            ]} />
          </Section>

          <Section number="6" title="Data sharing with third parties">
            <P>UseWok <strong>does not sell, rent or transfer any personal data</strong> to third parties for commercial purposes.</P>
            <P>Your data may be shared only with the following categories of subprocessors, strictly for the provision of the service and based on contractual agreements that comply with the GDPR:</P>
            <Table
              headers={['Provider', 'Role', 'Data transmitted', 'Location']}
              rows={[
                ['IONOS SE', 'Hosting / Infrastructure', 'Account data, server logs', 'Germany (European Union)'],
                ['Stripe, Inc.', 'Secure payment processing', "Email address, payment history. Bank card details are processed directly by Stripe, never stored by UseWok.", 'United States (SCCs in force)'],
                ['Google LLC (Analytics)', 'Audience analytics', 'Anonymized browsing data, truncated IP address', 'United States (SCCs in force)'],
                ['Base44, Inc.', 'Application and behavioral analytics', 'Pseudonymized behavioral data (clicks, pages)', 'United States (SCCs in force)'],
                ['Future email provider', 'Sending communications (with consent)', 'Email address only', 'To be specified at launch'],
              ]}
            />
            <P>All our subprocessors established outside the European Union are subject to the Standard Contractual Clauses (SCCs) adopted by the European Commission, ensuring a level of data protection equivalent to that applicable within the EU.</P>
            <P>Aside from the above, UseWok may disclose personal data if required by law, in the context of legal or administrative proceedings, or to protect the rights, property or safety of UseWok, its users or the general public.</P>
          </Section>

          <Section number="7" title="International data transfers">
            <P>Our primary infrastructure is hosted by IONOS SE, a German company whose data centers are located within the European Union. Your data is therefore hosted primarily on European territory.</P>
            <P>However, some of our service providers are based in the United States (Stripe, Inc.; Google LLC; Base44, Inc.). Transfers of personal data outside the European Economic Area (EEA) may therefore occur in the context of using these services.</P>
            <P>These transfers are governed by the appropriate safeguards provided for by the GDPR, and in particular by the Standard Contractual Clauses (SCCs) resulting from the European Commission's implementing decision of 4 June 2021, which contractually impose on these providers a level of data protection equivalent to that required within the EEA.</P>
            <InfoBox icon={Icon.info}>
              <strong>Your right to information</strong><br />
              You can obtain additional information about the safeguards governing these transfers by contacting us at <a href="mailto:compliance@usewok.com" style={{ color: ORANGE_DEEP }}>compliance@usewok.com</a>.
            </InfoBox>
          </Section>

          <Section number="8" title="Data retention period">
            <P>UseWok retains your personal data for no longer than is necessary for the purpose for which it was collected, taking into account our legal obligations and the need to handle any potential disputes.</P>
            <Table
              headers={['Data category', 'Retention period', 'Justification']}
              rows={[
                ['Active account data (name, email)', "For the entire duration the account is active, then 12 months after the last login", 'Provision of the service'],
                ["Data from a user-deleted account", 'Immediate and irreversible deletion upon request', "Right to erasure — Art. 17 GDPR"],
                ['Connection and security logs', '12 months from their generation', 'Security, fraud prevention, legitimate interest'],
                ["Billing and subscription data (via Stripe)", '10 years from the transaction date', 'Legal accounting obligation — Art. L123-22 French Commercial Code'],
                ['Customer support conversations', '3 years from ticket closure', 'Legitimate interest (dispute management) — 3-year limitation period'],
                ['Navigation analytics data (Google Analytics)', '26 months maximum (CNIL setting)', 'Service improvement'],
                ['Behavioral analytics data (Base44)', '12 months maximum', 'Service improvement'],
              ]}
            />
            <SuccessBox icon={Icon.success}>
              <strong>Account deletion in a few clicks</strong><br />
              You can delete your account at any time from your personal space, without conditions. Deletion is immediate and permanent. Only data subject to a legal retention obligation (billing data) is retained for the applicable legal period, in a database isolated from the active service.
            </SuccessBox>
          </Section>

          <Section number="9" title="Data security">
            <P>UseWok implements appropriate technical and organizational measures, in accordance with Article 32 of the GDPR, to ensure a level of security appropriate to the risk. These measures include in particular:</P>
            <BulletList items={[
              <><strong>Encryption in transit:</strong> All communications between your browser and our servers are encrypted via the HTTPS/TLS protocol. No data is transmitted in plaintext.</>,
              <><strong>Password hashing:</strong> Passwords for accounts created via email are transformed into a cryptographic hash using bcrypt, an irreversible algorithm that includes a random salt. UseWok can never reconstruct your password.</>,
              <><strong>Secure infrastructure:</strong> Our hosting is provided by IONOS SE, a provider certified ISO 27001 whose data centers meet European security standards.</>,
              <><strong>Strict access control:</strong> Access to personal data is limited to UseWok personnel whose functions require it, and only to the extent necessary to perform those functions.</>,
              <><strong>Secure authentication:</strong> Logins via Google and Apple rely on the OAuth 2.0 protocol, the industry standard for secure delegated authentication.</>,
            ]} />
            <WarningBox icon={Icon.warning}>
              <strong>No security is infallible</strong><br />
              Although UseWok takes every measure to protect your data, no system of transmission or electronic storage can guarantee absolute security. We recommend that you use a strong and unique password for your account.
              <br /><br />
              In the event of a personal data breach likely to result in a high risk to your rights and freedoms, UseWok undertakes to notify the incident to the CNIL within 72 hours of its discovery (Art. 33 GDPR), and to inform you without undue delay if your personal situation so requires (Art. 34 GDPR).
            </WarningBox>
          </Section>

          <Section number="10" title="Cookies and tracking technologies">
            <P>UseWok uses cookies and similar tracking technologies to ensure the operation of the service, analyze audience behavior and improve your user experience.</P>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 12 }}>Types of cookies used</h3>
            <Table
              headers={['Category', 'Tool', 'Purpose', 'Legal basis', 'Duration']}
              rows={[
                ['Essential', 'UseWok session cookie', 'Maintain your authentication, secure your session, remember your essential preferences', 'Necessary for the service (no consent required)', 'Session duration'],
                ['Audience analytics', 'Google Analytics', 'Measure traffic, analyze user journeys, improve the service', 'Prior consent (Art. 6.1.a GDPR)', '26 months max'],
                ['Application analytics', 'Base44', 'Analyze in-app behavior (clicks, pages visited)', 'Prior consent (Art. 6.1.a GDPR)', '12 months max'],
              ]}
            />
            <P>In accordance with CNIL recommendations, we obtain your consent before depositing any cookie that is not strictly necessary for the operation of the service. You can withdraw your consent at any time via our cookie preference manager accessible from each page of the site.</P>
            <P>You can also disable cookies from your browser settings. Disabling analytics cookies will not affect the essential features of the Platform.</P>
            <P style={{ fontSize: 13, color: INK_SOFT }}>To learn more about cookies: <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" style={{ color: ORANGE_DEEP }}>www.allaboutcookies.org</a></P>
          </Section>

          <Section number="11" title="Your rights regarding personal data">
            <P>In accordance with the GDPR (Articles 15 to 22), you have the following rights regarding the personal data that UseWok processes about you:</P>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 28 }}>
              {[
                { icon: Icon.access, title: "Right of access", desc: "Obtain confirmation that data about you is being processed, and receive a copy of that data as well as all information relating to its processing. (Art. 15 GDPR)" },
                { icon: Icon.rectify, title: 'Right to rectification', desc: "Request the correction of any inaccurate, incomplete or obsolete data about you. (Art. 16 GDPR)" },
                { icon: Icon.erase, title: 'Right to erasure', desc: "Request the deletion of your personal data ('right to be forgotten'), subject to the legal retention obligations that apply to UseWok. (Art. 17 GDPR)" },
                { icon: Icon.block, title: 'Right to object', desc: "Object, at any time, to the processing of your data for direct marketing purposes, or when the processing is based on UseWok's legitimate interest. (Art. 21 GDPR)" },
                { icon: Icon.pause, title: 'Right to restriction', desc: "Request the temporary suspension of the processing of your data in the cases provided for by regulations (e.g., contesting the accuracy of the data). (Art. 18 GDPR)" },
                { icon: Icon.portable, title: 'Right to data portability', desc: "Receive your data in a structured, commonly used and machine-readable format, or have it transmitted directly to another data controller. (Art. 20 GDPR)" },
              ].map((r, i) => <RightCard key={i} {...r} />)}
            </div>
            <P>To exercise any of these rights, please send your request by email to <a href="mailto:compliance@usewok.com" style={{ color: ORANGE_DEEP }}>compliance@usewok.com</a>, clearly specifying the right you wish to exercise. We may ask you to verify your identity to process your request. We are committed to responding within one (1) month of receiving your request. This period may be extended by two additional months in the case of complex requests or a high number of requests, in which case we will inform you.</P>
            <P>These rights are not absolute and may be subject to the conditions and limitations provided by applicable regulations, in particular to comply with our legal obligations or to protect the legitimate rights and interests of UseWok or third parties.</P>
          </Section>

          <Section number="12" title="Contact and complaints">
            <P>For any questions regarding this policy or the exercise of your rights, please contact our dedicated data protection service:</P>
            <div style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12, padding: '24px 28px', marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: INK, marginBottom: 12 }}>UseWok, Inc. — Personal Data Protection</div>
              <div style={{ fontSize: 14, color: INK_SOFT, lineHeight: 2.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.mail} <a href="mailto:compliance@usewok.com" style={{ color: ORANGE_DEEP }}>compliance@usewok.com</a></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.web} <a href="https://usewok.com" style={{ color: ORANGE_DEEP }}>https://usewok.com</a></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.pin} Libourne, Gironde, France</div>
              </div>
            </div>
            <P>If, after contacting us, you believe that the processing of your personal data by UseWok does not comply with applicable data protection regulations, you have the right to file a complaint with the competent supervisory authority. In France, this is:</P>
            <div style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12, padding: '24px 28px' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: INK, marginBottom: 12 }}>CNIL — Commission Nationale de l'Informatique et des Libertés</div>
              <div style={{ fontSize: 14, color: INK_SOFT, lineHeight: 2.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.pin} 3 Place de Fontenoy – TSA 80715 – 75334 PARIS CEDEX 07</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.phone} +33 (0)1 53 73 22 22</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{Icon.web} <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: ORANGE_DEEP }}>www.cnil.fr</a></div>
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
            <a href="mailto:compliance@usewok.com" style={{ color: ORANGE_DEEP, fontWeight: 600 }}>compliance@usewok.com</a>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{ background: '#fff', borderTop: '1px solid rgba(21,19,15,0.10)', padding: '24px clamp(20px, 5vw, 60px)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: INK_SOFT, margin: 0 }}>
          © 2026 UseWok — The AI visibility platform ·{' '}
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