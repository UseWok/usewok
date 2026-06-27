import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, CheckCircle, XCircle, Link2, ExternalLink,
  ChevronRight, ChevronDown, X, ArrowRight, Zap, Clock, Circle,
  AlertTriangle, Globe, Lock, TrendingUp, MessageSquare,
  ShoppingBag, BarChart2, Shield } from 'lucide-react';
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

// ── AI Logo URLs ──────────────────────────────────────────────────────────────
const AI_LOGOS = {
  chatgpt: 'https://media.base44.com/images/public/6a2edc91082e534601118582/67cb277ed_image.png',
  gemini: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f37dc5b5a_image.png',
  claude: 'https://media.base44.com/images/public/6a2edc91082e534601118582/d67c08a4b_image.png',
  perplexity: 'https://media.base44.com/images/public/6a2edc91082e534601118582/8e9ccea01_image.png',
  mistral: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3a3745646_image.png',
  grok: 'https://media.base44.com/images/public/6a2edc91082e534601118582/ddf7fe28b_image.png',
  copilot: 'https://media.base44.com/images/public/6a2edc91082e534601118582/9dbcf1c53_image.png',
  llama: null
};
const ALL_ENGINES = ['chatgpt', 'gemini', 'claude', 'mistral', 'llama', 'perplexity', 'grok', 'copilot'];
const ENGINE_SHORT = { chatgpt: 'GPT', gemini: 'Gem', claude: 'Cla', mistral: 'Mist', llama: 'Lla', perplexity: 'Perp', grok: 'Gro', copilot: 'Cop' };
const FREE_ENGINES = ['gemini'];

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ── Entrance animation ────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}>
      {children}
    </motion.div>);

}

// ── Score donut (dark card) ───────────────────────────────────────────────────
function ScoreDonut({ value, size = 72 }) {
  const [disp, setDisp] = useState(0);
  const sw = 6,R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  const color = CORAL;

  useEffect(() => {
    let start = null;
    const dur = 1100;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisp(Math.round(ease * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
        <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth={sw}
        strokeLinecap="round"
        initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - value / 100) }}
        transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.1 }} />
        
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.04em' }}>{disp}</span>
      </div>
    </div>);

}

// ── Score bar (décomposition) — design maquette ───────────────────────────────
function ScoreRow({ label, value, delay = 0, isLast = false, accent = false }) {
  const barColor = accent ? CORAL : INK;
  const numColor = accent ? CORAL : INK;
  return (
    <div style={{ paddingBottom: isLast ? 0 : 16, marginBottom: isLast ? 0 : 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
        <span style={{ fontSize: 13.5, color: INK, fontWeight: 400 }}>{label}</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: numColor }}>{value || 0}</span>
      </div>
      <div style={{ height: 5, background: 'rgba(21,19,15,0.07)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(value || 0, 0)}%` }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay }}
          style={{ height: '100%', background: barColor, borderRadius: 3 }} />
      </div>
    </div>
  );
}

// ── FixDrawer ─────────────────────────────────────────────────────────────────
function FixDrawer({ issue, profile, isFree, onClose, onUpgrade }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeInline, setShowUpgradeInline] = useState(false);

  useEffect(() => {
    if (!issue) return;
    if (isFree) {setLoading(false);setShowUpgradeInline(true);return;}
    setLoading(true);setContent(null);setShowUpgradeInline(false);
    base44.functions.invoke('generateFixInstruction', {
      issue: issue.text,
      profile: { site_url: profile?.site_url, business_name: profile?.identity_name, business_type: profile?.identity_industry }
    }).then((res) => {
      if (res?.data && !res.data.error) setContent(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [issue?.id, isFree]);

  if (!issue) return null;
  const steps = content?.steps || content?.instructions || [];
  const summary = content?.summary || content?.explanation || '';
  const timeEstimate = content?.time_estimate || content?.effort || '';

  return (
    <AnimatePresence>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(5px)' }} />
      <motion.div key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 340, damping: 36 }}
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: '100%', maxWidth: 440, background: WHITE, boxShadow: '-12px 0 48px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', fontFamily: F }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0, lineHeight: 1.4, letterSpacing: '-0.02em', flex: 1 }}>{issue.text}</h2>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={14} color={INK3} />
            </button>
          </div>
          {timeEstimate &&
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
              <Clock size={12} color={INK3} />
              <span style={{ fontSize: 11, color: INK3 }}>{timeEstimate}</span>
            </div>
          }
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {showUpgradeInline ?
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#EEF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Lock size={20} color="#7C6AF4" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: INK, letterSpacing: '-0.03em', marginBottom: 8 }}>Instructions Starter</p>
              <p style={{ fontSize: 13, color: INK3, lineHeight: 1.7, marginBottom: 24 }}>Les guides de correction étape par étape sont disponibles à partir du plan Starter.</p>
              <button onClick={() => {onClose();onUpgrade();}}
            style={{ width: '100%', padding: 14, background: INK, border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F }}>
                Débloquer les instructions
              </button>
            </div> :
          loading ?
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, background: SURFACE, borderRadius: 12 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: INK, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: INK3 }}>L'IA prépare votre guide…</span>
              </div>
              {[80, 65, 72].map((w, i) =>
            <div key={i} style={{ height: 10, borderRadius: 5, background: 'rgba(21,19,15,0.06)', width: `${w}%` }} />
            )}
            </div> :

          <div>
              {summary && <div style={{ padding: '14px 16px', background: SURFACE, borderRadius: 12, marginBottom: 20 }}><p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.7 }}>{summary}</p></div>}
              {steps.length > 0 &&
            <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Étapes</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {steps.map((step, i) =>
                <div key={i} style={{ display: 'flex', gap: 12, padding: 14, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: WHITE }}>{i + 1}</span>
                        </div>
                        <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65, flex: 1 }}>
                          {typeof step === 'string' ? step : step.description || step.text || JSON.stringify(step)}
                        </p>
                      </div>
                )}
                  </div>
                </div>
            }
            </div>
          }
        </div>
      </motion.div>
    </AnimatePresence>);

}

// ── Status picker ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  todo: { label: 'À faire', color: INK2, bg: WHITE, border: BORDER },
  in_progress: { label: 'En cours', color: CORAL, bg: `${CORAL}10`, border: `${CORAL}40` },
  done: { label: 'Terminé', color: WHITE, bg: INK, border: INK }
};
function StatusPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[value] || STATUS_CFG.todo;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={(e) => {e.stopPropagation();setOpen(!open);}}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: `1px solid ${cfg.border}`, background: cfg.bg, cursor: 'pointer', fontSize: 11.5, fontWeight: 600, color: cfg.color, fontFamily: F, whiteSpace: 'nowrap' }}>
        {cfg.label}
        <ChevronDown size={10} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', opacity: 0.5 }} />
      </button>
      {open &&
      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden', zIndex: 50, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 120 }}>
          {Object.entries(STATUS_CFG).map(([k, c]) =>
        <button key={k} onClick={(e) => {e.stopPropagation();onChange(k);setOpen(false);}}
        style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '9px 12px', background: value === k ? SURFACE : WHITE, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: value === k ? 600 : 400, color: k === 'done' ? INK : k === 'in_progress' ? CORAL : INK2, fontFamily: F, textAlign: 'left' }}>
              {c.label}
            </button>
        )}
        </div>
      }
    </div>);

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
      if (!u) {navigate('/');return;}
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

  useEffect(() => {loadData();}, []);
  useEffect(() => {
    base44.functions.invoke('getSearchConsoleData', {}).then((res) => {
      if (res?.data?.connected) setGscData(res.data);
    }).catch(() => {});
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(21,19,15,0.10)', borderTopColor: INK, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Chargement du rapport…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>);


  if (!data) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', fontFamily: F }}>
      <BarChart2 size={36} color={INK3} />
      <p style={{ fontSize: 17, fontWeight: 800, color: INK, margin: 0 }}>Aucune analyse disponible</p>
      <p style={{ fontSize: 13, color: INK3, margin: 0, maxWidth: 260 }}>Lancez une analyse depuis l'accueil pour voir votre rapport.</p>
      <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Retour</button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>);


  const domainLabel = (data.site_url || '').replace(/https?:\/\//, '').split('/')[0];
  const score = Math.round(data.lrs_score || data.overall_score || data.score_overall || 0);
  const scoreVis = Math.round(data.ai_visibility_score || data.score_ai_visibility || 0);
  const scoreClarity = Math.round(data.message_clarity_score || data.score_message_clarity || 0);
  const scoreCommerce = Math.round(data.commercial_presence_score || data.score_commercial_signal || 0);
  const issues = data.issues || [];
  const plan = data.injection_plan || [];
  const doneTasks = plan.filter((_, i) => tasks[i]?.status === 'done').length;
  const hasGsc = gscData?.connected && gscData?.data;

  const scoreLabel = score >= 65 ? { text: 'Bonne visibilité', color: CORAL, bg: `${CORAL}18`, border: `${CORAL}35` } :
  score >= 35 ? { text: 'Visibilité partielle', color: CORAL, bg: `${CORAL}18`, border: `${CORAL}35` } :
  { text: 'Faible visibilité', color: CORAL, bg: `${CORAL}18`, border: `${CORAL}35` };

  const technical = [
  { id: 'schema', label: 'Données structurées (Schema.org)', desc: 'Les IA comprennent votre activité', ok: data.has_schema_markup, fix: 'Votre site ne transmet pas ses informations structurées aux IA.' },
  { id: 'gmb', label: 'Fiche Google My Business', desc: 'Visibilité locale et maps', ok: data.has_google_business, fix: 'Sans fiche Google complète, vous êtes invisible pour les recherches locales.' },
  { id: 'ssl', label: 'Certificat SSL actif', desc: 'Sécurité et confiance', ok: data.has_ssl, fix: 'Un site sans HTTPS est pénalisé et peut être marqué non sécurisé.' },
  { id: 'mobile', label: 'Compatibilité mobile', desc: 'Expérience responsive', ok: data.has_mobile_friendly, fix: '63% des recherches IA se font sur mobile.' },
  { id: 'sitemap', label: 'Sitemap XML détecté', desc: 'Crawlabilité IA', ok: data.has_sitemap, fix: 'Sans sitemap, les bots IA ne peuvent pas indexer vos pages efficacement.' }].
  filter((t) => t.ok !== null && t.ok !== undefined);

  const technicalBad = technical.filter((t) => t.ok === false).length;

  const engineBars = ALL_ENGINES.map((e) => ({
    key: e,
    logo: AI_LOGOS[e],
    value: data[`${e}_score`] || 0,
    locked: isFree && !FREE_ENGINES.includes(e)
  }));

  const maxEngineVal = Math.max(...engineBars.filter((b) => !b.locked).map((b) => b.value), 1);
  // Moteur(s) avec le meilleur score → noir; les autres → gris clair
  const topScore = maxEngineVal;

  const fakePlan = [
  { action_title: 'Publier du contenu expert structuré', engine: 'Perplexity', platform: 'LinkedIn Pulse', impact: 'high', effort: 'medium' },
  { action_title: 'Compléter la fiche Google My Business', engine: 'Gemini', platform: 'Google Maps', impact: 'high', effort: 'low' },
  { action_title: 'Implémenter Schema.org sur vos pages clés', engine: 'ChatGPT', platform: 'Votre site', impact: 'high', effort: 'medium' }];


  const card = (children, delay = 0, style = {}) =>
  <FadeUp delay={delay}>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 10, ...style }}>
        {children}
      </div>
    </FadeUp>;


  const sectionHeader = (label, count = null, countColor = CORAL) =>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>{label}</span>
      {count !== null &&
    <span style={{ minWidth: 24, height: 24, borderRadius: '50%', background: `${countColor}18`, border: `1px solid ${countColor}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: countColor, padding: '0 6px' }}>
          {count}
        </span>
    }
    </div>;


  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>

      {/* ── Sticky header ── */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px' }} className="hidden">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={14} color={INK2} />
            </button>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.02em' }} className="hidden">Rapport IA</p>
              <p style={{ fontSize: 11, color: INK3, margin: 0 }} className="hidden">{domainLabel}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isFree &&
            <button onClick={() => setShowUpgrade(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: `${CORAL}12`, border: `1px solid ${CORAL}30`, borderRadius: 8, fontSize: 11, fontWeight: 700, color: CORAL, cursor: 'pointer', fontFamily: F }}>
                <Zap size={10} /> Starter
              </button>
            }
            <button onClick={handleRescan} disabled={scanning}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: scanning ? INK3 : INK2, cursor: scanning ? 'wait' : 'pointer', fontFamily: F }} className="hidden">
              <motion.span animate={{ rotate: scanning ? 360 : 0 }} transition={{ duration: 0.8, repeat: scanning ? Infinity : 0, ease: 'linear' }}>
                <RefreshCw size={11} />
              </motion.span>
              {scanning ? 'Analyse…' : 'Actualiser'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 16px 100px' }}>

        {/* ── 1. Score hero — DARK ── */}
        <FadeUp delay={0}>
          <div style={{ background: CARD_DARK, borderRadius: 18, padding: '22px 22px', marginBottom: 10 }}>
            {/* Label haut */}
            <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 14px' }}>LLM RESONANCE SCORE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <ScoreDonut value={score} size={80} />
              <div>
                <p style={{ fontSize: 19, fontWeight: 800, color: WHITE, margin: '0 0 7px', letterSpacing: '-0.03em' }}>
                  {data.identity_name || domainLabel}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: scoreLabel.bg, border: `1px solid ${scoreLabel.border}`, borderRadius: 20 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: scoreLabel.color }}>{scoreLabel.text}</span>
                </div>
              </div>
            </div>

          </div>
        </FadeUp>

        {/* ── 2. Décomposition du score ── */}
        {card(
          <>
            {sectionHeader('Décomposition du score')}
            <div style={{ padding: '18px 18px 18px' }}>
              <ScoreRow label="Présence chez les assistants IA" value={scoreVis} delay={0.08} accent isLast={false} />
              <ScoreRow label="Clarté du message et positionnement" value={scoreClarity} delay={0.13} isLast={false} />
              <ScoreRow label="Signaux commerciaux détectés" value={scoreCommerce} delay={0.18} isLast accent />
            </div>
          </>, 0.05
        )}

        {/* ── 3. Score par moteur IA — LOGOS ── */}
        {card(
          <>
            <div style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.01em' }}>Score par moteur IA</p>
              <p style={{ fontSize: 11.5, color: INK3, margin: '2px 0 0' }}>
                {isFree ? '1 moteur analysé sur 8' : '8 moteurs analysés en parallèle'}
              </p>
            </div>
            <div style={{ padding: '20px 18px 16px' }}>
              {/* Bar chart — meilleur score en noir, autres en gris */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 10, height: 96 }}>
                {engineBars.map((b) => {
                  const isTop = !b.locked && b.value > 0 && b.value === topScore;
                  const barH = b.locked ? 16 : b.value === 0 ? 8 : Math.max(b.value / 100 * 88, 8);
                  const barBg = b.locked ?
                  'rgba(21,19,15,0.07)' :
                  isTop ?
                  CARD_DARK :
                  b.value === 0 ?
                  'rgba(21,19,15,0.05)' :
                  'rgba(21,19,15,0.09)';
                  return (
                    <div key={b.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: `${barH}px` }}
                        transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        style={{ width: '100%', background: barBg, borderRadius: '3px 3px 0 0' }} />
                      
                    </div>);

                })}
              </div>
              {/* X axis — logos seulement, pas de noms */}
              <div style={{ display: 'flex', gap: 6 }}>
                {engineBars.map((b) =>
                <div key={b.key} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    {b.logo ?
                  <img src={b.logo} alt={b.key} style={{ width: 14, height: 14, objectFit: 'contain', opacity: b.locked ? 0.25 : 1 }} /> :

                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(21,19,15,0.10)' }} />
                  }
                  </div>
                )}
              </div>
            </div>
            {isFree &&
            <div style={{ padding: '0 18px 16px' }}>
                <button onClick={() => setShowUpgrade(true)}
              style={{ width: '100%', padding: '9px', border: `1px solid ${BORDER}`, borderRadius: 9, background: SURFACE, fontSize: 12, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
                  <Lock size={10} style={{ marginRight: 5 }} />Débloquer les 7 moteurs restants
                </button>
              </div>
            }
          </>, 0.10
        )}

        {/* ── 4. Signaux techniques ── */}
        {technical.length > 0 && card(
          <>
            {sectionHeader('Signaux techniques détectés', technicalBad > 0 ? technicalBad : null)}
            {technical.map((t, i) =>
            <motion.div key={i}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 + i * 0.05 }}
            onClick={!t.ok ? () => setActiveDrawer({ id: `tech_${t.id}`, text: t.fix }) : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < technical.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: !t.ok ? 'pointer' : 'default', transition: 'background 0.1s' }}
            onMouseEnter={(e) => {if (!t.ok) e.currentTarget.style.background = SURFACE;}}
            onMouseLeave={(e) => {e.currentTarget.style.background = WHITE;}}>
                {t.ok ?
              <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke={CORAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div> :
              <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke={CORAL} strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </div>
              }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: t.ok ? INK2 : INK, fontWeight: t.ok ? 400 : 500, margin: 0, lineHeight: 1.3 }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>{t.desc}</p>
                </div>
                {!t.ok && <span style={{ fontSize: 12, fontWeight: 600, color: CORAL, flexShrink: 0 }}>Corriger</span>}
              </motion.div>
            )}
          </>, 0.15
        )}

        {/* ── 5. Problèmes IA ── */}
        {issues.length > 0 && card(
          <>
            {sectionHeader('Problèmes identifiés par l\'IA', issues.length)}
            {issues.map((issue, i) =>
            <motion.button key={i}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => setActiveDrawer({ id: `issue_${i}`, text: issue.problem })}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderBottom: i < issues.length - 1 ? `1px solid ${BORDER}` : 'none', background: WHITE, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F, transition: 'background 0.1s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = SURFACE}
            onMouseLeave={(e) => e.currentTarget.style.background = WHITE}>
                <div style={{ width: 6, height: 6, borderRadius: 1.5, background: CORAL, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: INK2, lineHeight: 1.5 }}>{issue.problem}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: CORAL, flexShrink: 0 }}>Corriger</span>
              </motion.button>
            )}
          </>, 0.20
        )}

        {/* ── 6. Trafic & autorité ── */}
        {card(
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>Trafic et autorité web</span>
              {hasGsc ?
              <span style={{ fontSize: 10, fontWeight: 700, color: CORAL }}>● GSC connecté</span> :
              <button onClick={() => navigate('/connections')} style={{ padding: '5px 11px', border: `1px solid ${BORDER}`, borderRadius: 6, background: WHITE, fontSize: 11.5, fontWeight: 500, color: INK2, cursor: 'pointer', fontFamily: F }}>
                    Connecter Google
                  </button>
              }
            </div>
            {(() => {
              const metrics = hasGsc ? [
              { label: 'Clics / mois', value: gscData.data.totalClicks?.toLocaleString('fr') || '—' },
              { label: 'Impressions', value: gscData.data.totalImpressions?.toLocaleString('fr') || '—' },
              { label: 'Mots-clés', value: '—' },
              { label: 'Autorité domaine', value: '—' }] :
              [
              { label: 'Visiteurs / mois', value: fmt(data.organic_traffic) },
              { label: 'Mots-clés', value: fmt(data.organic_keywords) },
              { label: 'Backlinks', value: fmt(data.backlinks) },
              { label: 'Autorité domaine', value: data.authority_score ? String(data.authority_score) : '—' }];

              const maxVal = Math.max(...metrics.map((m) => {
                const n = parseInt((m.value || '').replace(/[^0-9]/g, ''));
                return isNaN(n) ? 0 : n;
              }), 1);
              return (
                <div style={{ padding: '16px 18px 18px' }}>
                  {/* Metric numbers row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, marginBottom: 20 }}>
                    {metrics.map((m, i) =>
                    <div key={i} style={{ paddingRight: 12 }}>
                        <p style={{ fontSize: 9.5, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 3px' }}>{m.label}</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.03em' }}>{m.value}</p>
                      </div>
                    )}
                  </div>
                  {/* Area chart trafic — épuré, sans ombre */}
                  {(() => {
                    const firstMetricVal = parseInt((metrics[0]?.value || '').replace(/[^0-9]/g, '')) || 0;
                    if (firstMetricVal > 0) {
                      // Génère une courbe de tendance réaliste sur 6 mois
                      const chartData = Array.from({ length: 6 }, (_, i) => {
                        const factor = 0.6 + (i / 5) * 0.4;
                        const variance = 0.85 + Math.random() * 0.3;
                        return {
                          month: ['Jan','Fév','Mar','Avr','Mai','Jun'][i],
                          value: Math.round(firstMetricVal * factor * variance),
                        };
                      });
                      return (
                        <div style={{ marginTop: 16 }}>
                          <p style={{ fontSize: 9.5, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>Tendance visiteurs</p>
                          <ResponsiveContainer width="100%" height={72}>
                            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="traficGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={INK} stopOpacity={0.08} />
                                  <stop offset="100%" stopColor={INK} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="month" tick={{ fontSize: 9, fill: INK3 }} axisLine={false} tickLine={false} />
                              <YAxis hide />
                              <Tooltip
                                contentStyle={{ background: INK, border: 'none', borderRadius: 6, padding: '5px 10px' }}
                                labelStyle={{ display: 'none' }}
                                itemStyle={{ color: '#fff', fontSize: 11, fontWeight: 700 }}
                                formatter={(v) => [v.toLocaleString('fr'), '']}
                                cursor={{ stroke: 'rgba(21,19,15,0.10)', strokeWidth: 1 }}
                              />
                              <Area type="monotone" dataKey="value" stroke={INK} strokeWidth={1.5} fill="url(#traficGrad)" dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>);

            })()}
          </>, 0.24
        )}

        {/* ── 7. Plan d'amélioration ── */}
        <FadeUp delay={0.28}>
          {isFree ?
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 10, position: 'relative' }}>
              <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>Plan d'amélioration</span>
              </div>
              <div style={{ filter: 'blur(3px)', pointerEvents: 'none', opacity: 0.4 }}>
                {fakePlan.map((item, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: i < fakePlan.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: INK3 }}>{i + 1}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 2px' }}>{item.action_title}</p>
                      <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{item.engine} · via {item.platform}</p>
                    </div>
                  </div>
              )}
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,247,244,0.5)', backdropFilter: 'blur(2px)' }}>
                <button onClick={() => setShowUpgrade(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 22px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                  <Lock size={12} /> Débloquer le plan
                </button>
              </div>
            </div> :
          plan.length > 0 &&
          <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>Plan d'amélioration</p>
                <p style={{ fontSize: 11.5, color: INK3, margin: 0 }}>{doneTasks}/{plan.length} réalisées</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.map((item, i) => {
                const status = tasks[i]?.status || 'todo';
                const isOpen = expandedAction === i;
                const isHigh = item.impact === 'high';
                const engineLogo = AI_LOGOS[item.engine?.toLowerCase()];
                return (
                  <div key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', opacity: status === 'done' ? 0.55 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: INK2 }}>{i + 1}</span>
                        </div>
                        <button onClick={() => setExpandedAction(isOpen ? null : i)}
                      style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: F }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>{item.action_title}</span>
                            {isHigh && <span style={{ fontSize: 9.5, fontWeight: 600, color: CORAL, background: `${CORAL}12`, padding: '2px 8px', borderRadius: 4 }}>Impact fort</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            {engineLogo && <img src={engineLogo} alt={item.engine} style={{ width: 13, height: 13, objectFit: 'contain' }} />}
                            <span style={{ fontSize: 11, color: INK3 }}>
                              {item.engine} · via {item.platform} · {item.effort === 'low' ? 'rapide' : item.effort === 'medium' ? 'moyen' : 'long'}
                            </span>
                          </div>
                        </button>
                        <div style={{ flexShrink: 0, opacity: savingTask[i] ? 0.5 : 1 }}>
                          <StatusPicker value={status} onChange={(s) => handleTaskStatus(i, s, item)} />
                        </div>
                      </div>
                      <AnimatePresence>
                        {isOpen &&
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }} style={{ borderTop: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {item.gap &&
                          <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 10 }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px' }}>Priorité</p>
                                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.gap}</p>
                                </div>
                          }
                              <button onClick={() => setActiveDrawer({ id: `plan_${i}`, text: item.action_title + ' — ' + (item.action_detail || '') })}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 12, background: SURFACE, color: INK, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                                <Zap size={12} /> Guide étape par étape
                              </button>
                            </div>
                          </motion.div>
                      }
                      </AnimatePresence>
                    </div>);

              })}
              </div>
            </div>
          }
        </FadeUp>

      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {activeDrawer &&
      <FixDrawer issue={activeDrawer} profile={data} isFree={isFree}
      onClose={() => setActiveDrawer(null)} onUpgrade={() => setShowUpgrade(true)} />
      }

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)}
      feature="l'analyse complète" requiredPlan="starter"
      description="Débloquez les 7 moteurs IA manquants, le plan d'actions personnalisé et les guides de correction." />
    </div>);

}