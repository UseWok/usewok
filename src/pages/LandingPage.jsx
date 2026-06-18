import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// ── Design tokens ──
const BG = '#0A0A0A';
const BG2 = '#111111';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.45)';
const DIM = 'rgba(255,255,255,0.22)';
const ACCENT = '#5B57F8'; // Linear purple

// ── Font injection ──
function FontLoader() {
  useEffect(() => {
    if (document.getElementById('linear-font')) return;
    const l = document.createElement('link');
    l.id = 'linear-font';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }, []);
  return null;
}

const F = "'Inter', system-ui, sans-serif";

// ── Navbar ──
function Navbar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
      background: scrolled ? 'rgba(10,10,10,0.94)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
      transition: 'all 0.3s ease',
      fontFamily: F,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
          <path d="M0 50C0 22.4 22.4 0 50 0s50 22.4 50 50-22.4 50-50 50S0 77.6 0 50z" fill="#5B57F8"/>
          <path d="M15 15L85 85M15 85L85 15" stroke="white" strokeWidth="12" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>Linear</span>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="hidden-mobile">
        {[['Product', '#product'], ['Resources', '#features'], ['Customers', '#testimonials'], ['Pricing', '#pricing'], ['Now', '#now'], ['Contact', '#contact']].map(([label, href]) => (
          <a key={label} href={href} style={{ fontSize: 14, fontWeight: 500, color: MUTED, textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = TEXT}
            onMouseLeave={e => e.currentTarget.style.color = MUTED}>
            {label}
          </a>
        ))}
      </nav>

      {/* Auth buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onLogin} style={{
          fontFamily: F, fontSize: 14, fontWeight: 500, color: MUTED,
          background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', transition: 'color 150ms',
        }}
          onMouseEnter={e => e.currentTarget.style.color = TEXT}
          onMouseLeave={e => e.currentTarget.style.color = MUTED}>
          Log in
        </button>
        <button onClick={onSignup} style={{
          fontFamily: F, fontSize: 14, fontWeight: 600, color: TEXT,
          background: ACCENT, border: 'none', borderRadius: 8,
          padding: '8px 18px', cursor: 'pointer', transition: 'opacity 150ms',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Sign up
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </header>
  );
}

// ── Hero Section ──
function Hero({ onSignup }) {
  return (
    <section style={{
      minHeight: '100vh', background: BG,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '120px 32px 80px', position: 'relative', overflow: 'hidden', fontFamily: F,
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 800, height: 500,
        background: 'radial-gradient(ellipse, rgba(91,87,248,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 900 }}>
        {/* New badge */}
        <motion.a
          href="#coding-sessions"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 40,
            padding: '5px 14px 5px 8px',
            background: 'rgba(91,87,248,0.1)', border: `1px solid rgba(91,87,248,0.25)`,
            borderRadius: 100, textDecoration: 'none',
            transition: 'background 200ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,87,248,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,87,248,0.1)'}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, background: ACCENT + '22', borderRadius: 100, padding: '2px 8px', letterSpacing: '0.05em' }}>NEW</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Coding Sessions →</span>
        </motion.a>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 6.5rem)', fontWeight: 700,
            color: TEXT, letterSpacing: '-0.04em', lineHeight: 1.0,
            margin: '0 0 24px',
          }}
        >
          The product<br />development system<br />
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>for teams and agents</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          style={{
            fontSize: 18, fontWeight: 400, color: MUTED,
            lineHeight: 1.7, maxWidth: 500, margin: '0 auto 48px',
          }}
        >
          Purpose-built for planning and building products. Designed for the AI era.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}
        >
          <button onClick={onSignup} style={{
            fontFamily: F, fontSize: 15, fontWeight: 600, color: TEXT,
            background: ACCENT, border: 'none', borderRadius: 10,
            padding: '14px 32px', cursor: 'pointer', transition: 'opacity 150ms',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Get started
          </button>
          <button onClick={() => document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' })} style={{
            fontFamily: F, fontSize: 15, fontWeight: 500, color: MUTED,
            background: 'none', border: `1px solid ${BORDER}`, borderRadius: 10,
            padding: '14px 28px', cursor: 'pointer', transition: 'all 200ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}>
            Learn more
          </button>
        </motion.div>
      </div>

      {/* App screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1, marginTop: 80, width: '90vw', maxWidth: 1100 }}
      >
        <AppMockup />
      </motion.div>
    </section>
  );
}

// ── App Mockup (the big Linear-style UI preview) ──
function AppMockup() {
  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${BORDER}`,
      boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
      background: '#161616',
      fontFamily: F,
    }}>
      {/* Window bar */}
      <div style={{ height: 36, background: '#1A1A1A', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
        <div style={{ flex: 1 }} />
        <div style={{ width: 160, height: 18, background: '#222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>linear.app / workspace</span>
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', height: 520 }}>
        {/* Sidebar */}
        <div style={{ width: 220, borderRight: `1px solid ${BORDER}`, padding: '12px 0', flexShrink: 0, background: '#161616' }}>
          <div style={{ padding: '8px 12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>L</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Linear</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>∨</span>
          </div>

          {[
            { icon: '📥', label: 'Inbox' },
            { icon: '🔶', label: 'My issues' },
            { icon: '📋', label: 'Reviews' },
            { icon: '💡', label: 'Pulse' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 11 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>{item.label}</span>
            </div>
          ))}

          <div style={{ padding: '16px 12px 6px', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Workspace</div>
          {['Initiatives', 'Projects', 'More'].map((item, i) => (
            <div key={i} style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{item}</span>
            </div>
          ))}

          <div style={{ padding: '16px 12px 6px', fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Favorites</div>
          {[
            { dot: '#F95738', label: 'Faster app launch' },
            { dot: '#22c55e', label: 'Agent tasks' },
            { dot: ACCENT, label: 'UI Refresh' },
            { dot: '#ef4444', label: 'Agents Insights' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Issue header */}
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Faster app launch</span>
            <span style={{ fontSize: 10, color: MUTED }}>⭐</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>···</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: MUTED }}>02 / 145</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>ENG-2703</span>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 220px', overflow: 'hidden' }}>
            {/* Issue body */}
            <div style={{ padding: '20px', overflowY: 'auto', borderRight: `1px solid ${BORDER}` }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Faster app launch</h3>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.65, margin: '0 0 24px' }}>
                Render UI before <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>vehicle_state</code> sync when minimum required state is present, instead of blocking on full refresh during iOS startup.
              </p>

              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>Activity</div>

              {[
                { avatar: '🔷', text: 'Linear created the issue via Slack on behalf of karri', time: '2min ago' },
                { avatar: '🏷️', text: 'Triage Intelligence added the label Performance and iOS', time: '2min ago' },
                { avatar: '👤', text: 'karri · 4 min ago — Right now we show a spinner forever, which makes it look like the car disappeared...', time: '' },
                { avatar: '💬', text: 'jori · just now — @Linear can you take a stab at this?', time: '' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>{item.avatar}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                    {item.text}
                    {item.time && <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>{item.time}</span>}
                  </span>
                </div>
              ))}
            </div>

            {/* Sidebar meta */}
            <div style={{ padding: '16px', fontSize: 12, fontWeight: 500 }}>
              {[
                { label: 'Status', value: 'In Progress', color: '#22c55e' },
                { label: 'Priority', value: 'High', color: '#ef4444' },
                { label: 'Assignee', value: 'jori', color: null },
                { label: 'Team', value: 'Linear', color: null },
              ].map((meta, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 4, fontWeight: 500, letterSpacing: '0.04em' }}>{meta.label}</div>
                  <div style={{ fontSize: 13, color: meta.color || 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{meta.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Three pillars section ──
function ThreePillars() {
  const pillars = [
    { fig: 'FIG 0.2', label: 'Built for purpose', desc: 'Linear is shaped by the practices and principles of world-class product teams.' },
    { fig: 'FIG 0.3', label: 'Powered by AI agents', desc: 'Designed for workflows shared by humans and agents. From drafting PRDs to pushing PRs.' },
    { fig: 'FIG 0.4', label: 'Designed for speed', desc: 'Reduces noise and restores momentum to help teams ship with high velocity and focus.' },
  ];

  return (
    <section id="product" style={{ background: BG2, borderTop: `1px solid ${BORDER}`, padding: '80px 32px', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 64px', maxWidth: 700 }}
        >
          A new species of product tool.{' '}
          <span style={{ color: 'rgba(255,255,255,0.22)' }}>Purpose-built for modern teams with AI workflows at its core.</span>
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1 }}>
          {pillars.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '40px 32px',
                borderTop: `1px solid ${BORDER}`,
                borderRight: i < pillars.length - 1 ? `1px solid ${BORDER}` : 'none',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', marginBottom: 20 }}>{p.fig}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: TEXT, margin: '0 0 10px', letterSpacing: '-0.01em' }}>{p.label}</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Feature sections ──
function FeatureSection({ id, num, title, subtitle, linkLabel, linkHref, children, bg = BG }) {
  return (
    <section id={id} style={{ background: bg, borderTop: `1px solid ${BORDER}`, padding: '120px 32px', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>{num}</span>
          <a href={linkHref} style={{ fontSize: 14, fontWeight: 600, color: TEXT, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = TEXT}>
            {linkLabel} <span style={{ fontSize: 12 }}>→</span>
          </a>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '0 0 16px', maxWidth: 700 }}
        >
          {title}
        </motion.h2>
        <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65, maxWidth: 560, marginBottom: 56 }}>{subtitle}</p>

        {children}
      </div>
    </section>
  );
}

// ── Intake / Issue tracker mock ──
function IntakeMock() {
  const groups = [
    { label: 'Backlog', count: 8, color: 'rgba(255,255,255,0.3)', issues: ['Reduce UI flicker during autonomy...', 'Add buffering for autonomy event streams', 'Reduce startup delay caused by vehicle sync', 'Fix delayed route updates during rerouting'] },
    { label: 'Todo', count: 71, color: ACCENT, issues: ['Remove UI inconsistencies', 'TypeError: Cannot read properties', 'Upgrade to Claude Opus 4.5', 'Optimize load times'] },
    { label: 'In Progress', count: 3, color: '#22c55e', issues: ['Remove contentData from GraphQL API', 'Launch page assets', 'Prevent duplicate ride requests on poor...'] },
    { label: 'Done', count: 53, color: '#6b7280', issues: ['Clean up deprecated APIs...', 'Reduce latency in autonomy st...', 'Reduce ETA fluctuations durin...', 'Improve fallback messaging'] },
  ];

  return (
    <div style={{ background: '#141414', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', fontFamily: F }}>
      {groups.map((g, gi) => (
        <div key={gi} style={{ borderBottom: gi < groups.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.color }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{g.label}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '0 5px' }}>{g.count}</span>
          </div>
          {g.issues.map((issue, ii) => (
            <div key={ii} style={{ padding: '9px 16px 9px 36px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${g.color}`, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', flex: 1 }}>{issue}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>ENG-{2000 + gi * 100 + ii}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Roadmap mock ──
function RoadmapMock() {
  const months = ['FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'];
  const tracks = [
    { label: 'UI Refresh', start: 0, end: 2, color: ACCENT },
    { label: 'Split fares', start: 2, end: 4, color: '#22c55e' },
    { label: 'Autonomy status clarity', start: 1, end: 5, color: '#f59e0b' },
    { label: 'Core Product', start: 0, end: 6, color: '#6b7280' },
    { label: 'APAC Expansion', start: 4, end: 6, color: '#ec4899' },
  ];

  return (
    <div style={{ background: '#141414', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', fontFamily: F }}>
      {/* Month header */}
      <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(${months.length}, 1fr)`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ padding: '10px 16px', borderRight: `1px solid ${BORDER}` }} />
        {months.map(m => (
          <div key={m} style={{ padding: '10px 8px', fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.06em', textAlign: 'center', borderRight: `1px solid rgba(255,255,255,0.04)` }}>
            {m}
          </div>
        ))}
      </div>
      {/* Tracks */}
      {tracks.map((track, ti) => (
        <div key={ti} style={{ display: 'grid', gridTemplateColumns: `140px repeat(${months.length}, 1fr)`, borderBottom: ti < tracks.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
          <div style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500, borderRight: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center' }}>{track.label}</div>
          {months.map((m, mi) => (
            <div key={mi} style={{ position: 'relative', padding: '8px 4px', borderRight: `1px solid rgba(255,255,255,0.04)`, display: 'flex', alignItems: 'center' }}>
              {mi === track.start && (
                <div style={{
                  position: 'absolute', left: 4, right: mi === track.end ? 4 : '-100%',
                  height: 24, borderRadius: mi === track.end ? 6 : '6px 0 0 6px',
                  background: track.color + '33', border: `1px solid ${track.color}55`,
                  zIndex: 1,
                }} />
              )}
              {mi > track.start && mi <= track.end && (
                <div style={{
                  position: 'absolute', left: 0, right: mi === track.end ? 4 : 0,
                  height: 24, borderRadius: mi === track.end ? '0 6px 6px 0' : 0,
                  background: track.color + '33',
                  border: `1px solid ${track.color}55`,
                  borderLeft: 'none',
                  zIndex: 1,
                }} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Agent terminal mock ──
function AgentMock() {
  return (
    <div style={{ background: '#0D0D0D', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', fontFamily: "'Fira Code', monospace" }}>
      {/* Terminal header */}
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10, background: '#141414' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 8, fontFamily: F }}>Linear Agent · kinetic-iOS</span>
      </div>
      <div style={{ padding: '16px 20px', fontSize: 12, lineHeight: 1.9 }}>
        {[
          { color: '#22c55e', text: '✓ On it! I\'ve received your request.' },
          { color: MUTED, text: 'Kicked off a task in kinetic/kinetic-iOS environment.' },
          { color: 'rgba(255,255,255,0.25)', text: '$ rg --files -g \'AGENTS.md\'' },
          { color: '#22c55e', text: '  AGENTS.md' },
          { color: MUTED, text: 'Locating initialization logic for vehicle_state...' },
          { color: '#f59e0b', text: 'Thinking...' },
          { color: 'rgba(255,255,255,0.2)', text: '' },
          { color: MUTED, text: 'Examining startup path...' },
        ].map((line, i) => (
          <div key={i} style={{ color: line.color }}>{line.text}</div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACCENT, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ color: ACCENT, fontSize: 11, fontWeight: 600, fontFamily: F }}>Agent working...</span>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ── Code diff mock ──
function DiffMock() {
  const lines = [
    { type: 'file', text: 'kinetic-ios/src/screens/Home/HomeScreen.tsx' },
    { type: 'removed', text: "  const { vehicleState, isFullySynced } = useVehicleState()" },
    { type: 'removed', text: "  if (!isFullySynced) {" },
    { type: 'removed', text: "    return <ActivityIndicator />" },
    { type: 'removed', text: "  }" },
    { type: 'added', text: "  const { vehicleState, hasMinState } = useVehicleState()" },
    { type: 'added', text: "  if (!hasMinState) {" },
    { type: 'added', text: "    return <ActivityIndicator />" },
    { type: 'added', text: "  }" },
    { type: 'normal', text: "  return <Dashboard vehicleState={vehicleState} />" },
  ];

  return (
    <div style={{ background: '#0D0D0D', borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden', fontFamily: "'Fira Code', monospace", fontSize: 12 }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${BORDER}`, background: '#141414', fontFamily: F, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Code Review</span>
        <span style={{ fontSize: 10, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 4, padding: '1px 7px', marginLeft: 'auto' }}>+4</span>
        <span style={{ fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 4, padding: '1px 7px' }}>-3</span>
      </div>
      {lines.map((line, i) => (
        <div key={i} style={{
          padding: '3px 16px',
          background: line.type === 'file' ? 'rgba(255,255,255,0.03)' :
            line.type === 'added' ? 'rgba(34,197,94,0.07)' :
            line.type === 'removed' ? 'rgba(239,68,68,0.07)' : 'transparent',
          color: line.type === 'file' ? 'rgba(255,255,255,0.35)' :
            line.type === 'added' ? '#86efac' :
            line.type === 'removed' ? '#fca5a5' : 'rgba(255,255,255,0.45)',
          borderLeft: line.type === 'added' ? '2px solid #22c55e' :
            line.type === 'removed' ? '2px solid #ef4444' : '2px solid transparent',
          lineHeight: 1.8,
        }}>
          {line.type === 'added' && <span style={{ marginRight: 8, color: '#22c55e' }}>+</span>}
          {line.type === 'removed' && <span style={{ marginRight: 8, color: '#ef4444' }}>-</span>}
          {line.type === 'file' && <span style={{ marginRight: 8, color: 'rgba(255,255,255,0.2)' }}>📄</span>}
          {line.text}
        </div>
      ))}
    </div>
  );
}

// ── Pricing section ──
function Pricing({ onSignup }) {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Free',
      price: annual ? 0 : 0,
      unit: 'per member/month',
      desc: 'For individuals and small teams getting started.',
      cta: 'Get started',
      primary: false,
      features: ['Up to 5 members', 'Unlimited issues', 'Cycles & backlogs', '250MB file storage', 'Integrations'],
    },
    {
      name: 'Standard',
      price: annual ? 8 : 10,
      unit: 'per member/month',
      desc: 'For growing teams that need more control.',
      cta: 'Get started',
      primary: true,
      badge: 'Most popular',
      features: ['Unlimited members', 'Advanced roadmaps', 'Analytics & insights', '10GB file storage', 'Priority support', 'Admin controls'],
    },
    {
      name: 'Plus',
      price: annual ? 16 : 20,
      unit: 'per member/month',
      desc: 'For scaling teams that need enterprise power.',
      cta: 'Get started',
      primary: false,
      features: ['Everything in Standard', 'SLA uptime guarantee', 'Advanced security', 'Custom integrations', 'Dedicated support', 'SAML SSO'],
    },
  ];

  return (
    <section id="pricing" style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '120px 32px', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '0 0 16px' }}
          >
            Simple, transparent pricing
          </motion.h2>
          <p style={{ fontSize: 17, color: MUTED, marginBottom: 32 }}>Start free. Scale when you're ready.</p>

          {/* Toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#1A1A1A', borderRadius: 100, padding: '5px 6px', border: `1px solid ${BORDER}` }}>
            {['Monthly', 'Annual'].map(opt => (
              <button key={opt} onClick={() => setAnnual(opt === 'Annual')} style={{
                fontFamily: F, fontSize: 13, fontWeight: 600,
                padding: '7px 20px', borderRadius: 100, border: 'none', cursor: 'pointer',
                background: (annual && opt === 'Annual') || (!annual && opt === 'Monthly') ? '#fff' : 'transparent',
                color: (annual && opt === 'Annual') || (!annual && opt === 'Monthly') ? '#000' : MUTED,
                transition: 'all 200ms',
              }}>
                {opt} {opt === 'Annual' && <span style={{ color: '#22c55e', fontSize: 11, marginLeft: 4 }}>–20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1 }}>
          {plans.map((plan, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '40px 32px',
                background: plan.primary ? 'rgba(91,87,248,0.06)' : 'transparent',
                border: `1px solid ${plan.primary ? 'rgba(91,87,248,0.25)' : BORDER}`,
                borderRadius: 12,
                position: 'relative',
                margin: '0 0 0 0',
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: ACCENT, borderRadius: 100, padding: '3px 14px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  {plan.badge}
                </div>
              )}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 4px' }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: MUTED, margin: '0 0 20px', lineHeight: 1.6 }}>{plan.desc}</p>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: TEXT, letterSpacing: '-0.04em' }}>${plan.price}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginLeft: 6 }}>{plan.unit}</span>
              </div>
              <button onClick={onSignup} style={{
                fontFamily: F, fontSize: 14, fontWeight: 600, width: '100%',
                padding: '12px 0', borderRadius: 8, border: `1px solid ${plan.primary ? 'transparent' : BORDER}`,
                background: plan.primary ? ACCENT : 'transparent', color: plan.primary ? '#fff' : MUTED,
                cursor: 'pointer', marginBottom: 28, transition: 'all 200ms',
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                {plan.cta}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid rgba(255,255,255,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 9, color: TEXT }}>✓</span>
                    </div>
                    <span style={{ fontSize: 13, color: MUTED }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──
function Testimonials() {
  const logos = ['Vercel', 'Notion', 'Loom', 'Raycast', 'Mercury', 'Perplexity', 'Arc', 'Figma'];
  const testimonials = [
    { name: 'Guillermo Rauch', role: 'CEO, Vercel', quote: 'Linear has fundamentally changed how we build products. The speed and quality of the tool itself shows what\'s possible.' },
    { name: 'Ivan Zhao', role: 'CEO, Notion', quote: 'We use Linear to build Notion. The attention to detail and performance is exactly what we look for in tools we use.' },
    { name: 'Joe Thomas', role: 'CEO, Loom', quote: 'Our entire engineering org moved to Linear in a week. The quality bar Linear sets is unlike anything else.' },
    { name: 'Thomas Paul Mann', role: 'CEO, Raycast', quote: 'Linear is how software should be built. Fast, focused, and opinionated in the best way.' },
  ];

  return (
    <section id="testimonials" style={{ background: BG2, borderTop: `1px solid ${BORDER}`, padding: '120px 32px', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 16px' }}
        >
          Loved by builders worldwide
        </motion.h2>
        <p style={{ fontSize: 17, color: MUTED, marginBottom: 64 }}>The best product teams in the world run on Linear.</p>

        {/* Logo strip */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 72 }}>
          {logos.map(logo => (
            <span key={logo} style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '-0.01em' }}>{logo}</span>
          ))}
        </div>

        {/* Quotes grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 1 }}>
          {testimonials.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{ padding: '40px', borderTop: `1px solid ${BORDER}`, borderLeft: i % 2 === 1 ? `1px solid ${BORDER}` : 'none' }}
            >
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 24px', fontStyle: 'italic' }}>
                "{t.quote}"
              </p>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, margin: '0 0 2px' }}>{t.name}</p>
                <p style={{ fontSize: 12, color: DIM, margin: 0 }}>{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──
function FinalCta({ onSignup }) {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '160px 32px', fontFamily: F, position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(91,87,248,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto', textAlign: 'center', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', fontWeight: 700, color: TEXT, letterSpacing: '-0.04em', lineHeight: 0.95, margin: '0 0 28px' }}>
            Build what matters.<br />
            <span style={{ color: 'rgba(255,255,255,0.18)' }}>Ship with clarity.</span>
          </h2>
          <p style={{ fontSize: 18, color: MUTED, marginBottom: 48, lineHeight: 1.65, maxWidth: 460, margin: '0 auto 48px' }}>
            Join 10,000+ product teams who use Linear to plan, build, and ship faster.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onSignup} style={{
              fontFamily: F, fontSize: 16, fontWeight: 600, color: TEXT,
              background: ACCENT, border: 'none', borderRadius: 10,
              padding: '16px 40px', cursor: 'pointer', transition: 'opacity 150ms',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Start for free
            </button>
            <button onClick={() => window.open('https://linear.app', '_blank')} style={{
              fontFamily: F, fontSize: 16, fontWeight: 500, color: MUTED,
              background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 10,
              padding: '16px 32px', cursor: 'pointer', transition: 'all 200ms',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = TEXT; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}>
              Contact sales
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.18)', marginTop: 24 }}>
            Free forever · No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ── Footer ──
function Footer() {
  const cols = [
    { title: 'Product', links: [['Intake', '#'], ['Plan', '#'], ['Build', '#'], ['Diffs', '#'], ['Cycles', '#'], ['Mobile', '#']] },
    { title: 'Resources', links: [['Docs', '#'], ['Changelog', '#'], ['Blog', '#'], ['API', '#'], ['Status', '#'], ['Security', '#']] },
    { title: 'Company', links: [['About', '#'], ['Careers', '#'], ['Customers', '#'], ['Contact', '#'], ['Terms', '/terms'], ['Privacy', '/privacy']] },
  ];

  return (
    <footer style={{ background: '#060606', borderTop: `1px solid ${BORDER}`, padding: '64px 32px 32px', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(3, 1fr)', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
                <path d="M0 50C0 22.4 22.4 0 50 0s50 22.4 50 50-22.4 50-50 50S0 77.6 0 50z" fill="#5B57F8"/>
                <path d="M15 15L85 85M15 85L85 15" stroke="white" strokeWidth="12" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 15, fontWeight: 700, color: TEXT, letterSpacing: '-0.02em' }}>Linear</span>
            </div>
            <p style={{ fontSize: 13, color: DIM, lineHeight: 1.7, margin: 0 }}>The product development system for teams and agents.</p>
          </div>

          {cols.map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, fontWeight: 600, color: DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.color = MUTED}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', margin: 0 }}>© 2026 Linear Orbit, Inc.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Twitter', 'GitHub', 'YouTube', 'LinkedIn'].map(s => (
              <a key={s} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none', transition: 'color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.color = MUTED}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── ROOT ──
export default function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
  }, [navigate]);

  if (!ready) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.06)', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const onSignup = () => base44.auth.redirectToLogin('/app');
  const onLogin = () => base44.auth.redirectToLogin('/app');

  return (
    <div style={{ background: BG, fontFamily: F }}>
      <FontLoader />
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      <Hero onSignup={onSignup} />
      <ThreePillars />

      <FeatureSection
        id="product-section"
        num="1.0"
        title={<>Make product<br /><span style={{ color: 'rgba(255,255,255,0.22)' }}>operations self-driving</span></>}
        subtitle="Turn conversations and customer feedback into actionable issues that are routed, labeled, and prioritized for the right team."
        linkLabel="Intake"
        linkHref="#"
        bg={BG2}
      >
        <IntakeMock />
      </FeatureSection>

      <FeatureSection
        num="2.0"
        title={<>Define the<br /><span style={{ color: 'rgba(255,255,255,0.22)' }}>product direction</span></>}
        subtitle="Plan and navigate from idea to launch. Align your team with product initiatives, strategic roadmaps, and clear, up-to-date PRDs."
        linkLabel="Plan"
        linkHref="#"
      >
        <RoadmapMock />
      </FeatureSection>

      <FeatureSection
        num="3.0"
        title={<>Move work forward<br /><span style={{ color: 'rgba(255,255,255,0.22)' }}>across teams and agents</span></>}
        subtitle="Build and deploy AI agents that work alongside your team. Work on complex tasks together or delegate entire issues end-to-end."
        linkLabel="Build"
        linkHref="#"
        bg={BG2}
      >
        <AgentMock />
      </FeatureSection>

      <FeatureSection
        num="4.0"
        title={<>Review PRs and<br /><span style={{ color: 'rgba(255,255,255,0.22)' }}>agent output</span></>}
        subtitle="Understand code changes at a glance with structural diffs for human and agent output. Review, discuss, and merge — all within Linear."
        linkLabel="Diffs"
        linkHref="#"
      >
        <DiffMock />
      </FeatureSection>

      <Testimonials />
      <Pricing onSignup={onSignup} />
      <FinalCta onSignup={onSignup} />
      <Footer />
    </div>
  );
}