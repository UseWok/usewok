import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, X, Zap, Clock, Lock,
  AlertTriangle, BarChart2, TrendingUp, CheckCircle2,
  ChevronDown, Sparkles, Target, ArrowRight, Bookmark
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import { getWokPlanId } from '@/lib/wok-plans';
import UpgradeModal from '@/components/upsell/UpgradeModal';

const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#6B6660';
const INK3 = '#A8A49F';
const BORDER = 'rgba(21,19,15,0.10)';
const SURFACE = '#F8F7F4';
const WHITE = '#FFFFFF';
const CORAL = '#FF5A1F';
const CARD_DARK = '#15130F';
const GREEN = '#10B981';

const AI_LOGOS = {
  chatgpt: 'https://media.base44.com/images/public/6a2edc91082e534601118582/67cb277ed_image.png',
  gemini: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f37dc5b5a_image.png',
  claude: 'https://media.base44.com/images/public/6a2edc91082e534601118582/d67c08a4b_image.png',
  perplexity: 'https://media.base44.com/images/public/6a2edc91082e534601118582/8e9ccea01_image.png',
  mistral: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3a3745646_image.png',
  grok: 'https://media.base44.com/images/public/6a2edc91082e534601118582/ddf7fe28b_image.png',
  copilot: 'https://media.base44.com/images/public/6a2edc91082e534601118582/92bb51643_image.png',
  llama: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1bdc7666b_image.png'
};
const ALL_ENGINES = ['chatgpt', 'gemini', 'claude', 'mistral', 'llama', 'perplexity', 'grok', 'copilot'];
const ENGINE_NAMES = { chatgpt: 'ChatGPT', gemini: 'Gemini', claude: 'Claude', mistral: 'Mistral', llama: 'Llama', perplexity: 'Perplexity', grok: 'Grok', copilot: 'Copilot' };
const FREE_ENGINES = ['gemini'];

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function FadeUp({ children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}>
      {children}
    </motion.div>
  );
}

// ── Animated score number ─────────────────────────────────────────────────────
function AnimatedScore({ value, size = 56 }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    let start = null;
    const dur = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisp(Math.round(ease * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span style={{ fontSize: size, fontWeight: 900, color: WHITE, letterSpacing: '-0.05em', lineHeight: 1 }}>{disp}</span>;
}

// ── FixDrawer — cache mémoire locale pour éviter re-fetch ────────────────────
const FIX_CACHE = {};

function FixDrawer({ issue, profile, isFree, onClose, onUpgrade }) {
  const cacheKey = issue?.id || '';
  const [content, setContent] = useState(() => FIX_CACHE[cacheKey] || null);
  const [loading, setLoading] = useState(!FIX_CACHE[cacheKey] && !isFree);
  const [fromCache, setFromCache] = useState(!!FIX_CACHE[cacheKey]);

  useEffect(() => {
    if (!issue) return;
    if (isFree) { setLoading(false); return; }
    // Si déjà en mémoire, ne pas refaire l'appel
    if (FIX_CACHE[cacheKey]) { setContent(FIX_CACHE[cacheKey]); setLoading(false); return; }
    setLoading(true); setContent(null); setFromCache(false);
    base44.functions.invoke('generateFixInstruction', {
      issue: issue.text,
      profile: {
        site_url: profile?.site_url,
        business_name: profile?.identity_name,
        business_type: profile?.identity_industry
      }
    }).then((res) => {
      if (res?.data && !res.data.error) {
        FIX_CACHE[cacheKey] = res.data;
        setContent(res.data);
        setFromCache(!!res.data.from_cache);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [cacheKey, isFree]);

  if (!issue) return null;
  const steps = content?.steps || [];
  const summary = content?.summary || '';
  const timeEstimate = content?.time_estimate || '';
  const fixType = content?.type || '';

  return (
    <AnimatePresence>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} />
      <motion.div key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: '100%', maxWidth: 460, background: WHITE, boxShadow: '-12px 0 48px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', fontFamily: F }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${BORDER}`, background: WHITE, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: 2, background: CORAL, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: CORAL, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {issue.type === 'plan' ? 'Plan d\'action' : 'Correction'}
                </span>
                {fromCache && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 600, color: GREEN, background: `${GREEN}15`, padding: '2px 7px', borderRadius: 20 }}>
                    <Bookmark size={8} /> Sauvegardé
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0, lineHeight: 1.4, letterSpacing: '-0.02em' }}>{issue.text}</h2>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={14} color={INK3} />
            </button>
          </div>
          {timeEstimate && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20 }}>
                <Clock size={11} color={INK3} />
                <span style={{ fontSize: 11, color: INK2, fontWeight: 600 }}>{timeEstimate}</span>
              </div>
              {fixType && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: fixType === 'seul' ? `${GREEN}12` : `${CORAL}10`, border: `1px solid ${fixType === 'seul' ? `${GREEN}30` : `${CORAL}25`}`, borderRadius: 20 }}>
                  <span style={{ fontSize: 11, color: fixType === 'seul' ? GREEN : CORAL, fontWeight: 600 }}>{fixType === 'seul' ? '✓ Faisable seul' : '↗ Avec aide'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isFree ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${CORAL}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Lock size={22} color={CORAL} />
              </div>
              <p style={{ fontSize: 17, fontWeight: 800, color: INK, letterSpacing: '-0.03em', marginBottom: 8 }}>Guide de correction Starter</p>
              <p style={{ fontSize: 13, color: INK3, lineHeight: 1.7, marginBottom: 28, maxWidth: 280, margin: '0 auto 28px' }}>
                Chaque correction génère un guide étape par étape adapté à votre business. Disponible dès le plan Starter.
              </p>
              <button onClick={() => { onClose(); onUpgrade(); }}
                style={{ width: '100%', padding: 14, background: INK, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F }}>
                Débloquer les guides — Starter
              </button>
            </div>
          ) : loading ? (
            <div style={{ padding: '24px 20px' }}>
              {/* Spinner card — fidèle à la maquette */}
              <div style={{
                padding: '18px 20px',
                background: '#F5F0E8',
                borderRadius: 16,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                {/* Spinner coral avec arc partiel */}
                <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" style={{ animation: 'spin 0.9s linear infinite', display: 'block' }}>
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#E8DDD0" strokeWidth="3" />
                    <circle cx="20" cy="20" r="16" fill="none" stroke={CORAL} strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="40 60"
                      strokeDashoffset="0"
                    />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 3px', lineHeight: 1.3 }}>L'IA prépare votre guide<br/>personnalisé…</p>
                  <p style={{ fontSize: 12, color: INK3, margin: 0, fontWeight: 400 }}>Adapté à votre secteur et votre site</p>
                </div>
              </div>
              {/* Skeleton lines */}
              {[85, 65, 75, 50].map((w, i) => (
                <div key={i} style={{
                  height: 11,
                  borderRadius: 6,
                  background: 'rgba(21,19,15,0.07)',
                  width: `${w}%`,
                  marginBottom: 12,
                }} />
              ))}
            </div>
          ) : content ? (
            <div style={{ padding: '20px', background: WHITE }}>
              {/* Impact box — pourquoi ça compte */}
              {summary && (
                <div style={{ padding: '16px 18px', background: `${CORAL}08`, border: `1px solid ${CORAL}20`, borderRadius: 14, marginBottom: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: CORAL, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>💡 Pourquoi c'est important</p>
                  <p style={{ fontSize: 13.5, color: INK, margin: 0, lineHeight: 1.7, fontWeight: 500 }}>{summary}</p>
                </div>
              )}

              {/* Steps */}
              {steps.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Ce que vous faites maintenant</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {steps.map((step, i) => {
                      const stepText = typeof step === 'string' ? step : step.description || step.text || '';
                      const [action, result] = stepText.includes('→') ? stepText.split('→') : [stepText, null];
                      return (
                        <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 13 }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? CORAL : CARD_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: WHITE }}>{i + 1}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13.5, color: INK, margin: '0 0 4px', lineHeight: 1.55, fontWeight: 500 }}>{action.trim()}</p>
                            {result && (
                              <p style={{ fontSize: 11.5, color: GREEN, margin: 0, fontWeight: 600 }}>→ {result.trim()}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: INK3 }}>Une erreur est survenue. Réessayez dans quelques secondes.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Status picker ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  todo: { label: 'À faire', color: INK2, bg: WHITE, border: BORDER },
  in_progress: { label: 'En cours', color: CORAL, bg: `${CORAL}10`, border: `${CORAL}40` },
  done: { label: '✓ Terminé', color: WHITE, bg: INK, border: INK }
};
function StatusPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[value] || STATUS_CFG.todo;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: `1px solid ${cfg.border}`, background: cfg.bg, cursor: 'pointer', fontSize: 11.5, fontWeight: 600, color: cfg.color, fontFamily: F, whiteSpace: 'nowrap' }}>
        {cfg.label}
        <ChevronDown size={10} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', opacity: 0.5 }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden', zIndex: 50, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 120 }}>
          {Object.entries(STATUS_CFG).map(([k, c]) => (
            <button key={k} onClick={(e) => { e.stopPropagation(); onChange(k); setOpen(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '9px 12px', background: value === k ? SURFACE : WHITE, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: value === k ? 600 : 400, color: k === 'done' ? GREEN : k === 'in_progress' ? CORAL : INK2, fontFamily: F, textAlign: 'left' }}>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Score ring (hero) ─────────────────────────────────────────────────────────
function ScoreRing({ value, size = 100 }) {
  const sw = 7, R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={sw} />
        <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={CORAL} strokeWidth={sw}
          strokeLinecap="round"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - value / 100) }}
          transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], delay: 0.1 }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatedScore value={value} size={30} />
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 1 }}>/100</span>
      </div>
    </div>
  );
}

// ── Issue card — avec contexte business ──────────────────────────────────────
function IssueCard({ issue, index, onClick, onStatusChange, status, saving }) {
  const urgency = issue.urgency || issue.severity || 'medium';
  const urgencyColor = urgency === 'high' ? CORAL : urgency === 'low' ? INK3 : '#D97706';
  const urgencyLabel = urgency === 'high' ? 'Urgent' : urgency === 'low' ? 'Mineur' : 'Important';

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}
      style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 8 }}>
      <button onClick={onClick}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 13, padding: '15px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${urgencyColor}12`, border: `1px solid ${urgencyColor}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <AlertTriangle size={14} color={urgencyColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: urgencyColor, background: `${urgencyColor}12`, padding: '2px 8px', borderRadius: 20 }}>{urgencyLabel}</span>
          </div>
          <p style={{ fontSize: 13.5, color: INK, fontWeight: 600, margin: '0 0 4px', lineHeight: 1.4 }}>
            {issue.problem || issue.text}
          </p>
          {issue.impact && (
            <p style={{ fontSize: 12, color: INK3, margin: 0, lineHeight: 1.5 }}>
              {issue.impact}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: CORAL }}>Corriger →</span>
        </div>
      </button>
    </motion.div>
  );
}

// ── Plan action card ──────────────────────────────────────────────────────────
function PlanCard({ item, index, status, onStatusChange, saving, onGuide, engineLogos }) {
  const [expanded, setExpanded] = useState(false);
  const isHigh = item.impact === 'high';
  const isDone = status === 'done';
  const engineLogo = engineLogos[item.engine?.toLowerCase()];
  const effortLabel = item.effort === 'low' ? '⚡ Rapide' : item.effort === 'medium' ? '⏱ Quelques heures' : '📅 Plusieurs jours';

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index }}
      style={{ background: WHITE, border: `1px solid ${isDone ? `${GREEN}40` : BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 8, opacity: isDone ? 0.6 : 1, transition: 'opacity 0.2s' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '15px 16px' }}>
        {/* Numéro */}
        <div style={{ width: 28, height: 28, borderRadius: 8, background: isDone ? `${GREEN}15` : isHigh ? `${CORAL}12` : SURFACE, border: `1px solid ${isDone ? `${GREEN}30` : isHigh ? `${CORAL}25` : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isDone
            ? <CheckCircle2 size={14} color={GREEN} />
            : <span style={{ fontSize: 11, fontWeight: 800, color: isHigh ? CORAL : INK2 }}>{index + 1}</span>
          }
        </div>

        {/* Content */}
        <button onClick={() => setExpanded(!expanded)}
          style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: F }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 6px', lineHeight: 1.4 }}>{item.action_title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {engineLogo && <img src={engineLogo} alt={item.engine} style={{ width: 14, height: 14, objectFit: 'contain' }} />}
            <span style={{ fontSize: 11.5, color: INK3 }}>{item.engine}</span>
            <span style={{ fontSize: 11.5, color: 'rgba(21,19,15,0.15)' }}>·</span>
            <span style={{ fontSize: 11.5, color: INK3 }}>{effortLabel}</span>
            {isHigh && <span style={{ fontSize: 10, fontWeight: 700, color: CORAL, background: `${CORAL}10`, padding: '2px 7px', borderRadius: 20 }}>Fort impact</span>}
          </div>
        </button>

        {/* Status */}
        <div style={{ flexShrink: 0, opacity: saving ? 0.5 : 1 }}>
          <StatusPicker value={status} onChange={onStatusChange} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }} style={{ borderTop: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {item.gap && (
                <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 10 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px' }}>
                    Pourquoi c'est prioritaire
                  </p>
                  <p style={{ fontSize: 13, color: '#78350F', margin: 0, lineHeight: 1.65 }}>{item.gap}</p>
                </div>
              )}
              <button onClick={() => onGuide({ id: `plan_${index}`, text: item.action_title + (item.action_detail ? ' — ' + item.action_detail : ''), type: 'plan' })}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: CARD_DARK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                <Sparkles size={13} color={CORAL} /> Voir le guide étape par étape
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

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
      const matched = active ? profiles.find((p) => p.site_url === active.url) || null : profiles[0] || null;
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
      // Supprimer le cache des corrections pour ce site (se régénèreront au prochain clic)
      const u = await base44.auth.me().catch(() => null);
      if (u) {
        const caches = await base44.entities.UserFixCache.filter({ user_id: u.id, site_url: data.site_url }).catch(() => []);
        await Promise.all(caches.map(c => base44.entities.UserFixCache.delete(c.id).catch(() => {})));
      }

      const fnName = isFree ? 'analyzeWebsiteLite' : 'analyzeWebsite';
      const res = await base44.functions.invoke(fnName, { url: data.site_url });
      if (res?.data && !res.data.error) {
        const u = await base44.auth.me();
        if (u) {
          const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id });
          const matched = profiles.find((p) => p.site_url === data.site_url);
          if (matched) {
            const brand_keywords = await uploadProfileData(res.data);
            await base44.entities.BusinessProfile.update(matched.id, {
              brand_keywords, score_overall: res.data.overall_score || 0,
              score_ai_visibility: res.data.ai_visibility_score || 0,
              score_message_clarity: res.data.message_clarity_score || 0,
              score_commercial_signal: res.data.commercial_presence_score || 0,
              last_scan: new Date().toISOString()
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
    setSavingTask((prev) => ({ ...prev, [index]: true }));
    const existing = tasks[index];
    try {
      if (existing?.id) {
        await base44.entities.ActionTask.update(existing.id, { status: newStatus });
        setTasks((prev) => ({ ...prev, [index]: { ...prev[index], status: newStatus } }));
      } else {
        const created = await base44.entities.ActionTask.create({
          user_id: user.id, site_url: data?.site_url || '',
          action_index: index, action_title: item.action_title || '',
          engine: item.engine || '', platform: item.platform || '', status: newStatus
        });
        setTasks((prev) => ({ ...prev, [index]: created }));
      }
    } catch {}
    setSavingTask((prev) => ({ ...prev, [index]: false }));
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    base44.functions.invoke('getSearchConsoleData', {}).then((res) => {
      if (res?.data?.connected) setGscData(res.data);
    }).catch(() => {});
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(21,19,15,0.10)', borderTopColor: CORAL, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', fontFamily: F }}>
      <BarChart2 size={36} color={INK3} />
      <p style={{ fontSize: 17, fontWeight: 800, color: INK, margin: 0 }}>Aucune analyse disponible</p>
      <p style={{ fontSize: 13, color: INK3, margin: 0, maxWidth: 260 }}>Lancez une analyse depuis l'accueil pour voir votre rapport.</p>
      <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Retour</button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
  const businessName = data.identity_name || domainLabel;

  // ── Score hero text ──────────────────────────────────────────────────────────
  const getHeroInsight = () => {
    const insight = data.shock_insight || data.ai_summary || '';
    if (insight) return insight;
    if (score < 30) return `Sur 100 questions posées à une IA sur votre secteur, vous apparaissez dans moins de ${score} réponses. Vos concurrents captent ces clients à votre place.`;
    if (score < 55) return `Vous avez une présence partielle chez les IA — ${100 - score} points vous séparent encore d'une visibilité dominante dans votre secteur.`;
    return `Bonne visibilité IA. Les moteurs comme ChatGPT et Gemini commencent à vous recommander. Voici comment aller encore plus loin.`;
  };

  const getScoreColor = () => score >= 65 ? GREEN : score >= 35 ? '#D97706' : CORAL;
  const getScoreLabel = () => score >= 65 ? 'Bonne visibilité IA' : score >= 35 ? 'Visibilité partielle' : 'Faible visibilité IA';

  const technical = [
    { id: 'schema', label: 'Fiche business lisible par les IA', desc: 'Les IA comprennent qui vous êtes et ce que vous vendez', ok: data.has_schema_markup, fix: 'Les IA ne savent pas qui vous êtes. Quand un client demande "recommande-moi un X", vous n\'êtes pas dans leur réponse.', urgency: 'high' },
    { id: 'gmb', label: 'Présence Google Maps complète', desc: 'Vous apparaissez dans les recherches locales', ok: data.has_google_business, fix: 'Votre fiche Google est incomplète ou absente. Vous perdez des clients locaux qui cherchent votre type de service.', urgency: 'high' },
    { id: 'ssl', label: 'Site sécurisé (HTTPS)', desc: 'Les IA font confiance à votre site', ok: data.has_ssl, fix: 'Votre site n\'est pas sécurisé. Les IA évitent de recommander des sites non sécurisés.', urgency: 'medium' },
    { id: 'mobile', label: 'Site adapté aux téléphones', desc: '80% des recherches IA se font sur mobile', ok: data.has_mobile_friendly, fix: 'Votre site n\'est pas adapté aux téléphones. La majorité de vos clients potentiels vivent une mauvaise expérience.', urgency: 'medium' },
    { id: 'sitemap', label: 'Pages accessibles aux IA', desc: 'Toutes vos pages sont découvertes et indexées', ok: data.has_sitemap, fix: 'Les IA ne voient pas toutes vos pages. Une partie de votre contenu est invisible pour ChatGPT et Gemini.', urgency: 'low' },
  ].filter((t) => t.ok !== null && t.ok !== undefined);

  const technicalBad = technical.filter((t) => t.ok === false);

  const engineBars = ALL_ENGINES.map((e) => ({
    key: e, name: ENGINE_NAMES[e],
    logo: AI_LOGOS[e],
    value: data[`${e}_score`] || 0,
    locked: isFree && !FREE_ENGINES.includes(e)
  }));
  const topScore = Math.max(...engineBars.filter(b => !b.locked).map(b => b.value), 1);

  const fakePlan = [
    { action_title: 'Publier du contenu expert sur votre domaine', engine: 'Perplexity', platform: 'Votre site + LinkedIn', impact: 'high', effort: 'medium' },
    { action_title: 'Compléter votre fiche Google pour les recherches locales', engine: 'Gemini', platform: 'Google Maps', impact: 'high', effort: 'low' },
    { action_title: 'Ajouter vos informations business aux pages clés', engine: 'ChatGPT', platform: 'Votre site', impact: 'high', effort: 'medium' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>

      {/* ── Sticky header ── */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={14} color={INK2} />
            </button>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>Rapport de visibilité IA</p>
              <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{domainLabel}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isFree && (
              <button onClick={() => setShowUpgrade(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: `${CORAL}12`, border: `1px solid ${CORAL}30`, borderRadius: 8, fontSize: 11, fontWeight: 700, color: CORAL, cursor: 'pointer', fontFamily: F }}>
                <Zap size={10} /> Starter
              </button>
            )}
            <button onClick={handleRescan} disabled={scanning}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: scanning ? INK3 : INK2, cursor: scanning ? 'wait' : 'pointer', fontFamily: F }}>
              <motion.span animate={{ rotate: scanning ? 360 : 0 }} transition={{ duration: 0.8, repeat: scanning ? Infinity : 0, ease: 'linear' }}>
                <RefreshCw size={11} />
              </motion.span>
              {scanning ? 'Analyse…' : 'Actualiser'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 100px' }}>

        {/* ── 1. Hero score ── */}
        <FadeUp delay={0}>
          <div style={{ background: CARD_DARK, borderRadius: 20, padding: '24px 22px 22px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
            {/* Ambient glow */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${CORAL}20 0%, transparent 65%)`, pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 16px' }}>LLM Resonance Score</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 18 }}>
                <ScoreRing value={score} size={92} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: WHITE, margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>{businessName}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: `${getScoreColor()}18`, border: `1px solid ${getScoreColor()}35`, borderRadius: 20 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: getScoreColor() }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: getScoreColor() }}>{getScoreLabel()}</span>
                  </div>
                </div>
              </div>

              {/* Insight percutant */}
              <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, marginBottom: 18 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.70)', margin: 0, lineHeight: 1.7 }}>
                  {getHeroInsight()}
                </p>
              </div>

              {/* 3 métriques clés */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Présence IA', value: scoreVis, suffix: '' },
                  { label: 'Message clair', value: scoreClarity, suffix: '' },
                  { label: 'Signaux business', value: scoreCommerce, suffix: '' },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.04em' }}>{m.value}</div>
                    <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ── 2. Score par moteur IA ── */}
        <FadeUp delay={0.08}>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 2px' }}>Qui vous recommande</p>
              <p style={{ fontSize: 11.5, color: INK3, margin: 0 }}>
                {isFree ? 'Gemini analysé · 7 moteurs verrouillés' : '8 moteurs IA testés en parallèle'}
              </p>
            </div>
            <div style={{ padding: '18px 18px 14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {engineBars.map((b) => {
                  const isTop = !b.locked && b.value > 0 && b.value === topScore;
                  return (
                    <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: b.locked ? 0.35 : 1 }}>
                      {b.logo
                        ? <img src={b.logo} alt={b.name} style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
                        : <div style={{ width: 16, height: 16, borderRadius: '50%', background: BORDER, flexShrink: 0 }} />
                      }
                      <span style={{ fontSize: 12, fontWeight: 600, color: INK2, width: 66, flexShrink: 0 }}>{b.name}</span>
                      <div style={{ flex: 1, height: 6, background: 'rgba(21,19,15,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                        {!b.locked && (
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${b.value}%` }}
                            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            style={{ height: '100%', background: isTop ? CORAL : 'rgba(21,19,15,0.2)', borderRadius: 999 }} />
                        )}
                        {b.locked && <div style={{ width: '30%', height: '100%', background: 'rgba(21,19,15,0.12)', borderRadius: 999 }} />}
                      </div>
                      {b.locked
                        ? <Lock size={10} color={INK3} style={{ flexShrink: 0 }} />
                        : <span style={{ fontSize: 12, fontWeight: 700, color: isTop ? CORAL : INK2, width: 24, textAlign: 'right' }}>{b.value}</span>
                      }
                    </div>
                  );
                })}
              </div>
              {isFree && (
                <button onClick={() => setShowUpgrade(true)}
                  style={{ width: '100%', marginTop: 14, padding: '10px', border: `1px solid ${BORDER}`, borderRadius: 9, background: SURFACE, fontSize: 12, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Lock size={11} /> Voir les 7 autres moteurs — Starter
                </button>
              )}
            </div>
          </div>
        </FadeUp>

        {/* ── 3. Points bloquants (signaux techniques) ── */}
        {technicalBad.length > 0 && (
          <FadeUp delay={0.12}>
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 2px' }}>Ce qui bloque votre visibilité</p>
                  <p style={{ fontSize: 11.5, color: INK3, margin: 0 }}>{technicalBad.length} point{technicalBad.length > 1 ? 's' : ''} à corriger pour progresser</p>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${CORAL}12`, border: `1px solid ${CORAL}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: CORAL }}>{technicalBad.length}</span>
                </div>
              </div>
              <div style={{ padding: '10px 14px 14px' }}>
                {technicalBad.map((t, i) => (
                  <button key={i} onClick={() => setActiveDrawer({ id: `tech_${t.id}`, text: t.fix, type: 'fix' })}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'none', border: `1px solid ${BORDER}`, borderRadius: 11, cursor: 'pointer', textAlign: 'left', fontFamily: F, marginBottom: i < technicalBad.length - 1 ? 8 : 0, transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${CORAL}10`, border: `1px solid ${CORAL}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertTriangle size={13} color={CORAL} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '0 0 2px' }}>{t.label}</p>
                      <p style={{ fontSize: 11.5, color: INK3, margin: 0 }}>{t.desc}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: CORAL, flexShrink: 0 }}>Corriger →</span>
                  </button>
                ))}
              </div>
              {/* Points OK */}
              {technical.filter(t => t.ok).length > 0 && (
                <div style={{ padding: '12px 18px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {technical.filter(t => t.ok).map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: `${GREEN}10`, border: `1px solid ${GREEN}25`, borderRadius: 20 }}>
                      <CheckCircle2 size={11} color={GREEN} />
                      <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeUp>
        )}

        {/* ── 4. Problèmes IA identifiés ── */}
        {issues.length > 0 && (
          <FadeUp delay={0.16}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 2px' }}>Pourquoi les IA ne vous recommandent pas</p>
                  <p style={{ fontSize: 11.5, color: INK3, margin: 0 }}>Cliquez sur chaque point pour voir comment le corriger</p>
                </div>
              </div>
              {issues.map((issue, i) => (
                <IssueCard
                  key={i} issue={issue} index={i}
                  onClick={() => setActiveDrawer({ id: `issue_${i}`, text: issue.problem || issue.text, type: 'fix' })}
                  status={tasks[`issue_${i}`]?.status || 'todo'}
                  saving={false}
                />
              ))}
            </div>
          </FadeUp>
        )}

        {/* ── 5. Trafic ── */}
        <FadeUp delay={0.20}>
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 2px' }}>Trafic et notoriété</p>
                <p style={{ fontSize: 11.5, color: INK3, margin: 0 }}>Combien de personnes vous trouvent aujourd'hui</p>
              </div>
              {hasGsc
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: GREEN }}>● Search Console</span>
                : <button onClick={() => navigate('/connections')} style={{ padding: '5px 11px', border: `1px solid ${BORDER}`, borderRadius: 6, background: WHITE, fontSize: 11.5, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
                    Connecter Google
                  </button>
              }
            </div>
            <div style={{ padding: '16px 18px 18px' }}>
              {(() => {
                const metrics = hasGsc ? [
                  { label: 'Clics / mois', value: gscData.data.totalClicks?.toLocaleString('fr') || '—', sub: 'depuis Google' },
                  { label: 'Impressions', value: gscData.data.totalImpressions?.toLocaleString('fr') || '—', sub: 'personnes vous voient' },
                  { label: 'Taux de clic', value: `${gscData.data.avgCtr}%`, sub: 'cliquent sur vous' },
                  { label: 'Position moy.', value: `#${gscData.data.avgPosition}`, sub: 'dans les résultats' },
                ] : [
                  { label: 'Visiteurs / mois', value: fmt(data.organic_traffic), sub: 'trafic organique' },
                  { label: 'Mots-clés', value: fmt(data.organic_keywords), sub: 'expressions trouvées' },
                  { label: 'Liens entrants', value: fmt(data.backlinks), sub: 'sites qui pointent vers vous' },
                  { label: 'Autorité', value: data.authority_score ? String(data.authority_score) : '—', sub: 'score de confiance' },
                ];
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {metrics.map((m, i) => (
                      <div key={i} style={{ padding: '12px 14px', background: SURFACE, borderRadius: 11 }}>
                        <p style={{ fontSize: 9.5, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>{m.label}</p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: INK, margin: '0 0 2px', letterSpacing: '-0.04em', lineHeight: 1 }}>{m.value}</p>
                        <p style={{ fontSize: 10.5, color: INK3, margin: 0 }}>{m.sub}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </FadeUp>

        {/* ── 6. Plan d'action ── */}
        <FadeUp delay={0.24}>
          {isFree ? (
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 10, position: 'relative' }}>
              <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 2px' }}>Votre plan de visibilité personnalisé</p>
                <p style={{ fontSize: 11.5, color: INK3, margin: 0 }}>Actions concrètes classées par impact</p>
              </div>
              <div style={{ filter: 'blur(3px)', pointerEvents: 'none', opacity: 0.4 }}>
                {fakePlan.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < fakePlan.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: INK3 }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 2px' }}>{item.action_title}</p>
                      <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{item.engine} · {item.platform}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,247,244,0.6)', backdropFilter: 'blur(2px)' }}>
                <button onClick={() => setShowUpgrade(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: CARD_DARK, color: WHITE, border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: F, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  <Sparkles size={14} color={CORAL} /> Débloquer mon plan personnalisé
                </button>
              </div>
            </div>
          ) : plan.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 2px' }}>Votre plan de visibilité</p>
                  <p style={{ fontSize: 11.5, color: INK3, margin: 0 }}>{doneTasks}/{plan.length} actions réalisées</p>
                </div>
                {doneTasks > 0 && (
                  <div style={{ padding: '5px 12px', background: `${GREEN}12`, border: `1px solid ${GREEN}30`, borderRadius: 20 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: GREEN }}>{Math.round(doneTasks / plan.length * 100)}% accompli</span>
                  </div>
                )}
              </div>
              {plan.map((item, i) => (
                <PlanCard
                  key={i} item={item} index={i}
                  status={tasks[i]?.status || 'todo'}
                  onStatusChange={(s) => handleTaskStatus(i, s, item)}
                  saving={!!savingTask[i]}
                  onGuide={setActiveDrawer}
                  engineLogos={AI_LOGOS}
                />
              ))}
            </div>
          )}
        </FadeUp>

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {activeDrawer && (
        <FixDrawer issue={activeDrawer} profile={data} isFree={isFree}
          onClose={() => setActiveDrawer(null)} onUpgrade={() => setShowUpgrade(true)} />
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)}
        feature="l'analyse complète" requiredPlan="starter"
        description="Débloquez les 7 moteurs IA manquants, le plan d'actions personnalisé et les guides de correction." />
    </div>
  );
}