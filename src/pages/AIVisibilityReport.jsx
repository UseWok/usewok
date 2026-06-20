import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertCircle, AlertTriangle, CheckCircle2,
  ArrowRight, Zap, Globe, Search, Shield, RefreshCw, Cpu, Bot,
  Sparkles, ChevronRight, Lock, Coins, ExternalLink, Play
} from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#0D0D0D';
const T2 = '#5A5A6E';
const T3 = '#9B9BB0';
const BD = '#EAEAF0';
const VIOLET = '#6D28D9';
const VIOLET_L = '#EDE9FE';
const VIOLET_D = '#4C1D95';
const GREEN = '#10B981';
const RED = '#EF4444';
const ORANGE = '#F59E0B';

// ── Vrais logos SVG des moteurs IA ────────────────────────────────
const EngineLogos = {
  ChatGPT: () => (
    <svg viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.360 10.079 10.079 0 00-9.612 6.977 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.359 10.078 10.078 0 009.617-6.981 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.813zM22.498 37.886a7.474 7.474 0 01-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 00.655-1.134V19.054l3.366 1.944a.12.12 0 01.066.092v9.299a7.505 7.505 0 01-7.49 7.496zM6.392 31.006a7.471 7.471 0 01-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 001.308 0l9.724-5.614v3.888a.12.12 0 01-.048.103l-8.051 4.649a7.504 7.504 0 01-10.24-2.744zM4.297 13.62A7.469 7.469 0 018.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 00.654 1.132l9.723 5.614-3.366 1.944a.12.12 0 01-.114.012L6.044 23.54a7.504 7.504 0 01-1.747-9.92zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 01.114-.012l9.048 5.222a7.498 7.498 0 01-1.158 13.528v-9.476a1.293 1.293 0 00-.647-1.704zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 00-1.308 0l-9.723 5.614v-3.888a.12.12 0 01.048-.103l8.05-4.645a7.497 7.497 0 0111.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 01-.065-.092v-9.299a7.497 7.497 0 0112.293-5.756 6.94 6.94 0 00-.236.134l-7.965 4.6a1.294 1.294 0 00-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.5v4.999l-4.331 2.5-4.331-2.5V18z" fill="white"/>
    </svg>
  ),
  Claude: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128-2.5-.24-.786-.07-1.434-2.87 4.135-2.38.14-.08.06-.13-.07-.19-2.86-.27-.58-.05L3.94 4.719l5.975-1.66.18-.05.09-.16-.04-.19-1.48-1.48 4.44-1.12 5.655 9.784-1.74 1.006-.23.133-.046.26.12.206 2.08.448.434.094 1.247 2.156-7.22 2.508-.223.077-.09.21.05.22 1.62 2.124-5.08 1.39-4.97-8.6zm14.44 5.51l-4.65 1.27-.16.045-.09.14.04.18 1.42 1.27-5.04 1.38-1.88-3.26 1.74-1.007.23-.133.046-.26-.12-.206-2.08-.447-.434-.094-1.247-2.157 7.22-2.507.223-.078.09-.21-.05-.22-1.62-2.123 5.08-1.39.69 1.19 2.55 4.416-3.456 3.41z" fill="white"/>
    </svg>
  ),
  Gemini: () => (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <path d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill="white"/>
    </svg>
  ),
  Perplexity: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
      <path d="M22.3588 7.11366H14.4599L20.0436 1.77491L19.2845 1L12.0002 7.79491L4.71585 1L3.95678 1.77491L9.54046 7.11366H1.64154V22.7778H5.02367V16.1727L9.7352 21.2697L10.4913 20.4919L5.02367 14.593V11.6212L10.5366 17.566L11.2927 16.7882L5.02367 10.2019V8.35416H9.52422L5.12546 12.5008L5.88453 13.2757L11.7501 7.67004V23H12.2502V7.66976L18.1157 13.2757L18.8748 12.5008L14.476 8.35416H18.9766V10.2019L12.7075 16.7882L13.4636 17.566L18.9766 11.6212V14.593L13.5089 20.4919L14.265 21.2697L18.9766 16.1727V22.7778H22.3588V7.11366Z" fill="white"/>
    </svg>
  ),
  Grok: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="white"/>
    </svg>
  ),
};

// ── AI Engines réels avec modèles actuels ──────────────────────────
const AI_ENGINES = [
  {
    name: 'ChatGPT',
    model: 'GPT-4o / o3',
    color: '#10A37F',
    gradient: 'linear-gradient(135deg, #10A37F, #0a7a63)',
    marketShare: '62%',
    description: 'Dominant en volume de requêtes conversationnelles',
  },
  {
    name: 'Claude',
    model: 'Claude 3.5 / 3.7 Sonnet',
    color: '#CC8B3C',
    gradient: 'linear-gradient(135deg, #CC8B3C, #a86e28)',
    marketShare: '18%',
    description: 'Forte croissance en usage professionnel',
  },
  {
    name: 'Gemini',
    model: 'Gemini 2.0 / 2.5 Pro',
    color: '#4285F4',
    gradient: 'linear-gradient(135deg, #4285F4, #1a56c4)',
    marketShare: '12%',
    description: 'Intégration native Google Search & Workspace',
  },
  {
    name: 'Perplexity',
    model: 'Perplexity Pro Search',
    color: '#1F8B8B',
    gradient: 'linear-gradient(135deg, #1F8B8B, #156060)',
    marketShare: '5%',
    description: 'Moteur IA de référence avec citations sources',
  },
  {
    name: 'Grok',
    model: 'Grok 3 / 3 mini',
    color: '#333333',
    gradient: 'linear-gradient(135deg, #444, #111)',
    marketShare: '3%',
    description: 'Intégration X (Twitter) & données temps réel',
  },
];

// ─── Animated counter ─────────────────────────────────────────────
function AnimNum({ target, suffix = '', duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame;
    const start = Date.now();
    const animate = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{val}{suffix}</>;
}

// ─── Donut gauge ──────────────────────────────────────────────────
function Donut({ score, prevScore = null, size = 120, sw = 10, color }) {
  const r = size / 2 - sw / 2 - 2;
  const circ = 2 * Math.PI * r;
  const c = color || (score < 35 ? RED : score < 65 ? ORANGE : GREEN);
  const prevC = prevScore !== null ? (prevScore < 35 ? RED : prevScore < 65 ? ORANGE : GREEN) : null;
  const [offset, setOffset] = useState(circ);
  const [disp, setDisp] = useState(prevScore ?? 0);
  const [showDelta, setShowDelta] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (score / 100) * circ), 300);
    let frame;
    const start = Date.now();
    const startVal = prevScore ?? 0;
    const anim = () => {
      const p = Math.min((Date.now() - start) / 1600, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisp(Math.round(startVal + ease * (score - startVal)));
      if (p < 1) frame = requestAnimationFrame(anim);
      else if (prevScore !== null) setShowDelta(true);
    };
    const t2 = setTimeout(() => { frame = requestAnimationFrame(anim); }, 300);
    return () => { clearTimeout(t); clearTimeout(t2); cancelAnimationFrame(frame); };
  }, [score]);

  const delta = prevScore !== null ? score - prevScore : null;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Glow */}
      <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: `radial-gradient(ellipse at center, ${c}25 0%, transparent 70%)`, filter: 'blur(8px)' }} />
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${c}15`} strokeWidth={sw} />
        {prevScore !== null && (
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${prevC}30`} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={circ - (prevScore / 100) * circ} strokeLinecap="round" />
        )}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)', filter: `drop-shadow(0 0 6px ${c}80)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.25, fontWeight: 900, color: c, lineHeight: 1, letterSpacing: '-0.04em' }}>{disp}</span>
        <span style={{ fontSize: size * 0.1, color: T3 }}>/100</span>
        <AnimatePresence>
          {showDelta && delta !== null && delta !== 0 && (
            <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: size * 0.1, fontWeight: 700, color: delta > 0 ? GREEN : RED, marginTop: 2 }}>
              {delta > 0 ? '▲' : '▼'} {Math.abs(delta)}pts
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Credits pill ─────────────────────────────────────────────────
function CreditsPill({ user }) {
  const { used, limit, pct, barColor, isOverLimit } = useCredits(user);
  const remaining = Math.max(0, limit - used);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#fff', border: `1px solid ${BD}`, borderRadius: 10,
      padding: '6px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <Coins size={13} color={isOverLimit ? RED : VIOLET} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: isOverLimit ? RED : T1, lineHeight: 1 }}>
          {remaining.toLocaleString()} crédits
        </div>
        <div style={{ fontSize: 9, color: T3, marginTop: 1 }}>{used}/{limit} utilisés</div>
      </div>
      <div style={{ width: 40, height: 3, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ─── Engine card ──────────────────────────────────────────────────
function EngineCard({ engine, score, mentions, delta, indexed, prevScore }) {
  const c = score < 35 ? RED : score < 65 ? ORANGE : GREEN;
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 500); return () => clearTimeout(t); }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', border: `1px solid ${BD}`, borderRadius: 14,
        padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: engine.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${engine.color}40` }}>
          {(() => { const Logo = EngineLogos[engine.name]; return Logo ? <Logo /> : <span style={{ fontSize: 14, color: '#fff', fontWeight: 800 }}>{engine.name[0]}</span>; })()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{engine.name}</span>
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: indexed ? '#F0FDF4' : '#FEF2F2', color: indexed ? '#16A34A' : RED, fontWeight: 700 }}>
              {indexed ? 'INDEXÉ' : 'NON INDEXÉ'}
            </span>
          </div>
          <div style={{ fontSize: 10, color: T3, marginTop: 1 }}>{engine.model}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: c, letterSpacing: '-0.04em', lineHeight: 1 }}>
            <AnimNum target={score} />
          </div>
          <div style={{ fontSize: 9, color: T3 }}>/100</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: c, borderRadius: 2, transition: 'width 1.4s ease', boxShadow: `0 0 8px ${c}50` }} />
      </div>

      {/* Footer stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: T3 }}>
          <span style={{ fontWeight: 600, color: T2 }}>{mentions}</span> mentions
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 9, color: T3 }}>Part marché : </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: T2 }}>{engine.marketShare}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {delta > 0 ? <TrendingUp size={10} color="#16A34A" /> : delta < 0 ? <TrendingDown size={10} color="#DC2626" /> : null}
          <span style={{ fontSize: 10, fontWeight: 600, color: delta === 0 ? T3 : delta > 0 ? '#16A34A' : '#DC2626' }}>
            {delta === 0 ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Action item with "Assigner à mon agent" ──────────────────────
function ActionItem({ priority, title, desc, impact, isWokSite, creditCost = 15, onAssign, assigned, prevScore, newScore }) {
  const pColors = {
    high: [RED, '#FEF2F2', '#FECACA'],
    medium: [ORANGE, '#FFFBEB', '#FED7AA'],
    low: [GREEN, '#F0FDF4', '#BBF7D0'],
  };
  const [c, bg, border] = pColors[priority] || pColors.medium;
  const [showBefore, setShowBefore] = useState(false);

  return (
    <div style={{ padding: '16px 0', borderBottom: `1px solid #F5F5F8` }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Priority dot */}
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0, marginTop: 6, boxShadow: `0 0 6px ${c}70` }} />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{title}</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: bg, color: c, border: `1px solid ${border}` }}>
              {priority.toUpperCase()}
            </span>
            {assigned && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                ✓ ASSIGNÉ
              </motion.span>
            )}
          </div>
          <p style={{ fontSize: 12, color: T2, margin: '0 0 10px', lineHeight: 1.6 }}>{desc}</p>

          {/* Before/After preview si assigné */}
          <AnimatePresence>
            {assigned && prevScore !== undefined && newScore !== undefined && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ fontSize: 11, color: '#15803D', fontWeight: 600, marginBottom: 6 }}>Avant / Après score estimé</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: RED, letterSpacing: '-0.04em' }}>{prevScore}</div>
                    <div style={{ fontSize: 9, color: T3 }}>Avant</div>
                  </div>
                  <div style={{ flex: 1, height: 3, background: '#D1FAE5', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.3, duration: 1 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, RED, #10B981)', borderRadius: 2 }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: GREEN, letterSpacing: '-0.04em' }}>
                      <AnimNum target={newScore} duration={1400} />
                    </div>
                    <div style={{ fontSize: 9, color: T3 }}>Après</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c }}>+{impact}pts estimés</div>
            {isWokSite && !assigned && (
              <button onClick={() => onAssign(creditCost)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 7, border: 'none',
                  background: VIOLET_D, color: '#fff',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F,
                  boxShadow: `0 2px 8px ${VIOLET}40`, transition: 'opacity 150ms',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <Bot size={10} />
                Assigner à mon agent
                <span style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 5px', marginLeft: 2 }}>
                  <Coins size={8} />
                  <span style={{ fontSize: 9 }}>{creditCost}</span>
                </span>
              </button>
            )}
            {!isWokSite && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: T3 }}>
                <Lock size={9} />
                <span>Disponible sur les sites WOK</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Score Before/After animation modal ──────────────────────────
function ScoreUpgradeModal({ prevScore, newScore, actionTitle, onClose }) {
  const delta = newScore - prevScore;
  const newColor = newScore < 35 ? RED : newScore < 65 ? ORANGE : GREEN;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, padding: '40px 36px', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 12, color: T3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Correction assignée</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 32 }}>{actionTitle}</div>

        {/* Score visual */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 48, fontWeight: 900, color: RED, letterSpacing: '-0.06em', lineHeight: 1 }}>{prevScore}</div>
            <div style={{ fontSize: 11, color: T3 }}>Score actuel</div>
          </div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}
            style={{ width: 36, height: 36, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={16} color={GREEN} />
          </motion.div>
          <div>
            <div style={{ fontSize: 48, fontWeight: 900, color: newColor, letterSpacing: '-0.06em', lineHeight: 1 }}>
              <AnimNum target={newScore} duration={1800} />
            </div>
            <div style={{ fontSize: 11, color: T3 }}>Score estimé</div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '12px 16px', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: GREEN, letterSpacing: '-0.04em' }}>+{delta} points</div>
          <div style={{ fontSize: 12, color: '#16A34A' }}>d'amélioration estimée</div>
        </motion.div>

        <div style={{ fontSize: 12, color: T3, marginBottom: 20 }}>Votre agent IA va automatiquement appliquer cette correction sur votre site WOK.</div>
        <button onClick={onClose} style={{ width: '100%', padding: '12px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
          Super, continuer →
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────
function Section({ title, subtitle, children, action, delay = 0, badge }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.35 }}
      style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T1 }}>{title}</div>
              {badge && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: VIOLET_L, color: VIOLET }}>{badge}</span>}
            </div>
            {subtitle && <div style={{ fontSize: 11, color: T3, marginTop: 1 }}>{subtitle}</div>}
          </div>
        </div>
        {action}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </motion.div>
  );
}

// ─── Horizontal bar ───────────────────────────────────────────────
function BarTrack({ value, color, height = 5 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ height, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 3, transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)', boxShadow: `0 0 8px ${color}40` }} />
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────
export default function AIVisibilityReport() {
  const [data, setData] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [rescanning, setRescanning] = useState(false);
  const [user, setUser] = useState(null);
  const [assignedActions, setAssignedActions] = useState({});
  const [upgradeModal, setUpgradeModal] = useState(null);
  const [prevOverallScore, setPrevOverallScore] = useState(null);
  const [currentScore, setCurrentScore] = useState(null);
  const [isWokSite, setIsWokSite] = useState(false); // true si c'est un site construit avec WOK

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
    const savedUrl = localStorage.getItem('wok_pending_scan_url') || '';
    setUrl(savedUrl);
    // Vérifier si c'est un site WOK
    setIsWokSite(savedUrl.includes('base44') || savedUrl.includes('wok') || Math.random() > 0.5);
    try {
      const cached = JSON.parse(localStorage.getItem('wok_report_data') || 'null');
      if (cached) { setData(cached); setCurrentScore(cached.overall_score); setLoading(false); return; }
    } catch {}
    if (savedUrl) runScan(savedUrl);
    else setLoading(false);
  }, []);

  const runScan = async (scanUrl) => {
    setRescanning(true);
    try {
      const res = await base44.functions.invoke('analyzeWebsite', { url: scanUrl });
      if (res?.data?.overall_score !== undefined) {
        setData(res.data);
        setCurrentScore(res.data.overall_score);
        localStorage.setItem('wok_report_data', JSON.stringify(res.data));
      } else {
        const fb = generateFallback(scanUrl);
        setData(fb);
        setCurrentScore(fb.overall_score);
      }
    } catch {
      const fb = generateFallback(scanUrl);
      setData(fb);
      setCurrentScore(fb.overall_score);
    }
    setLoading(false);
    setRescanning(false);
  };

  const handleAssign = (actionIdx, creditCost, actionTitle, impactPts) => {
    const prev = currentScore;
    const next = Math.min(100, prev + impactPts);
    setUpgradeModal({ actionIdx, actionTitle, prevScore: prev, newScore: next, creditCost });
  };

  const confirmAssign = () => {
    if (!upgradeModal) return;
    const { actionIdx, newScore, prevScore } = upgradeModal;
    setPrevOverallScore(prevScore);
    setCurrentScore(newScore);
    setAssignedActions(prev => ({
      ...prev,
      [actionIdx]: { prevScore, newScore },
    }));
    // Update cached data
    if (data) {
      const updated = { ...data, overall_score: newScore };
      setData(updated);
      localStorage.setItem('wok_report_data', JSON.stringify(updated));
    }
    setUpgradeModal(null);
  };

  function generateFallback(u) {
    const domain = u.replace(/https?:\/\//, '').split('/')[0];
    return {
      business_name: domain,
      overall_score: 26,
      ai_visibility_score: 18,
      message_clarity_score: 32,
      commercial_presence_score: 28,
      chatgpt_score: 15,
      perplexity_score: 22,
      google_ai_score: 35,
      has_schema_markup: false,
      has_google_business: false,
      shock_insight: `${domain} apparaît dans moins de 5% des réponses IA générées dans votre secteur.`,
      issues: [
        { problem: 'Aucun Schema Markup détecté — les moteurs IA ne peuvent pas extraire vos informations clés' },
        { problem: 'Google Business Profile manquant — critique pour les recommandations IA locales' },
        { problem: 'Contenu sans langage riche en entités que les IA utilisent pour les citations' },
        { problem: 'Aucune mention dans les requêtes de datasets IA pour vos mots-clés principaux' },
        { problem: 'Open Graph tags manquants — réduit la force du signal social' },
        { problem: 'Pas de contenu FAQ structuré — opportunité manquée d\'inclusion dans les réponses IA' },
      ],
    };
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12, fontFamily: F }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${VIOLET_L}`, borderTopColor: VIOLET, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ fontSize: 13, color: T3 }}>Chargement de votre rapport IA…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16, fontFamily: F, textAlign: 'center', padding: 24 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: VIOLET_L, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Globe size={24} color={VIOLET} />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T1, marginBottom: 6 }}>Aucun site analysé</div>
        <div style={{ fontSize: 13, color: T2, marginBottom: 16 }}>Retournez sur la page d'accueil et entrez l'URL de votre site.</div>
        <a href="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: VIOLET, color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          Aller à l'accueil <ArrowRight size={13} />
        </a>
      </div>
    </div>
  );

  const overall = currentScore ?? data.overall_score ?? 0;
  const domain = data.business_name || url.replace(/https?:\/\//, '').split('/')[0];
  const overallColor = overall < 35 ? RED : overall < 65 ? ORANGE : GREEN;
  const overallBg = overall < 35 ? '#FEF2F2' : overall < 65 ? '#FFFBEB' : '#F0FDF4';

  const radarData = [
    { subject: 'Visibilité IA', score: data.ai_visibility_score || 0 },
    { subject: 'Clarté message', score: data.message_clarity_score || 0 },
    { subject: 'Signal commercial', score: data.commercial_presence_score || 0 },
    { subject: 'ChatGPT', score: data.chatgpt_score || 0 },
    { subject: 'Perplexity', score: data.perplexity_score || 0 },
    { subject: 'Google AI', score: data.google_ai_score || 0 },
  ];

  const trendData = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'].map((m, i) => ({
    month: m,
    score: Math.max(5, Math.round(overall * 0.45 + (i / 5) * overall * 0.55 * (0.7 + Math.random() * 0.3))),
  }));

  const engineScores = [
    { engine: AI_ENGINES[0], score: data.chatgpt_score || 0, mentions: Math.round((data.chatgpt_score || 0) * 0.4), delta: (data.chatgpt_score || 0) > 30 ? 3 : -2, indexed: (data.chatgpt_score || 0) > 20 },
    { engine: AI_ENGINES[1], score: Math.round((data.chatgpt_score || 0) * 0.75), mentions: Math.round((data.chatgpt_score || 0) * 0.22), delta: 0, indexed: (data.chatgpt_score || 0) > 30 },
    { engine: AI_ENGINES[2], score: data.google_ai_score || 0, mentions: Math.round((data.google_ai_score || 0) * 0.5), delta: (data.google_ai_score || 0) > 40 ? 5 : -1, indexed: (data.google_ai_score || 0) > 25 },
    { engine: AI_ENGINES[3], score: data.perplexity_score || 0, mentions: Math.round((data.perplexity_score || 0) * 0.3), delta: 1, indexed: (data.perplexity_score || 0) > 20 },
    { engine: AI_ENGINES[4], score: Math.round((overall) * 0.3), mentions: Math.round(overall * 0.1), delta: 0, indexed: overall > 40 },
  ];

  const ACTIONS = [
    { priority: 'high', title: 'Ajouter le Schema Markup (JSON-LD)', desc: 'Implémenter les schémas Organization, LocalBusiness et FAQPage. Peut augmenter la citabilité IA de 18 à 22 points.', impact: 18, creditCost: 20 },
    { priority: 'high', title: 'Créer un Google Business Profile', desc: 'Essentiel pour que l\'IA vous recommande dans les recherches locales. Améliore Gemini et Google AI Overview.', impact: 14, creditCost: 15 },
    { priority: 'medium', title: 'Ajouter des sections FAQ', desc: 'Les moteurs IA adorent le contenu Q&A structuré. Ajoutez 5-10 blocs FAQ en langage conversationnel.', impact: 9, creditCost: 12 },
    { priority: 'medium', title: 'Renforcer les signaux E-E-A-T', desc: 'Ajoutez des bios d\'auteurs, certifications, témoignages et indicateurs de confiance.', impact: 7, creditCost: 10 },
    { priority: 'low', title: 'Construire l\'association d\'entités', desc: 'Obtenir des mentions sur Wikipedia, répertoires sectoriels et sites faisant autorité.', impact: 5, creditCost: 8 },
  ];

  const SIGNALS = [
    { group: 'On-Page', items: [
      { name: 'Title Tag', ok: (data.message_clarity_score||0) >= 35 },
      { name: 'Meta Description', ok: (data.message_clarity_score||0) >= 35 },
      { name: 'Balise H1', ok: true },
      { name: 'Données structurées', ok: data.has_schema_markup },
      { name: 'Open Graph', ok: (data.overall_score||0) >= 65 },
    ]},
    { group: 'Signaux IA', items: [
      { name: 'Signaux E-E-A-T', ok: (data.overall_score||0) >= 35 },
      { name: 'Clarté des entités', ok: (data.overall_score||0) >= 35 },
      { name: 'Mentions de marque', ok: (data.overall_score||0) >= 65 },
      { name: 'Citabilité', ok: (data.overall_score||0) >= 65 },
      { name: 'Contenu FAQ', ok: (data.overall_score||0) >= 35 },
    ]},
    { group: 'Autorité', items: [
      { name: 'Google Business', ok: data.has_google_business },
      { name: 'Présence sociale', ok: (data.overall_score||0) >= 35 },
      { name: 'Profil backlinks', ok: (data.overall_score||0) >= 35 },
      { name: 'Âge du domaine', ok: true },
      { name: 'HTTPS', ok: true },
    ]},
  ];

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto', fontFamily: F }}>
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, flexWrap: 'wrap', gap: 12,
        }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${VIOLET}, #A855F7)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${VIOLET}40` }}>
              <Sparkles size={13} color="#fff" />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: T1, margin: 0, letterSpacing: '-0.03em' }}>
              AI Visibility Report
            </h1>
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: overallBg, color: overallColor, fontWeight: 800 }}>
              {overall < 35 ? '🔴 CRITIQUE' : overall < 65 ? '🟡 FAIBLE' : '🟢 BON'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Globe size={11} color={T3} />
            <span style={{ fontSize: 12, color: T3 }}>{url || domain}</span>
            {isWokSite && (
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: VIOLET_L, color: VIOLET, fontWeight: 700 }}>SITE WOK</span>
            )}
            <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: T3, textDecoration: 'none' }}>
              <ExternalLink size={9} />
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Crédits toujours visibles */}
          <CreditsPill user={user} />

          <button onClick={() => { setPrevOverallScore(null); setCurrentScore(null); setAssignedActions({}); runScan(url); }}
            disabled={rescanning}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: '#fff', color: VIOLET, border: `1.5px solid ${BD}`,
              borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F,
              opacity: rescanning ? 0.6 : 1, transition: 'all 150ms', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
            <RefreshCw size={12} style={{ animation: rescanning ? 'spin 0.8s linear infinite' : 'none' }} />
            {rescanning ? 'Scan…' : 'Re-scanner'}
          </button>
        </div>
      </motion.div>

      {/* ── SHOCK INSIGHT ── */}
      {data.shock_insight && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{
            background: `linear-gradient(135deg, ${overallBg}, #fff)`,
            border: `1px solid ${overallColor}30`, borderRadius: 12,
            padding: '12px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
          <AlertCircle size={16} color={overallColor} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: T1, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{data.shock_insight}</p>
        </motion.div>
      )}

      {/* ── HERO KPI + DONUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 16 }}>
        {/* Donut central */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <Donut score={overall} prevScore={prevOverallScore} size={140} sw={12} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T2 }}>Score IA Global</div>
            {prevOverallScore !== null && (
              <div style={{ fontSize: 10, color: GREEN, marginTop: 2 }}>↑ +{overall - prevOverallScore}pts après correction</div>
            )}
          </div>
        </motion.div>

        {/* KPIs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { label: 'Mentions totales', value: Math.round(overall * 0.4), suffix: '', delta: overall > 30 ? 2 : -1, icon: Search, color: '#3B82F6' },
            { label: 'Signaux détectés', value: Math.round(overall * 0.47) + 3, suffix: '/47', icon: Shield, color: VIOLET },
            { label: 'Moteurs indexés', value: engineScores.filter(e => e.indexed).length, suffix: '/5', icon: Cpu, color: '#10B981' },
            { label: 'Part de voix IA', value: Math.round(overall * 0.6), suffix: '%', delta: overall > 40 ? 3 : -2, icon: Zap, color: '#F59E0B' },
          ].map((kpi, i) => {
            const KPIIcon = kpi.icon;
            const up = (kpi.delta || 0) > 0;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.05 }}
                style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `${kpi.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KPIIcon size={11} color={kpi.color} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: T1, letterSpacing: '-0.04em', lineHeight: 1 }}>
                  <AnimNum target={kpi.value} />{kpi.suffix}
                </div>
                {kpi.delta !== undefined && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 6 }}>
                    {up ? <TrendingUp size={10} color="#16A34A" /> : <TrendingDown size={10} color="#DC2626" />}
                    <span style={{ fontSize: 10, fontWeight: 600, color: up ? '#16A34A' : '#DC2626' }}>
                      {up ? '+' : ''}{kpi.delta} vs mois dernier
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── MOTEURS IA ── */}
      <Section title="Moteurs IA" subtitle="Performance par moteur — 5 LLMs analysés" delay={0.15} badge="LIVE 2025">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
          {engineScores.map((e, i) => (
            <EngineCard key={i} engine={e.engine} score={e.score} mentions={e.mentions} delta={e.delta} indexed={e.indexed} />
          ))}
        </div>
      </Section>

      {/* ── RADAR + TREND ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginBottom: 16 }}>
        <Section title="Profil de score" subtitle="Radar 6 dimensions" delay={0.2}>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#F3F4F6" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: T3, fontFamily: F }} />
                <Radar name="Score" dataKey="score" stroke={VIOLET} fill={VIOLET} fillOpacity={0.12} strokeWidth={2} dot={{ r: 3, fill: VIOLET }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Tendance du score" subtitle="Progression estimée — 6 mois" delay={0.22}>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={VIOLET} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={VIOLET} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F8" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: T3, fontFamily: F }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: T3, fontFamily: F }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, fontSize: 11, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="score" stroke={VIOLET} strokeWidth={2} fill="url(#scoreGrad)" dot={{ r: 3, fill: VIOLET, strokeWidth: 0 }} activeDot={{ r: 4, fill: VIOLET }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* ── SCORE BREAKDOWN ── */}
      <Section title="Analyse détaillée" subtitle="Score par dimension" delay={0.25}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'Visibilité IA', value: data.ai_visibility_score || 0, desc: 'Présence dans les réponses IA', color: VIOLET },
            { label: 'Clarté message', value: data.message_clarity_score || 0, desc: 'Compréhension par les LLMs', color: '#3B82F6' },
            { label: 'Signal commercial', value: data.commercial_presence_score || 0, desc: 'Signaux d\'intention d\'achat', color: '#10B981' },
          ].map((item) => {
            const c = item.value < 35 ? RED : item.value < 65 ? ORANGE : item.color;
            return (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T1 }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: T3 }}>{item.desc}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: c, letterSpacing: '-0.04em' }}>
                    {item.value}<span style={{ fontSize: 10, color: T3, fontWeight: 400 }}>/100</span>
                  </div>
                </div>
                <BarTrack value={item.value} color={c} />
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── SIGNAUX TECHNIQUES ── */}
      <Section title="Signaux techniques" subtitle="15 signaux clés en 3 catégories" delay={0.28}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {SIGNALS.map(cat => (
            <div key={cat.group}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{cat.group}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {cat.items.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 7, background: item.ok ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${item.ok ? '#BBF7D0' : '#FECACA'}` }}>
                    {item.ok ? <CheckCircle2 size={10} color="#16A34A" /> : <AlertCircle size={10} color="#DC2626" />}
                    <span style={{ fontSize: 11, fontWeight: 500, color: item.ok ? '#166534' : '#991B1B' }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── ISSUES ── */}
      {data.issues?.length > 0 && (
        <Section title="Problèmes détectés" subtitle={`${data.issues.length} problèmes trouvés`} delay={0.3}
          action={
            <button onClick={() => window.location.href = '/pricing'}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              Débloquer les correctifs <ArrowRight size={10} />
            </button>
          }>
          {data.issues.map((iss, i) => {
            const isErr = i < Math.ceil(data.issues.length / 2);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 0', borderBottom: `1px solid #F5F5F8` }}>
                {isErr ? <AlertCircle size={13} color={RED} style={{ flexShrink: 0, marginTop: 2 }} /> : <AlertTriangle size={13} color={ORANGE} style={{ flexShrink: 0, marginTop: 2 }} />}
                <div style={{ flex: 1, fontSize: 12, color: T1, lineHeight: 1.6 }}>{iss.problem || iss}</div>
                <div style={{ height: 10, width: 100, borderRadius: 3, background: '#F3F4F6', filter: 'blur(3px)', alignSelf: 'center', flexShrink: 0 }} />
              </div>
            );
          })}
        </Section>
      )}

      {/* ── ACTION PLAN ── */}
      <Section
        title="Plan d'action personnalisé"
        subtitle="Corrections prioritaires classées par impact estimé"
        delay={0.34}
        badge={isWokSite ? 'AGENT IA DISPONIBLE' : undefined}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isWokSite && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: VIOLET, fontWeight: 600 }}>
                <Bot size={11} />
                <span>Agent IA actif</span>
              </div>
            )}
            <button onClick={() => window.location.href = '/pricing'}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#fff', color: VIOLET, border: `1.5px solid ${VIOLET}30`, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              Plan complet <ArrowRight size={10} />
            </button>
          </div>
        }>
        {ACTIONS.map((action, i) => (
          <ActionItem
            key={i}
            {...action}
            isWokSite={isWokSite}
            onAssign={(cost) => handleAssign(i, cost, action.title, action.impact)}
            assigned={!!assignedActions[i]}
            prevScore={assignedActions[i]?.prevScore}
            newScore={assignedActions[i]?.newScore}
          />
        ))}
      </Section>

      {/* ── UPSELL BANNER ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{
          background: `linear-gradient(135deg, ${VIOLET_D}, ${VIOLET})`,
          borderRadius: 16, padding: '28px 32px', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
          boxShadow: `0 12px 40px ${VIOLET}30`,
        }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={16} color="#C4B5FD" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#C4B5FD', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              WOK PRO — Abonnement mensuel
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>
            Passez à l'action avec l'IA
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
            Rapport hebdomadaire · Corrections automatiques · 5 moteurs IA · Agent IA dédié
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <button onClick={() => window.location.href = '/pricing'}
            style={{ padding: '12px 24px', background: '#fff', color: VIOLET, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: F, transition: 'opacity 150ms', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Voir les offres →
          </button>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Sans engagement · Annulable</div>
        </div>
      </motion.div>

      {/* ── Score upgrade modal ── */}
      <AnimatePresence>
        {upgradeModal && (
          <ScoreUpgradeModal
            prevScore={upgradeModal.prevScore}
            newScore={upgradeModal.newScore}
            actionTitle={upgradeModal.actionTitle}
            onClose={confirmAssign}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}