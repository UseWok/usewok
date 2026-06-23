import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Link2, ExternalLink, ChevronRight, ChevronDown, X, ArrowRight, Zap, Clock, Circle, AlertTriangle, Globe } from 'lucide-react';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';

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

// ── Score circle ─────────────────────────────────────────────────────────────
function ScoreCircle({ value, size = 88 }) {
  const R = size / 2 - 6;
  const circ = 2 * Math.PI * R;
  const pct = Math.min(value / 100, 1);
  const color = value >= 65 ? '#111110' : value >= 35 ? '#111110' : '#111110';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="#EBEBEB" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={INK} strokeWidth={5}
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

// ── Side drawer for fix instructions ────────────────────────────────────────
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101,
          width: '100%', maxWidth: 420,
          background: WHITE, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', fontFamily: F,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
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

        {/* Body */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', background: SURFACE, borderRadius: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: INK, animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: INK3 }}>L'IA prépare votre guide…</span>
              </div>
              {[80, 60, 70].map((w, i) => (
                <div key={i} style={{ height: 12, borderRadius: 6, background: `linear-gradient(90deg, #F0F0EE 25%, #E6E6E4 50%, #F0F0EE 75%)`, backgroundSize: '400px 100%', animation: 'shimmer 1.5s infinite', width: `${w}%` }} />
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
                  <p style={{ fontSize: 11, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                    Étapes à suivre
                  </p>
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

// ── Score card ────────────────────────────────────────────────────────────────
function ScoreCard({ label, value, desc, benchmark }) {
  const ok = value >= benchmark;
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <ScoreCircle value={value} size={64} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 11, color: INK3, lineHeight: 1.5, marginBottom: 6 }}>{desc}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: ok ? '#F0FDF4' : '#FEF9EE', border: `1px solid ${ok ? '#BBF7D0' : '#FDE68A'}` }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: ok ? '#059669' : '#D97706' }}>
            {ok ? '✓ Bon niveau' : '↗ À améliorer'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Status picker for action plan ────────────────────────────────────────────
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
        <Icon size={11} />
        {cfg.label}
        <ChevronDown size={10} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 130 }}>
          {Object.entries(STATUS_CFG).map(([k, c]) => {
            const I = c.icon;
            return (
              <button key={k} onClick={e => { e.stopPropagation(); onChange(k); setOpen(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: value === k ? SURFACE : WHITE, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: c.color, fontFamily: F, textAlign: 'left' }}>
                <I size={12} />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AIVisibilityReport() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null); // { id, text, severity }
  const [gscData, setGscData] = useState(null);
  const [tasks, setTasks] = useState({});
  const [user, setUser] = useState(null);
  const [savingTask, setSavingTask] = useState({});
  const [expandedAction, setExpandedAction] = useState(null);

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
      const active = getActiveDomain();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const matched = active ? (profiles.find(p => p.site_url === active.url) || null) : profiles[0] || null;
      if (matched) {
        let extra = {};
        try { extra = JSON.parse(matched.brand_keywords || '{}'); } catch {}
        setData({ ...matched, ...extra });
        // Load action tasks
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
      const res = await base44.functions.invoke('analyzeWebsite', { url: data.site_url });
      if (res?.data && !res.data.error) {
        const u = await base44.auth.me();
        if (u) {
          const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id });
          const matched = profiles.find(p => p.site_url === data.site_url);
          if (matched) {
            await base44.entities.BusinessProfile.update(matched.id, {
              brand_keywords: JSON.stringify(res.data),
              score_overall: res.data.overall_score || 0,
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
      <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
        ← Retour
      </button>
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

  const technical = [
    { id: 'schema', label: 'Votre site est bien compris par les assistants IA', ok: data.has_schema_markup, fix: 'Votre site ne transmet pas correctement ses informations aux IA — elles ne savent pas précisément ce que vous vendez.', severity: 'error' },
    { id: 'gmb', label: 'Votre entreprise apparaît sur Google Maps', ok: data.has_google_business, fix: 'Sans fiche Google, votre entreprise est invisible pour les recherches locales et ne peut pas être recommandée dans votre zone.', severity: 'error' },
    { id: 'ssl', label: 'Votre site est sécurisé (cadenas)', ok: data.has_ssl, fix: 'Un site sans cadenas est pénalisé par les moteurs de recherche et inspire moins confiance aux visiteurs.', severity: 'warning' },
    { id: 'mobile', label: 'Votre site s\'affiche bien sur mobile', ok: data.has_mobile_friendly, fix: 'Plus de 60% des recherches se font sur téléphone — un site non adapté perd la majorité de son audience.', severity: 'warning' },
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
            {data.last_scan && (
              <span style={{ fontSize: 10, color: INK3, display: 'none' }}>Mis à jour {new Date(data.last_scan).toLocaleDateString('fr')}</span>
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
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '24px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <ScoreCircle value={score} size={96} />
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                Score de visibilité global
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.03em', marginBottom: 6 }}>
                {data.identity_name || domainLabel}
              </div>
              <p style={{ fontSize: 12, color: INK3, margin: 0, lineHeight: 1.6 }}>
                {score >= 65 ? 'Votre site est bien référencé auprès des assistants IA.' :
                  score >= 35 ? 'Des améliorations peuvent significativement augmenter votre visibilité.' :
                  'Votre site est peu visible sur les assistants IA — des actions prioritaires sont recommandées.'}
              </p>
            </div>
            <a href={data.site_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: INK3, textDecoration: 'none', padding: '6px 10px', border: `1px solid ${BORDER}`, borderRadius: 8 }}>
              <Globe size={11} /> Voir le site <ExternalLink size={9} />
            </a>
          </div>
          {data.shock_insight && (
            <div style={{ marginTop: 16, padding: '12px 14px', background: SURFACE, borderRadius: 10, borderLeft: '3px solid #EBEBEB' }}>
              <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.7 }}>{data.shock_insight}</p>
            </div>
          )}
        </div>

        {/* ── 3 scores détaillés ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <ScoreCard
            label="Présence chez les assistants IA"
            value={scoreVis}
            desc="À quelle fréquence les IA comme ChatGPT ou Google vous recommandent quand quelqu'un cherche vos services."
            benchmark={40}
          />
          <ScoreCard
            label="Clarté de votre message"
            value={scoreClarity}
            desc="Est-ce que les IA comprennent bien ce que vous faites ? Un message flou = moins de recommandations."
            benchmark={50}
          />
          <ScoreCard
            label="Signaux de vente"
            value={scoreCommerce}
            desc="Votre site transmet-il les bons signaux (prix, disponibilité, avis) pour que les IA vous recommandent en contexte d'achat ?"
            benchmark={45}
          />
        </div>

        {/* ── Problèmes détectés (cliquables → drawer) ── */}
        {issues.length > 0 && (
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: INK3, flexShrink: 0 }}>
                  Corriger <ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Signaux techniques (cliquables → drawer) ── */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
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
              {t.ok
                ? <CheckCircle size={17} color="#10B981" style={{ flexShrink: 0 }} />
                : <XCircle size={17} color="#EF4444" style={{ flexShrink: 0 }} />
              }
              <span style={{ flex: 1, fontSize: 13, color: t.ok ? INK2 : INK }}>{t.label}</span>
              {!t.ok && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#EF4444', flexShrink: 0 }}>Corriger <ChevronRight size={12} /></div>}
              {t.ok && <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>✓ OK</span>}
            </div>
          ))}
        </div>

        {/* ── Données de trafic ── */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
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

        {/* ── Plan d'actions ── */}
        {plan.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Plan d'amélioration</p>
                <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>{doneTasks}/{plan.length} actions réalisées</p>
              </div>
              <div style={{ height: 4, width: 80, background: BORDER, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(doneTasks / plan.length) * 100}%`, background: INK, borderRadius: 2, transition: 'width 0.5s' }} />
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
                          <Zap size={13} />
                          Obtenir un guide étape par étape
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Concurrents ── */}
        {data.competitors?.filter(c => typeof c === 'object' && c.domain && c.domain !== domainLabel).length > 0 && (
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>Sites concurrents détectés</p>
            {data.competitors.filter(c => typeof c === 'object' && c.domain && c.domain !== domainLabel).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: i < data.competitors.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
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
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>

      {/* ── Side drawer ── */}
      {activeDrawer && (
        <FixDrawer
          issue={activeDrawer}
          profile={data}
          onClose={() => setActiveDrawer(null)}
        />
      )}
    </div>
  );
}