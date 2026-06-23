import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Zap, AlertTriangle, TrendingUp, CheckCircle, BarChart2 } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const WHITE = '#FFFFFF';
const SURFACE = '#F7F7F5';

// ── Score ring
function ScoreRing({ score, size = 80 }) {
  const R = size / 2 - 6;
  const circ = 2 * Math.PI * R;
  const c = score >= 65 ? '#10B981' : score >= 35 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#F0F0F0" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={c} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.12, color: INK3, fontWeight: 500 }}>/100</span>
      </div>
    </div>
  );
}

// ── Mini bar
function MiniBar({ label, value }) {
  const c = value >= 65 ? '#10B981' : value >= 35 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: INK2 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{value}</span>
      </div>
      <div style={{ height: 4, background: SURFACE, borderRadius: 2 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: c, borderRadius: 2 }} />
      </div>
    </div>
  );
}

// ── Illustration SVGs inline
function IllustrationScore() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" style={{ margin: '0 auto', display: 'block' }}>
      {/* Background glow */}
      <ellipse cx="60" cy="60" rx="50" ry="20" fill="rgba(124,106,244,0.07)" />
      {/* Score circle */}
      <circle cx="60" cy="36" r="28" fill="none" stroke="#E8E8E8" strokeWidth="5" />
      <circle cx="60" cy="36" r="28" fill="none" stroke="#7C6AF4" strokeWidth="5"
        strokeDasharray="176" strokeDashoffset="70" strokeLinecap="round"
        transform="rotate(-90 60 36)" />
      {/* Center */}
      <text x="60" y="41" textAnchor="middle" fontSize="16" fontWeight="800" fill="#111">67</text>
      {/* Small dots */}
      <circle cx="22" cy="60" r="4" fill="#10B981" opacity="0.5" />
      <circle cx="98" cy="60" r="4" fill="#F59E0B" opacity="0.5" />
      <circle cx="10" cy="36" r="3" fill="#7C6AF4" opacity="0.3" />
      <circle cx="110" cy="36" r="3" fill="#7C6AF4" opacity="0.3" />
    </svg>
  );
}

function IllustrationIssues() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" style={{ margin: '0 auto', display: 'block' }}>
      <rect x="10" y="10" width="100" height="18" rx="5" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="1" />
      <rect x="10" y="34" width="100" height="18" rx="5" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="1" />
      <rect x="10" y="58" width="100" height="18" rx="5" fill="#FFF7ED" stroke="#FCD34D" strokeWidth="1" />
      <circle cx="22" cy="19" r="4" fill="#EF4444" />
      <text x="22" y="23" textAnchor="middle" fontSize="7" fill="white" fontWeight="700">!</text>
      <circle cx="22" cy="43" r="4" fill="#EF4444" />
      <text x="22" y="47" textAnchor="middle" fontSize="7" fill="white" fontWeight="700">!</text>
      <circle cx="22" cy="67" r="4" fill="#F59E0B" />
      <text x="22" y="71" textAnchor="middle" fontSize="7" fill="white" fontWeight="700">!</text>
      <rect x="32" y="16" width="50" height="5" rx="2" fill="#FCA5A5" opacity="0.6" />
      <rect x="32" y="40" width="40" height="5" rx="2" fill="#FCA5A5" opacity="0.6" />
      <rect x="32" y="64" width="55" height="5" rx="2" fill="#FCD34D" opacity="0.6" />
    </svg>
  );
}

function IllustrationPlan() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" style={{ margin: '0 auto', display: 'block' }}>
      {/* Steps */}
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle cx="20" cy={18 + i * 24} r="8" fill={i === 0 ? '#7C6AF4' : i === 1 ? '#10B981' : '#E8E8E8'}
            opacity={i === 2 ? 0.4 : 1} />
          <text x="20" y={23 + i * 24} textAnchor="middle" fontSize="8" fill="white" fontWeight="700">{i + 1}</text>
          <rect x="36" y={14 + i * 24} width={i === 0 ? 60 : i === 1 ? 48 : 40} height="5" rx="2"
            fill={i === 0 ? '#7C6AF4' : i === 1 ? '#10B981' : '#E8E8E8'} opacity={i === 2 ? 0.3 : 0.6} />
          <rect x="36" y={22 + i * 24} width={i === 0 ? 40 : i === 1 ? 32 : 28} height="3" rx="1" fill="#E8E8E8" opacity="0.5" />
          {i < 2 && <line x1="20" y1={26 + i * 24} x2="20" y2={34 + i * 24} stroke="#E8E8E8" strokeWidth="1.5" strokeDasharray="3 2" />}
        </g>
      ))}
      {/* Arrow forward */}
      <path d="M 100 40 L 112 40 M 107 34 L 113 40 L 107 46" stroke="#7C6AF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STEPS = [
  {
    key: 'score',
    title: 'Votre Score LRS',
    subtitle: 'LLM Resonance Score™',
    icon: BarChart2,
    color: '#7C6AF4',
    Illustration: IllustrationScore,
  },
  {
    key: 'issues',
    title: 'Problèmes détectés',
    subtitle: 'Ce qui bloque votre visibilité IA',
    icon: AlertTriangle,
    color: '#EF4444',
    Illustration: IllustrationIssues,
  },
  {
    key: 'plan',
    title: 'Votre Plan d\'action',
    subtitle: '3 leviers prioritaires pour cette semaine',
    icon: TrendingUp,
    color: '#10B981',
    Illustration: IllustrationPlan,
  },
];

export default function ScanResultsOnboarding({ data, onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const lrs = Math.round(data?.lrs_score || data?.overall_score || 0);
  const aiVis = data?.ai_visibility_score || 0;
  const clarity = data?.message_clarity_score || 0;
  const commercial = data?.commercial_presence_score || 0;
  const issues = data?.issues || [];
  const businessName = data?.business_name || 'Votre site';

  const renderStepContent = () => {
    if (current.key === 'score') {
      return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <ScoreRing score={lrs} size={90} />
            <div>
              <div style={{ fontSize: 13, color: INK3, marginBottom: 4 }}>Score global</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>{lrs}<span style={{ fontSize: 14, color: INK3, fontWeight: 500 }}>/100</span></div>
              <div style={{
                display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 20,
                background: lrs >= 65 ? '#ECFDF5' : lrs >= 35 ? '#FFFBEB' : '#FEF2F2',
                color: lrs >= 65 ? '#10B981' : lrs >= 35 ? '#F59E0B' : '#EF4444',
                fontSize: 11, fontWeight: 700,
              }}>
                {lrs >= 65 ? '✓ Bonne visibilité' : lrs >= 35 ? '⚠ Partielle' : '✗ Invisible aux IA'}
              </div>
            </div>
          </div>
          <MiniBar label="Visibilité IA" value={aiVis} />
          <MiniBar label="Clarté du message" value={clarity} />
          <MiniBar label="Signal commercial" value={commercial} />
          {data?.shock_insight && (
            <div style={{ marginTop: 16, padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, fontSize: 12, color: '#B91C1C', lineHeight: 1.55 }}>
              💡 {data.shock_insight}
            </div>
          )}
        </div>
      );
    }

    if (current.key === 'issues') {
      const topIssues = issues.slice(0, 3);
      if (!topIssues.length) {
        return (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <CheckCircle size={40} color="#10B981" style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>Aucun problème critique détecté</div>
            <div style={{ fontSize: 12, color: INK3, marginTop: 4 }}>Votre site est bien structuré pour les IA.</div>
          </div>
        );
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topIssues.map((issue, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
              style={{ padding: '12px 14px', background: issue.severity === 'error' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${issue.severity === 'error' ? '#FCA5A5' : '#FCD34D'}`, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>{issue.severity === 'error' ? '🔴' : '🟡'}</span>
                <span style={{ fontSize: 12.5, color: INK, lineHeight: 1.55 }}>{issue.problem}</span>
              </div>
            </motion.div>
          ))}
          {issues.length > 3 && (
            <div style={{ fontSize: 11.5, color: INK3, textAlign: 'center', padding: '4px 0' }}>
              + {issues.length - 3} autres problèmes dans le rapport complet
            </div>
          )}
        </div>
      );
    }

    if (current.key === 'plan') {
      const topEngines = ['chatgpt', 'gemini', 'claude'].map(k => ({
        name: k.charAt(0).toUpperCase() + k.slice(1),
        score: data?.[`${k}_score`] || 0,
      }));
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Score par moteur IA</div>
            {topEngines.map((e, i) => <MiniBar key={e.name} label={e.name} value={e.score} />)}
          </div>
          <div style={{ padding: '14px 16px', background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 8 }}>🎯 Vos 3 priorités cette semaine</div>
            {[
              'Ajouter des balises Schema sur vos pages clés',
              'Publier du contenu structuré pour les IA citantes',
              'Renforcer votre présence sur les plateformes référencées',
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < 2 ? 8 : 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#7C6AF4', color: WHITE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <span style={{ fontSize: 12, color: INK2, lineHeight: 1.5 }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', fontFamily: F, padding: '16px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: WHITE, borderRadius: 24, width: '100%', maxWidth: 460, position: 'relative', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.22)' }}>

        {/* Color bar top */}
        <div style={{ height: 4, background: `linear-gradient(90deg, #7C6AF4, #10B981)` }} />

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${current.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <current.icon size={16} color={current.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: INK3, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{current.subtitle}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: INK, letterSpacing: '-0.03em' }}>{current.title}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer' }}>
            <X size={12} color={INK3} />
          </button>
        </div>

        {/* Domain badge */}
        <div style={{ padding: '10px 24px 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}` }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: 11, color: INK3 }}>{businessName}</span>
          </div>
        </div>

        {/* Step content */}
        <div style={{ padding: '18px 24px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div style={{ padding: '0 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? INK : BORDER, transition: 'all 0.3s' }} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, fontSize: 13, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
                Retour
              </button>
            )}
            <button onClick={() => isLast ? onClose() : setStep(s => s + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none', background: INK, fontSize: 13, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F }}>
              {isLast ? 'Voir le rapport complet' : 'Suivant'}
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}