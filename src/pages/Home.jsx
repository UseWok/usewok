import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import {
  Home as HomeIcon, Search, Compass, Share2,
  LayoutGrid, Star, User, Users, Inbox,
  Plus, ChevronDown, Mic, ArrowUp,
  ArrowRight, ChevronRight,
} from 'lucide-react';
import TensorsOnboarding, { shouldShowTensorsOnboarding } from '../components/onboarding/TensorsOnboarding';
import UserOnboarding, { shouldShowUserOnboarding } from '../components/onboarding/UserOnboarding';

const PENDING_KEY = 'stensor_pending_query';

// ── Sidebar icon row ──
function SideNavIcon({ icon: Icon, active, label, onClick, showLabel }) {
  return (
    <button onClick={onClick}
      title={!showLabel ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        width: '100%',
        padding: '7px 10px',
        gap: 10,
        borderRadius: 8,
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        border: 'none', cursor: 'pointer', color: active ? '#fff' : '#888',
        textAlign: 'left', fontSize: 13, fontWeight: active ? 600 : 400,
        whiteSpace: 'nowrap',
        transition: 'background 100ms, color 100ms',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#ccc'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; } }}
    >
      {/* Icon — always at same X position */}
      <Icon size={16} style={{ flexShrink: 0 }} />
      {/* Label — toggled instantly, no animation */}
      {showLabel && <span style={{ display: 'block', fontSize: 13, lineHeight: 1.2 }}>{label}</span>}
    </button>
  );
}

// ── Sidebar ──
function Sidebar({ open, onToggle, user, navigate }) {
  const ICON_COL_WIDTH = 48; // px — always visible
  const LABEL_WIDTH = 152;   // px — added when open

  const sidebarWidth = open ? ICON_COL_WIDTH + LABEL_WIDTH : ICON_COL_WIDTH;

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A';

  return (
    <div style={{
      width: sidebarWidth,
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px 6px',
      gap: 0,
      overflow: 'hidden',
      // No transition on width — icons stay anchored
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* Logo + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 4px 10px', gap: 6, marginBottom: 0 }}>
        {/* Lovable-style multicolor logo */}
        <button onClick={onToggle} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', flexShrink: 0, background: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="4" fill="#FF4A17"/>
            <circle cx="16" cy="8" r="4" fill="#7B4FE0"/>
            <circle cx="8" cy="16" r="4" fill="#3B8BEB"/>
            <circle cx="16" cy="16" r="4" fill="#4ade80"/>
          </svg>
        </button>
        {open && <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden' }}>WOK</span>}
      </div>

      {/* Workspace selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 10px', cursor: 'pointer', borderRadius: 8, marginBottom: 4 }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ width: 24, height: 24, borderRadius: 6, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {userInitial}
        </div>
        {open && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.full_name?.split(' ')[0] || 'Workspace'}'s WOK
            </span>
            <ChevronDown size={12} color="#888" style={{ flexShrink: 0 }} />
          </div>
        )}
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '2px 0 8px' }} />

      {/* Primary nav */}
      <SideNavIcon icon={HomeIcon} label="Home" active showLabel={open} onClick={() => navigate('/app')} />
      <SideNavIcon icon={Search} label="Search" showLabel={open} onClick={() => {}} />
      <SideNavIcon icon={Compass} label="Resources" showLabel={open} onClick={() => {}} />
      <SideNavIcon icon={Share2} label="Connectors" showLabel={open} onClick={() => {}} />

      {/* Projects label */}
      {open && <p style={{ fontSize: 11, color: '#555', padding: '10px 10px 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Projects</p>}
      {!open && <div style={{ height: 10 }} />}

      <SideNavIcon icon={LayoutGrid} label="All projects" showLabel={open} onClick={() => navigate('/projects')} />
      <SideNavIcon icon={Star} label="Starred" showLabel={open} onClick={() => {}} />
      <SideNavIcon icon={User} label="Created by me" showLabel={open} onClick={() => {}} />
      <SideNavIcon icon={Users} label="Shared with me" showLabel={open} onClick={() => {}} />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom: avatar + inbox */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 4 }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {userInitial}
          </div>
          {open && <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'user@wok.app'}</span>}
        </div>

        {/* Inbox with red badge */}
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <SideNavIcon icon={Inbox} label="Inbox" showLabel={open} onClick={() => {}} />
          <span style={{ position: 'absolute', top: 4, left: 24, width: 8, height: 8, background: '#E8184A', borderRadius: '50%', border: '1.5px solid #121212', display: 'block' }} />
        </div>
      </div>
    </div>
  );
}

// ── Project card mock ──
function ProjectCard({ title, color }) {
  return (
    <div style={{ flexShrink: 0, width: 200, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#1A1A1A', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.18)'}
      onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'}>
      <div style={{ height: 100, background: color, position: 'relative', overflow: 'hidden' }}>
        {/* Mini fake UI inside card */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 4, padding: 10 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 3, width: '60%' }} />
          <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 3, width: '80%' }} />
          <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 3, width: '45%' }} />
        </div>
      </div>
      <div style={{ padding: '8px 10px 10px' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
        <p style={{ fontSize: 11, color: '#555', margin: '2px 0 0' }}>Edited just now</p>
      </div>
    </div>
  );
}

const MOCK_PROJECTS = [
  { title: 'Grow Your SaaS', color: 'linear-gradient(135deg,#1e3a8a,#3b82f6)' },
  { title: 'ai-site-creator-best', color: 'linear-gradient(135deg,#1a1a1a,#333)' },
  { title: 'Monochrome Mart', color: 'linear-gradient(135deg,#374151,#6b7280)' },
  { title: 'Black & White Boutique', color: 'linear-gradient(135deg,#111,#1f2937)' },
  { title: 'Landing Pro', color: 'linear-gradient(135deg,#7b1fa2,#e91e63)' },
];

export default function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projectTab, setProjectTab] = useState('My projects');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUserOnboarding, setShowUserOnboarding] = useState(false);

  const handleSend = (q) => {
    const query = q || input;
    if (!query.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const quizResults = JSON.parse(localStorage.getItem('stensor_quiz_results') || 'null');
    if (quizResults) {
      base44.auth.me().then((u) => {
        if (u && !u.quiz_answers) base44.auth.updateMe({ quiz_answers: quizResults });
        localStorage.removeItem('stensor_quiz_results');
      }).catch(() => localStorage.removeItem('stensor_quiz_results'));
    }
    const pending = localStorage.getItem(PENDING_KEY);
    if (pending) { localStorage.removeItem(PENDING_KEY); navigate(`/chat?q=${encodeURIComponent(pending)}`); return; }
    base44.auth.me().then(setUser).catch(() => {});
    if (shouldShowUserOnboarding()) setTimeout(() => setShowUserOnboarding(true), 800);
    else if (shouldShowTensorsOnboarding()) setTimeout(() => setShowOnboarding(true), 1200);
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Antoine';

  const TABS = ['My projects', 'Recently viewed', 'Lovable templates'];

  return (
    // ── App Wrapper (black background, fixed, no scaling borders) ──
    <div style={{
      width: '100vw', height: '100vh',
      background: '#121212',
      display: 'flex',
      alignItems: 'stretch',
      padding: '10px 10px 10px 0', // top/right/bottom banding; left = sidebar lives there
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
    }}>
      {showUserOnboarding && <UserOnboarding onClose={() => setShowUserOnboarding(false)} />}
      {showOnboarding && <TensorsOnboarding onClose={() => setShowOnboarding(false)} />}

      {/* ── Sidebar (lives in black band on the left) ── */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(v => !v)} user={user} navigate={navigate} />

      {/* ── Grand Rectangle ── */}
      <div style={{
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minWidth: 0,
        // Mesh gradient background
        background: `
          radial-gradient(ellipse 80% 50% at 100% 10%, rgba(30,80,180,0.85) 0%, transparent 60%),
          radial-gradient(ellipse 60% 60% at 50% 55%, rgba(220,40,180,0.9) 0%, transparent 55%),
          radial-gradient(ellipse 70% 50% at 20% 80%, rgba(255,80,20,0.85) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 80% 90%, rgba(255,120,0,0.6) 0%, transparent 50%),
          #0a0a0f
        `,
      }}>

        {/* ── Center content (fills available space) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 24px', minHeight: 0 }}>

          {/* Connector badge/pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px 6px 8px',
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: 999,
            marginBottom: 24,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}>
            {/* 3 mini connector logos */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[{bg:'#FF4A17'},{bg:'#7B4FE0'},{bg:'#3B8BEB'}].map((c, i) => (
                <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: c.bg, border: '1.5px solid #121212', marginLeft: i > 0 ? -6 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Power your app with connectors</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>→</span>
          </div>

          {/* Main title */}
          <h1 style={{
            fontSize: 'clamp(24px, 3.2vw, 38px)',
            fontWeight: 500,
            color: '#fff',
            textAlign: 'center',
            margin: '0 0 28px',
            letterSpacing: '-0.02em',
            lineHeight: 1.18,
          }}>
            What should we build, {firstName}?
          </h1>

          {/* Chat input bar */}
          <div style={{ width: '100%', maxWidth: 620, position: 'relative' }}>
            <div style={{
              background: 'rgba(30,30,30,0.92)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18,
              backdropFilter: 'blur(12px)',
              overflow: 'hidden',
            }}>
              {/* Top row: placeholder textarea */}
              <div style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 16px 8px' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask Lovable to build a landing page for my..."
                  rows={1}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 14, color: '#fff', resize: 'none', fontFamily: 'inherit',
                    lineHeight: 1.5, minHeight: 20,
                  }}
                  className="placeholder:text-[#666]"
                />
              </div>
              {/* Bottom toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '6px 10px 10px', gap: 6 }}>
                {/* Plus */}
                <button style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  <Plus size={15} />
                </button>

                <div style={{ flex: 1 }} />

                {/* Build button */}
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Build <ChevronDown size={13} />
                </button>

                {/* Mic */}
                <button style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  <Mic size={14} />
                </button>

                {/* Send */}
                <button onClick={() => handleSend()} disabled={!input.trim()}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: input.trim() ? '#F95738' : 'rgba(255,255,255,0.12)', border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}>
                  <ArrowUp size={15} color="#fff" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── My Projects panel (bottom of the gradient rectangle) ── */}
        <div style={{
          background: 'rgba(18,18,18,0.92)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px 14px 0 0',
          padding: '16px 20px 0',
          flexShrink: 0,
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setProjectTab(tab)} style={{
                  padding: '5px 13px', borderRadius: 999, border: projectTab === tab ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  background: projectTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                  fontSize: 13, fontWeight: projectTab === tab ? 600 : 400,
                  color: projectTab === tab ? '#fff' : '#888', cursor: 'pointer', transition: 'all 100ms',
                }}>
                  {tab}
                </button>
              ))}
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#888'}>
              Browse all <ArrowRight size={13} />
            </button>
          </div>

          {/* Project cards scroll */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
            {MOCK_PROJECTS.map(p => (
              <ProjectCard key={p.title} title={p.title} color={p.color} />
            ))}
          </div>
        </div>

      </div>{/* end Grand Rectangle */}

    </div>
  );
}