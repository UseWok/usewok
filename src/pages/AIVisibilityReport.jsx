import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, X, Zap, Clock, Lock,
  AlertTriangle, BarChart2, TrendingUp, CheckCircle2,
  ChevronDown, Sparkles, ArrowRight, Bookmark, Copy, Check,
  Download, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import { getWokPlanId } from '@/lib/wok-plans';
import UpgradeModal from '@/components/upsell/UpgradeModal';

const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
const INK = '#1A1814';
const INK2 = '#857E6E';
const INK3 = '#A8A49F';
const BORDER = 'rgba(21,19,15,0.12)';
const SURFACE = '#F7F2E9';
const WHITE = '#FFFFFF';
const CORAL = '#FF5A1F';
const CARD_DARK = '#15130F';
const GREEN = '#3FA66B';
const GREEN_SOFT = '#E3F1E9';
const CREAM_DEEP = '#EEE5D2';
const ORANGE_DEEP = '#B23E10';
const ORANGE_SOFT = '#FCE3D2';

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
const ALL_ENGINES = ['mistral', 'gemini', 'chatgpt', 'claude', 'copilot', 'perplexity', 'llama', 'grok'];
const ENGINE_NAMES = { chatgpt: 'ChatGPT', gemini: 'Gemini', claude: 'Claude', mistral: 'Mistral', llama: 'Llama', perplexity: 'Perplexity', grok: 'Grok', copilot: 'Copilot' };
const RADAR_LABELS = [
  { name: 'Mistral', x: 100, y: 8 },
  { name: 'Gemini', x: 166, y: 40 },
  { name: 'ChatGPT', x: 188, y: 103 },
  { name: 'Claude', x: 166, y: 166 },
  { name: 'Copilot', x: 100, y: 195 },
  { name: 'Perplexity', x: 34, y: 166 },
  { name: 'Llama', x: 12, y: 103 },
  { name: 'Grok', x: 34, y: 40 },
];
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

// ── Radar helpers ──
function radarPoints(scores, maxR = 70, cx = 100, cy = 100) {
  return ALL_ENGINES.map((e, i) => {
    const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
    const s = scores[e] || 0;
    const r = maxR * (s / 100);
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');
}
function radarOuter(maxR = 70, cx = 100, cy = 100) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
    pts.push(`${(cx + maxR * Math.cos(angle)).toFixed(1)},${(cy + maxR * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(' ');
}
function radarInner(maxR = 35, cx = 100, cy = 100) {
  return radarOuter(maxR, cx, cy);
}
function radarLines(maxR = 70, cx = 100, cy = 100) {
  return ALL_ENGINES.map((_, i) => {
    const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
    return { x1: cx, y1: cy, x2: cx + maxR * Math.cos(angle), y2: cy + maxR * Math.sin(angle) };
  });
}

// ── Animated score number ──
function AnimatedScore({ value, size = 17, color = '#F7F2E9' }) {
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
  return <span style={{ fontSize: size, fontWeight: 500, color, lineHeight: 1 }}>{disp}</span>;
}

// ── Normalize issue text to issue_key ──
function normalizeIssueKey(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9àâäéèêëîïôùûüç\s]/g, '').replace(/\s+/g, '_').slice(0, 80);
}

const FIX_MEM = {};

// ── FixDrawer — persistance cloud via UserFixCache ──
function FixDrawer({ issue, profile, user, isFree, onClose, onUpgrade, onVerified }) {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const techLevel = (() => {
    try {
      const prefs = typeof profile?.user_preferences === 'string'
        ? JSON.parse(profile.user_preferences)
        : profile?.user_preferences || {};
      return prefs.tech_level || 'no_code';
    } catch { return 'no_code'; }
  })();

  const issueKey = normalizeIssueKey(issue?.text || '');
  const cacheKey = `${issueKey}__${techLevel}`;
  const [content, setContent] = useState(() => FIX_MEM[cacheKey] || null);
  const [loading, setLoading] = useState(!FIX_MEM[cacheKey] && !isFree);

  useEffect(() => {
    if (!issue) return;
    if (isFree) { setLoading(false); return; }
    if (FIX_MEM[cacheKey]) { setContent(FIX_MEM[cacheKey]); setLoading(false); return; }

    setLoading(true);
    setContent(null);

    const checkDB = user?.id
      ? base44.entities.UserFixCache.filter({ user_id: user.id, issue_key: cacheKey }).catch(() => [])
      : Promise.resolve([]);

    checkDB.then(async (cached) => {
      if (cached.length > 0) {
        const c = cached[0];
        let steps = [];
        try { steps = JSON.parse(c.steps || '[]'); } catch {}
        const data = {
          summary: c.summary, steps,
          prompt: c.prompt || null,
          explanation: c.explanation || null,
          time_estimate: c.time_estimate, type: c.fix_type,
          profile_type: c.profile_type || techLevel,
          from_cache: true
        };
        FIX_MEM[cacheKey] = data;
        setContent(data);
        setLoading(false);
        return;
      }

      const res = await base44.functions.invoke('generateFixInstruction', {
        issue: issue.text,
        businessProfile: {
          site_url: profile?.site_url,
          identity_name: profile?.identity_name,
          identity_industry: profile?.identity_industry,
          user_preferences: profile?.user_preferences,
        },
      }).catch(() => null);

      if (res?.data && !res.data.error) {
        FIX_MEM[cacheKey] = res.data;
        setContent(res.data);
      }
      setLoading(false);
    });
  }, [cacheKey, isFree]);

  if (!issue) return null;
  const steps = content?.steps || [];
  const summary = content?.summary || '';
  const prompt = content?.prompt || '';
  const explanation = content?.explanation || '';
  const timeEstimate = content?.time_estimate || '';
  const fixType = content?.type || '';
  const profileType = content?.profile_type || techLevel;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt || explanation || summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await base44.functions.invoke('verifyFix', {
        issue: issue.text,
        taskTitle: issue.text,
        fixData: content,
        businessProfile: {
          site_url: profile?.site_url,
          identity_name: profile?.identity_name,
          identity_industry: profile?.identity_industry,
          identity_city: profile?.identity_city,
          identity_target: profile?.identity_target,
          brand_keywords: profile?.brand_keywords,
          products: profile?.products,
        },
      });
      const r = res?.data;
      if (r && !r.error) {
        setVerifyResult(r);
        if (r.verified && onVerified) {
          setTimeout(() => { onVerified(); }, 2500);
        }
      } else {
        setVerifyResult({ verified: false, feedback: 'Impossible de vérifier. Réessayez dans un instant.', confidence: 0 });
      }
    } catch {
      setVerifyResult({ verified: false, feedback: 'Erreur de vérification. Réessayez.', confidence: 0 });
    }
    setVerifying(false);
  };

  return (
    <AnimatePresence>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(4px)' }} />
      <motion.div key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: '100%', maxWidth: 420, background: WHITE, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', fontFamily: F }}>

        {/* ── Header ── */}
        <div style={{ padding: '18px', borderBottom: `0.5px solid ${BORDER}`, background: WHITE, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: CORAL, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {issue.type === 'plan' ? 'Plan d\'action' : 'Correction'}
                </span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.4, margin: 0, overflowWrap: 'anywhere' }}>{issue.text}</p>
            </div>
            <button onClick={onClose} className="lrsm-close"
              style={{ width: 26, height: 26, borderRadius: '50%', border: `0.5px solid ${BORDER}`, background: 'none', color: INK2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <X size={13} />
            </button>
          </div>

          {(timeEstimate || fixType) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {timeEstimate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: INK2, border: `0.5px solid ${BORDER}`, borderRadius: 999, padding: '5px 11px' }}>
                  <Clock size={12} /> {timeEstimate}
                </span>
              )}
              {fixType && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 500, color: ORANGE_DEEP, background: ORANGE_SOFT, borderRadius: 999, padding: '5px 11px' }}>
                  <Check size={12} /> {fixType === 'seul' ? 'Faisable seul' : 'Avec aide'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: WHITE }}>
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
            <div style={{ padding: '18px' }}>
              <div style={{ background: CREAM_DEEP, borderRadius: 10, padding: 13, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <svg width="30" height="30" viewBox="0 0 64 64" style={{ flexShrink: 0, animation: 'lrsmSpin .9s linear infinite', transformOrigin: '32px 32px' }}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(21,19,15,0.12)" strokeWidth="7" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke={CORAL} strokeWidth="7" strokeLinecap="round" strokeDasharray="40 123" />
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: INK }}>L'IA prépare votre guide personnalisé…</div>
                  <div style={{ fontSize: 11.5, color: INK2, marginTop: 2 }}>Adapté à votre secteur et votre site</div>
                </div>
              </div>
              <div className="lrsm-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '94%', marginBottom: 8 }} />
              <div className="lrsm-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '78%', marginBottom: 8, animationDelay: '.15s' }} />
              <div className="lrsm-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '68%', marginBottom: 8, animationDelay: '.3s' }} />
              <div className="lrsm-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '50%', animationDelay: '.45s' }} />
            </div>
          ) : content ? (
            <div style={{ padding: '18px' }}>
              <div style={{ height: '0.5px', background: BORDER, margin: '-18px -18px 14px' }} />

              {/* ── Pourquoi c'est important ── */}
              {summary && (
                <div style={{ background: ORANGE_SOFT, borderRadius: 10, padding: 13, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Sparkles size={13} color={ORANGE_DEEP} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: ORANGE_DEEP, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pourquoi c'est important</span>
                  </div>
                  <p style={{ fontSize: 12.5, lineHeight: 1.6, color: INK, margin: 0 }}>{summary}</p>
                </div>
              )}

              {/* ── Prompt à copier ── */}
              {prompt && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#7C3AED', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ➡️ Copie ceci dans ChatGPT ou Claude:
                  </p>
                  <div style={{ background: SURFACE, border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: 13, fontSize: 12.5, color: INK, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: 240, overflowY: 'auto' }}>
                    {prompt}
                  </div>
                  <button onClick={handleCopy}
                    style={{ marginTop: 10, width: '100%', padding: 12, background: copied ? GREEN : '#7C3AED', color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
                    {copied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier le prompt</>}
                  </button>
                </div>
              )}

              {/* ── Explication (developer) ── */}
              {explanation && !prompt && (
                <div style={{ marginBottom: 16, padding: 13, background: '#F3E8FF', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#4B2A8C', margin: 0, lineHeight: 1.65 }}>{explanation}</p>
                </div>
              )}

              {/* ── Étapes ── */}
              {steps.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: INK2, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Ce que vous faites maintenant</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {steps.map((step, i) => {
                      const stepText = typeof step === 'string' ? step : step.description || step.text || '';
                      const arrowIdx = stepText.indexOf('→');
                      const action = arrowIdx >= 0 ? stepText.slice(0, arrowIdx).trim() : stepText.trim();
                      const result = arrowIdx >= 0 ? stepText.slice(arrowIdx + 1).trim() : (step.result || step.expected_result || null);

                      return (
                        <div key={i} className="lrsm-step" style={{ border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: 12, display: 'flex', gap: 10, transition: 'border-color .15s ease' }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? CORAL : CARD_DARK, color: i === 0 ? '#fff' : SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, color: INK, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{action}</div>
                            {result && (
                              <div style={{ fontSize: 11.5, color: GREEN, marginTop: 5, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                                <ArrowRight size={12} style={{ marginTop: 1, flexShrink: 0 }} />
                                <span>Résultat attendu : {result}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Vérification IA ── */}
              {!isFree && (
                <div style={{ marginTop: 16 }}>
                  <button onClick={handleVerify} disabled={verifying}
                    style={{ width: '100%', padding: 13, background: verifying ? SURFACE : verifyResult?.verified ? GREEN : CARD_DARK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: verifying ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: F, transition: 'background 0.2s' }}>
                    {verifying ? (
                      <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: WHITE, borderRadius: '50%', animation: 'lrsmSpin 0.7s linear infinite' }} /> Analyse de votre site…</>
                    ) : verifyResult?.verified ? (
                      <><CheckCircle2 size={14} /> Tâche validée par l'IA ✓</>
                    ) : (
                      <><Sparkles size={14} color={CORAL} /> Vérifier avec l'IA</>
                    )}
                  </button>
                  {verifyResult && (
                    <div style={{ marginTop: 10, padding: 13, background: verifyResult.verified ? GREEN_SOFT : '#FFFBEB', border: `0.5px solid ${verifyResult.verified ? `${GREEN}40` : '#FEF3C7'}`, borderRadius: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        {verifyResult.verified ? <CheckCircle2 size={14} color={GREEN} /> : <AlertTriangle size={14} color="#D97706" />}
                        <span style={{ fontSize: 11, fontWeight: 600, color: verifyResult.verified ? GREEN : '#D97706', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          {verifyResult.verified ? 'Correction validée' : 'Pas encore validé'}
                        </span>
                        {verifyResult.confidence > 0 && (
                          <span style={{ fontSize: 11, color: INK2, marginLeft: 'auto' }}>{verifyResult.confidence}% confiance</span>
                        )}
                      </div>
                      <p style={{ fontSize: 12.5, color: verifyResult.verified ? '#15803D' : '#92400E', margin: '0 0 8px', lineHeight: 1.6, fontWeight: 500 }}>{verifyResult.feedback}</p>
                      {verifyResult.what_was_found && (
                        <p style={{ fontSize: 12, color: INK2, margin: '0 0 6px', lineHeight: 1.5 }}><strong>Trouvé:</strong> {verifyResult.what_was_found}</p>
                      )}
                      {verifyResult.what_is_missing && !verifyResult.verified && (
                        <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.5 }}><strong>Manquant:</strong> {verifyResult.what_is_missing}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px 18px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: INK2 }}>Une erreur est survenue. Réessayez dans quelques secondes.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Status picker ──
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

// ── Score ring (hero, dark card) ──
function ScoreRing({ value, size = 72 }) {
  const sw = 6, R = 26;
  const circ = 2 * Math.PI * R;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'block' }}>
        <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(247,242,233,0.12)" strokeWidth={sw} />
        <motion.circle cx="32" cy="32" r={R} fill="none" stroke={CORAL} strokeWidth={sw}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - value / 100) }}
          transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1], delay: 0.1 }} />
        <text x="32" y="29" textAnchor="middle" fontSize="17" fontWeight="500" fill="#F7F2E9">
          <AnimatedScore value={value} size={17} />
        </text>
        <text x="32" y="42" textAnchor="middle" fontSize="8" fill="rgba(247,242,233,0.55)">/100</text>
      </svg>
    </div>
  );
}

// ── Action card (actions recommandées) ──
function ActionCard({ item, index, urgency, urgencyColor, onClick, status, onStatusChange, saving, isFree }) {
  const urgencyBg = urgency === 'Urgent' ? CORAL : urgency === 'Cette semaine' ? ORANGE_SOFT : CREAM_DEEP;
  const urgencyFg = urgency === 'Urgent' ? '#fff' : urgency === 'Cette semaine' ? ORANGE_DEEP : INK2;
  const isDone = status === 'done';

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index }}
      className="lrs-card lrs-action"
      style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8, opacity: isDone ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 500, color: urgencyFg, background: urgencyBg, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>{urgency}</span>
          {isDone && <CheckCircle2 size={12} color={GREEN} />}
          <span style={{ fontSize: 13, fontWeight: 500, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.action_title || item.text || item.label}</span>
        </div>
        <div style={{ fontSize: 12, color: INK2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.impact || item.desc || item.gap || ''}
        </div>
      </div>
      {!isFree && status !== undefined && onStatusChange ? (
        <div style={{ flexShrink: 0, opacity: saving ? 0.5 : 1 }}>
          <StatusPicker value={status} onChange={onStatusChange} />
        </div>
      ) : null}
      <button onClick={onClick} className="lrs-launch"
        style={{ background: 'none', border: 'none', color: CORAL, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, fontFamily: F, flexShrink: 0 }}>
        Lancer<ArrowRight size={12} />
      </button>
    </motion.div>
  );
}

// ── MAIN ──
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
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [planId, setPlanId] = useState('free');
  const [fakeLoading, setFakeLoading] = useState(false);

  const isFree = planId === 'free';
  const isStarter = planId === 'starter';
  const isPro = planId === 'pro';

  const handleLockedAction = () => {
    setFakeLoading(true);
    setTimeout(() => { setFakeLoading(false); setShowUpgrade(true); }, 2000);
  };

  const PLAN_ENGINES_ACTIVE = isFree
    ? ['gemini']
    : isStarter
    ? ['gemini', 'chatgpt', 'claude', 'llama', 'perplexity']
    : ['gemini', 'chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'copilot', 'grok'];
  const PLAN_ENGINES_LOCKED = isStarter ? ['mistral', 'copilot', 'grok'] : [];
  const PLAN_ENGINES_BLURRED = isFree ? ['chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'grok', 'copilot'] : [];

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
            const extra = await getProfileData(matched);
            setData({ ...matched, ...extra });
          } else {
            setData(res.data);
          }
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

  if (data?.scan_in_progress && !data?.score_overall) return (
    <div style={{ minHeight: '100vh', background: CARD_DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: F }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', marginBottom: 18 }} />
      <div style={{ fontSize: 19, fontWeight: 700, color: '#FFFFFF', marginBottom: 5 }}>Analyse en cours…</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>8 moteurs IA · Résultat dans ~60 secondes</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

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
  const scorePrev = Math.round(data.score_previous || 0);
  const scoreDelta = score - scorePrev;
  const issues = data.issues || [];
  const plan = data.injection_plan || [];
  const hasGsc = gscData?.connected && gscData?.data;
  const businessName = data.identity_name || domainLabel;

  // ── Qualitative labels for dark hero mentions ──
  const freqLabel = scoreVis >= 60 ? 'Élevée' : scoreVis >= 30 ? 'Modérée' : 'Faible';
  const sentimentLabel = scoreClarity >= 60 ? 'Bonne' : scoreClarity >= 30 ? 'Moyenne' : 'À améliorer';
  const precisionLabel = scoreCommerce >= 60 ? 'Bonne' : scoreCommerce >= 30 ? 'Moyenne' : 'À améliorer';

  // ── Engine scores for radar + table ──
  const engineScores = {};
  ALL_ENGINES.forEach(e => { engineScores[e] = data[`${e}_score`] || 0; });
  const activeScores = {};
  ALL_ENGINES.forEach(e => {
    if (PLAN_ENGINES_ACTIVE.includes(e)) activeScores[e] = engineScores[e];
    else activeScores[e] = 0;
  });
  const avgScore = ALL_ENGINES.filter(e => PLAN_ENGINES_ACTIVE.includes(e) && !PLAN_ENGINES_LOCKED.includes(e))
    .reduce((acc, e) => acc + engineScores[e], 0) / Math.max(1, PLAN_ENGINES_ACTIVE.filter(e => !PLAN_ENGINES_LOCKED.includes(e)).length);

  // ── Evolution chart points ──
  const evoPoints = (() => {
    const start = scorePrev || Math.round(score * 0.65);
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const val = start + (score - start) * t;
      const x = (i / 5) * 300;
      const y = 70 - (val / 100) * 55;
      pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
    }
    return pts.join(' ');
  })();

  // ── Sentiment per engine ──
  const getSentiment = (val) => {
    if (val >= 65) return { label: 'Positif', color: GREEN, bg: GREEN_SOFT };
    if (val >= 40) return { label: 'Neutre', color: INK2, bg: CREAM_DEEP };
    return { label: 'Mixte', color: ORANGE_DEEP, bg: ORANGE_SOFT };
  };

  // ── Technical issues ──
  const technical = [
    { id: 'schema', label: 'Fiche business lisible par les IA', desc: 'Les IA comprennent qui vous êtes et ce que vous vendez', ok: data.has_schema_markup, fix: 'Les IA ne savent pas qui vous êtes. Quand un client demande "recommande-moi un X", vous n\'êtes pas dans leur réponse.', urgency: 'high' },
    { id: 'gmb', label: 'Présence Google Maps complète', desc: 'Vous apparaissez dans les recherches locales', ok: data.has_google_business, fix: 'Votre fiche Google est incomplète ou absente. Vous perdez des clients locaux qui cherchent votre type de service.', urgency: 'high' },
    { id: 'ssl', label: 'Site sécurisé (HTTPS)', desc: 'Les IA font confiance à votre site', ok: data.has_ssl, fix: 'Votre site n\'est pas sécurisé. Les IA évitent de recommander des sites non sécurisés.', urgency: 'medium' },
    { id: 'mobile', label: 'Site adapté aux téléphones', desc: '80% des recherches IA se font sur mobile', ok: data.has_mobile_friendly, fix: 'Votre site n\'est pas adapté aux téléphones. La majorité de vos clients potentiels vivent une mauvaise expérience.', urgency: 'medium' },
    { id: 'sitemap', label: 'Pages accessibles aux IA', desc: 'Toutes vos pages sont découvertes et indexées', ok: data.has_sitemap, fix: 'Les IA ne voient pas toutes vos pages. Une partie de votre contenu est invisible pour ChatGPT et Gemini.', urgency: 'low' },
  ].filter((t) => t.ok !== null && t.ok !== undefined);
  const technicalBad = technical.filter((t) => t.ok === false);

  // ── Combined actions list ──
  const allActions = [];
  technicalBad.forEach((t) => {
    allActions.push({ key: `tech_${t.id}`, action_title: t.label, impact: t.desc, gap: t.fix, urgency: 'Urgent', type: 'fix', text: t.fix });
  });
  issues.forEach((issue, i) => {
    allActions.push({ key: `issue_${i}`, action_title: issue.problem || issue.text, impact: issue.impact || '', urgency: 'Cette semaine', type: 'fix', text: issue.problem || issue.text });
  });
  plan.forEach((item, i) => {
    allActions.push({ key: `plan_${i}`, action_title: item.action_title, impact: item.gap || `${item.engine} · ${item.platform || ''}`, urgency: item.effort === 'low' ? 'Court terme' : 'Moyen terme', type: 'plan', text: item.action_title + (item.action_detail ? ' — ' + item.action_detail : ''), planIndex: i, item });
  });

  const doneTasks = plan.filter((_, i) => tasks[i]?.status === 'done').length;

  return (
    <div className="lrs-mock" style={{
      background: SURFACE, minHeight: '100vh', fontFamily: F, color: INK,
      padding: 24,
    }}>
      <style>{`
        .lrs-mock *{box-sizing:border-box;font-family:${F};}
        .lrs-card{background:#fff;border:0.5px solid ${BORDER};border-radius:12px;}
        .lrs-row:hover{background:${CREAM_DEEP};}
        .lrs-icon-btn{background:none;border:none;color:${INK2};cursor:pointer;padding:4px;display:flex;align-items:center;gap:5px;font-size:12px;font-family:${F};}
        .lrs-icon-btn:hover{color:${INK};}
        .lrs-back:hover{color:${INK};}
        .lrs-action:hover{border-color:${INK};}
        .lrs-launch:hover{opacity:.7;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes lrsmSpin{to{transform:rotate(360deg);}}
        @keyframes lrsmPulse{0%,100%{opacity:1;}50%{opacity:.45;}}
        .lrsm-skel{animation:lrsmPulse 1.4s ease-in-out infinite;}
        .lrsm-close:hover{background:${CREAM_DEEP};}
        .lrsm-step:hover{border-color:${INK};}
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* ── Top bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="lrs-icon-btn lrs-back" onClick={() => navigate('/app')}>
            <ArrowLeft size={13} /> Tableau de bord
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isFree && (
              <button onClick={() => setShowUpgrade(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: ORANGE_SOFT, border: 'none', borderRadius: 999, fontSize: 11, fontWeight: 700, color: ORANGE_DEEP, cursor: 'pointer', fontFamily: F }}>
                <Zap size={10} /> Starter
              </button>
            )}
            <button onClick={handleRescan} disabled={scanning} className="lrs-icon-btn"
              style={{ opacity: scanning ? 0.5 : 1 }}>
              <motion.span animate={{ rotate: scanning ? 360 : 0 }} transition={{ duration: 0.8, repeat: scanning ? Infinity : 0, ease: 'linear' }}>
                <RefreshCw size={13} />
              </motion.span>
              {scanning ? 'Analyse…' : 'Actualiser'}
            </button>
            <button className="lrs-icon-btn" onClick={() => window.print()}>
              <Download size={13} /> Exporter
            </button>
          </div>
        </div>

        {/* ── Title ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 21, fontWeight: 500, color: INK }}>Rapport de réputation IA</div>
          <div style={{ fontSize: 13, color: INK2, marginTop: 3 }}>{domainLabel} · Mis à jour {data.last_scan ? new Date(data.last_scan).toLocaleDateString('fr') : "aujourd'hui"}</div>
        </div>

        {/* ── Dark hero: score ring + mentions ── */}
        <FadeUp delay={0}>
          <div style={{ background: CARD_DARK, borderRadius: 12, padding: 20, marginBottom: 14, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <ScoreRing value={score} size={72} />
              {scoreDelta !== 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 8, color: GREEN, fontSize: 12, fontWeight: 500 }}>
                  {scoreDelta > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {scoreDelta > 0 ? '+' : ''}{scoreDelta} pts
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(247,242,233,0.55)', marginBottom: 10 }}>Mentions sectorielles</div>
              {[
                { label: 'Fréquence de citation', val: freqLabel },
                { label: 'Qualité du sentiment', val: sentimentLabel },
                { label: 'Précision des faits', val: precisionLabel },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '0.5px solid rgba(247,242,233,0.1)' }}>
                  <span style={{ fontSize: 13, color: 'rgba(247,242,233,0.75)' }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: CORAL, background: 'rgba(255,90,31,0.16)', padding: '3px 9px', borderRadius: 999 }}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* ── Evolution chart ── */}
        <FadeUp delay={0.06}>
          <div className="lrs-card" style={{ padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>Évolution de la réputation</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: GREEN, background: GREEN_SOFT, padding: '3px 9px', borderRadius: 999 }}>
                {scoreDelta >= 0 ? '+' : ''}{scoreDelta || 11}% · 6 mois
              </span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 300 80" preserveAspectRatio="none">
              <polyline points={evoPoints} fill="none" stroke={CORAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="300" cy={70 - (score / 100) * 55} r="4" fill={CORAL} />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: INK2, marginTop: 4 }}>
              <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span>
            </div>
          </div>
        </FadeUp>

        {/* ── 3 stat cards ── */}
        <FadeUp delay={0.10}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 24 }}>
            <div className="lrs-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: INK2, marginBottom: 6 }}>Part de voix IA</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: INK }}>{scoreVis}%</div>
              <div style={{ fontSize: 11, color: GREEN, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                <ArrowUpRight size={12} /> {scoreDelta >= 0 ? '+' : ''}{scoreDelta || 3}% vs mois -1
              </div>
            </div>
            <div className="lrs-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: INK2, marginBottom: 6 }}>Perception positive</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: INK }}>{scoreClarity}%</div>
              <div style={{ fontSize: 11, color: GREEN, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                <ArrowUpRight size={12} /> +5% vs mois -1
              </div>
            </div>
            <div className="lrs-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: INK2, marginBottom: 6 }}>Mentions IA / mois</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: INK }}>~{fmt(data.organic_traffic || 420)}</div>
              <div style={{ fontSize: 11, color: GREEN, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                <ArrowUpRight size={12} /> +18% vs mois -1
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ── Radar ── */}
        <FadeUp delay={0.14}>
          <div style={{ fontSize: 11, fontWeight: 500, color: INK2, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Radar des assistants IA</div>
          <div className="lrs-card" style={{ padding: 18, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap', position: 'relative' }}>
            <svg width="190" height="190" viewBox="0 0 200 200" style={{ filter: isFree ? 'blur(3px)' : 'none' }}>
              <polygon points={radarOuter()} fill="none" stroke={BORDER} strokeWidth="1" />
              <polygon points={radarInner()} fill="none" stroke={BORDER} strokeWidth="1" />
              {radarLines().map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2.toFixed(1)} y2={l.y2.toFixed(1)} stroke={BORDER} strokeWidth="1" />
              ))}
              <polygon points={radarPoints(isFree ? { gemini: engineScores.gemini } : activeScores)} fill="rgba(255,90,31,0.18)" stroke={CORAL} strokeWidth="2" />
              <circle cx="100" cy="100" r="17" fill="#fff" stroke={BORDER} strokeWidth="1" />
              <text x="100" y="103" textAnchor="middle" fontSize="13" fontWeight="500" fill={INK}>{Math.round(avgScore)}</text>
              {RADAR_LABELS.map((l, i) => (
                <text key={i} x={l.x} y={l.y} textAnchor="middle" fontSize="9" fill={INK2}>{l.name}</text>
              ))}
            </svg>
            {isFree && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={handleLockedAction}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                  <Lock size={12} color={CORAL} /> Débloquer — Starter
                </button>
              </div>
            )}
          </div>
        </FadeUp>

        {/* ── Scores table ── */}
        <FadeUp delay={0.18}>
          <div style={{ fontSize: 11, fontWeight: 500, color: INK2, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Scores par assistant IA</div>
          <div className="lrs-card" style={{ marginBottom: 24, position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto', gap: 8, padding: '10px 16px', fontSize: 11, color: INK2, borderBottom: `0.5px solid ${BORDER}` }}>
              <span>Assistant</span><span>Score</span><span>Évolution</span><span>Sentiment</span>
            </div>
            {ALL_ENGINES.map((e) => {
              const val = engineScores[e];
              const blurred = PLAN_ENGINES_BLURRED.includes(e);
              const locked = PLAN_ENGINES_LOCKED.includes(e);
              const fakeVal = { chatgpt: 42, claude: 38, mistral: 29, llama: 35, perplexity: 51, grok: 22, copilot: 31 }[e] || 30;
              const sent = getSentiment(val);

              if (blurred) {
                return (
                  <div key={e} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto', gap: 8, alignItems: 'center', padding: '11px 16px', borderBottom: `0.5px solid ${BORDER}`, filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>{ENGINE_NAMES[e]}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 999, background: CREAM_DEEP }}>
                        <div style={{ width: `${fakeVal}%`, height: 4, borderRadius: 999, background: 'rgba(21,19,15,0.2)' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: INK, width: 20 }}>{fakeVal}</span>
                    </div>
                    <span style={{ fontSize: 12, color: INK2 }}>—</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: INK2, background: CREAM_DEEP, padding: '2px 8px', borderRadius: 999, width: 'fit-content' }}>—</span>
                  </div>
                );
              }

              if (locked) {
                return (
                  <div key={e} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto', gap: 8, alignItems: 'center', padding: '11px 16px', borderBottom: `0.5px solid ${BORDER}`, opacity: 0.4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>{ENGINE_NAMES[e]}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 999, background: CREAM_DEEP }}>
                        <div style={{ width: '25%', height: 4, borderRadius: 999, background: 'rgba(21,19,15,0.12)' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: INK, width: 20 }}>—</span>
                    </div>
                    <span style={{ fontSize: 12, color: INK2 }}>—</span>
                    <Lock size={11} color={INK3} />
                  </div>
                );
              }

              return (
                <div key={e} className="lrs-row" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto', gap: 8, alignItems: 'center', padding: '11px 16px', borderBottom: `0.5px solid ${BORDER}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>{ENGINE_NAMES[e]}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 999, background: CREAM_DEEP }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ delay: 0.2, duration: 0.7 }}
                        style={{ height: 4, borderRadius: 999, background: CORAL }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: INK, width: 20 }}>{val}</span>
                  </div>
                  <span style={{ fontSize: 12, color: INK2, display: 'flex', alignItems: 'center', gap: 2 }}><Minus size={11} />—</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: sent.color, background: sent.bg, padding: '2px 8px', borderRadius: 999, width: 'fit-content' }}>{sent.label}</span>
                </div>
              );
            })}
            {(isFree || isStarter) && (
              <div style={{ padding: '12px 16px' }}>
                <button onClick={() => setShowUpgrade(true)}
                  style={{ width: '100%', padding: '10px', border: `1px solid ${BORDER}`, borderRadius: 9, background: SURFACE, fontSize: 12, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Lock size={11} /> {isFree ? 'Débloquer les 7 autres moteurs — Starter' : 'Débloquer Mistral, Copilot, Grok — Pro'}
                </button>
              </div>
            )}
          </div>
        </FadeUp>

        {/* ── Part de voix sectorielle ── */}
        {data.competitors && Array.isArray(data.competitors) && data.competitors.length > 0 && (
          <FadeUp delay={0.22}>
            <div style={{ fontSize: 11, fontWeight: 500, color: INK2, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Part de voix dans votre secteur</div>
            <div className="lrs-card" style={{ padding: 16, marginBottom: 24 }}>
              {data.competitors.map((comp, i) => {
                const isYou = comp.name === businessName || comp.is_you;
                const pct = comp.share || comp.percentage || 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < data.competitors.length - 1 ? 12 : 0 }}>
                    <span style={{ width: 84, fontSize: 13, color: isYou ? ORANGE_DEEP : INK, fontWeight: isYou ? 600 : 400 }}>
                      {comp.name}{isYou && <span style={{ fontSize: 10, fontWeight: 500, background: ORANGE_SOFT, padding: '1px 6px', borderRadius: 999, marginLeft: 4 }}>Vous</span>}
                    </span>
                    <div style={{ flex: 1, height: 8, borderRadius: 999, background: CREAM_DEEP }}>
                      <div style={{ width: `${pct}%`, height: 8, borderRadius: 999, background: isYou ? CORAL : INK }} />
                    </div>
                    <span style={{ width: 32, textAlign: 'right', fontSize: 13, fontWeight: 500, color: isYou ? ORANGE_DEEP : INK }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </FadeUp>
        )}

        {/* ── Actions recommandées ── */}
        <FadeUp delay={0.26}>
          <div style={{ fontSize: 11, fontWeight: 500, color: INK2, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Actions recommandées</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
            {isFree ? (
              <>
                <div style={{ filter: 'blur(3px)', pointerEvents: 'none', opacity: 0.4 }}>
                  {allActions.slice(0, 5).map((action, i) => (
                    <ActionCard key={action.key} item={action} index={i} urgency={action.urgency} urgencyColor={action.urgency === 'Urgent' ? CORAL : INK2} onClick={() => {}} />
                  ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button onClick={() => setShowUpgrade(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: CARD_DARK, color: WHITE, border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: F, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                    <Sparkles size={14} color={CORAL} /> Débloquer mon plan personnalisé
                  </button>
                </div>
              </>
            ) : (
              <>
                {allActions.map((action, i) => {
                  const taskStatus = action.planIndex !== undefined ? (tasks[action.planIndex]?.status || 'todo') : undefined;
                  return (
                    <ActionCard
                      key={action.key}
                      item={action}
                      index={i}
                      urgency={action.urgency}
                      urgencyColor={action.urgency === 'Urgent' ? CORAL : action.urgency === 'Cette semaine' ? ORANGE_DEEP : INK2}
                      status={taskStatus}
                      onStatusChange={(s) => action.planIndex !== undefined && handleTaskStatus(action.planIndex, s, action.item)}
                      saving={action.planIndex !== undefined ? !!savingTask[action.planIndex] : false}
                      isFree={false}
                      onClick={() => setActiveDrawer({ id: action.key, text: action.text, type: action.type })}
                    />
                  );
                })}
                {plan.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, padding: '8px 16px' }}>
                    <span style={{ fontSize: 12, color: INK2 }}>{doneTasks}/{plan.length} actions réalisées</span>
                    {doneTasks > 0 && (
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: GREEN, background: GREEN_SOFT, padding: '5px 12px', borderRadius: 999 }}>
                        {Math.round(doneTasks / plan.length * 100)}% accompli
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </FadeUp>

      </div>

      {/* Fake loading overlay — plan free */}
      {fakeLoading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
          <div style={{ background: WHITE, borderRadius: 18, padding: '28px 32px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', minWidth: 240 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid rgba(0,0,0,0.08)`, borderTopColor: CORAL, animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Chargement…</p>
            <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Vérification de votre abonnement</p>
          </div>
        </div>
      )}

      {activeDrawer && (
        <FixDrawer issue={activeDrawer} profile={data} user={user} isFree={isFree}
          onClose={() => setActiveDrawer(null)} onUpgrade={() => setShowUpgrade(true)}
          onVerified={() => {
            if (activeDrawer.id?.startsWith('plan_')) {
              const idx = parseInt(activeDrawer.id.replace('plan_', ''));
              if (plan[idx]) handleTaskStatus(idx, 'done', plan[idx]);
            }
            setActiveDrawer(null);
          }} />
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)}
        feature="l'analyse complète" requiredPlan="starter"
        description="Débloquez les 7 moteurs IA manquants, le plan d'actions personnalisé et les guides de correction." />
    </div>
  );
}