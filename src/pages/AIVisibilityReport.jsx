import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Link2, ExternalLink, ChevronRight, ChevronDown, X, ArrowRight, Zap, Clock, Circle, AlertTriangle, Globe, Lock } from 'lucide-react';
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

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ── Score circle ──────────────────────────────────────────────────────────────
function ScoreCircle({ value, size = 88, color }) {
  const R = size / 2 - 6;
  const circ = 2 * Math.PI * R;
  const pct = Math.min(value / 100, 1);
  const c = color || (value >= 65 ? '#10B981' : value >= 35 ? '#F59E0B' : '#EF4444');
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="#EBEBEB" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={c} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size > 70 ? 26 : 16, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.04em' }}>{value}</span>
        <span style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>/100</span>
      </div>
    </div>
  );
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({ data: bars, height = 80 }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {bars.map((b, i) => {
        const c = b.value >= 65 ? '#10B981' : b.value >= 35 ? '#F59E0B' : '#EF4444';
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: INK3 }}>{b.value}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(b.value / max) * (height - 20)}px` }}
              transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: '100%', background: c, borderRadius: '4px 4px 0 0', minHeight: 3 }}
            />
            <span style={{ fontSize: 8, color: INK3, textAlign: 'center', lineHeight: 1.2 }}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Horizontal score bar ──────────────────────────────────────────────────────
function HBar({ value, color, label }) {
  const c = color || (value >= 65 ? '#10B981' : value >= 35 ? '#F59E0B' : '#EF4444');
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: INK2 }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{value}</span>
      </div>
      <div style={{ height: 6, background: '#F0F0F0', borderRadius: 3 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: c, borderRadius: 3 }}
        />
      </div>
    </div>
  );
}

// ── Side drawer for fix instructions ─────────────────────────────────────────
function FixDrawer({ issue, profile, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issue) return;
    setLoading(true);
    setContent(null);
    base44.functions.invoke('generateFixInstruction', {
      issue: issue.text,
      profile: { site_url: profile?.site_url, business_name: profile?.identity_name, business_type: profile?.identity_industry },
    }).then(res => {
      if (res?.data && !res.data.error) setContent(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [issue?.id]);

  if (!issue) return null;
  const steps = content?.steps || content?.instructions || [];
  const summary = content?.summary || content?.explanation || '';
  const timeEstimate = content?.time_estimate || content?.effort || '';

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: '100%', maxWidth: 420, background: WHITE, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', fontFamily: F, overflowY: 'auto' }}
      >
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 6, background: issue.severity === 'error' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${issue.severity === 'error' ? '#FECACA' : '#FDE68A'}`, marginBottom: 10 }}>
                <AlertTriangle size={11} color={issue.severity === 'error' ? '#EF4444' : '#D97706'} />
                <span style={{ fontSize: 10, fontWeight: 700, color: issue.severity === 'error' ? '#EF4444' : '#D97706' }}>
                  {issue.severity === 'error' ? 'Problème important' : 'Point à améliorer'}
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
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: SURFACE, borderRadius: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: INK, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: INK3 }}>L'IA prépare votre guide…</span>
              </div>
              {[80, 60, 70].map((w, i) => (
                <div key={i} style={{ height: 12, borderRadius: 6, background: `linear-gradient(90deg,#F0F0EE 25%,#E6E6E4 50%,#F0F0EE 75%)`, backgroundSize: '400px 100%', animation: 'shimmer 1.5s infinite', width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <div>
              {summary && (
                <div style={{ padding: '14px 16px', background: SURFACE, borderRadius: 12, marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.7 }}>{summary}</p>
                </div>
              )}
              {steps.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>Étapes à suivre</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {steps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '14px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: WHITE }}>{i + 1}</span>
                        </div>
                        <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65, flex: 1 }}>
                          {typeof step === 'string' ? step : step.description || step.text || JSON.stringify(step)}
                        </p>
                      </div>
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

// ── Locked section overlay ────────────────────────────────────────────────────
function LockedSection({ children, label = 'Plan Starter requis', onUpgrade }) {
  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.6 }}>
        {children}
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,247,245,0.7)', backdropFilter: 'blur(2px)' }}>
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 24px', textAlign: 'center', maxWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <Lock size={16} color="#7C6AF4" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: INK, marginBottom: 5, letterSpacing: '-0.01em' }}>{label}</div>
          <div style={{ fontSize: 11, color: INK3, marginBottom: 14, lineHeight: 1.5 }}>Débloquez cette section avec un plan supérieur.</div>
          <button onClick={onUpgrade}
            style={{ width: '100%', padding: '9px', background: INK, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Zap size={11} fill={WHITE} stroke="none" /> Passer au Starter
          </button>
        </div>
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
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1px solid ${cfg.border}`, background: cfg.bg, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: cfg.color, fontFamily: F }}>
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

// ── Engine logos ──────────────────────────────────────────────────────────────
const ENGINE_COLORS = { chatgpt: '#10A37F', gemini: '#4285F4', claude: '#D97706', mistral: '#FF6B35', llama: '#5046E4', perplexity: '#1E293B', grok: '#1DA1F2', copilot: '#0078D4' };
const ENGINE_LABELS = { chatgpt: 'ChatGPT', gemini: 'Gemini', claude: 'Claude', mistral: 'Mistral', llama: 'Llama', perplexity: 'Perplexity', grok: 'Grok', copilot: 'Copilot' };
const FREE_ENGINES = ['gemini'];

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
        setTasks(prev => ({ ...prev, [index]: { ...prev[index], status: newStatus } }));
      } else {
        const created = await base44.entities.ActionTask.create({
          user_id: user.id, site_url: data?.site_url || '',
          action_index: index, action_title: item.action_title || '',
          engine: item.engine || '', platform: item.platform || '', status: newStatus,
        });
        setTasks(prev => ({ ...prev, [index]: created }));
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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E8E8E8', borderTopColor: INK, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', fontFamily: F }}>
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
  // Only use real issues from scan — never pollute score with fake locked data
  const issues = data.issues || [];
  const plan = data.injection_plan || [];
  const doneTasks = plan.filter((_, i) => tasks[i]?.status === 'done').length;
  const hasGsc = gscData?.connected && gscData?.data;

  const technical = [
    { id: 'schema', label: 'Votre site est bien compris par les assistants IA', ok: data.has_schema_markup, fix: 'Votre site ne transmet pas correctement ses informations aux IA — elles ne savent pas précisément ce que vous vendez.', severity: 'error' },
    { id: 'gmb', label: 'Votre entreprise apparaît sur Google Maps', ok: data.has_google_business, fix: 'Sans fiche Google, votre entreprise est invisible pour les recherches locales et ne peut pas être recommandée dans votre zone.', severity: 'error' },
    { id: 'ssl', label: 'Votre site est sécurisé (cadenas)', ok: data.has_ssl, fix: 'Un site sans cadenas est pénalisé par les moteurs de recherche et inspire moins confiance aux visiteurs.', severity: 'warning' },
    { id: 'mobile', label: 'Votre site s\'affiche bien sur mobile', ok: data.has_mobile_friendly, fix: 'Plus de 60% des recherches se font sur téléphone — un site non adapté perd la majorité de son audience.', severity: 'warning' },
  ];

  // Engines available for this plan
  const allEngines = ['chatgpt', 'gemini', 'claude', 'mistral', 'llama', 'perplexity', 'grok', 'copilot'];
  const visibleEngines = isFree ? FREE_ENGINES : allEngines;
  const engineBars = allEngines.map(e => ({ label: ENGINE_LABELS[e], value: data[`${e}_score`] || 0, locked: isFree && !FREE_ENGINES.includes(e), color: ENGINE_COLORS[e] }));

  // Fake blurred competitor data (never shown as real)
  const fakeCompetitors = [
    { domain: 'concurrent-1.fr', authority_score: 67, organic_traffic: 42000 },
    { domain: 'concurrent-2.fr', authority_score: 54, organic_traffic: 18500 },
    { domain: 'concurrent-3.fr', authority_score: 71, organic_traffic: 65000 },
  ];
  const realCompetitors = data.competitors?.filter(c => typeof c === 'object' && c.domain && c.domain !== domainLabel) || [];
  const competitorsToShow = isFree ? fakeCompetitors : realCompetitors;

  // Fake blurred action plan (for free)
  const fakePlan = [
    { action_title: 'Publier une page de données primaires', engine: 'Perplexity', platform: 'LinkedIn Pulse', impact: 'high', effort: 'medium', gap: 'Vos concurrents apparaissent dans les réponses IA car ils ont du contenu structuré.', action_detail: 'Créez un article de fond sur votre expertise principale et publiez-le sur les plateformes référencées par les IA.' },
    { action_title: 'Renforcer la présence Google Business', engine: 'Gemini', platform: 'Google Maps', impact: 'high', effort: 'low', gap: 'Votre fiche Google n\'est pas optimisée pour les requêtes locales.', action_detail: 'Complétez votre fiche Google avec des photos récentes, vos horaires et répondez aux avis.' },
    { action_title: 'Ajouter des balises Schema structurées', engine: 'ChatGPT', platform: 'Votre site', impact: 'high', effort: 'medium', gap: 'Les IA ne comprennent pas bien votre offre sans données structurées.', action_detail: 'Implémentez les schémas Organization, Product et FAQ sur vos pages clés.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      {/* ── Header ── */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 20, paddingTop: 'max(0px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/app')} style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={14} color={INK2} />
            </button>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Visibilité IA</p>
              <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{domainLabel}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isFree && (
              <button onClick={() => setShowUpgrade(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#EEF0FF', border: '1px solid #C7D2FE', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#7C6AF4', cursor: 'pointer', fontFamily: F }}>
                <Zap size={10} fill="#7C6AF4" stroke="none" /> Passer au Starter
              </button>
            )}
            <button onClick={handleRescan} disabled={scanning}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', border: `1px solid ${BORDER}`, borderRadius: 9, background: WHITE, fontSize: 11, fontWeight: 600, color: scanning ? INK3 : INK2, cursor: scanning ? 'wait' : 'pointer', fontFamily: F }}>
              <RefreshCw size={11} style={{ animation: scanning ? 'spin 0.8s linear infinite' : 'none' }} />
              {scanning ? 'Analyse…' : 'Actualiser'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 100px' }}>

        {/* ── Score principal ── */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '24px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <ScoreCircle value={score} size={96} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>LLM Resonance Score™</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.03em', marginBottom: 6 }}>{data.identity_name || domainLabel}</div>
              <p style={{ fontSize: 12, color: INK3, margin: 0, lineHeight: 1.6 }}>
                {score >= 65 ? 'Votre site est bien référencé auprès des assistants IA.' :
                  score >= 35 ? 'Des améliorations peuvent significativement augmenter votre visibilité.' :
                  'Votre site est peu visible sur les assistants IA — des actions prioritaires sont recommandées.'}
              </p>
              {isFree && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '3px 10px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 20 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#D97706' }}>⚡ Scan Lite — 1 moteur analysé</span>
                </div>
              )}
            </div>
            <a href={data.site_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: INK3, textDecoration: 'none', padding: '6px 10px', border: `1px solid ${BORDER}`, borderRadius: 8 }}>
              <Globe size={11} /> Voir le site <ExternalLink size={9} />
            </a>
          </div>
          {data.shock_insight && (
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#FEF9EE', borderRadius: 10, borderLeft: '3px solid #FDE68A' }}>
              <p style={{ fontSize: 12, color: '#92400E', margin: 0, lineHeight: 1.7 }}>💡 {data.shock_insight}</p>
            </div>
          )}
        </div>

        {/* ── 3 barres de score ── */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 16 }}>Détail des scores</div>
          <HBar value={scoreVis} label="Présence chez les assistants IA" />
          <HBar value={scoreClarity} label="Clarté du message" />
          <HBar value={scoreCommerce} label="Signaux commerciaux" />
        </div>

        {/* ── Moteurs IA — graphique barres ── */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>Score par moteur IA</div>
              <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{isFree ? '1 moteur analysé — 7 de plus avec Starter' : `${allEngines.length} moteurs analysés`}</div>
            </div>
            {isFree && (
              <button onClick={() => setShowUpgrade(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#EEF0FF', border: '1px solid #C7D2FE', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#7C6AF4', cursor: 'pointer', fontFamily: F }}>
                <Lock size={9} /> Débloquer
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
            {engineBars.map((b, i) => {
              const c = b.locked ? '#E0E0E0' : (b.color || (b.value >= 65 ? '#10B981' : b.value >= 35 ? '#F59E0B' : '#EF4444'));
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: b.locked ? '#D0D0D0' : INK3 }}>{b.locked ? '?' : b.value}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: b.locked ? 24 : `${Math.max((b.value / 100) * 80, 4)}px` }}
                    transition={{ delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: '100%', background: b.locked ? 'repeating-linear-gradient(45deg,#E8E8E8,#E8E8E8 3px,#F3F3F3 3px,#F3F3F3 6px)' : c, borderRadius: '4px 4px 0 0', minHeight: 4 }}
                  />
                  {b.locked && (
                    <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)' }}>
                      <Lock size={7} color="#C0C0C0" />
                    </div>
                  )}
                  <span style={{ fontSize: 7, color: b.locked ? '#D0D0D0' : INK3, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{b.label}</span>
                </div>
              );
            })}
          </div>
          {/* Bottom baseline */}
          <div style={{ height: 1, background: BORDER, marginTop: 4 }} />
        </div>

        {/* ── Problèmes détectés ── */}
        {issues.length > 0 && (
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Problèmes à corriger</p>
                <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>Cliquez sur un problème pour voir comment le corriger</p>
              </div>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#EF4444' }}>{issues.length}</span>
            </div>
            {issues.map((issue, i) => (
              <button key={i}
                onClick={() => setActiveDrawer({ id: `issue_${i}`, text: issue.problem, severity: issue.severity })}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < issues.length - 1 ? `1px solid ${BORDER}` : 'none', background: WHITE, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F, transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: issue.severity === 'error' ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: INK2, lineHeight: 1.5 }}>{issue.problem}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: INK3, flexShrink: 0 }}>Corriger <ChevronRight size={12} /></div>
              </button>
            ))}
          </div>
        )}

        {/* ── Signaux techniques ── */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Vérifications techniques</p>
            <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>Cliquez sur un point rouge pour savoir comment le corriger</p>
          </div>
          {technical.map((t, i) => (
            <div key={i}
              onClick={!t.ok ? () => setActiveDrawer({ id: `tech_${t.id}`, text: t.fix, severity: t.severity }) : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < technical.length - 1 ? `1px solid ${BORDER}` : 'none', cursor: !t.ok ? 'pointer' : 'default', transition: 'background 0.12s' }}
              onMouseEnter={e => { if (!t.ok) e.currentTarget.style.background = SURFACE; }}
              onMouseLeave={e => { e.currentTarget.style.background = WHITE; }}>
              {t.ok ? <CheckCircle size={17} color="#10B981" style={{ flexShrink: 0 }} /> : <XCircle size={17} color="#EF4444" style={{ flexShrink: 0 }} />}
              <span style={{ flex: 1, fontSize: 13, color: t.ok ? INK2 : INK }}>{t.label}</span>
              {!t.ok && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#EF4444', flexShrink: 0 }}>Corriger <ChevronRight size={12} /></div>}
              {t.ok && <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>✓ OK</span>}
            </div>
          ))}
        </div>

        {/* ── Données de trafic ── */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Trafic & visibilité</p>
            {hasGsc
              ? <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} /> Données réelles connectées</span>
              : <button onClick={() => navigate('/connections')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: INK2, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: F }}><Link2 size={10} /> Connecter Google</button>
            }
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {(hasGsc ? [
              { label: 'Clics ce mois', value: gscData.data.totalClicks?.toLocaleString('fr') || '–' },
              { label: 'Impressions', value: gscData.data.totalImpressions?.toLocaleString('fr') || '–' },
              { label: 'Taux de clic', value: `${gscData.data.avgCtr}%` },
              { label: 'Position moyenne', value: String(gscData.data.avgPosition) },
            ] : [
              { label: 'Visiteurs / mois', value: fmt(data.organic_traffic) },
              { label: 'Mots recherchés', value: fmt(data.organic_keywords) },
              { label: 'Liens entrants', value: fmt(data.backlinks) },
              { label: 'Score d\'autorité', value: data.authority_score ? String(data.authority_score) : '–' },
            ]).map((m, i) => (
              <div key={i} style={{ padding: '14px 18px', borderBottom: i < 2 ? `1px solid ${BORDER}` : 'none', borderRight: i % 2 === 0 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ fontSize: 10, color: INK3, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.03em', lineHeight: 1 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Plan d'actions (bloqué pour free) ── */}
        {(plan.length > 0 || isFree) && (
          <div style={{ marginBottom: 14 }}>
            {isFree ? (
              <LockedSection
                label="Plan d'actions — Starter requis"
                onUpgrade={() => setShowUpgrade(true)}
              >
                <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Plan d'amélioration</p>
                    <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>3 actions prioritaires personnalisées</p>
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
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#F0FDF4', padding: '2px 7px', borderRadius: 20 }}>Impact fort</span>
                    </div>
                  ))}
                </div>
              </LockedSection>
            ) : (
              plan.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Plan d'amélioration</p>
                      <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>{doneTasks}/{plan.length} actions réalisées</p>
                    </div>
                    <div style={{ height: 4, width: 80, background: BORDER, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${plan.length ? (doneTasks / plan.length) * 100 : 0}%`, background: INK, borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {plan.map((item, i) => {
                      const task = tasks[i];
                      const status = task?.status || 'todo';
                      const isOpen = expandedAction === i;
                      const isHigh = item.impact === 'high';
                      return (
                        <div key={i} style={{ background: WHITE, border: `1px solid ${status === 'done' ? '#BBF7D0' : BORDER}`, borderRadius: 14, overflow: 'hidden', opacity: status === 'done' ? 0.65 : 1, transition: 'opacity 0.2s' }}>
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
                                {item.platform && `Via ${item.platform}`}{item.effort && ` · ${item.effort === 'low' ? 'Rapide' : item.effort === 'medium' ? 'Moyen' : 'Long'}`}
                              </div>
                            </button>
                            <div style={{ flexShrink: 0, opacity: savingTask[i] ? 0.5 : 1 }}>
                              <StatusPicker value={status} onChange={s => handleTaskStatus(i, s, item)} />
                            </div>
                            <button onClick={() => setExpandedAction(isOpen ? null : i)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}>
                              <ChevronDown size={14} color={INK3} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                          </div>
                          {isOpen && (
                            <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {item.gap && (
                                <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 10 }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px' }}>Pourquoi c'est important</p>
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
                                onClick={() => setActiveDrawer({ id: `plan_${i}`, text: item.action_title + ' — ' + item.action_detail, severity: 'info', isPlan: true, item })}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: SURFACE, color: INK, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                                <Zap size={13} /> Obtenir un guide étape par étape <ArrowRight size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ── Concurrents (bloqué pour free) ── */}
        {(competitorsToShow.length > 0) && (
          isFree ? (
            <LockedSection label="Analyse concurrents — Starter requis" onUpgrade={() => setShowUpgrade(true)}>
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>Sites concurrents détectés</p>
                {fakeCompetitors.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < fakeCompetitors.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{c.domain}</div>
                      <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{fmt(c.organic_traffic)} visiteurs/mois</div>
                    </div>
                    <div style={{ padding: '5px 10px', background: SURFACE, borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: INK }}>{c.authority_score}</div>
                      <div style={{ fontSize: 8, color: INK3, textTransform: 'uppercase' }}>score</div>
                    </div>
                  </div>
                ))}
              </div>
            </LockedSection>
          ) : (
            <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>Sites concurrents détectés</p>
              {realCompetitors.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < realCompetitors.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{c.domain}</div>
                    {c.organic_traffic > 0 && <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{fmt(c.organic_traffic)} visiteurs/mois</div>}
                  </div>
                  {c.authority_score != null && (
                    <div style={{ padding: '5px 10px', background: SURFACE, borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: INK }}>{c.authority_score}</div>
                      <div style={{ fontSize: 8, color: INK3, textTransform: 'uppercase' }}>score</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>

      {activeDrawer && <FixDrawer issue={activeDrawer} profile={data} onClose={() => setActiveDrawer(null)} />}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="l'analyse complète"
        requiredPlan="starter"
        description="Débloquez les 7 moteurs IA manquants, le plan d'actions personnalisé et l'analyse de vos concurrents."
      />
    </div>
  );
}