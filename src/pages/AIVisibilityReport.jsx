import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, CheckCircle, XCircle, Link2, ExternalLink,
  ChevronRight, ChevronDown, X, ArrowRight, Zap, Clock, Circle,
  AlertTriangle, Globe, Lock, TrendingUp, Eye, MessageSquare,
  ShoppingBag, BarChart2, Cpu, Shield
} from 'lucide-react';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import { getWokPlanId } from '@/lib/wok-plans';
import UpgradeModal from '@/components/upsell/UpgradeModal';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EBEBEB';
const SURFACE = '#F8F7F5';
const WHITE = '#FFFFFF';
const CORAL = '#F95738';

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ── Stagger card entrance ─────────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated score circle ─────────────────────────────────────────────────────
function ScoreCircle({ value, size = 88, color }) {
  const [displayed, setDisplayed] = useState(0);
  const R = size / 2 - 6;
  const circ = 2 * Math.PI * R;
  const c = color || (value >= 65 ? '#10B981' : value >= 35 ? '#F59E0B' : '#EF4444');

  useEffect(() => {
    let start = null;
    const duration = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(ease * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#EBEBEB" strokeWidth={5} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={R} fill="none" stroke={c} strokeWidth={5}
          strokeLinecap="round"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - value / 100) }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size > 70 ? 26 : 16, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.04em' }}>{displayed}</span>
        <span style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>/100</span>
      </div>
    </div>
  );
}

// ── Animated horizontal bar ───────────────────────────────────────────────────
function HBar({ value, label, delay = 0, icon: Icon, sublabel }) {
  const c = value >= 65 ? '#10B981' : value >= 35 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={11} color={INK3} />}
          <span style={{ fontSize: 12, color: INK2, fontWeight: 500 }}>{label}</span>
          {sublabel && <span style={{ fontSize: 10, color: INK3 }}>· {sublabel}</span>}
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: c }}>{value}</span>
      </div>
      <div style={{ height: 7, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${c}CC, ${c})`, borderRadius: 4 }}
        />
      </div>
    </div>
  );
}

// ── FixDrawer — slide-in for fix instructions ─────────────────────────────────
function FixDrawer({ issue, profile, isFree, onClose, onUpgrade }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeInline, setShowUpgradeInline] = useState(false);

  useEffect(() => {
    if (!issue) return;
    if (isFree) { setLoading(false); setShowUpgradeInline(true); return; }
    setLoading(true); setContent(null); setShowUpgradeInline(false);
    base44.functions.invoke('generateFixInstruction', {
      issue: issue.text,
      profile: { site_url: profile?.site_url, business_name: profile?.identity_name, business_type: profile?.identity_industry },
    }).then(res => {
      if (res?.data && !res.data.error) setContent(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [issue?.id, isFree]);

  if (!issue) return null;
  const steps = content?.steps || content?.instructions || [];
  const summary = content?.summary || content?.explanation || '';
  const timeEstimate = content?.time_estimate || content?.effort || '';

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(5px)' }}
      />
      <motion.div
        key="drawer"
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: '100%', maxWidth: 440, background: WHITE, boxShadow: '-12px 0 48px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', fontFamily: F }}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 6, background: issue.severity === 'error' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${issue.severity === 'error' ? '#FECACA' : '#FDE68A'}`, marginBottom: 10 }}>
                <AlertTriangle size={11} color={issue.severity === 'error' ? '#EF4444' : '#D97706'} />
                <span style={{ fontSize: 10, fontWeight: 700, color: issue.severity === 'error' ? '#EF4444' : '#D97706' }}>
                  {issue.severity === 'error' ? 'Problème critique' : 'Point d\'amélioration'}
                </span>
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0, lineHeight: 1.4, letterSpacing: '-0.02em' }}>{issue.text}</h2>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={14} color={INK3} />
            </button>
          </div>
          {timeEstimate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <Clock size={12} color={INK3} />
              <span style={{ fontSize: 11, color: INK3 }}>{timeEstimate}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {/* Free user — upgrade gate */}
          {showUpgradeInline ? (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
              style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: '#EEF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Lock size={22} color="#7C6AF4" />
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: INK, letterSpacing: '-0.03em', marginBottom: 8 }}>
                Instructions réservées aux abonnés
              </div>
              <p style={{ fontSize: 13, color: INK3, lineHeight: 1.7, marginBottom: 24, maxWidth: 280, margin: '0 auto 24px' }}>
                Les guides de correction étape par étape, générés par IA pour votre site spécifiquement, sont disponibles à partir du plan Starter.
              </p>
              <div style={{ background: SURFACE, borderRadius: 12, padding: '14px 16px', marginBottom: 20, textAlign: 'left' }}>
                {['Instructions détaillées générées par IA', 'Adaptées à votre secteur et site', 'Temps estimé pour chaque correction', 'Code & exemples concrets fournis'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 3 ? 8 : 0 }}>
                    <CheckCircle size={13} color="#10B981" />
                    <span style={{ fontSize: 12, color: INK2 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { onClose(); onUpgrade(); }}
                style={{ width: '100%', padding: '14px', background: INK, border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Zap size={13} fill={WHITE} stroke="none" /> Débloquer les instructions
              </button>
              <button onClick={onClose} style={{ width: '100%', marginTop: 10, padding: '10px', background: 'transparent', border: 'none', fontSize: 12, color: INK3, cursor: 'pointer', fontFamily: F }}>
                Continuer sans correction
              </button>
            </motion.div>
          ) : loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: SURFACE, borderRadius: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: INK, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: INK3 }}>L'IA prépare votre guide personnalisé…</span>
              </div>
              {[85, 65, 75, 55].map((w, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                  style={{ height: 11, borderRadius: 6, background: 'linear-gradient(90deg,#F0F0EE 25%,#E6E6E4 50%,#F0F0EE 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.5s infinite', width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <div>
              {summary && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '14px 16px', background: SURFACE, borderRadius: 12, marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.7 }}>{summary}</p>
                </motion.div>
              )}
              {steps.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Étapes à suivre</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {steps.map((step, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                        style={{ display: 'flex', gap: 12, padding: '14px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: WHITE }}>{i + 1}</span>
                        </div>
                        <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65, flex: 1 }}>
                          {typeof step === 'string' ? step : step.description || step.text || JSON.stringify(step)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
              {!summary && steps.length === 0 && (
                <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>Aucune instruction générée pour ce point.</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Intent tracker ────────────────────────────────────────────────────────────
function trackIntent(featureName) {
  try { base44.analytics.track({ eventName: 'locked_section_hover', properties: { feature: featureName } }); } catch {}
}

// ── Locked section overlay — sophistiqué ─────────────────────────────────────
function LockedSection({ children, label = 'Fonctionnalité avancée', onUpgrade, intentKey = 'unknown' }) {
  const tracked = useRef(false);
  const handleEnter = () => { if (!tracked.current) { tracked.current = true; trackIntent(intentKey); } };

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}
      onMouseEnter={handleEnter}
    >
      <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.45 }}>{children}</div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,11,0.52)', backdropFilter: 'blur(3px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          style={{ background: 'rgba(20,20,24,0.96)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '24px 28px', textAlign: 'center', maxWidth: 290, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Lock size={16} color="rgba(255,255,255,0.7)" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F0F0EE', marginBottom: 6, letterSpacing: '-0.02em' }}>{label}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 18, lineHeight: 1.6 }}>
            Inclus dans le plan Starter et supérieur.
          </div>
          <motion.button onClick={onUpgrade}
            whileHover={{ opacity: 0.88 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '10px', background: WHITE, border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#0A0A0B', cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            Voir les plans <ArrowRight size={11} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Status picker ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  todo:        { label: 'À faire',  color: INK3,     bg: SURFACE,   border: BORDER,    icon: Circle },
  in_progress: { label: 'En cours', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A', icon: Clock },
  done:        { label: 'Terminé',  color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', icon: CheckCircle },
};
function StatusPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[value] || STATUS_CFG.todo;
  const Icon = cfg.icon;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(!open); }}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1px solid ${cfg.border}`, background: cfg.bg, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: cfg.color, fontFamily: F, whiteSpace: 'nowrap' }}>
        <Icon size={11} /> {cfg.label}
        <ChevronDown size={10} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 130 }}>
          {Object.entries(STATUS_CFG).map(([k, c]) => {
            const I = c.icon;
            return (
              <button key={k} onClick={e => { e.stopPropagation(); onChange(k); setOpen(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: value === k ? SURFACE : WHITE, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: c.color, fontFamily: F, textAlign: 'left' }}>
                <I size={12} /> {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const ENGINE_COLORS = { chatgpt: '#10A37F', gemini: '#4285F4', claude: '#D97706', mistral: '#FF6B35', llama: '#5046E4', perplexity: '#1E293B', grok: '#1DA1F2', copilot: '#0078D4' };
const ENGINE_LABELS = { chatgpt: 'ChatGPT', gemini: 'Gemini', claude: 'Claude', mistral: 'Mistral', llama: 'Llama', perplexity: 'Perp.', grok: 'Grok', copilot: 'Copilot' };
const FREE_ENGINES = ['gemini'];
const ALL_ENGINES = ['chatgpt', 'gemini', 'claude', 'mistral', 'llama', 'perplexity', 'grok', 'copilot'];

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AIVisibilityReport() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [gscData, setGscData] = useState(null);
  const [tasks, setTasks] = useState({});
  const [user, setUser] = useState(null);
  const [savingTask, setSavingTask] = useState({});
  const [expandedAction, setExpandedAction] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [planId, setPlanId] = useState('free');

  const isFree = planId === 'free';

  useEffect(() => {
    const unsub = onActiveDomainChange(() => loadData());
    return unsub;
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      if (!u) { navigate('/'); return; }
      setUser(u);
      setPlanId(getWokPlanId(u));
      const active = getActiveDomain();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const matched = active ? (profiles.find(p => p.site_url === active.url) || null) : profiles[0] || null;
      if (matched) {
        const extra = await getProfileData(matched);
        setData({ ...matched, ...extra });
        const existing = await base44.entities.ActionTask.filter({ user_id: u.id, site_url: matched.site_url }).catch(() => []);
        const map = {};
        for (const t of existing) map[t.action_index] = t;
        setTasks(map);
      }
    } catch {}
    setLoading(false);
  };

  const handleRescan = async () => {
    if (!data?.site_url) return;
    setScanning(true);
    try {
      const fnName = isFree ? 'analyzeWebsiteLite' : 'analyzeWebsite';
      const res = await base44.functions.invoke(fnName, { url: data.site_url });
      if (res?.data && !res.data.error) {
        const u = await base44.auth.me();
        if (u) {
          const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id });
          const matched = profiles.find(p => p.site_url === data.site_url);
          if (matched) {
            const brand_keywords = await uploadProfileData(res.data);
            await base44.entities.BusinessProfile.update(matched.id, {
              brand_keywords, score_overall: res.data.overall_score || 0,
              score_ai_visibility: res.data.ai_visibility_score || 0,
              score_message_clarity: res.data.message_clarity_score || 0,
              score_commercial_signal: res.data.commercial_presence_score || 0,
              last_scan: new Date().toISOString(),
            });
          }
          setData({ ...(matched || {}), ...res.data });
        }
      }
    } catch {}
    setScanning(false);
  };

  const handleTaskStatus = async (index, newStatus, item) => {
    if (!user) return;
    setSavingTask(prev => ({ ...prev, [index]: true }));
    const existing = tasks[index];
    try {
      if (existing?.id) {
        await base44.entities.ActionTask.update(existing.id, { status: newStatus });
        const updated = { ...tasks, [index]: { ...tasks[index], status: newStatus } };
        setTasks(updated);
        try { localStorage.setItem('wok_action_tasks', JSON.stringify(updated)); } catch {}
      } else {
        const created = await base44.entities.ActionTask.create({
          user_id: user.id, site_url: data?.site_url || '',
          action_index: index, action_title: item.action_title || '',
          engine: item.engine || '', platform: item.platform || '', status: newStatus,
        });
        const updated = { ...tasks, [index]: created };
        setTasks(updated);
        try { localStorage.setItem('wok_action_tasks', JSON.stringify(updated)); } catch {}
      }
    } catch {}
    setSavingTask(prev => ({ ...prev, [index]: false }));
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    base44.functions.invoke('getSearchConsoleData', {}).then(res => {
      if (res?.data?.connected) setGscData(res.data);
    }).catch(() => {});
  }, []);

  // ── Loading state ──
  if (loading) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E8E8E8', borderTopColor: INK, margin: '0 auto 14px' }} />
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Chargement du rapport…</p>
      </div>
    </div>
  );

  // ── Empty state ──
  if (!data) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', fontFamily: F }}>
      <BarChart2 size={36} color={INK3} />
      <p style={{ fontSize: 17, fontWeight: 800, color: INK, margin: 0 }}>Aucune analyse disponible</p>
      <p style={{ fontSize: 13, color: INK3, margin: 0, maxWidth: 260 }}>Lancez une analyse depuis l'accueil pour voir votre rapport.</p>
      <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Retour</button>
    </div>
  );

  const domainLabel = (data.site_url || '').replace(/https?:\/\//, '').split('/')[0];
  const score = Math.round(data.lrs_score || data.overall_score || data.score_overall || 0);
  const scoreVis = Math.round(data.ai_visibility_score || data.score_ai_visibility || 0);
  const scoreClarity = Math.round(data.message_clarity_score || data.score_message_clarity || 0);
  const scoreCommerce = Math.round(data.commercial_presence_score || data.score_commercial_signal || 0);
  const issues = data.issues || [];
  const plan = data.injection_plan || [];
  const doneTasks = plan.filter((_, i) => tasks[i]?.status === 'done').length;
  const hasGsc = gscData?.connected && gscData?.data;

  // Score label
  const scoreLabel = score >= 65 ? { text: 'Bonne visibilité', color: '#10B981', bg: '#ECFDF5' }
    : score >= 35 ? { text: 'Visibilité partielle', color: '#D97706', bg: '#FFFBEB' }
    : { text: 'Faible visibilité', color: '#EF4444', bg: '#FEF2F2' };

  // Technical signals — enriched
  const technical = [
    { id: 'schema', label: 'Données structurées (Schema.org)', desc: 'Les IA comprennent votre activité', ok: data.has_schema_markup, fix: 'Votre site ne transmet pas ses informations structurées. Les moteurs IA ne savent pas précisément ce que vous vendez, votre zone géographique, ni vos prix.', severity: 'error' },
    { id: 'gmb', label: 'Fiche Google My Business', desc: 'Visibilité locale & maps', ok: data.has_google_business, fix: 'Sans fiche Google complète, vous êtes invisible pour les recherches locales. Gemini et ChatGPT ne peuvent pas vous recommander géographiquement.', severity: 'error' },
    { id: 'ssl', label: 'Certificat SSL actif', desc: 'Sécurité & confiance', ok: data.has_ssl, fix: 'Un site sans HTTPS est pénalisé dans les classements et peut être marqué "non sécurisé" par les navigateurs.', severity: 'warning' },
    { id: 'mobile', label: 'Compatibilité mobile', desc: 'Expérience responsive', ok: data.has_mobile_friendly, fix: '63% des recherches IA se font sur mobile. Un site non adapté perd la majorité de ses visiteurs potentiels.', severity: 'warning' },
    { id: 'speed', label: 'Vitesse de chargement', desc: 'Core Web Vitals', ok: data.load_time_ms ? data.load_time_ms < 3000 : null, fix: 'Une page lente (>3s) est pénalisée par Google et ignorée par les IA qui indexent le web.', severity: 'warning' },
    { id: 'sitemap', label: 'Sitemap XML détecté', desc: 'Crawlabilité IA', ok: data.has_sitemap, fix: 'Sans sitemap, les bots IA ne peuvent pas indexer efficacement vos pages. Vous perdez de la visibilité structurelle.', severity: 'warning' },
  ].filter(t => t.ok !== null && t.ok !== undefined);

  const engineBars = ALL_ENGINES.map(e => ({
    label: ENGINE_LABELS[e], value: data[`${e}_score`] || 0,
    locked: isFree && !FREE_ENGINES.includes(e), color: ENGINE_COLORS[e], key: e,
  }));

  const fakeCompetitors = [
    { domain: 'votre-concurrent-a.fr', authority_score: 67, organic_traffic: 42000, lrs: 61 },
    { domain: 'votre-concurrent-b.fr', authority_score: 54, organic_traffic: 18500, lrs: 48 },
    { domain: 'votre-concurrent-c.fr', authority_score: 71, organic_traffic: 65000, lrs: 74 },
  ];
  const realCompetitors = data.competitors?.filter(c => typeof c === 'object' && c.domain && c.domain !== domainLabel) || [];

  const fakePlan = [
    { action_title: 'Publier du contenu expert structuré', engine: 'Perplexity', platform: 'LinkedIn Pulse', impact: 'high', effort: 'medium' },
    { action_title: 'Compléter la fiche Google My Business', engine: 'Gemini', platform: 'Google Maps', impact: 'high', effort: 'low' },
    { action_title: 'Implémenter Schema.org sur vos pages clés', engine: 'ChatGPT', platform: 'Votre site', impact: 'high', effort: 'medium' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>

      {/* ── Sticky header ── */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 20, paddingTop: 'max(0px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/app')} style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={14} color={INK2} />
            </button>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Rapport IA</p>
              <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{domainLabel}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isFree && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowUpgrade(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: `${CORAL}12`, border: `1px solid ${CORAL}30`, borderRadius: 8, fontSize: 11, fontWeight: 700, color: CORAL, cursor: 'pointer', fontFamily: F }}>
                <Zap size={10} fill={CORAL} stroke="none" /> Passer au Starter
              </motion.button>
            )}
            <button onClick={handleRescan} disabled={scanning}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: `1px solid ${BORDER}`, borderRadius: 9, background: WHITE, fontSize: 11, fontWeight: 600, color: scanning ? INK3 : INK2, cursor: scanning ? 'wait' : 'pointer', fontFamily: F }}>
              <motion.span animate={{ rotate: scanning ? 360 : 0 }} transition={{ duration: 0.8, repeat: scanning ? Infinity : 0, ease: 'linear' }}>
                <RefreshCw size={11} />
              </motion.span>
              {scanning ? 'Analyse…' : 'Actualiser'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 100px' }}>

        {/* ── 1. Score principal ── */}
        <FadeUp delay={0}>
          <div style={{ background: INK, borderRadius: 20, padding: '24px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${scoreLabel.color}30 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', position: 'relative' }}>
              <ScoreCircle value={score} size={96} />
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>LLM Resonance Score™</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: WHITE, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.1 }}>{data.identity_name || domainLabel}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: `${scoreLabel.color}20`, border: `1px solid ${scoreLabel.color}40`, borderRadius: 20 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: scoreLabel.color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: scoreLabel.color }}>{scoreLabel.text}</span>
                </div>
                {isFree && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>⚡ Scan Lite · 1 moteur analysé sur 8</span>
                  </div>
                )}
              </div>
              <a href={data.site_url} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}>
                <Globe size={11} /> <ExternalLink size={9} />
              </a>
            </div>
            {data.shock_insight && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 10, borderLeft: `3px solid ${CORAL}` }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.65 }}>💡 {data.shock_insight}</p>
              </motion.div>
            )}
            {/* Last scan date */}
            {data.last_scan && (
              <div style={{ marginTop: 14, fontSize: 10, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={9} /> Dernier scan : {new Date(data.last_scan).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>
        </FadeUp>

        {/* ── 2. Détail des 3 scores ── */}
        <FadeUp delay={0.07}>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 7 }}>
              <BarChart2 size={13} color={INK2} /> Décomposition du score
            </div>
            <HBar value={scoreVis} label="Présence chez les assistants IA" icon={Cpu} delay={0.1} sublabel={`${scoreVis >= 50 ? 'Bonne' : 'À améliorer'}`} />
            <HBar value={scoreClarity} label="Clarté du message & positionnement" icon={MessageSquare} delay={0.15} sublabel={`${scoreClarity >= 50 ? 'Clair' : 'Vague pour les IA'}`} />
            <HBar value={scoreCommerce} label="Signaux commerciaux détectés" icon={ShoppingBag} delay={0.2} sublabel={`${scoreCommerce >= 50 ? 'Convaincant' : 'Insuffisant'}`} />
          </div>
        </FadeUp>

        {/* ── 3. Score par moteur IA ── */}
        <FadeUp delay={0.12}>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: INK, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={13} color={INK2} /> Score par moteur IA
                </div>
                <div style={{ fontSize: 10, color: INK3, marginTop: 2 }}>
                  {isFree ? '1 moteur analysé — 7 supplémentaires avec Starter' : `${ALL_ENGINES.length} moteurs analysés en parallèle`}
                </div>
              </div>
              {isFree && (
                <button onClick={() => setShowUpgrade(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#EEF0FF', border: '1px solid #C7D2FE', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#7C6AF4', cursor: 'pointer', fontFamily: F }}>
                  <Lock size={9} /> Débloquer
                </button>
              )}
            </div>
            {/* Bar chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 6 }}>
              {engineBars.map((b, i) => {
                const c = b.locked ? '#E0E0E0' : b.color;
                const h = b.locked ? 20 : Math.max((b.value / 100) * 90, 4);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative' }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: b.locked ? '#D0D0D0' : INK3 }}>{b.locked ? '?' : b.value}</span>
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: `${h}px` }}
                      transition={{ delay: 0.1 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      style={{ width: '100%', background: b.locked ? 'repeating-linear-gradient(45deg,#E8E8E8,#E8E8E8 3px,#F3F3F3 3px,#F3F3F3 6px)' : `linear-gradient(180deg, ${c}CC, ${c})`, borderRadius: '4px 4px 0 0', minHeight: 4, position: 'relative' }}
                    />
                    {b.locked && (
                      <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)' }}>
                        <Lock size={7} color="#C0C0C0" />
                      </div>
                    )}
                    <span style={{ fontSize: 7, color: b.locked ? '#D0D0D0' : INK3, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{b.label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 1, background: BORDER }} />
            {/* Quick interpretation */}
            {!isFree && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {engineBars.filter(b => !b.locked).sort((a, b) => b.value - a.value).slice(0, 2).map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}` }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: b.color }} />
                    <span style={{ fontSize: 10, color: INK2, fontWeight: 600 }}>{ENGINE_LABELS[b.key] || b.label} · meilleure visibilité</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeUp>

        {/* ── 4. Signaux techniques (enrichis) ── */}
        {technical.length > 0 && (
          <FadeUp delay={0.17}>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={13} color={INK2} /> Signaux techniques détectés
                  </div>
                  <div style={{ fontSize: 10, color: INK3, marginTop: 2 }}>
                    Cliquez sur un problème pour {isFree ? 'voir comment le corriger' : 'obtenir le guide IA'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {technical.filter(t => t.ok === false).length > 0 && (
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#EF4444', flexShrink: 0 }}>{technical.filter(t => t.ok === false).length}</span>
                  )}
                </div>
              </div>
              {technical.map((t, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
                  onClick={!t.ok ? () => setActiveDrawer({ id: `tech_${t.id}`, text: t.fix, severity: t.severity }) : undefined}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < technical.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: !t.ok ? 'pointer' : 'default', transition: 'background 0.12s' }}
                  whileHover={!t.ok ? { backgroundColor: SURFACE } : {}}>
                  {t.ok ? <CheckCircle size={17} color="#10B981" style={{ flexShrink: 0 }} /> : <XCircle size={17} color="#EF4444" style={{ flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: t.ok ? INK2 : INK, fontWeight: t.ok ? 400 : 600, lineHeight: 1.3 }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: INK3, marginTop: 1 }}>{t.desc}</div>
                  </div>
                  {!t.ok && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#EF4444', flexShrink: 0, fontWeight: 600 }}>
                      Corriger <ChevronRight size={12} />
                    </div>
                  )}
                  {t.ok && <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', flexShrink: 0 }}>✓</span>}
                </motion.div>
              ))}
            </div>
          </FadeUp>
        )}

        {/* ── 5. Problèmes IA détectés ── */}
        {issues.length > 0 && (
          <FadeUp delay={0.21}>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={13} color="#D97706" /> Problèmes identifiés par l'IA
                  </div>
                  <div style={{ fontSize: 10, color: INK3, marginTop: 2 }}>Cliquez pour obtenir le guide de correction</div>
                </div>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#EF4444' }}>{issues.length}</span>
              </div>
              {issues.map((issue, i) => (
                <motion.button key={i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 + i * 0.05 }}
                  onClick={() => setActiveDrawer({ id: `issue_${i}`, text: issue.problem, severity: issue.severity })}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < issues.length - 1 ? `1px solid ${BORDER}` : 'none', background: WHITE, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F, transition: 'background 0.12s' }}
                  whileHover={{ backgroundColor: SURFACE }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: issue.severity === 'error' ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: INK2, lineHeight: 1.5 }}>{issue.problem}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: isFree ? '#7C6AF4' : INK3, flexShrink: 0, fontWeight: 600 }}>
                    {isFree ? <><Lock size={10} /> Guide</> : <>Corriger <ChevronRight size={12} /></>}
                  </div>
                </motion.button>
              ))}
            </div>
          </FadeUp>
        )}

        {/* ── 6. Trafic & données ── */}
        <FadeUp delay={0.25}>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: INK, display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={13} color={INK2} /> Trafic & autorité web
              </div>
              {hasGsc
                ? <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} /> GSC connecté</span>
                : <button onClick={() => navigate('/connections')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: INK2, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: F }}><Link2 size={10} /> Connecter Google</button>
              }
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {(hasGsc ? [
                { label: 'Clics ce mois', value: gscData.data.totalClicks?.toLocaleString('fr') || '–', sub: 'via Google Search' },
                { label: 'Impressions', value: gscData.data.totalImpressions?.toLocaleString('fr') || '–', sub: 'recherches détectées' },
                { label: 'Taux de clic', value: `${gscData.data.avgCtr}%`, sub: 'CTR moyen' },
                { label: 'Position moyenne', value: String(gscData.data.avgPosition), sub: 'classement Google' },
              ] : [
                { label: 'Visiteurs / mois', value: fmt(data.organic_traffic), sub: 'trafic organique' },
                { label: 'Mots-clés', value: fmt(data.organic_keywords), sub: 'termes positionnés' },
                { label: 'Backlinks', value: fmt(data.backlinks), sub: 'liens entrants' },
                { label: 'Autorité domaine', value: data.authority_score ? String(data.authority_score) : '–', sub: 'sur 100' },
              ]).map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 + i * 0.06 }}
                  style={{ padding: '16px 18px', borderBottom: i < 2 ? `1px solid ${BORDER}` : 'none', borderRight: i % 2 === 0 ? `1px solid ${BORDER}` : 'none' }}>
                  <div style={{ fontSize: 9, color: INK3, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>{m.value}</div>
                  <div style={{ fontSize: 9, color: INK3, marginTop: 4 }}>{m.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* ── 7. Plan d'actions ── */}
        {(plan.length > 0 || isFree) && (
          <FadeUp delay={0.29}>
            <div style={{ marginBottom: 12 }}>
              {isFree ? (
                <LockedSection label="Plan d'actions — Starter requis" onUpgrade={() => setShowUpgrade(true)} intentKey="action_plan">
                  <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>Plan d'amélioration personnalisé</div>
                      <div style={{ fontSize: 10, color: INK3, marginTop: 2 }}>3 actions prioritaires avec moteur cible & effort estimé</div>
                    </div>
                    {fakePlan.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < fakePlan.length - 1 ? `1px solid ${BORDER}` : 'none', background: WHITE }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: INK3 }}>{i + 1}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 2 }}>{item.action_title}</div>
                          <div style={{ fontSize: 10, color: INK3 }}>Via {item.platform} · Impact fort</div>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#F0FDF4', padding: '2px 8px', borderRadius: 20 }}>fort</span>
                      </div>
                    ))}
                  </div>
                </LockedSection>
              ) : plan.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>Plan d'amélioration</div>
                      <div style={{ fontSize: 10, color: INK3, marginTop: 2 }}>{doneTasks}/{plan.length} actions réalisées</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 5, width: 80, background: BORDER, borderRadius: 3, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${plan.length ? (doneTasks / plan.length) * 100 : 0}%` }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          style={{ height: '100%', background: '#10B981', borderRadius: 3 }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.map((item, i) => {
                      const task = tasks[i];
                      const status = task?.status || 'todo';
                      const isOpen = expandedAction === i;
                      const isHigh = item.impact === 'high';
                      return (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
                          style={{ background: WHITE, border: `1px solid ${status === 'done' ? '#BBF7D0' : BORDER}`, borderRadius: 14, overflow: 'hidden', opacity: status === 'done' ? 0.65 : 1, transition: 'opacity 0.2s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: INK3 }}>{i + 1}</span>
                            </div>
                            <button onClick={() => setExpandedAction(isOpen ? null : i)}
                              style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0, fontFamily: F }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{item.action_title}</span>
                                {isHigh && <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#F0FDF4', padding: '2px 6px', borderRadius: 20 }}>Impact fort</span>}
                              </div>
                              <div style={{ fontSize: 10, color: INK3 }}>
                                {item.engine && <span style={{ marginRight: 8 }}>🎯 {item.engine}</span>}
                                {item.platform && `Via ${item.platform}`}
                                {item.effort && ` · ${item.effort === 'low' ? 'Rapide' : item.effort === 'medium' ? 'Moyen' : 'Long'}`}
                              </div>
                            </button>
                            <div style={{ flexShrink: 0, opacity: savingTask[i] ? 0.5 : 1 }}>
                              <StatusPicker value={status} onChange={s => handleTaskStatus(i, s, item)} />
                            </div>
                            <button onClick={() => setExpandedAction(isOpen ? null : i)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}>
                              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown size={14} color={INK3} />
                              </motion.span>
                            </button>
                          </div>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                style={{ borderTop: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  {item.gap && (
                                    <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 10 }}>
                                      <p style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px' }}>Pourquoi c'est prioritaire</p>
                                      <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.gap}</p>
                                    </div>
                                  )}
                                  {item.action_detail && (
                                    <div>
                                      <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Ce qu'il faut faire</p>
                                      <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.action_detail}</p>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => setActiveDrawer({ id: `plan_${i}`, text: item.action_title + ' — ' + (item.action_detail || ''), severity: 'info' })}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: SURFACE, color: INK, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                                    <Zap size={13} /> Guide étape par étape <ArrowRight size={13} />
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </FadeUp>
        )}

        {/* ── 8. Concurrents ── */}
        {(isFree || realCompetitors.length > 0) && (
          <FadeUp delay={0.33}>
            {isFree ? (
              <LockedSection label="Analyse concurrents — Starter requis" onUpgrade={() => setShowUpgrade(true)} intentKey="competitors">
                <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>Concurrents détectés</div>
                    <div style={{ fontSize: 10, color: INK3, marginTop: 2 }}>LRS comparatif, trafic & autorité domaine</div>
                  </div>
                  {fakeCompetitors.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < fakeCompetitors.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{c.domain}</div>
                        <div style={{ fontSize: 10, color: INK3, marginTop: 2 }}>{fmt(c.organic_traffic)} visiteurs/mois</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ padding: '4px 10px', background: SURFACE, borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: INK }}>{c.lrs}</div>
                          <div style={{ fontSize: 8, color: INK3 }}>LRS</div>
                        </div>
                        <div style={{ padding: '4px 10px', background: SURFACE, borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: INK }}>{c.authority_score}</div>
                          <div style={{ fontSize: 8, color: INK3 }}>DA</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </LockedSection>
            ) : (
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>Concurrents détectés</div>
                </div>
                {realCompetitors.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < realCompetitors.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{c.domain}</div>
                      {c.organic_traffic > 0 && <div style={{ fontSize: 10, color: INK3, marginTop: 2 }}>{fmt(c.organic_traffic)} visiteurs/mois</div>}
                    </div>
                    {c.authority_score != null && (
                      <div style={{ padding: '4px 10px', background: SURFACE, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: INK }}>{c.authority_score}</div>
                        <div style={{ fontSize: 8, color: INK3, textTransform: 'uppercase' }}>DA</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </FadeUp>
        )}

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>

      {activeDrawer && (
        <FixDrawer
          issue={activeDrawer}
          profile={data}
          isFree={isFree}
          onClose={() => setActiveDrawer(null)}
          onUpgrade={() => setShowUpgrade(true)}
        />
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="l'analyse complète"
        requiredPlan="starter"
        description="Débloquez les 7 moteurs IA manquants, le plan d'actions personnalisé, les guides de correction et l'analyse de vos concurrents."
      />
    </div>
  );
}