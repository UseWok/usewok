import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { LandingPricingLight } from './LandingPricingPage';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0F0F0F';
const BG2 = '#111111';
const BORDER = 'rgba(255,255,255,0.07)';
const T1 = '#FFFFFF';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.28)';

useEffect: null; // suppress unused import warning

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
function Navbar({ onLogin, onSignup }) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      height: 48, display: 'flex', alignItems: 'center',
      padding: '0 20px', fontFamily: F,
      background: '#0D0D0D',
      borderBottom: `1px solid rgba(255,255,255,0.06)`,
    }}>
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0, minWidth: 90 }}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M0.705 14.443L3.557 17.295C3.837 17.575 4.258 17.638 4.607 17.435L0.565 13.393C0.362 13.742 0.425 14.163 0.705 14.443Z" fill="white"/>
          <path d="M0.133 12.646L5.354 17.867C5.527 17.951 5.724 17.963 5.912 17.888L0.112 12.088C0.037 12.276 0.049 12.473 0.133 12.646Z" fill="white"/>
          <path d="M0 11.338V12.106L5.894 18H6.662L0 11.338Z" fill="white"/>
          <path d="M9 0C4.029 0 0 4.029 0 9V10.272L7.728 18H9C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="white"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 500, color: T1, letterSpacing: '-0.01em' }}>Linear</span>
      </a>

      <div style={{ flex: 1 }} />

      {/* Nav links — centered */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {[['Product','#'],['Resources','#'],['Customers','#'],['Pricing','/pricing'],['Now','#'],['Contact','#']].map(([l,h]) => (
          <a key={l} href={h} style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 150ms', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.color = T1}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>{l}</a>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 90, justifyContent: 'flex-end' }}>
        <a href="#" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', whiteSpace: 'nowrap' }}
          onMouseEnter={e => e.currentTarget.style.color = T1}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Docs</a>
        <button onClick={onSignup} style={{
          fontFamily: F, fontSize: 13, fontWeight: 500,
          color: T1, background: 'transparent',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 20, padding: '5px 16px', cursor: 'pointer',
          transition: 'border-color 150ms',
          whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'}>
          Open app
        </button>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onSignup }) {
  return (
    <section style={{ background: BG, paddingTop: 44, fontFamily: F }}>
      {/* Gradient top bg */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 500,
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(90,90,240,0.12) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Hero text */}
        <div style={{ padding: '72px 120px 0', position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: 42, fontWeight: 700, color: T1,
            letterSpacing: '-0.04em', lineHeight: 1.08,
            margin: '0 0 14px', maxWidth: 560,
          }}>
            The product development<br />system for teams<br />and agents
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 640 }}>
            <p style={{ fontSize: 13, color: T2, margin: 0, fontWeight: 400 }}>
              Purpose-built for planning and building products. Designed for the AI era.
            </p>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#000', background: T1, borderRadius: 3, padding: '1px 6px', letterSpacing: '0.01em' }}>New</span>
              <span style={{ fontSize: 13, color: T2 }}>Coding Sessions →</span>
            </a>
          </div>
        </div>

        {/* App Screenshot */}
        <div style={{ padding: '48px 120px 0', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: '10px 10px 0 0', overflow: 'hidden',
            border: `1px solid rgba(255,255,255,0.09)`, borderBottom: 'none',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.6)',
          }}>
            <AppScreenshot />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── APP SCREENSHOT MOCKUP ────────────────────────────────────────────────────
function AppScreenshot() {
  return (
    <div style={{ background: '#1C1C1E', fontFamily: F }}>
      {/* Window bar */}
      <div style={{ height: 34, background: '#161618', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6 }}>
        {['#FF5F56','#FFBD2E','#27C93F'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#5A5AF0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="8" height="8" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="white"/></svg>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Linear</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>∨</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>🔍</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>✏️</span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', height: 480 }}>
        {/* Sidebar */}
        <div style={{ width: 196, background: '#1A1A1C', borderRight: `1px solid rgba(255,255,255,0.05)`, padding: '6px 0', flexShrink: 0 }}>
          {[
            { icon: '📥', label: 'Inbox' },
            { icon: '◈', label: 'My issues' },
            { icon: '⟳', label: 'Reviews' },
            { icon: '⚡', label: 'Pulse' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 10, width: 14, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
            </div>
          ))}
          <div style={{ padding: '10px 10px 3px', fontSize: 10, color: 'rgba(255,255,255,0.18)', fontWeight: 500, letterSpacing: '0.04em' }}>Workspace ▾</div>
          {['Initiatives', 'Projects', 'More'].map(l => (
            <div key={l} style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 10, width: 14, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>◎</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>{l}</span>
            </div>
          ))}
          <div style={{ padding: '10px 10px 3px', fontSize: 10, color: 'rgba(255,255,255,0.18)', fontWeight: 500, letterSpacing: '0.04em' }}>Favorites ▾</div>
          {[
            { label: 'Faster app launch', color: '#FF8C42', active: true },
            { label: 'Agent tasks', color: '#22c55e' },
            { label: 'UI Refresh', color: '#ef4444' },
            { label: 'Agents Insights', color: '#5A5AF0' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 7, background: item.active ? 'rgba(255,255,255,0.06)' : 'transparent', borderRadius: item.active ? 4 : 0, margin: item.active ? '0 5px' : '0' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: item.active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.38)' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ height: 38, borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Faster app launch</span>
            <span style={{ fontSize: 11, color: '#FFBD2E' }}>★</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>···</span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>02 / 145 ⌃⌄</span>
            <div style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.08)', margin: '0 6px' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>ENG-2703</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>🔗 ⊞ ↗</span>
          </div>

          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Issue body */}
            <div style={{ flex: 1, padding: '20px 22px', overflowY: 'auto', borderRight: `1px solid rgba(255,255,255,0.05)` }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: T1, margin: '0 0 9px', letterSpacing: '-0.02em' }}>Faster app launch</h2>
              <p style={{ fontSize: 12, color: T2, lineHeight: 1.6, margin: '0 0 20px' }}>
                Render UI before{' '}
                <code style={{ background: 'rgba(255,255,255,0.09)', padding: '1px 5px', borderRadius: 3, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>vehicle_state</code>
                {' '}sync when minimum required state is present, instead of blocking on full refresh during iOS startup.
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px' }}>Activity</p>
              {[
                { color: '#5A5AF0', icon: '◈', text: <>Linear created the issue via <u>Slack</u> on behalf of <u>karri</u> · 2min ago</> },
                { color: '#888', icon: '🏷', text: <><u>Triage Intelligence</u> added the label <u>Performance</u> and <u>iOS</u> · 2min ago</> },
              ].map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11, color: a.color, marginTop: 1, flexShrink: 0 }}>{a.icon}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', lineHeight: 1.6 }}>{a.text}</span>
                </div>
              ))}

              <div style={{ margin: '12px 0', display: 'flex', gap: 9 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#5A5AF0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>K</div>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>karri</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>4 min ago</span>
                  <p style={{ fontSize: 12, color: T2, margin: '3px 0 0', lineHeight: 1.55 }}>Right now we show a spinner forever, which makes it look like the car disappeared...</p>
                </div>
              </div>

              <div style={{ margin: '12px 0', display: 'flex', gap: 9 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#2D6A4F', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', fontWeight: 700 }}>J</div>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>jori</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>just now</span>
                  <p style={{ fontSize: 12, color: T2, margin: '3px 0 0', lineHeight: 1.55 }}>@Linear can you take a stab at this?</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', background: 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="9" height="9" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.5)"/></svg>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Linear</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>connected by jori · 2 min ago</span>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '3px 0' }}>✦ Changed 2 files — Draft PR awaiting your review · 2 min ago</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginTop: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>⊙</span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>Linear moved from <span style={{ color: 'rgba(255,255,255,0.5)' }}>Todo</span> to <span style={{ color: 'rgba(255,255,255,0.5)' }}>In Progress</span> · just now</span>
              </div>
            </div>

            {/* Right meta */}
            <div style={{ width: 200, padding: '14px 14px', flexShrink: 0 }}>
              {[
                { dot: '#22c55e', label: 'In Progress' },
                { bar: true, label: 'High' },
                { initials: 'J', bg: '#2D6A4F', label: 'jori' },
                { linearLogo: true, label: 'Linear' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                  {r.dot && <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.dot, flexShrink: 0 }} />}
                  {r.bar && <svg width="14" height="10" viewBox="0 0 14 10"><rect x="0" y="3" width="3" height="4" fill="rgba(255,255,255,0.2)"/><rect x="4" y="1" width="3" height="6" fill="rgba(255,255,255,0.4)"/><rect x="8" y="0" width="3" height="8" fill="rgba(255,255,255,0.65)"/><rect x="12" y="2" width="2" height="5" fill="rgba(255,255,255,0.3)"/></svg>}
                  {r.initials && <div style={{ width: 14, height: 14, borderRadius: '50%', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{r.initials}</div>}
                  {r.linearLogo && <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="8" height="8" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.55)"/></svg></div>}
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{r.label}</span>
                </div>
              ))}

              {/* AI panel */}
              <div style={{ marginTop: 16, background: '#141416', border: `1px solid rgba(255,255,255,0.09)`, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="8" height="8" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.65)"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T1 }}>Linear</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Opus 4.8</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>− □ ✕</span>
                </div>
                <div style={{ padding: '10px 12px', fontSize: 11, lineHeight: 1.75 }}>
                  <p style={{ color: 'rgba(255,255,255,0.45)', margin: '0 0 4px' }}>jori connected Linear to ENG-2703</p>
                  <p style={{ color: 'rgba(255,255,255,0.65)', margin: '0 0 3px', fontWeight: 500 }}>Examining the startup path...</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', margin: '0 0 7px' }}>Worked for 7s ▾</p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', margin: '0 0 6px' }}>Pushed and opened a draft PR. Changes:</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', fontFamily: 'monospace', fontSize: 10 }}>• useRideHistory.ts : build a <span style={{ background: 'rgba(255,255,255,0.07)', padding: '0 3px', borderRadius: 2 }}>waitingStatusById</span> map and use it as the <span style={{ background: 'rgba(255,255,255,0.07)', padding: '0 3px', borderRadius: 2 }}>getLastAction</span> by line</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', margin: '2px 0 6px', fontFamily: 'monospace', fontSize: 10 }}>• <span style={{ background: 'rgba(255,255,255,0.07)', padding: '0 3px', borderRadius: 2 }}>RideHistoryPage.tsx</span> : dimmed rows reset</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Changed 2 files</span>
                    <span style={{ fontSize: 10, color: '#22c55e', background: 'rgba(34,197,94,0.1)', borderRadius: 2, padding: '0 4px' }}>+4</span>
                    <span style={{ fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 2, padding: '0 4px' }}>-4</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }}>Preview</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.03)', borderRadius: 4, padding: '5px 7px' }}>
                    ↑ Draft Update homepage H1<br />
                    <span style={{ color: 'rgba(255,255,255,0.16)' }}>master ← ride/drv-899-update-homepage-h1-65a6</span>
                  </div>
                </div>
                <div style={{ padding: '6px 12px', borderTop: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', flex: 1 }}>Tell Linear what to do next...</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>↺ 🔗 ↑</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOGO STRIP ───────────────────────────────────────────────────────────────
function LogoStrip() {
  const logos = [
    { text: '▲ Vercel' },
    { text: '⊕ CURSOR' },
    { text: 'OSCAR' },
    { text: 'OpenAI' },
    { text: 'coinbase' },
    { text: '$ Cash App' },
    { text: '⊗ BOOM' },
    { text: 'ramp ↗' },
  ];
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '36px 120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {logos.map(l => (
          <span key={l.text} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.22)', letterSpacing: '-0.01em', fontFamily: F }}>{l.text}</span>
        ))}
      </div>
    </section>
  );
}

// ─── NEW SPECIES ──────────────────────────────────────────────────────────────
function NewSpecies() {
  return (
    <section style={{ background: BG, padding: '80px 120px', fontFamily: F, borderTop: `1px solid ${BORDER}` }}>
      <h2 style={{
        fontSize: 36, fontWeight: 700, lineHeight: 1.15,
        letterSpacing: '-0.04em', margin: 0, maxWidth: 680,
      }}>
        <span style={{ color: T1 }}>A new species of product tool.</span>{' '}
        <span style={{ color: 'rgba(255,255,255,0.32)' }}>Purpose-built for modern teams with AI workflows at its core, Linear sets a new standard for planning and building products.</span>
      </h2>
    </section>
  );
}

// ─── THREE PILLARS ────────────────────────────────────────────────────────────
function ThreePillars() {
  const items = [
    {
      fig: 'FIG 0.2',
      img: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7b144b7-4ef0-4991-9bcb-617c6a37d200/f=auto,dpr=2,fit=scale-down,metadata=none',
      title: 'Built for purpose',
      desc: 'Linear is shaped by the practices and principles of world-class product teams.',
    },
    {
      fig: 'FIG 0.3',
      img: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/6600ca96-e49b-4fd9-c03a-7979faddad00/f=auto,dpr=2,fit=scale-down,metadata=none',
      title: 'Powered by AI agents',
      desc: 'Designed for workflows shared by humans and agents. From drafting PRDs to pushing PRs.',
    },
    {
      fig: 'FIG 0.4',
      img: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7fa8f5f-d439-4329-6a65-de549b51e300/f=auto,dpr=2,fit=scale-down,metadata=none',
      title: 'Designed for speed',
      desc: 'Reduces noise and restores momentum to help teams ship with high velocity and focus.',
    },
  ];
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, fontFamily: F }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
        {items.map((p, i) => (
          <div key={i} style={{ borderRight: i < 2 ? `1px solid ${BORDER}` : 'none', padding: '0 0 48px' }}>
            <div style={{ padding: '32px 40px 0', fontSize: 11, color: T3, fontWeight: 500, letterSpacing: '0.04em' }}>{p.fig}</div>
            <div style={{ padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
              <img src={p.img} alt={p.title} style={{ width: '100%', maxWidth: 240, objectFit: 'contain', filter: 'brightness(0.88)' }} />
            </div>
            <div style={{ padding: '0 40px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: T1, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: T2, lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── FEATURE SECTION WRAPPER ─────────────────────────────────────────────────
function FeatureSection({ title, desc, num, linkLabel, subLinks, children }) {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '100px 120px', fontFamily: F }}>
      {/* Header split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 64 }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: T1, letterSpacing: '-0.04em', lineHeight: 1.08, margin: 0 }}>{title}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <p style={{ fontSize: 15, color: T2, lineHeight: 1.7, margin: '0 0 20px' }}>{desc}</p>
          <a href="#" style={{ fontSize: 13, color: T2, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: T3 }}>{num}</span>
            <span>{linkLabel} →</span>
          </a>
        </div>
      </div>
      {/* Mock */}
      {children}
      {/* Sub links */}
      {subLinks && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 48, maxWidth: 540 }}>
          {subLinks.map((sl, i) => (
            <a key={i} href="#" style={{ fontSize: 13, color: T3, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => e.currentTarget.style.color = T2}
              onMouseLeave={e => e.currentTarget.style.color = T3}>
              <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12 }}>{sl.num}</span>
              <span>{sl.label}</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── INTAKE MOCK ──────────────────────────────────────────────────────────────
function IntakeMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, fontFamily: F }}>
      {/* Slack thread */}
      <div style={{ background: '#1A1A1C', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 12 }}>⚙</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Thread in <span style={{ color: T1 }}>#feedback</span></span>
          <div style={{ flex: 1 }} /><span style={{ fontSize: 11, color: T3 }}>⋮</span>
        </div>
        {[
          { name: 'lena', color: '#7C6AF4', time: '3:06 PM', msg: "Anyone else noticing the iOS app feels slow to open if you haven't used it in a bit?" },
          { name: 'didier', color: '#E87C3E', time: '3:06 PM', msg: "Yea, we're still blocking initial render on a full vehicle_state sync every time..." },
          { name: 'andreas', color: '#4E9CF5', time: '3:06 PM', msg: 'Feels like we could render sooner and load the rest in the background. Probably also worth tracking startup timing so we know how often this happens!' },
        ].map((m, i) => (
          <div key={i} style={{ padding: '10px 14px', display: 'flex', gap: 9, borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: m.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{m.name[0].toUpperCase()}</div>
            <div>
              <div style={{ display: 'flex', gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T1 }}>{m.name}</span>
                <span style={{ fontSize: 10, color: T3, marginTop: 1 }}>{m.time}</span>
              </div>
              <p style={{ fontSize: 12, color: T2, lineHeight: 1.55, margin: 0 }}>{m.msg}</p>
            </div>
          </div>
        ))}
        <div style={{ padding: '10px 14px' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 8px' }}>
            <span style={{ background: 'rgba(90,90,240,0.18)', color: '#7C6AF4', borderRadius: 3, padding: '0 4px' }}>@Linear</span>{' '}create urgent issues and assign to me
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {['＋','Aa','☺','@','⬡','🎤','/'].map((c,i)=><span key={i} style={{fontSize:11,color:T3}}>{c}</span>)}
            <div style={{ flex:1 }} />
            <button style={{ background:'#5A5AF0',border:'none',borderRadius:5,padding:'5px 12px',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>▶ <span style={{fontSize:10}}>1× ▾</span></button>
          </div>
        </div>
      </div>

      {/* Kanban columns */}
      <div style={{ background: '#1A1A1C', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', height: '100%' }}>
          {[
            { title: 'Todo', count: 71, color: '#888', items: ['Remove UI inconsistencies', 'TypedError: Cannot read properties', 'Upgrade to Claude Opus 4.5', 'Retrieve backtrace'] },
            { title: 'In-Progress', count: 3, color: '#22c55e', items: ['Remove contentData from GraphQL API', 'Launch page assets', 'Prevent duplicate ride requests on po...'] },
            { title: 'Done', count: '', color: '#4E9CF5', items: [] },
          ].map((col, i) => (
            <div key={i} style={{ borderRight: i < 2 ? `1px solid rgba(255,255,255,0.05)` : 'none', padding: '10px 0' }}>
              <div style={{ padding: '0 12px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{col.title}</span>
                {col.count && <span style={{ fontSize: 10, color: T3, background: 'rgba(255,255,255,0.05)', borderRadius: 3, padding: '0 4px' }}>{col.count}</span>}
                <div style={{ flex:1 }} /><span style={{ fontSize: 11, color: T3 }}>＋ ···</span>
              </div>
              {col.items.map((item, ii) => (
                <div key={ii} style={{ margin: '0 8px 4px', padding: '7px 10px', background: '#222224', borderRadius: 6, border: `1px solid rgba(255,255,255,0.05)` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${col.color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{item}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <span style={{ fontSize: 9, color: T3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '1px 5px' }}>Bug</span>
                    <span style={{ fontSize: 9, color: T3, background: 'rgba(255,255,255,0.06)', borderRadius: 3, padding: '1px 5px' }}>Design</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PLAN MOCK (Roadmap) ──────────────────────────────────────────────────────
function PlanMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, fontFamily: F }}>
      {/* Initiatives */}
      <div style={{ background: '#1A1A1C', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Initiatives</span>
        </div>
        {[
          { label: 'Core Product', count: 99, icon: '◎', color: '#5A5AF0', children: [
            { label: 'Infra stability', count: 28, icon: '⬡', color: '#E87C3E' },
            { label: 'Autonomous systems', count: 16, icon: '＋', color: '#4E9CF5' },
            { label: 'Mobile apps', count: 8, icon: '📱', color: '#22c55e' },
          ]},
          { label: 'APAC Expansion', count: 21, icon: '◎', color: '#E87C3E', children: [
            { label: 'Japan Launch', count: 12, icon: '⬡', color: '#ef4444' },
            { label: 'Customer-driven priorities', count: 9, icon: '⬡', color: '#7C6AF4' },
          ]},
        ].map((item, i) => (
          <div key={i}>
            <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: item.color }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: 11, color: T3 }}>{item.count}</span>
            </div>
            {item.children?.map((c, ci) => (
              <div key={ci} style={{ padding: '6px 14px 6px 36px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: c.color }}>{c.icon}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', flex: 1 }}>{c.label}</span>
                <span style={{ fontSize: 11, color: T3 }}>{c.count}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Gantt */}
      <div style={{ background: '#1A1A1C', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden' }}>
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
              <div style={{ position: 'relative', height: 26, background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                <div style={{
                  position: 'absolute', left: t.left, width: t.width, height: '100%',
                  background: t.color + '28', border: `1px solid ${t.color}50`,
                  borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8,
                }}>
                  <span style={{ fontSize: 10, color: t.color, fontWeight: 500, whiteSpace: 'nowrap' }}>{t.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BUILD MOCK (Agent) ───────────────────────────────────────────────────────
function BuildMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontFamily: F }}>
      {/* Terminal */}
      <div style={{ background: '#141416', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="8" height="8" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.65)"/></svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: T1 }}>Codex</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: T3 }}>—</span>
        </div>
        <div style={{ padding: '14px', fontSize: 12, lineHeight: 1.8 }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', margin: '0 0 4px' }}>On it! I've received your request.</p>
          <p style={{ color: T2, margin: '0 0 4px' }}>Kicked off a task in <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 4px', borderRadius: 3, fontSize: 11, fontFamily: 'monospace' }}>kinetic/kinetic-iOS</code> environment.</p>
          <p style={{ color: T2, margin: '0 0 4px' }}>Searching for root AGENTS file</p>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '7px 10px', margin: '4px 0 8px', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            kinetic/kinetic-iOS$ /bin/bash -lc rg --files -g 'AGENTS.md'<br />
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>AGENTS.md</span>
          </div>
          <p style={{ color: T2, margin: '0 0 4px' }}>Locating initialization logic for <code style={{ background: 'rgba(255,255,255,0.07)', padding: '1px 4px', borderRadius: 3, fontSize: 11, fontFamily: 'monospace' }}>vehicle_state</code></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[0,1,2,3,4,5].map(i => <div key={i} style={{ width: 3, height: 12, background: `rgba(255,255,255,${0.08 + i * 0.04})`, borderRadius: 2 }} />)}
            </div>
            <span style={{ color: T3, fontSize: 12 }}>Thinking...</span>
          </div>
        </div>
      </div>

      {/* Assign dropdown */}
      <div style={{ background: '#1A1A1C', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center' }}>
          <input readOnly value="Assign to..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'rgba(255,255,255,0.45)', flex: 1, fontFamily: F, cursor: 'default' }} />
          <span style={{ fontSize: 10, color: T3 }}>···</span>
        </div>
        {[
          { name: 'Codex', tag: 'Agent', avatar: '⊙', color: '#5A5AF0', check: true },
          { name: 'Steven', avatar: 'S', color: '#E87C3E' },
          { name: 'Ema', avatar: 'E', color: '#4E9CF5' },
          { name: 'GitHub Copilot', tag: 'Agent', avatar: '⊗', color: '#555' },
          { name: 'Cursor', tag: 'Agent', avatar: '◊', color: '#777' },
          { name: 'Meg', avatar: 'M', color: '#7C6AF4' },
        ].map((item, i) => (
          <div key={i} style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 150ms', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: '#fff', fontWeight: 700 }}>{item.avatar}</div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', flex: 1 }}>{item.name}</span>
            {item.tag && <span style={{ fontSize: 10, color: T3, background: 'rgba(255,255,255,0.05)', borderRadius: 3, padding: '1px 6px' }}>{item.tag}</span>}
            {item.check && <span style={{ fontSize: 12, color: '#22c55e' }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DIFF MOCK ─────────────────────────────────────────────────────────────────
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
    { n: '10', before: "    return <ActivityIndicator size=\"large\" />", after: "    return <ActivityIndicator size=\"large\" />", changed: false },
    { n: '11', before: '  }', after: '  }', changed: false },
  ];
  return (
    <div style={{ background: '#141416', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden', fontFamily: F }}>
      <div style={{ padding: '8px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: T3 }}>📄 kinetic-ios/src/screens/Home/HomeScreen.tsx</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: T2 }}>Linear ↗</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ borderRight: `1px solid rgba(255,255,255,0.05)` }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', padding: '1.5px 0', background: line.changed ? 'rgba(239,68,68,0.06)' : 'transparent', borderLeft: line.changed ? '2px solid rgba(239,68,68,0.35)' : '2px solid transparent' }}>
              <span style={{ width: 28, textAlign: 'right', paddingRight: 10, fontSize: 10, color: T3, fontFamily: 'monospace', flexShrink: 0 }}>{line.n}</span>
              <span style={{ fontSize: 11, color: line.changed ? '#fca5a5' : 'rgba(255,255,255,0.4)', fontFamily: 'monospace', whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.before}</span>
            </div>
          ))}
        </div>
        <div>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', padding: '1.5px 0', background: line.changed ? 'rgba(34,197,94,0.06)' : 'transparent', borderLeft: line.changed ? '2px solid rgba(34,197,94,0.35)' : '2px solid transparent' }}>
              <span style={{ width: 28, textAlign: 'right', paddingRight: 10, fontSize: 10, color: T3, fontFamily: 'monospace', flexShrink: 0 }}>{line.n}</span>
              <span style={{ fontSize: 11, color: line.changed ? '#86efac' : 'rgba(255,255,255,0.4)', fontFamily: 'monospace', whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.after}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MONITOR MOCK ─────────────────────────────────────────────────────────────
function MonitorMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontFamily: F }}>
      {/* Pulse card */}
      <div style={{ background: '#1A1A1C', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T1 }}>Weekly Pulse for Jun 18</span>
          <div style={{ flex: 1 }} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.09)`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', color: T2, fontSize: 11 }}>
            ▶ Listen
          </button>
          <span style={{ fontSize: 10, color: T3 }}>1.0× ⋮</span>
        </div>
        <div style={{ padding: '8px 14px 4px', fontSize: 10, color: T3, fontWeight: 500, letterSpacing: '0.04em' }}>Projects</div>
        {[
          { title: 'UI refresh', status: 'At risk', statusColor: '#ef4444', by: 'romain', when: '1 day ago',
            bullets: ['iOS implementation is mostly complete, but Android updates are still work in progress', "Risk of timeline slip if remaining design decisions aren't finalized soon"] },
          { title: 'Tokyo launch', status: 'On track', statusColor: '#22c55e', by: 'julian', when: '3 hours ago',
            bullets: ['Localization efforts have been completed', 'Everything else on track for launch in early September'] },
        ].map((p, i) => (
          <div key={i} style={{ padding: '8px 14px 12px', borderTop: `1px solid rgba(255,255,255,0.04)` }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T1, margin: '0 0 4px' }}>{p.title}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.statusColor }} />
              <span style={{ fontSize: 11, color: p.statusColor, fontWeight: 500 }}>{p.status}</span>
              <span style={{ fontSize: 10, color: T3 }}>· By {p.by} · {p.when}</span>
            </div>
            {p.bullets.map((b, bi) => (
              <div key={bi} style={{ display: 'flex', gap: 7, marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: T3, flexShrink: 0, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 12, color: T2, lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Cycle time chart */}
      <div style={{ background: '#1A1A1C', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>Cycle time by agent</span>
        </div>
        <div style={{ padding: '14px', height: 260, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
          {/* Y axis */}
          <div style={{ position: 'absolute', left: 14, top: 14, bottom: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 4 }}>
            {[50,40,30,20,10,0].map(v => <span key={v} style={{ fontSize: 9, color: T3 }}>{v}</span>)}
          </div>
          {/* Scatter dots */}
          <div style={{ flex: 1, marginLeft: 20, position: 'relative', height: '100%' }}>
            {[
              { x: 10, y: 80, c: '#5A5AF0', s: 5 }, { x: 15, y: 60, c: '#5A5AF0', s: 4 }, { x: 20, y: 40, c: '#5A5AF0', s: 6 },
              { x: 30, y: 70, c: '#E87C3E', s: 5 }, { x: 35, y: 50, c: '#E87C3E', s: 4 }, { x: 40, y: 85, c: '#E87C3E', s: 7 },
              { x: 50, y: 30, c: '#22c55e', s: 5 }, { x: 55, y: 55, c: '#22c55e', s: 4 }, { x: 60, y: 45, c: '#22c55e', s: 6 },
              { x: 70, y: 65, c: '#7C6AF4', s: 5 }, { x: 75, y: 35, c: '#7C6AF4', s: 4 }, { x: 80, y: 75, c: '#7C6AF4', s: 6 },
              { x: 12, y: 20, c: '#5A5AF0', s: 4 }, { x: 22, y: 90, c: '#E87C3E', s: 5 }, { x: 45, y: 25, c: '#22c55e', s: 4 },
              { x: 62, y: 88, c: '#7C6AF4', s: 5 }, { x: 68, y: 15, c: '#5A5AF0', s: 4 }, { x: 82, y: 42, c: '#E87C3E', s: 5 },
              { x: 25, y: 48, c: '#22c55e', s: 4 }, { x: 52, y: 72, c: '#7C6AF4', s: 5 }, { x: 78, y: 28, c: '#5A5AF0', s: 4 },
            ].map((d, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${d.x}%`, bottom: `${d.y}%`,
                width: d.s, height: d.s, borderRadius: '50%', background: d.c, opacity: 0.75,
                transform: 'translate(-50%, 50%)',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CHANGELOG ────────────────────────────────────────────────────────────────
function Changelog() {
  const posts = [
    { dot: '#ef4444', title: 'Coding sessions in Linear', desc: 'Earlier this year, we launched Linear Agent, giving teams a new way to pla...', date: 'Jun 10, 2026' },
    { dot: '#555', title: 'Team documents', desc: "Important team context doesn't always belong in a specific issue, project, o...", date: 'Jun 3, 2026' },
    { dot: '#555', title: 'Linear Diffs', desc: 'Agents generate large volumes of code, but individuals are still...', date: 'May 27, 2026' },
    { dot: '#555', title: 'Project Slack channels', desc: 'Project teams often use a Slack channel to discuss and share feedba...', date: 'May 21, 2026' },
  ];
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '100px 120px', fontFamily: F }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, color: T1, letterSpacing: '-0.04em', margin: '0 0 64px' }}>Changelog</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
        {posts.map((p, i) => (
          <div key={i}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.dot, marginBottom: 14 }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: T1, margin: '0 0 7px', letterSpacing: '-0.01em' }}>{p.title}</h3>
            <p style={{ fontSize: 12, color: T2, lineHeight: 1.65, margin: '0 0 10px' }}>{p.desc}</p>
            <span style={{ fontSize: 11, color: T3 }}>{p.date}</span>
          </div>
        ))}
      </div>
      <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 36, fontSize: 13, color: T2, textDecoration: 'none' }}>View all →</a>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section style={{ background: BG, padding: '0 120px 80px', fontFamily: F }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ background: '#E2E2F4', padding: '44px', borderRadius: '10px 0 0 10px', position: 'relative', overflow: 'hidden', minHeight: 300 }}>
          {/* Watermark */}
          <div style={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.07 }}>
            <svg width="200" height="200" viewBox="0 0 18 18" fill="none"><path d="M9 0C4.029 0 0 4.029 0 9C0 13.971 4.029 18 9 18C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="#1a1a3a"/></svg>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3, letterSpacing: '-0.03em', margin: '0 0 auto' }}>
            "You'll probably build a better product, just because of the craft that{' '}
            <span style={{ color: '#5A5AF0' }}>using Linear infuses on your brain.</span>"
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, color: '#E2E2F4' }}>⊛</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Gabriel Peal</p>
              <p style={{ fontSize: 12, color: 'rgba(26,26,46,0.55)', margin: 0 }}>Staff Software Engineer, OpenAI</p>
            </div>
          </div>
        </div>
        <div style={{ background: '#E2F060', padding: '44px', borderRadius: '0 10px 10px 0', position: 'relative', overflow: 'hidden', minHeight: 300 }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#111', lineHeight: 1.3, letterSpacing: '-0.03em', margin: '0 0 auto' }}>
            "Our speed is intense and Linear helps us be action biased."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, color: '#E2F060' }}>↗</span>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>Nik Koblov</p>
              <p style={{ fontSize: 12, color: 'rgba(17,17,17,0.55)', margin: 0 }}>Head of Engineering, Ramp</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
        <p style={{ fontSize: 13, color: T2, margin: 0 }}>
          Linear powers over <strong style={{ color: T1 }}>33,000</strong> product teams. From ambitious startups to major enterprises.
        </p>
        <a href="#" style={{ fontSize: 13, color: T2, textDecoration: 'none' }}>Customer stories →</a>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCta({ onSignup }) {
  return (
    <section style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '140px 120px', textAlign: 'center', fontFamily: F }}>
      <h2 style={{ fontSize: 'clamp(3rem,6.5vw,6rem)', fontWeight: 700, color: T1, letterSpacing: '-0.05em', lineHeight: 1.0, margin: '0 0 36px' }}>
        Built for the future.<br />Available today.
      </h2>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={onSignup} style={{ fontFamily: F, fontSize: 14, fontWeight: 500, color: '#000', background: T1, border: 'none', borderRadius: 7, padding: '10px 24px', cursor: 'pointer' }}>Get started</button>
        <button style={{ fontFamily: F, fontSize: 14, fontWeight: 500, color: T2, background: 'transparent', border: `1px solid rgba(255,255,255,0.14)`, borderRadius: 7, padding: '10px 24px', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = T2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}>
          Contact sales
        </button>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: 'Product', links: ['Intake','Plan','Build','Diffs','Monitor','Pricing','Security'] },
    { title: 'Features', links: ['Asks','Agents','Coding Sessions','Customer Requests','Insights','Mobile','Integrations','Changelog'] },
    { title: 'Company', links: ['About','Customers','Careers','Blog','Method','Quality','Brand'] },
    { title: 'Resources', links: ['Switch','Download','Documentation','Developers','Status','Enterprise','Startups'] },
    { title: 'Connect', links: ['Contact us','Community','X (Twitter)','GitHub','YouTube'] },
  ];
  return (
    <footer style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: '56px 120px 36px', fontFamily: F }}>
      <div style={{ display: 'grid', gridTemplateColumns: '72px repeat(5,1fr)', gap: 28, marginBottom: 44 }}>
        <div style={{ paddingTop: 2 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M0.705 14.443L3.557 17.295C3.837 17.575 4.258 17.638 4.607 17.435L0.565 13.393C0.362 13.742 0.425 14.163 0.705 14.443Z" fill="rgba(255,255,255,0.45)"/>
            <path d="M0 11.338V12.106L5.894 18H6.662L0 11.338Z" fill="rgba(255,255,255,0.45)"/>
            <path d="M9 0C4.029 0 0 4.029 0 9V10.272L7.728 18H9C13.971 18 18 13.971 18 9C18 4.029 13.971 0 9 0Z" fill="rgba(255,255,255,0.45)"/>
          </svg>
        </div>
        {cols.map((col, i) => (
          <div key={i}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: '0 0 14px' }}>{col.title}</p>
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
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
  }, [navigate]);

  if (!ready) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.05)', borderTopColor: 'rgba(255,255,255,0.4)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
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

      <FeatureSection
        title={<>Make product operations<br/>self-driving</>}
        desc="Turn conversations and customer feedback into actionable issues that are routed, labeled, and prioritized for the right team."
        num="1.0" linkLabel="Intake"
        subLinks={[
          { num: '1.1', label: 'Linear Agent' }, { num: '1.2', label: 'Triage' },
          { num: '1.3', label: 'Customer Requests' }, { num: '1.4', label: 'Linear Asks' },
        ]}
      >
        <IntakeMock />
      </FeatureSection>

      <FeatureSection
        title={<>Define the product<br/>direction</>}
        desc="Plan and navigate from idea to launch. Align your team with product initiatives, strategic roadmaps, and clear, up-to-date PRDs."
        num="2.0" linkLabel="Plan"
        subLinks={[
          { num: '2.1', label: 'Projects' }, { num: '2.2', label: 'Documents' },
          { num: '2.3', label: 'Initiatives' }, { num: '2.4', label: 'Visual planning' },
        ]}
      >
        <PlanMock />
      </FeatureSection>

      <FeatureSection
        title={<>Move work forward across<br/>teams and agents</>}
        desc="Build and deploy AI agents that work alongside your team. Work on complex tasks together or delegate entire issues end-to-end."
        num="3.0" linkLabel="Build"
        subLinks={[
          { num: '3.1', label: 'Issues' }, { num: '3.2', label: 'Agents' },
          { num: '3.3', label: 'Linear MCP' }, { num: '3.4', label: 'Git automations' },
          { num: '3.5', label: 'Cycles' },
        ]}
      >
        <BuildMock />
      </FeatureSection>

      <FeatureSection
        title={<>Review PRs and agent<br/>output</>}
        desc="Understand code changes at a glance with structural diffs for human and agent output. Review, discuss, and merge — all within Linear."
        num="4.0" linkLabel="Diffs"
      >
        <DiffMock />
      </FeatureSection>

      <FeatureSection
        title={<>Understand progress<br/>at scale</>}
        desc="Take the guesswork out of product development with project updates, analytics, and dashboards that surface what needs your attention."
        num="5.0" linkLabel="Monitor"
        subLinks={[
          { num: '5.1', label: 'Pulse' }, { num: '5.2', label: 'Insights' },
          { num: '5.3', label: 'Dashboards' },
        ]}
      >
        <MonitorMock />
      </FeatureSection>

      <LandingPricingLight onSignup={onSignup} />
      <Changelog />
      <Testimonials />
      <FinalCta onSignup={onSignup} />
      <Footer />
    </div>
  );
}