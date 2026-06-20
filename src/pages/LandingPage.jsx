import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ScanHero from '@/components/landing/ScanHero';
import OnboardingQuiz from '@/components/landing/OnboardingQuiz';
import ParticleField from '@/components/landing/ParticleField';

// ── Dark theme tokens ──
const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const BG2 = '#111113';
const BORDER = 'rgba(255,255,255,0.07)';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.25)';

// ── Fade-in on scroll wrapper ──
function FadeIn({ children, delay = 0, y = 24, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function FontLoader() {
  useEffect(() => {
    if (document.getElementById('lp-gfont')) return;
    const l = document.createElement('link');
    l.id = 'lp-gfont'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(l);
  }, []);
  return null;
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar({ onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      height: 58,
      display: 'flex', alignItems: 'center',
      padding: '0 28px', fontFamily: F,
      background: scrolled ? 'rgba(10,10,11,0.82)' : 'rgba(10,10,11,0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.09)' : 'transparent'}`,
      transition: 'background 300ms, border-color 300ms',
    }}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0, minWidth: 90 }}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M0.705 14.443L3.557 17.295C3.837 17.575 4.258 17.638 4.607 17.435L0.565 13.393C0.362 13.742 0.425 14.163 0.705 14.443Z" fill={T1}/>
          <path d="M0.133 12.646L5.354 17.867C5.527 17.951 5.724 17.963 5.912 17.888L0.112 12.088C0.037 12.276 0.049 12.473 0.133 12.646Z" fill={T1}/>
          <path d="M0 11.338V12.106L5.894 18H6.662L0 11.338Z" fill={T1}/>
          <path d="M9 0C4.029 0 0 4.029 0 9V10.272L7.728 18H9C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill={T1}/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 600, color: T1, letterSpacing: '-0.01em' }}>Linear</span>
      </a>

      <div style={{ flex: 1 }} />

      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {[['Product','#'],['Resources','#'],['Customers','#'],['Now','#'],['Contact','#']].map(([l,h]) => (
          <a key={l} href={h} style={{ fontSize: 13, fontWeight: 400, color: T2, textDecoration: 'none', transition: 'color 150ms', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.color = T1}
            onMouseLeave={e => e.currentTarget.style.color = T2}>{l}</a>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 90, justifyContent: 'flex-end' }}>
        <a href="#" style={{ fontSize: 13, fontWeight: 400, color: T2, textDecoration: 'none', whiteSpace: 'nowrap' }}
          onMouseEnter={e => e.currentTarget.style.color = T1}
          onMouseLeave={e => e.currentTarget.style.color = T2}>Docs</a>
        <button onClick={onSignup} style={{
          fontFamily: F, fontSize: 13, fontWeight: 500,
          color: '#0A0A0B', background: T1,
          border: 'none',
          borderRadius: 20, padding: '6px 18px', cursor: 'pointer',
          transition: 'opacity 150ms', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Open app
        </button>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onSignup }) {
  return (
    <section style={{ background: BG, paddingTop: 58, fontFamily: F, position: 'relative', overflow: 'hidden' }}>
      {/* Hero glow — multi-layer atmospheric */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1200, height: 700, pointerEvents: 'none' }}>
        {/* Primary wide violet halo */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(90,90,240,0.22) 0%, transparent 65%)', filter: 'blur(40px)' }} />
        {/* Left accent — indigo */}
        <div style={{ position: 'absolute', top: 80, left: '15%', width: 400, height: 300, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(120,80,255,0.14) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        {/* Right accent — blue */}
        <div style={{ position: 'absolute', top: 60, right: '10%', width: 380, height: 280, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(60,140,255,0.10) 0%, transparent 70%)', filter: 'blur(55px)' }} />
        {/* Bottom soft fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(to bottom, transparent, #0A0A0B)' }} />
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ padding: '80px 120px 0', position: 'relative', zIndex: 1 }}>
          <FadeIn delay={0.05}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 12px', marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>New · Coding Sessions →</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.12}>
            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: T1,
              letterSpacing: '-0.04em', lineHeight: 1.06,
              margin: '0 0 20px', maxWidth: 620,
            }}>
              The product development<br />system for teams<br />and agents
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 640 }}>
              <p style={{ fontSize: 15, color: T2, margin: 0, fontWeight: 400, lineHeight: 1.6 }}>
                Purpose-built for planning and building products.<br />Designed for the AI era.
              </p>
              <button onClick={onSignup} style={{
                fontFamily: F, fontSize: 14, fontWeight: 500, color: '#0A0A0B', background: T1,
                border: 'none', borderRadius: 8, padding: '10px 22px', cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 32,
                transition: 'opacity 150ms',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Get started free
              </button>
            </div>
          </FadeIn>
        </div>

        {/* App Screenshot */}
        <FadeIn delay={0.3} y={40} style={{ padding: '52px 80px 0', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: '12px 12px 0 0', overflow: 'hidden',
            border: `1px solid rgba(255,255,255,0.1)`, borderBottom: 'none',
            boxShadow: '0 -8px 80px rgba(90,90,240,0.15), 0 -2px 40px rgba(0,0,0,0.8)',
          }}>
            <AppScreenshot />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── APP SCREENSHOT MOCKUP ────────────────────────────────────────────────────
function AppScreenshot() {
  return (
    <div style={{ background: '#141416', fontFamily: F }}>
      <div style={{ height: 34, background: '#1A1A1C', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6 }}>
        {['#FF5F56','#FFBD2E','#27C93F'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Linear</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', height: 420 }}>
        <div style={{ width: 180, background: '#111113', borderRight: `1px solid rgba(255,255,255,0.05)`, padding: '8px 0', flexShrink: 0 }}>
          {['📥 Inbox','◈ My issues','⟳ Reviews','⚡ Pulse'].map((l,i) => (
            <div key={i} style={{ padding: '5px 12px', fontSize: 12, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 7 }}>{l}</div>
          ))}
          <div style={{ padding: '10px 12px 3px', fontSize: 10, color: 'rgba(255,255,255,0.15)', fontWeight: 500, letterSpacing: '0.04em' }}>Favorites ▾</div>
          {[
            { label: 'Faster app launch', color: '#FF8C42', active: true },
            { label: 'Agent tasks', color: '#22c55e' },
            { label: 'UI Refresh', color: '#ef4444' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 7, background: item.active ? 'rgba(255,255,255,0.06)' : 'transparent', borderRadius: 4, margin: item.active ? '1px 6px' : '1px 0' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: item.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.28)' }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ height: 36, borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Faster app launch</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>ENG-2703</span>
          </div>
          <div style={{ flex: 1, padding: '20px 22px', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: T1, margin: '0 0 10px' }}>Faster app launch</h2>
            <p style={{ fontSize: 12, color: T2, lineHeight: 1.6, margin: '0 0 18px' }}>
              Render UI before <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>vehicle_state</code> sync when minimum required state is present.
            </p>
            {[
              { color: '#5A5AF0', msg: 'Linear created the issue via Slack on behalf of karri · 2min ago' },
              { color: '#888', msg: 'Triage Intelligence added the label Performance and iOS · 2min ago' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: a.color, marginTop: 4, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: 180, padding: '14px', flexShrink: 0, borderLeft: `1px solid rgba(255,255,255,0.05)` }}>
          {[['In Progress','#22c55e'],['High','#f59e0b'],['jori','#2D6A4F']].map(([l,c],i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOGO STRIP ───────────────────────────────────────────────────────────────
function LogoStrip() {
  const logos = ['▲ Vercel', '⊕ CURSOR', 'OSCAR', 'OpenAI', 'coinbase', '$ Cash App', '⊗ BOOM', 'ramp ↗'];
  return (
    <FadeIn>
      <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '32px 120px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {logos.map(l => (
            <span key={l} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.12)', letterSpacing: '-0.01em', fontFamily: F }}>{l}</span>
          ))}
        </div>
      </section>
    </FadeIn>
  );
}

// ─── NEW SPECIES ──────────────────────────────────────────────────────────────
function NewSpecies() {
  return (
    <section style={{ background: BG, padding: '100px 120px', fontFamily: F, borderTop: `1px solid ${BORDER}` }}>
      <FadeIn>
        <h2 style={{ fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.04em', margin: 0, maxWidth: 720 }}>
          <span style={{ color: T1 }}>A new species of product tool.</span>{' '}
          <span style={{ color: 'rgba(255,255,255,0.22)' }}>Purpose-built for modern teams with AI workflows at its core, Linear sets a new standard for planning and building products.</span>
        </h2>
      </FadeIn>
    </section>
  );
}

// ─── THREE PILLARS ────────────────────────────────────────────────────────────
function ThreePillars() {
  const items = [
    { fig: 'FIG 0.2', img: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7b144b7-4ef0-4991-9bcb-617c6a37d200/f=auto,dpr=2,fit=scale-down,metadata=none', title: 'Built for purpose', desc: 'Linear is shaped by the practices and principles of world-class product teams.' },
    { fig: 'FIG 0.3', img: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/6600ca96-e49b-4fd9-c03a-7979faddad00/f=auto,dpr=2,fit=scale-down,metadata=none', title: 'Powered by AI agents', desc: 'Designed for workflows shared by humans and agents. From drafting PRDs to pushing PRs.' },
    { fig: 'FIG 0.4', img: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7fa8f5f-d439-4329-6a65-de549b51e300/f=auto,dpr=2,fit=scale-down,metadata=none', title: 'Designed for speed', desc: 'Reduces noise and restores momentum to help teams ship with high velocity and focus.' },
  ];
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, fontFamily: F }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
        {items.map((p, i) => (
          <FadeIn key={i} delay={i * 0.1} style={{ borderRight: i < 2 ? `1px solid ${BORDER}` : 'none', padding: '0 0 48px' }}>
            <div style={{ padding: '32px 40px 0', fontSize: 11, color: T3, fontWeight: 500, letterSpacing: '0.04em' }}>{p.fig}</div>
            <div style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
              <img src={p.img} alt={p.title} style={{ width: '100%', maxWidth: 220, objectFit: 'contain', filter: 'brightness(0.7) invert(1) brightness(0.6)' }} />
            </div>
            <div style={{ padding: '0 40px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: T1, margin: '0 0 6px' }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: T2, lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ─── FEATURE SECTION WRAPPER ─────────────────────────────────────────────────
function FeatureSection({ title, desc, num, linkLabel, subLinks, children }) {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '100px 120px', fontFamily: F }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 64 }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(24px,2.8vw,36px)', fontWeight: 700, color: T1, letterSpacing: '-0.04em', lineHeight: 1.1, margin: 0 }}>{title}</h2>
        </FadeIn>
        <FadeIn delay={0.1} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <p style={{ fontSize: 15, color: T2, lineHeight: 1.7, margin: '0 0 20px' }}>{desc}</p>
          <a href="#" style={{ fontSize: 13, color: T2, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: T3 }}>{num}</span>
            <span>{linkLabel} →</span>
          </a>
        </FadeIn>
      </div>
      <FadeIn delay={0.15}>
        {children}
      </FadeIn>
      {subLinks && (
        <FadeIn delay={0.2}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 48, maxWidth: 540 }}>
            {subLinks.map((sl, i) => (
              <a key={i} href="#" style={{ fontSize: 13, color: T3, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.color = T2}
                onMouseLeave={e => e.currentTarget.style.color = T3}>
                <span style={{ fontSize: 12 }}>{sl.num}</span>
                <span>{sl.label}</span>
              </a>
            ))}
          </div>
        </FadeIn>
      )}
    </section>
  );
}

// ─── SIMPLE DARK MOCKS (Intake, Plan, Build, Diff, Monitor) ──────────────────
function DarkCard({ children, style = {} }) {
  return (
    <div style={{ background: '#16161A', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function IntakeMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, fontFamily: F }}>
      <DarkCard>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Thread in <span style={{ color: T1 }}>#feedback</span></span>
        </div>
        {[
          { name: 'lena', color: '#7C6AF4', msg: "Anyone else noticing the iOS app feels slow to open if you haven't used it in a bit?" },
          { name: 'didier', color: '#E87C3E', msg: "Yea, we're still blocking initial render on a full vehicle_state sync every time..." },
          { name: 'andreas', color: '#4E9CF5', msg: 'Feels like we could render sooner and load the rest in the background.' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '10px 14px', display: 'flex', gap: 9, borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: m.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{m.name[0].toUpperCase()}</div>
            <div><span style={{ fontSize: 12, fontWeight: 600, color: T1 }}>{m.name}</span><p style={{ fontSize: 11, color: T2, lineHeight: 1.55, margin: '2px 0 0' }}>{m.msg}</p></div>
          </div>
        ))}
      </DarkCard>
      <DarkCard>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', height: 240 }}>
          {[
            { title: 'Todo', count: 71, color: '#888', items: ['Remove UI inconsistencies','TypedError: Cannot read properties','Upgrade to Claude Opus 4.5'] },
            { title: 'In-Progress', count: 3, color: '#22c55e', items: ['Remove contentData from GraphQL API','Launch page assets'] },
            { title: 'Done', count: 0, color: '#4E9CF5', items: [] },
          ].map((col, i) => (
            <div key={i} style={{ borderRight: i < 2 ? `1px solid rgba(255,255,255,0.05)` : 'none', padding: '10px 0' }}>
              <div style={{ padding: '0 12px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>{col.title}</span>
                {col.count > 0 && <span style={{ fontSize: 10, color: T3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '0 4px' }}>{col.count}</span>}
              </div>
              {col.items.map((item, ii) => (
                <div key={ii} style={{ margin: '0 8px 4px', padding: '7px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: `1px solid rgba(255,255,255,0.05)` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${col.color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{item}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </DarkCard>
    </div>
  );
}

function PlanMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, fontFamily: F }}>
      <DarkCard>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Initiatives</span>
        </div>
        {[
          { label: 'Core Product', count: 99, color: '#5A5AF0' },
          { label: 'Infra stability', count: 28, color: '#E87C3E', indent: true },
          { label: 'Mobile apps', count: 8, color: '#22c55e', indent: true },
          { label: 'APAC Expansion', count: 21, color: '#E87C3E' },
          { label: 'Japan Launch', count: 12, color: '#ef4444', indent: true },
        ].map((item, i) => (
          <div key={i} style={{ padding: `6px ${item.indent ? '14px 6px 32px' : '14px'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: 11, color: T3 }}>{item.count}</span>
          </div>
        ))}
      </DarkCard>
      <DarkCard>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', gap: 20 }}>
          {['APR','MAY','JUN','JUL','AUG','SEP'].map(m => (
            <span key={m} style={{ fontSize: 10, fontWeight: 600, color: T3, letterSpacing: '0.06em' }}>{m}</span>
          ))}
        </div>
        <div style={{ padding: '14px' }}>
          {[
            { label: 'UI Refresh', color: '#7C6AF4', left: '0%', width: '35%' },
            { label: 'Split fares', color: '#22c55e', left: '28%', width: '28%' },
            { label: 'Autonomy status clarity', color: '#f59e0b', left: '42%', width: '45%' },
          ].map((t, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ position: 'relative', height: 26, background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>
                <div style={{ position: 'absolute', left: t.left, width: t.width, height: '100%', background: t.color + '20', border: `1px solid ${t.color}40`, borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                  <span style={{ fontSize: 10, color: t.color, fontWeight: 500, whiteSpace: 'nowrap' }}>{t.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DarkCard>
    </div>
  );
}

function BuildMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontFamily: F }}>
      <DarkCard>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: T1 }}>Codex</span>
          <span style={{ fontSize: 11, color: T3 }}>Agent</span>
        </div>
        <div style={{ padding: '14px', fontSize: 12, lineHeight: 1.8 }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 4px' }}>On it! I've received your request.</p>
          <p style={{ color: T2, margin: '0 0 4px' }}>Kicked off a task in <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 4px', borderRadius: 3, fontSize: 11 }}>kinetic/kinetic-iOS</code> environment.</p>
          <p style={{ color: T2, margin: '0 0 4px' }}>Searching for root AGENTS file</p>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '7px 10px', margin: '4px 0 8px', fontFamily: 'monospace', fontSize: 11, color: T3 }}>
            kinetic/kinetic-iOS$ rg --files -g 'AGENTS.md'<br />
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>AGENTS.md</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[0,1,2,3,4,5].map(i => <div key={i} style={{ width: 3, height: 12, background: `rgba(255,255,255,${0.08 + i * 0.06})`, borderRadius: 2 }} />)}
            </div>
            <span style={{ color: T3, fontSize: 12 }}>Thinking...</span>
          </div>
        </div>
      </DarkCard>
      <DarkCard>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Assign to...</span>
        </div>
        {[
          { name: 'Codex', tag: 'Agent', color: '#5A5AF0', check: true },
          { name: 'Steven', color: '#E87C3E' },
          { name: 'GitHub Copilot', tag: 'Agent', color: '#555' },
          { name: 'Cursor', tag: 'Agent', color: '#777' },
          { name: 'Meg', color: '#7C6AF4' },
        ].map((item, i) => (
          <div key={i} style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, color: '#fff', fontWeight: 700 }}>{item.name[0]}</div>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', flex: 1 }}>{item.name}</span>
            {item.tag && <span style={{ fontSize: 10, color: T3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '1px 6px' }}>{item.tag}</span>}
            {item.check && <span style={{ fontSize: 12, color: '#22c55e' }}>✓</span>}
          </div>
        ))}
      </DarkCard>
    </div>
  );
}

function DiffMock() {
  const lines = [
    { n: '01', before: "import React from 'react'", after: "import React from 'react'", changed: false },
    { n: '02', before: "import { View, ActivityIndicator } from 'react-native'", after: "import { View, ActivityIndicator } from 'react-native'", changed: false },
    { n: '03', before: "import { useVehicleState } from '@hooks/useVehicleState'", after: "import { useVehicleState, SyncStatus } from '@hooks/useVehicleSt...", changed: true },
    { n: '04', before: "import { Dashboard } from '@components/Dashboard'", after: "import { Dashboard } from '@components/Dashboard'", changed: false },
    { n: '05', before: '', after: '', changed: false },
    { n: '06', before: "export const HomeScreen = () => {", after: "export const HomeScreen = () => {", changed: false },
    { n: '07', before: "  const { vehicleState, isFullySynced } = useVehicleState()", after: "  const { vehicleState, syncStatus } = useVehicleState()", changed: true },
    { n: '08', before: '', after: '', changed: false },
    { n: '09', before: "  if (!isFullySynced) {", after: "  if (syncStatus === SyncStatus.PENDING) {", changed: true },
    { n: '10', before: '    return <ActivityIndicator size="large" />', after: '    return <ActivityIndicator size="large" />', changed: false },
  ];
  return (
    <DarkCard>
      <div style={{ padding: '8px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: T3 }}>📄 kinetic-ios/src/screens/Home/HomeScreen.tsx</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: T2 }}>Linear ↗</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ borderRight: `1px solid rgba(255,255,255,0.05)` }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', padding: '1.5px 0', background: line.changed ? 'rgba(239,68,68,0.08)' : 'transparent', borderLeft: line.changed ? '2px solid rgba(239,68,68,0.5)' : '2px solid transparent' }}>
              <span style={{ width: 28, textAlign: 'right', paddingRight: 10, fontSize: 10, color: T3, fontFamily: 'monospace', flexShrink: 0 }}>{line.n}</span>
              <span style={{ fontSize: 10, color: line.changed ? '#fca5a5' : 'rgba(255,255,255,0.2)', fontFamily: 'monospace', whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.before}</span>
            </div>
          ))}
        </div>
        <div>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', padding: '1.5px 0', background: line.changed ? 'rgba(34,197,94,0.08)' : 'transparent', borderLeft: line.changed ? '2px solid rgba(34,197,94,0.5)' : '2px solid transparent' }}>
              <span style={{ width: 28, textAlign: 'right', paddingRight: 10, fontSize: 10, color: T3, fontFamily: 'monospace', flexShrink: 0 }}>{line.n}</span>
              <span style={{ fontSize: 10, color: line.changed ? '#86efac' : 'rgba(255,255,255,0.2)', fontFamily: 'monospace', whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.after}</span>
            </div>
          ))}
        </div>
      </div>
    </DarkCard>
  );
}

function MonitorMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontFamily: F }}>
      <DarkCard>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Weekly Pulse for Jun 18</span>
          <div style={{ flex: 1 }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', color: T2, fontSize: 11 }}>▶ Listen</button>
        </div>
        {[
          { title: 'UI refresh', status: 'At risk', statusColor: '#ef4444', bullets: ['iOS implementation mostly complete', 'Risk of timeline slip if design decisions not finalized soon'] },
          { title: 'Tokyo launch', status: 'On track', statusColor: '#22c55e', bullets: ['Localization efforts completed', 'Everything on track for launch in early September'] },
        ].map((p, i) => (
          <div key={i} style={{ padding: '10px 14px', borderTop: `1px solid rgba(255,255,255,0.04)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.statusColor }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T1 }}>{p.title}</span>
              <span style={{ fontSize: 11, color: p.statusColor }}>{p.status}</span>
            </div>
            {p.bullets.map((b, bi) => <p key={bi} style={{ fontSize: 12, color: T2, margin: '2px 0', lineHeight: 1.5 }}>• {b}</p>)}
          </div>
        ))}
      </DarkCard>
      <DarkCard>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Cycle time by agent</span>
        </div>
        <div style={{ padding: '14px', height: 200, position: 'relative' }}>
          {[
            { x: 10, y: 75, c: '#5A5AF0', s: 5 }, { x: 18, y: 55, c: '#5A5AF0', s: 4 }, { x: 25, y: 35, c: '#5A5AF0', s: 6 },
            { x: 32, y: 65, c: '#E87C3E', s: 5 }, { x: 40, y: 45, c: '#E87C3E', s: 7 }, { x: 48, y: 80, c: '#E87C3E', s: 4 },
            { x: 55, y: 25, c: '#22c55e', s: 5 }, { x: 62, y: 50, c: '#22c55e', s: 4 }, { x: 70, y: 40, c: '#22c55e', s: 6 },
            { x: 75, y: 60, c: '#7C6AF4', s: 5 }, { x: 82, y: 30, c: '#7C6AF4', s: 4 }, { x: 88, y: 70, c: '#7C6AF4', s: 6 },
          ].map((d, i) => (
            <div key={i} style={{ position: 'absolute', left: `${d.x}%`, bottom: `${d.y}%`, width: d.s, height: d.s, borderRadius: '50%', background: d.c, opacity: 0.7, transform: 'translate(-50%, 50%)' }} />
          ))}
        </div>
      </DarkCard>
    </div>
  );
}

// ─── CHANGELOG ────────────────────────────────────────────────────────────────
function Changelog() {
  const posts = [
    { dot: '#ef4444', title: 'Coding sessions in Linear', desc: 'Earlier this year, we launched Linear Agent, giving teams a new way to pla...', date: 'Jun 10, 2026' },
    { dot: 'rgba(255,255,255,0.25)', title: 'Team documents', desc: "Important team context doesn't always belong in a specific issue, project, o...", date: 'Jun 3, 2026' },
    { dot: 'rgba(255,255,255,0.25)', title: 'Linear Diffs', desc: 'Agents generate large volumes of code, but individuals are still...', date: 'May 27, 2026' },
    { dot: 'rgba(255,255,255,0.25)', title: 'Project Slack channels', desc: 'Project teams often use a Slack channel to discuss and share feedba...', date: 'May 21, 2026' },
  ];
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '100px 120px', fontFamily: F }}>
      <FadeIn>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: T1, letterSpacing: '-0.04em', margin: '0 0 64px' }}>Changelog</h2>
      </FadeIn>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
        {posts.map((p, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.dot, marginBottom: 14 }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: T1, margin: '0 0 7px' }}>{p.title}</h3>
            <p style={{ fontSize: 12, color: T2, lineHeight: 1.65, margin: '0 0 10px' }}>{p.desc}</p>
            <span style={{ fontSize: 11, color: T3 }}>{p.date}</span>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section style={{ background: BG, padding: '0 120px 80px', fontFamily: F }}>
      <FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div style={{ background: '#1A1A2E', padding: '44px', borderRadius: '10px 0 0 10px', minHeight: 260 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#E2E2F4', lineHeight: 1.3, letterSpacing: '-0.03em', margin: '0 0 32px' }}>
              "You'll probably build a better product, just because of the craft that <span style={{ color: '#7C6AF4' }}>using Linear infuses on your brain.</span>"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#5A5AF0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>G</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E2F4', margin: 0 }}>Gabriel Peal</p>
                <p style={{ fontSize: 12, color: 'rgba(226,226,244,0.45)', margin: 0 }}>Staff Software Engineer, OpenAI</p>
              </div>
            </div>
          </div>
          <div style={{ background: '#1A1A0A', padding: '44px', borderRadius: '0 10px 10px 0', minHeight: 260 }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#E2F060', lineHeight: 1.3, letterSpacing: '-0.03em', margin: '0 0 32px' }}>
              "Our speed is intense and Linear helps us be action biased."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#E2F060', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#111', fontWeight: 700 }}>N</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#E2F060', margin: 0 }}>Nik Koblov</p>
                <p style={{ fontSize: 12, color: 'rgba(226,240,96,0.45)', margin: 0 }}>Head of Engineering, Ramp</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={0.1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
        <p style={{ fontSize: 13, color: T2, margin: 0 }}>Linear powers over <strong style={{ color: T1 }}>33,000</strong> product teams. From ambitious startups to major enterprises.</p>
        <a href="#" style={{ fontSize: 13, color: T2, textDecoration: 'none' }}>Customer stories →</a>
      </FadeIn>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCta({ onSignup }) {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '140px 120px', textAlign: 'center', fontFamily: F, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(90,90,240,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <FadeIn>
        <h2 style={{ fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700, color: T1, letterSpacing: '-0.05em', lineHeight: 1.0, margin: '0 0 36px' }}>
          Built for the future.<br />Available today.
        </h2>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onSignup} style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: '#0A0A0B', background: T1, border: 'none', borderRadius: 8, padding: '12px 28px', cursor: 'pointer', transition: 'opacity 150ms' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Get started free</button>
          <button style={{ fontFamily: F, fontSize: 14, fontWeight: 500, color: T2, background: 'transparent', border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 8, padding: '12px 28px', cursor: 'pointer', transition: 'color 150ms, border-color 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = T2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
            Contact sales
          </button>
        </div>
      </FadeIn>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: 'Product', links: ['Intake','Plan','Build','Diffs','Monitor','Security'] },
    { title: 'Features', links: ['Asks','Agents','Coding Sessions','Customer Requests','Insights','Mobile'] },
    { title: 'Company', links: ['About','Customers','Careers','Blog','Method','Brand'] },
    { title: 'Resources', links: ['Switch','Download','Documentation','Developers','Status','Enterprise'] },
    { title: 'Connect', links: ['Contact us','Community','X (Twitter)','GitHub','YouTube'] },
  ];
  return (
    <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '56px 120px 36px', fontFamily: F }}>
      <div style={{ display: 'grid', gridTemplateColumns: '72px repeat(5,1fr)', gap: 28, marginBottom: 44 }}>
        <div style={{ paddingTop: 2 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M0.705 14.443L3.557 17.295C3.837 17.575 4.258 17.638 4.607 17.435L0.565 13.393C0.362 13.742 0.425 14.163 0.705 14.443Z" fill="rgba(255,255,255,0.3)"/>
            <path d="M0 11.338V12.106L5.894 18H6.662L0 11.338Z" fill="rgba(255,255,255,0.3)"/>
            <path d="M9 0C4.029 0 0 4.029 0 9V10.272L7.728 18H9C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.3)"/>
          </svg>
        </div>
        {cols.map((col, i) => (
          <div key={i}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)', margin: '0 0 14px' }}>{col.title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {col.links.map(link => (
                <a key={link} href="#" style={{ fontSize: 12, color: T3, textDecoration: 'none', transition: 'color 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.color = T2}
                  onMouseLeave={e => e.currentTarget.style.color = T3}>{link}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 22, display: 'flex', gap: 20 }}>
        {['Privacy','Terms','DPA','AUP'].map(l => (
          <a key={l} href="#" style={{ fontSize: 11, color: T3, textDecoration: 'none' }}>{l}</a>
        ))}
      </div>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  // Force dark background on body — override the global light theme
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#0A0A0B';
    document.body.style.color = '#F0F0EE';
    document.documentElement.style.backgroundColor = '#0A0A0B';
    // Hide the grain pseudo-element
    const style = document.createElement('style');
    style.id = 'lp-dark-override';
    style.textContent = `#root::before { display: none !important; } body { background-color: #0A0A0B !important; }`;
    document.head.appendChild(style);
    return () => {
      document.body.style.backgroundColor = prev;
      document.body.style.color = '';
      document.documentElement.style.backgroundColor = prevHtml;
      document.getElementById('lp-dark-override')?.remove();
    };
  }, []);
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
  }, [navigate]);

  if (!ready) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  const onSignup = () => base44.auth.redirectToLogin('/app');

  // ── Quiz overlay — shown after scan results (or directly from onStartQuiz)
  if (showQuiz) return (
    <div style={{ background: '#FAFAFA', minHeight: '100vh', fontFamily: F }}>
      <FontLoader />
      <OnboardingQuiz onComplete={() => base44.auth.redirectToLogin('/app')} />
    </div>
  );

  return (
    <div style={{ background: BG, fontFamily: F }}>
      <FontLoader />
      <Navbar onSignup={onSignup} />

      {/* ── SCAN HERO — replaces original Hero ── */}
      <section style={{ background: BG, paddingTop: 58, fontFamily: F, position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
        {/* Particle scintillation layer */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <ParticleField count={90} />
        </div>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 1200, height: 700, pointerEvents: 'none', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 1000, height: 600, background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(90,90,240,0.16) 0%, transparent 65%)', filter: 'blur(40px)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <ScanHero onStartQuiz={() => setShowQuiz(true)} />
        </div>
      </section>

      {/* ── Separator + Legacy sections below ── */}
      <LogoStrip />
      <NewSpecies />
      <ThreePillars />

      <FeatureSection title={<>Make product operations<br/>self-driving</>} desc="Turn conversations and customer feedback into actionable issues that are routed, labeled, and prioritized for the right team." num="1.0" linkLabel="Intake" subLinks={[{ num: '1.1', label: 'Linear Agent' }, { num: '1.2', label: 'Triage' }, { num: '1.3', label: 'Customer Requests' }, { num: '1.4', label: 'Linear Asks' }]}>
        <IntakeMock />
      </FeatureSection>

      <FeatureSection title={<>Define the product<br/>direction</>} desc="Plan and navigate from idea to launch. Align your team with product initiatives, strategic roadmaps, and clear, up-to-date PRDs." num="2.0" linkLabel="Plan" subLinks={[{ num: '2.1', label: 'Projects' }, { num: '2.2', label: 'Documents' }, { num: '2.3', label: 'Initiatives' }, { num: '2.4', label: 'Visual planning' }]}>
        <PlanMock />
      </FeatureSection>

      <FeatureSection title={<>Move work forward across<br/>teams and agents</>} desc="Build and deploy AI agents that work alongside your team. Work on complex tasks together or delegate entire issues end-to-end." num="3.0" linkLabel="Build" subLinks={[{ num: '3.1', label: 'Issues' }, { num: '3.2', label: 'Agents' }, { num: '3.3', label: 'Linear MCP' }, { num: '3.4', label: 'Git automations' }]}>
        <BuildMock />
      </FeatureSection>

      <FeatureSection title={<>Review PRs and agent<br/>output</>} desc="Understand code changes at a glance with structural diffs for human and agent output. Review, discuss, and merge — all within Linear." num="4.0" linkLabel="Diffs">
        <DiffMock />
      </FeatureSection>

      <FeatureSection title={<>Understand progress<br/>at scale</>} desc="Take the guesswork out of product development with project updates, analytics, and dashboards that surface what needs your attention." num="5.0" linkLabel="Monitor" subLinks={[{ num: '5.1', label: 'Pulse' }, { num: '5.2', label: 'Insights' }, { num: '5.3', label: 'Dashboards' }]}>
        <MonitorMock />
      </FeatureSection>

      <Changelog />
      <Testimonials />
      <FinalCta onSignup={onSignup} />
      <Footer />
    </div>
  );
}