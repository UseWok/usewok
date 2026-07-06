import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, CheckCircle2, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const F = 'Inter, system-ui, sans-serif';
const INK = '#15130F';
const INK2 = '#4A453B';
const INK3 = 'rgba(21,19,15,0.5)';
const BORDER = 'rgba(21,19,15,0.12)';
const WHITE = '#FFFFFF';
const CORAL = '#FF5A1F';
const GREEN = '#3FA66B';
const GREEN_SOFT = '#E3F1E9';
const CREAM = '#F7F2E9';
const ORANGE_DEEP = '#C43E14';
const ORANGE_SOFT = '#FCE3D2';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

// Diminishing returns — same formula as backend
function computeGain(base, currentScore) {
  const gain = base * (1 - currentScore / 100);
  return Math.min(gain, 99 - currentScore);
}

export default function AuthorityTaskDrawer({ task, currentScore, onClose, onVerified }) {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(() => parseJSON(task?.verify_result_json, null));

  const instr = parseJSON(task?.instructions_json, {});
  const steps = instr.steps || [];
  const isDone = task?.status === 'done';
  const gain = computeGain(task?.points_base || 0, currentScore);

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke('authorityTasks', {
        action: 'verify',
        task_id: task.id,
        site_url: task.site_url,
      });
      const r = res?.data;
      if (r && !r.error) {
        setResult(r);
        if (r.verified && onVerified) {
          onVerified(r.new_score, r.points_granted);
        }
      } else {
        setResult({ verified: false, feedback: r?.error || 'Échec de la vérification. Réessayez.' });
      }
    } catch (e) {
      setResult({ verified: false, feedback: 'Erreur de vérification. Réessayez dans un instant.' });
    }
    setVerifying(false);
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(4px)' }} />
      <motion.div key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: '100%', maxWidth: 420, background: WHITE, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', fontFamily: F }}>

        <style>{`
          .atd-step:hover{border-color:${INK}!important;}
          .atd-btn-verify:hover{background:${ORANGE_DEEP}!important;}
          .atd-cta:hover{background:${INK}!important;}
          @keyframes atdSpin{to{transform:rotate(360deg);}}
        `}</style>

        {/* ── Header ── */}
        <div style={{ padding: '20px 22px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: CORAL }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL }} />
              Mission autorité
            </span>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: WHITE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={12} color={INK2} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            {instr.favicon && <img src={instr.favicon} width={36} height={36} style={{ borderRadius: 9, flexShrink: 0 }} alt="" />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.3, margin: 0, color: INK }}>{task.action_title}</h2>
              {instr.platform_label && <span style={{ fontSize: 12, color: INK3 }}>{instr.platform_label}</span>}
            </div>
          </div>

          {/* ── Points badge ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: isDone ? GREEN_SOFT : ORANGE_SOFT, borderRadius: 12, marginBottom: 4 }}>
            <TrendingUp size={16} color={isDone ? GREEN : ORANGE_DEEP} />
            {isDone ? (
              <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>
                +{task.points_granted || gain} pts gagnés · score IA mis à jour
              </span>
            ) : (
              <span style={{ fontSize: 13, fontWeight: 700, color: ORANGE_DEEP }}>
                +{Math.round(gain * 10) / 10} pts sur votre score IA une fois validé
              </span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px 22px' }}>
          {/* Description */}
          {instr.description && (
            <p style={{ fontSize: 13, color: INK2, lineHeight: 1.65, margin: '0 0 18px' }}>{instr.description}</p>
          )}

          <div style={{ height: 1, background: BORDER, marginBottom: 18 }} />

          {/* CTA — go to platform */}
          {instr.signup_url && !isDone && (
            <a href={instr.signup_url} target="_blank" rel="noopener noreferrer" className="atd-cta"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', height: 48, borderRadius: 12, background: INK, color: '#fff', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', marginBottom: 20, transition: 'background .15s ease', cursor: 'pointer' }}>
              <ExternalLink size={15} /> Aller sur {instr.platform_label}
            </a>
          )}

          {/* Steps */}
          {steps.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: INK3, marginBottom: 12 }}>Instructions</div>
              {steps.map((step, i) => (
                <div key={i} className="atd-step"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, transition: 'border-color .15s ease' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, color: '#fff', background: i === 0 ? CORAL : INK }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: INK2, margin: 0, overflowWrap: 'anywhere' }}>{step}</p>
                </div>
              ))}
            </>
          )}

          {/* Verify button */}
          {!isDone && (
            <button onClick={handleVerify} disabled={verifying} className="atd-btn-verify"
              style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', background: verifying ? CREAM : result?.verified ? GREEN : CORAL, color: '#fff', fontFamily: F, fontSize: 14, fontWeight: 700, cursor: verifying ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, transition: 'background .15s ease' }}>
              {verifying ? (
                <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'atdSpin 0.7s linear infinite' }} /> Vérification IA en cours…</>
              ) : result?.verified ? (
                <><CheckCircle2 size={15} /> Validé par l'IA ✓</>
              ) : (
                <><Sparkles size={15} /> Vérifier avec l'IA</>
              )}
            </button>
          )}

          {/* Result */}
          {result && (
            <div style={{ marginTop: 10, padding: 14, background: result.verified ? GREEN_SOFT : '#FFFBEB', border: `1px solid ${result.verified ? `${GREEN}40` : '#FEF3C7'}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                {result.verified ? <CheckCircle2 size={14} color={GREEN} /> : <AlertTriangle size={14} color="#D97706" />}
                <span style={{ fontSize: 11, fontWeight: 700, color: result.verified ? GREEN : '#D97706', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {result.verified ? 'Mission accomplie' : 'Pas encore validé'}
                </span>
                {result.confidence > 0 && <span style={{ fontSize: 11, color: INK2, marginLeft: 'auto' }}>{result.confidence}% confiance</span>}
              </div>
              <p style={{ fontSize: 12.5, color: result.verified ? '#15803D' : '#92400E', margin: '0 0 8px', lineHeight: 1.6, fontWeight: 500 }}>{result.feedback}</p>
              {result.verified && result.points_granted > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: WHITE, borderRadius: 8, marginTop: 8 }}>
                  <TrendingUp size={14} color={GREEN} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: GREEN }}>+{result.points_granted} pts</span>
                  <span style={{ fontSize: 12, color: INK3 }}>· Score IA : {Math.round(result.new_score || 0)}/100</span>
                </div>
              )}
              {result.what_was_found && (
                <p style={{ fontSize: 12, color: INK2, margin: '8px 0 0', lineHeight: 1.5 }}><strong>Trouvé :</strong> {result.what_was_found}</p>
              )}
              {result.profile_url && (
                <a href={result.profile_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: CORAL, marginTop: 8, textDecoration: 'none', fontWeight: 600 }}>
                  Voir le profil <ExternalLink size={11} />
                </a>
              )}
            </div>
          )}

          {/* Done state */}
          {isDone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: GREEN_SOFT, border: `1px solid ${GREEN}40`, borderRadius: 12, marginTop: 6 }}>
              <CheckCircle2 size={18} color={GREEN} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: GREEN, margin: 0 }}>Mission accomplie</p>
                <p style={{ fontSize: 11.5, color: INK2, margin: '2px 0 0' }}>+{task.points_granted || gain} points ajoutés à votre score IA</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}