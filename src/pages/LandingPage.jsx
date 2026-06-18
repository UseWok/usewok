import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const F = "'Inter', system-ui, sans-serif";
const BG = '#0A0A0A';
const BORDER = 'rgba(255,255,255,0.08)';

function FontLoader() {
  useEffect(() => {
    if (document.getElementById('lp-font')) return;
    const l = document.createElement('link');
    l.id = 'lp-font';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }, []);
  return null;
}

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', fontFamily: F,
      background: scrolled ? 'rgba(10,10,10,0.92)' : 'rgba(10,10,10,0.6)',
      backdropFilter: 'blur(20px)',
      borderBottom: scrolled ? `1px solid ${BORDER}` : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M0.705 14.443L3.557 17.295C3.837 17.575 4.258 17.638 4.607 17.435L0.565 13.393C0.362 13.742 0.425 14.163 0.705 14.443Z" fill="white"/>
          <path d="M0.133 12.646L5.354 17.867C5.527 17.951 5.724 17.963 5.912 17.888L0.112 12.088C0.037 12.276 0.049 12.473 0.133 12.646Z" fill="white"/>
          <path d="M0 11.338V12.106L5.894 18H6.662L0 11.338Z" fill="white"/>
          <path d="M9 0C4.029 0 0 4.029 0 9V10.272L7.728 18H9C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="white"/>
        </svg>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>Linear</span>
      </a>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {[['Product', '#'], ['Resources', '#'], ['Customers', '#testimonials'], ['Pricing', '/pricing'], ['Now', '#'], ['Contact', '#']].map(([l, h]) => (
          <a key={l} href={h} style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
            {l}
          </a>
        ))}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />
        <button onClick={onLogin} style={{ fontFamily: F, fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 150ms', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}>
          Log in
        </button>
        <button onClick={onSignup} style={{
          fontFamily: F, fontSize: 14, fontWeight: 500, color: '#000',
          background: '#fff', border: 'none', borderRadius: 20,
          padding: '7px 18px', cursor: 'pointer', transition: 'opacity 150ms',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Sign up
        </button>
      </nav>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onSignup }) {
  return (
    <section style={{
      background: BG, minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      padding: '0', position: 'relative', overflow: 'hidden', fontFamily: F,
    }}>
      {/* Text area */}
      <div style={{ padding: '160px 80px 0', position: 'relative', zIndex: 1 }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 5rem)', fontWeight: 700,
            color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05,
            margin: '0 0 20px', maxWidth: 680,
          }}
        >
          The product development<br />system for teams<br />and agents
        </motion.h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 820 }}>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 400 }}>
            Purpose-built for planning and building products. Designed for the AI era.
          </p>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.12)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.01em' }}>New</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>Coding Sessions →</span>
          </a>
        </div>
      </div>

      {/* App screenshot */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: '60px 40px 0', position: 'relative', zIndex: 1 }}
      >
        <LinearAppMockup />
      </motion.div>
    </section>
  );
}

// ── Big app mockup — pixel faithful ─────────────────────────────────────────
function LinearAppMockup() {
  return (
    <div style={{
      borderRadius: '12px 12px 0 0', overflow: 'hidden',
      border: `1px solid rgba(255,255,255,0.1)`,
      borderBottom: 'none',
      boxShadow: '0 -8px 60px rgba(0,0,0,0.5)',
      background: '#1C1C1E',
      fontFamily: F, fontSize: 13,
    }}>
      {/* Traffic lights bar */}
      <div style={{ height: 40, background: '#161618', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
      </div>

      {/* App layout */}
      <div style={{ display: 'flex', height: 540 }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: '#1C1C1E', borderRight: `1px solid rgba(255,255,255,0.06)`, padding: '8px 0', flexShrink: 0 }}>
          {/* Workspace header */}
          <div style={{ padding: '6px 12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: '#5A5AF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
                <path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="white"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Linear</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>∨</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>🔍</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>✏️</span>
          </div>

          {[
            { icon: '📥', label: 'Inbox' },
            { icon: '◈', label: 'My issues' },
            { icon: '⟳', label: 'Reviews' },
            { icon: '⚡', label: 'Pulse' },
          ].map((item, i) => (
            <SidebarItem key={i} icon={item.icon} label={item.label} />
          ))}

          <SidebarSection label="Workspace" />
          <SidebarItem icon="◎" label="Initiatives" />
          <SidebarItem icon="◉" label="Projects" />
          <SidebarItem icon="···" label="More" />

          <SidebarSection label="Favorites" />
          <SidebarItem icon="🟠" label="Faster app launch" active />
          <SidebarItem icon="🟢" label="Agent tasks" />
          <SidebarItem icon="✕" label="UI Refresh" />
          <SidebarItem icon="🔴" label="Agents Insights" />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1C1C1E', overflow: 'hidden' }}>
          {/* Issue top bar */}
          <div style={{ height: 44, borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Faster app launch</span>
            <span style={{ fontSize: 12, color: '#FFBD2E' }}>★</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>···</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>02 / 145</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>⌃ ⌄</span>
            <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>ENG-2703</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>🔗 ⊞ ↗</span>
          </div>

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Issue body */}
            <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', borderRight: `1px solid rgba(255,255,255,0.06)` }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Faster app launch</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: '0 0 24px' }}>
                Render UI before{' '}
                <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 3, fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace' }}>vehicle_state</code>
                {' '}sync when minimum required state is present, instead of blocking on full refresh during iOS startup.
              </p>

              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>Activity</p>

              {[
                { icon: '🔷', text: <>Linear created the issue via <span style={{ color: 'rgba(255,255,255,0.7)' }}>Slack</span> on behalf of <span style={{ color: 'rgba(255,255,255,0.7)' }}>karri</span> · 2min ago</> },
                { icon: '🏷', text: <><span style={{ color: 'rgba(255,255,255,0.7)' }}>Triage Intelligence</span> added the label <span style={{ color: 'rgba(255,255,255,0.7)' }}>Performance</span> and <span style={{ color: 'rgba(255,255,255,0.7)' }}>iOS</span> · 2min ago</> },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 12, marginTop: 1, flexShrink: 0 }}>{a.icon}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{a.text}</span>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, margin: '14px 0', alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#5A5AF0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>K</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>karri</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>4 min ago</span>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', lineHeight: 1.6 }}>
                    Right now we show a spinner forever, which makes it look like the car disappeared...
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, margin: '14px 0', alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2D6A4F', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>J</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>jori</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>just now</span>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', lineHeight: 1.6 }}>
                    @Linear can you take a stab at this?
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, margin: '14px 0', alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.6)"/></svg>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>Linear</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>connected by jori · 2 min ago</span>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>✦ Changed 2 files — Draft PR awaiting your review · 2 min ago</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, margin: '14px 0', alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>⊙</span>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>Linear moved from <span style={{ color: 'rgba(255,255,255,0.55)' }}>Todo</span> to <span style={{ color: 'rgba(255,255,255,0.55)' }}>In Progress</span> · just now</span>
              </div>
            </div>

            {/* Right meta panel */}
            <div style={{ width: 240, padding: '16px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <MetaRow icon="⊙" iconColor="#22c55e" label="In Progress" />
              <MetaRow icon="▪" iconColor="rgba(255,255,255,0.6)" label="High" isBar />
              <MetaRow avatar="J" label="jori" avatarBg="#2D6A4F" />
              <MetaRow logoLinear label="Linear" />

              {/* AI Panel */}
              <div style={{ marginTop: 20, background: '#141416', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="9" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.7)"/></svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Linear</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Opus 4.8</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}>− □ ✕</span>
                </div>
                <div style={{ padding: '12px 14px', fontSize: 12, lineHeight: 1.8 }}>
                  <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 6px' }}>jori connected Linear to ENG-2703</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', fontWeight: 500 }}>Examining the startup path...</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>Worked for 7s ▾</p>
                  <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 8px' }}>Pushed and opened a draft PR. Changes:</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 2px', fontFamily: 'monospace', fontSize: 11 }}>• useRideHistory.ts: build a <span style={{ background: 'rgba(255,255,255,0.08)', padding: '0 3px', borderRadius: 2 }}>waitingStatusById</span> map</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', fontFamily: 'monospace', fontSize: 11 }}>• <span style={{ background: 'rgba(255,255,255,0.08)', padding: '0 3px', borderRadius: 2 }}>RideHistoryPage.tsx</span>: dimmed rows reset</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Changed 2 files</span>
                    <span style={{ fontSize: 10, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 3, padding: '1px 5px' }}>+4</span>
                    <span style={{ fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 3, padding: '1px 5px' }}>-4</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', cursor: 'pointer' }}>Preview</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '6px 8px' }}>
                    <div>↑ Draft Update homepage H1</div>
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>master ← ride/drv-899-update-homepage-h1-65a6</div>
                  </div>
                </div>
                {/* Chat input */}
                <div style={{ padding: '8px 14px', borderTop: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', flex: 1 }}>Tell Linear what to do next...</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>↺ 🔗 ↑</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active }) {
  return (
    <div style={{
      padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
      borderRadius: active ? 4 : 0, margin: active ? '0 6px' : '0',
      transition: 'background 150ms',
    }}
      onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}>
      <span style={{ fontSize: 11, width: 14, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: active ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: active ? 500 : 400 }}>{label}</span>
    </div>
  );
}

function SidebarSection({ label }) {
  return (
    <div style={{ padding: '12px 12px 4px', fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 500, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
      {label} <span style={{ fontSize: 10 }}>▾</span>
    </div>
  );
}

function MetaRow({ icon, iconColor, label, isBar, avatar, avatarBg, logoLinear }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
      {avatar && (
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: avatarBg || '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{avatar}</span>
        </div>
      )}
      {logoLinear && (
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="9" height="9" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.6)"/></svg>
        </div>
      )}
      {icon && !avatar && !logoLinear && (
        isBar
          ? <svg width="14" height="10" viewBox="0 0 14 10"><rect x="0" y="3" width="3" height="4" fill="rgba(255,255,255,0.3)"/><rect x="4" y="1" width="3" height="6" fill="rgba(255,255,255,0.5)"/><rect x="8" y="0" width="3" height="8" fill="rgba(255,255,255,0.7)"/><rect x="12" y="2" width="2" height="5" fill="rgba(255,255,255,0.4)"/></svg>
          : <span style={{ fontSize: 12, color: iconColor }}>{icon}</span>
      )}
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>{label}</span>
    </div>
  );
}

// ── Logo strip ────────────────────────────────────────────────────────────────
function LogoStrip() {
  const logos = ['▲ Vercel', '⊕ CURSOR', 'OSCAR', 'OpenAI', 'coinbase', '$ Cash App', '⊗ BOOM', 'ramp ↗'];
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '48px 80px', fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        {logos.map(l => (
          <span key={l} style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '-0.01em' }}>{l}</span>
        ))}
      </div>
    </section>
  );
}

// ── "A new species" big statement ─────────────────────────────────────────────
function NewSpecies() {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '120px 80px', fontFamily: F }}>
      <h2 style={{
        fontSize: 'clamp(2.4rem, 5vw, 5rem)', fontWeight: 700, letterSpacing: '-0.04em',
        lineHeight: 1.05, margin: 0, maxWidth: 900,
        color: 'transparent',
        backgroundImage: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.4) 100%)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
      }}>
        A new species of product tool. <span style={{ color: 'transparent', backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>Purpose-built for modern teams with AI workflows at its core, Linear sets a new standard for planning and building products.</span>
      </h2>
    </section>
  );
}

// ── Three pillars with 3D isometric images ────────────────────────────────────
function ThreePillars() {
  const pillars = [
    {
      fig: 'FIG 0.2',
      img: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7b144b7-4ef0-4991-9bcb-617c6a37d200/f=auto,dpr=2,fit=scale-down,metadata=none',
      label: 'Built for purpose',
      desc: 'Linear is shaped by the practices and principles of world-class product teams.',
    },
    {
      fig: 'FIG 0.3',
      img: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/6600ca96-e49b-4fd9-c03a-7979faddad00/f=auto,dpr=2,fit=scale-down,metadata=none',
      label: 'Powered by AI agents',
      desc: 'Designed for workflows shared by humans and agents, from PRD to PR.',
    },
    {
      fig: 'FIG 0.4',
      img: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7fa8f5f-d439-4329-6a65-de549b51e300/f=auto,dpr=2,fit=scale-down,metadata=none',
      label: 'Designed for speed',
      desc: 'Reduces noise and restores momentum to help teams ship with high velocity and focus.',
    },
  ];

  return (
    <section style={{ background: BG, padding: '0', fontFamily: F }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: `1px solid ${BORDER}` }}>
        {pillars.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              borderRight: i < 2 ? `1px solid ${BORDER}` : 'none',
              padding: '0 0 48px 0',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '40px 40px 0', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em', marginBottom: 0 }}>{p.fig}</div>
            <img
              src={p.img}
              alt={p.label}
              style={{ width: '100%', height: 280, objectFit: 'contain', display: 'block', padding: '20px 40px' }}
            />
            <div style={{ padding: '0 40px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{p.label}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Feature section template ──────────────────────────────────────────────────
function FeatureSplit({ title, desc, linkNum, linkLabel, children, flip = false }) {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '120px 80px', fontFamily: F }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Text header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 80 }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.8rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, margin: 0 }}>
            {title}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 24px' }}>{desc}</p>
            <a href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>{linkNum}</span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{linkLabel} →</span>
            </a>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

// ── Intake section mock ───────────────────────────────────────────────────────
function IntakeMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, fontFamily: F }}>
      {/* Slack thread */}
      <div style={{ background: '#1A1A1E', borderRadius: 12, border: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13 }}>⚙</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Thread in <span style={{ color: '#fff' }}>#feedback</span></span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>⋮</span>
        </div>
        {[
          { name: 'lena', time: '3:06 PM', msg: "Anyone else noticing the iOS app feels slow to open if you haven't used it in a bit?", color: '#7C6AF4' },
          { name: 'didier', time: '3:06 PM', msg: "Yea, we're still blocking initial render on a full vehicle_state sync every time...", color: '#E87C3E' },
          { name: 'andreas', time: '3:06 PM', msg: 'Feels like we could render sooner and load the rest in the background. Probably also worth tracking startup timing so we know how often this happens!', color: '#4E9CF5' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '12px 16px', display: 'flex', gap: 10, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: m.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{m.name[0].toUpperCase()}</span>
            </div>
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{m.name}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{m.time}</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, margin: 0 }}>{m.msg}</p>
            </div>
          </div>
        ))}
        <div style={{ padding: '12px 16px' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 10px' }}>
            <span style={{ background: 'rgba(90,90,240,0.2)', color: '#7C6AF4', borderRadius: 3, padding: '0 3px' }}>@Linear</span>{' '}create urgent issues and assign to me
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {['＋', 'Aa', '☺', '@', '⬡', '🎤', '/'].map((c, i) => (
              <span key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}>{c}</span>
            ))}
            <div style={{ flex: 1 }} />
            <button style={{ background: '#5A5AF0', border: 'none', borderRadius: 6, padding: '6px 14px', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              ▶ <span style={{ fontSize: 11 }}>1× ▾</span>
            </button>
          </div>
        </div>
      </div>

      {/* Issue list */}
      <div style={{ background: '#1A1A1E', borderRadius: 12, border: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>In Progress</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '0 5px' }}>3</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>＋ ···</span>
        </div>
        {[
          { label: 'Remove contentData from GraphQL API', tag: '61039', avatar: 'R' },
          { label: 'Launch page assets', tag: 'Design', avatar: 'L' },
          { label: 'Prevent duplicate ride requests on poor...', tag: 'Bug  62048', avatar: 'P' },
        ].map((item, i) => (
          <div key={i} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid rgba(255,255,255,0.04)`, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid #22c55e', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '1px 5px' }}>{item.tag}</span>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#5A5AF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{item.avatar}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Roadmap mock ──────────────────────────────────────────────────────────────
function RoadmapMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, fontFamily: F }}>
      {/* Initiatives panel */}
      <div style={{ background: '#1A1A1E', borderRadius: 12, border: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Initiatives</span>
        </div>
        {[
          { label: 'Core Product', count: 99, indent: 0, icon: '◎', color: '#5A5AF0', children: [{ label: 'Infra stability', count: 28, icon: '⬡', color: '#E87C3E' }, { label: 'Autonomous systems', count: 16, icon: '＋', color: '#4E9CF5' }, { label: 'Mobile apps', count: 8, icon: '📱', color: '#22c55e' }] },
          { label: 'APAC Expansion', count: 21, indent: 0, icon: '◎', color: '#E87C3E', children: [{ label: 'Japan Launch', count: 12, icon: '⬡', color: '#ef4444' }, { label: 'Customer-driven priorities', count: 9, icon: '⬡', color: '#7C6AF4' }] },
        ].map((item, i) => (
          <div key={i}>
            <div style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ fontSize: 13, color: item.color }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{item.count}</span>
            </div>
            {item.children?.map((c, ci) => (
              <div key={ci} style={{ padding: '7px 16px 7px 40px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 12, color: c.color }}>{c.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{c.label}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{c.count}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ background: '#1A1A1E', borderRadius: 12, border: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', gap: 24 }}>
          {['FEB', 'MAR', 'APR', 'JUL', 'AUG', 'SEP'].map(m => (
            <span key={m} style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.05em' }}>{m}</span>
          ))}
        </div>
        <div style={{ padding: '16px' }}>
          {[
            { label: 'UI Refresh', color: '#7C6AF4', w: '30%', ml: '0%' },
            { label: 'Split fares', color: '#22c55e', w: '25%', ml: '25%' },
            { label: 'Autonomy status clarity', color: '#f59e0b', w: '50%', ml: '15%' },
            { label: 'Core Product', color: '#6b7280', w: '80%', ml: '0%' },
            { label: 'APAC Expansion', color: '#ec4899', w: '30%', ml: '55%' },
          ].map((t, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ height: 24, display: 'flex', alignItems: 'center', position: 'relative', background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                <div style={{
                  position: 'absolute', left: t.ml, width: t.w, height: '100%',
                  background: t.color + '33', border: `1px solid ${t.color}55`,
                  borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8,
                }}>
                  <span style={{ fontSize: 11, color: t.color, fontWeight: 500, whiteSpace: 'nowrap' }}>{t.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Agent assign mock ─────────────────────────────────────────────────────────
function AgentMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, fontFamily: F }}>
      {/* Terminal */}
      <div style={{ background: '#141416', borderRadius: 12, border: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="9" height="9" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.7)"/></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Codex</span>
        </div>
        <div style={{ padding: '16px', fontSize: 13, lineHeight: 1.9 }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 4px' }}>On it! I've received your request.</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Kicked off a task in <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3, fontSize: 12, fontFamily: 'monospace' }}>kinetic/kinetic-iOS</code> environment.</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Searching for root AGENTS file</p>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 12px', margin: '4px 0 8px', fontFamily: 'monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            kinetic/kinetic-iOS$ /bin/bash -lc rg --files -g 'AGENTS.md'<br />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>AGENTS.md</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>Locating initialization logic for <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: 3, fontSize: 12, fontFamily: 'monospace' }}>vehicle_state</code></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0,1,2,3,4,5].map(i => <div key={i} style={{ width: 3, height: 12, background: `rgba(255,255,255,${0.1 + i * 0.05})`, borderRadius: 2 }} />)}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Thinking...</span>
          </div>
        </div>
      </div>

      {/* Assign dropdown */}
      <div style={{ background: '#1A1A1E', borderRadius: 12, border: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input placeholder="Assign to..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'rgba(255,255,255,0.6)', flex: 1, fontFamily: F }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>···</span>
        </div>
        {[
          { name: 'Codex', tag: 'Agent', avatar: '⊙', color: '#5A5AF0', check: true },
          { name: 'Steven', avatar: 'S', color: '#E87C3E' },
          { name: 'Ema', avatar: 'E', color: '#4E9CF5' },
          { name: 'GitHub Copilot', tag: 'Agent', avatar: '⊗', color: '#444' },
          { name: 'Cursor', tag: 'Agent', avatar: '◊', color: '#666' },
          { name: 'Meg', avatar: 'M', color: '#7C6AF4' },
        ].map((item, i) => (
          <div key={i} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{item.avatar}</span>
            </div>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', flex: 1 }}>{item.name}</span>
            {item.tag && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '1px 6px' }}>{item.tag}</span>}
            {item.check && <span style={{ fontSize: 14, color: '#22c55e' }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Code diff mock ─────────────────────────────────────────────────────────────
function DiffMock() {
  const lines = [
    { n: '01', text: "import React from 'react'", removed: false },
    { n: '02', text: "import { View, ActivityIndicator } from 'react-native'", removed: false },
    { n: '03', text: "import { useVehicleState } from '@hooks/useVehicleState'", removed: true, addedText: "import { useVehicleState, SyncStatus } from '@hooks/useVehicleSt..." },
    { n: '04', text: "import { Dashboard } from '@components/Dashboard'", removed: false },
    { n: '05', text: '', removed: false },
    { n: '06', text: "export const HomeScreen = () => {", removed: false },
    { n: '07', text: "  const { vehicleState, isFullySynced } = useVehicleState()", removed: true, addedText: "  const { vehicleState, syncStatus } = useVehicleState()" },
    { n: '08', text: '', removed: false },
    { n: '09', text: "  if (!isFullySynced) {", removed: true, addedText: "  if (syncStatus === SyncStatus.PENDING) {" },
    { n: '10', text: "    return <ActivityIndicator size=\"large\" />", removed: false },
    { n: '11', text: "  }", removed: false },
  ];

  return (
    <div style={{ background: '#141416', borderRadius: 12, border: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden', fontFamily: F }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>📄 kinetic-ios/src/screens/Home/HomeScreen.tsx</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Linear ↗</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        {/* Left (before) */}
        <div style={{ borderRight: `1px solid rgba(255,255,255,0.06)` }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', padding: '2px 0', background: line.removed ? 'rgba(239,68,68,0.07)' : 'transparent', borderLeft: line.removed ? '2px solid rgba(239,68,68,0.4)' : '2px solid transparent' }}>
              <span style={{ width: 32, textAlign: 'right', paddingRight: 12, fontSize: 11, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', flexShrink: 0 }}>{line.n}</span>
              <span style={{ fontSize: 12, color: line.removed ? '#fca5a5' : 'rgba(255,255,255,0.45)', fontFamily: 'monospace', whiteSpace: 'pre' }}>{line.text}</span>
            </div>
          ))}
        </div>
        {/* Right (after) */}
        <div>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', padding: '2px 0', background: line.addedText ? 'rgba(34,197,94,0.07)' : 'transparent', borderLeft: line.addedText ? '2px solid rgba(34,197,94,0.4)' : '2px solid transparent' }}>
              <span style={{ width: 32, textAlign: 'right', paddingRight: 12, fontSize: 11, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', flexShrink: 0 }}>{line.n}</span>
              <span style={{ fontSize: 12, color: line.addedText ? '#86efac' : 'rgba(255,255,255,0.45)', fontFamily: 'monospace', whiteSpace: 'pre' }}>{line.addedText || line.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Pulse / Monitor mock ──────────────────────────────────────────────────────
function MonitorMock() {
  return (
    <div style={{ background: '#1A1A1E', borderRadius: 12, border: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden', fontFamily: F, maxWidth: 460 }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Weekly Pulse for Jun 18</span>
        <div style={{ flex: 1 }} />
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
          ▶ Listen
        </button>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>1.0× ⋮</span>
      </div>
      <div style={{ padding: '12px 16px 6px', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.04em' }}>Projects</div>

      {[
        { title: 'UI refresh', status: 'At risk', statusColor: '#ef4444', by: 'romain', when: '1 day ago', bullets: ['iOS implementation is mostly complete, but Android updates are still work in progress', 'Risk of timeline slip if remaining design decisions aren\'t finalized soon'] },
        { title: 'Tokyo launch', status: 'On track', statusColor: '#22c55e', by: 'julian', when: '3 hours ago', bullets: ['Localization efforts have been completed', 'Everything else on track for launch in early September'] },
      ].map((p, i) => (
        <div key={i} style={{ padding: '10px 16px', borderTop: `1px solid rgba(255,255,255,0.04)` }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>{p.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.statusColor }} />
            <span style={{ fontSize: 12, color: p.statusColor, fontWeight: 500 }}>{p.status}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>· By {p.by} · {p.when}</span>
          </div>
          {p.bullets.map((b, bi) => (
            <div key={bi} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 1 }}>•</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{b}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Changelog section ──────────────────────────────────────────────────────────
function ChangelogSection() {
  const posts = [
    { dot: '#ef4444', title: 'Coding sessions in Linear', desc: 'Earlier this year, we launched Linear Agent, giving teams a ne...', date: 'JUN 10, 2026' },
    { dot: '#6b7280', title: 'Team documents', desc: "Important team context doesn't always belong in a specific issue,...", date: 'JUN 3, 2026' },
    { dot: '#6b7280', title: 'Linear Diffs', desc: 'Agents generate large volumes of code, but individuals are still...', date: 'MAY 27, 2026' },
    { dot: '#6b7280', title: 'Project Slack channels', desc: 'Project teams often use a Slack channel to discuss and share...', date: 'MAY 21, 2026' },
  ];

  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '120px 80px', fontFamily: F }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(2.4rem, 5vw, 5rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 0 80px' }}>Changelog</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {posts.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.dot, marginBottom: 16 }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.01em' }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: '0 0 12px' }}>{p.desc}</p>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{p.date}</span>
            </motion.div>
          ))}
        </div>
        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 40, fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
          View all →
        </a>
      </div>
    </section>
  );
}

// ── Testimonials big cards ────────────────────────────────────────────────────
function TestimonialCards() {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '0 80px 80px', fontFamily: F }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {/* OpenAI — light purple card */}
          <div style={{ background: '#E8E8F0', borderRadius: '12px 0 0 12px', padding: '48px', position: 'relative', overflow: 'hidden' }}>
            <p style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3, margin: '0 0 48px', letterSpacing: '-0.02em' }}>
              "You'll probably build a better product, just because of the craft that{' '}
              <span style={{ color: '#5A5AF0' }}>using Linear infuses on your brain.</span>"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, color: '#fff' }}>⊛</span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Gabriel Peal</p>
                <p style={{ fontSize: 13, color: 'rgba(26,26,46,0.6)', margin: 0 }}>Staff Software Engineer, OpenAI</p>
              </div>
            </div>
          </div>
          {/* Ramp — yellow card */}
          <div style={{ background: '#E8F060', borderRadius: '0 12px 12px 0', padding: '48px', position: 'relative', overflow: 'hidden' }}>
            <p style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3, margin: '0 0 48px', letterSpacing: '-0.02em' }}>
              "Our speed is intense and Linear helps us be action biased."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, color: '#E8F060' }}>↗</span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Nik Koblov</p>
                <p style={{ fontSize: 13, color: 'rgba(26,26,26,0.6)', margin: 0 }}>Head of Engineering, Ramp</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40 }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Linear powers over <strong style={{ color: '#fff' }}>33,000</strong> product teams. From ambitious startups to major enterprises.
          </p>
          <a href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
            Customer stories →
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCta({ onSignup }) {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '160px 80px', fontFamily: F, textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}>
        <h2 style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.0, margin: '0 0 40px' }}>
          Built for the future.<br />Available today.
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onSignup} style={{
            fontFamily: F, fontSize: 15, fontWeight: 500, color: '#000',
            background: '#fff', border: 'none', borderRadius: 8,
            padding: '12px 28px', cursor: 'pointer', transition: 'opacity 150ms',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Get started
          </button>
          <button style={{
            fontFamily: F, fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.6)',
            background: 'transparent', border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 8,
            padding: '12px 28px', cursor: 'pointer', transition: 'all 200ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}>
            Contact sales
          </button>
        </div>
      </motion.div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: 'Product', links: ['Intake', 'Plan', 'Build', 'Diffs', 'Monitor', 'Pricing', 'Security'] },
    { title: 'Features', links: ['Asks', 'Agents', 'Coding Sessions', 'Customer Requests', 'Insights', 'Mobile', 'Integrations', 'Changelog'] },
    { title: 'Company', links: ['About', 'Customers', 'Careers', 'Blog', 'Method', 'Quality', 'Brand'] },
    { title: 'Resources', links: ['Switch', 'Download', 'Documentation', 'Developers', 'Status', 'Enterprise', 'Startups'] },
    { title: 'Connect', links: ['Contact us', 'Community', 'X (Twitter)', 'GitHub', 'YouTube'] },
  ];

  return (
    <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '60px 80px 40px', fontFamily: F }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(5, 1fr)', gap: 32, marginBottom: 48 }}>
          <div>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path d="M0.705 14.443L3.557 17.295C3.837 17.575 4.258 17.638 4.607 17.435L0.565 13.393C0.362 13.742 0.425 14.163 0.705 14.443Z" fill="rgba(255,255,255,0.5)"/>
              <path d="M0 11.338V12.106L5.894 18H6.662L0 11.338Z" fill="rgba(255,255,255,0.5)"/>
              <path d="M9 0C4.029 0 0 4.029 0 9V10.272L7.728 18H9C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.5)"/>
            </svg>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <a key={link} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 24, display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'DPA', 'AUP'].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}>
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
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
      <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.06)', borderTopColor: '#5A5AF0', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
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
      <LogoStrip />
      <NewSpecies />
      <ThreePillars />

      <FeatureSplit
        title={<>Make product operations<br />self-driving</>}
        desc="Turn conversations and customer feedback into actionable issues that are routed, labeled, and prioritized for the right team."
        linkNum="1.0" linkLabel="Intake"
      >
        <IntakeMock />
      </FeatureSplit>

      <FeatureSplit
        title={<>Define the product<br />direction</>}
        desc="Plan and navigate from idea to launch. Align your team with product initiatives, strategic roadmaps, and clear, up-to-date PRDs."
        linkNum="2.0" linkLabel="Plan"
      >
        <RoadmapMock />
      </FeatureSplit>

      <FeatureSplit
        title={<>Move work forward across<br />teams and agents</>}
        desc="Build and deploy AI agents that work alongside your team. Work on complex tasks together or delegate entire issues end-to-end."
        linkNum="3.0" linkLabel="Build"
      >
        <AgentMock />
      </FeatureSplit>

      <FeatureSplit
        title={<>Review PRs and agent<br />output</>}
        desc="Understand code changes at a glance with structural diffs for human and agent output. Review, discuss, and merge — all within Linear."
        linkNum="4.0" linkLabel="Diffs"
      >
        <DiffMock />
      </FeatureSplit>

      <FeatureSplit
        title={<>Understand progress<br />at scale</>}
        desc="Take the guesswork out of product development with project updates, analytics, and dashboards that surface what needs your attention."
        linkNum="5.0" linkLabel="Monitor"
      >
        <MonitorMock />
      </FeatureSplit>

      <ChangelogSection />
      <TestimonialCards />
      <FinalCta onSignup={onSignup} />
      <Footer />
    </div>
  );
}