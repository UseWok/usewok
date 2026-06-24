import { motion } from 'framer-motion';
import { X, Check, ArrowRight, TrendingUp, BarChart2, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const WHITE = '#FFFFFF';
const SURFACE = '#F7F7F5';

// Mini fake widgets shown blurred on sides — purely visual
function FakeWidget({ children, style }) {
  return (
    <div style={{
      background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`,
      padding: '14px 16px', fontSize: 11, color: '#555',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      ...style,
    }}>
      {children}
    </div>
  );
}

const PERKS = {
  starter: [
    '5 moteurs IA — ChatGPT, Claude, Mistral, Gemini…',
    'Scan complet 3×/semaine',
    'Audit technique & détection d\'erreurs',
    '5 sites surveillés simultanément',
    'Instructions de correction détaillées',
    'Intégrations GSC & Analytics',
  ],
  pro: [
    '8 moteurs IA — Perplexity, Grok, Copilot inclus',
    'Scan complet chaque jour',
    'Historique 365 jours',
    '10 sites surveillés simultanément',
    'Rapport PDF exportable',
    '200 messages chatbot IA',
  ],
};

export default function UpgradeModal({ open, onClose, feature = 'cette fonctionnalité', requiredPlan = 'starter', description }) {
  const navigate = useNavigate();
  if (!open) return null;

  const isStarter = requiredPlan !== 'pro';
  const targetPlan = isStarter ? 'starter' : 'pro';
  const perks = PERKS[targetPlan];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,11,0.65)', backdropFilter: 'blur(12px)', fontFamily: F, padding: 16 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: 680, display: 'flex', alignItems: 'stretch', gap: 0, borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.35)' }}
      >
        {/* ── Left blurred widgets ── */}
        <div style={{ width: 180, background: SURFACE, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' }}>
          <FakeWidget>
            <div style={{ fontSize: 10, color: INK3, marginBottom: 6, fontWeight: 600 }}>Competitor Analysis</div>
            <svg width="140" height="40" viewBox="0 0 140 40" fill="none">
              <path d="M0 32 Q20 20 35 24 Q55 28 70 16 Q90 6 110 10 Q125 13 140 8" stroke="#7C6AF4" strokeWidth="2" fill="none"/>
              <path d="M0 36 Q20 28 40 30 Q60 32 80 22 Q100 12 120 18 Q130 21 140 16" stroke="#10B981" strokeWidth="1.5" fill="none" opacity="0.6"/>
            </svg>
          </FakeWidget>
          <FakeWidget>
            <div style={{ fontSize: 10, color: INK3, marginBottom: 8, fontWeight: 600 }}>Domain Analytics</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: INK3 }}>Authority Score</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: INK }}>74</div>
                <div style={{ display: 'inline-block', background: '#F0FDF4', color: '#059669', fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>Good</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: INK3 }}>Organic Traffic</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: INK }}>136.2M</div>
              </div>
            </div>
          </FakeWidget>
          <FakeWidget>
            <div style={{ fontSize: 10, color: INK3, marginBottom: 6, fontWeight: 600 }}>Site Audit</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 40, height: 40 }}>
                <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="20" cy="20" r="15" fill="none" stroke="#E8E8E8" strokeWidth="4"/>
                  <circle cx="20" cy="20" r="15" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={94} strokeDashoffset={94*0.25} strokeLinecap="round"/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: INK }}>75%</div>
              </div>
              <div style={{ position: 'relative', width: 40, height: 40 }}>
                <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="20" cy="20" r="15" fill="none" stroke="#E8E8E8" strokeWidth="4"/>
                  <circle cx="20" cy="20" r="15" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray={94} strokeDashoffset={94*0.5} strokeLinecap="round"/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: INK }}>50%</div>
              </div>
            </div>
          </FakeWidget>
        </div>

        {/* ── Center — main content ── */}
        <div style={{ flex: 1, background: WHITE, padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={12} color={INK3} />
          </button>

          {/* Logo mark */}
          <div style={{ width: 48, height: 48, borderRadius: 14, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Zap size={22} color={WHITE} fill={WHITE} />
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 900, color: INK, margin: '0 0 12px', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
            Prenez la tête de la<br />nouvelle ère de la recherche
          </h2>
          <p style={{ fontSize: 13, color: INK3, margin: '0 0 24px', lineHeight: 1.7, maxWidth: 320 }}>
            {description || `Restez en avance sur l'évolution du Web en suivant votre visibilité sur Google et dans la recherche par IA.`}
          </p>

          {/* Perks */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 28, textAlign: 'left' }}>
            {perks.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Check size={9} color="#059669" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => { navigate('/pricing'); onClose(); }}
            style={{ width: '100%', padding: '15px', background: '#7C6AF4', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}
          >
            Passer au plan {isStarter ? 'Starter' : 'Pro'} <ArrowRight size={14} />
          </button>
          <button onClick={onClose} style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', borderRadius: 10, fontSize: 12, color: INK3, cursor: 'pointer', fontFamily: F }}>
            Continuer avec le plan Gratuit
          </button>
        </div>

        {/* ── Right blurred widgets ── */}
        <div style={{ width: 180, background: SURFACE, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' }}>
          <FakeWidget>
            <div style={{ fontSize: 10, color: INK3, marginBottom: 8, fontWeight: 600 }}>Insights</div>
            {['ChatGPT', 'Claude'].map((name, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: i === 0 ? '#F0FDF4' : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? '#10B981' : '#818CF8' }} />
                </div>
                <div style={{ flex: 1, height: 6, background: BORDER, borderRadius: 3 }}>
                  <div style={{ width: `${i === 0 ? 72 : 48}%`, height: '100%', background: i === 0 ? '#10B981' : '#818CF8', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </FakeWidget>
          <FakeWidget>
            <div style={{ fontSize: 10, color: INK3, marginBottom: 8, fontWeight: 600 }}>Brand Performance</div>
            <svg width="140" height="60" viewBox="0 0 140 60">
              <circle cx="55" cy="35" r="24" fill="rgba(124,106,244,0.15)" stroke="#7C6AF4" strokeWidth="1.5" opacity="0.7"/>
              <circle cx="80" cy="30" r="20" fill="rgba(16,185,129,0.12)" stroke="#10B981" strokeWidth="1.5" opacity="0.7"/>
              <circle cx="68" cy="42" r="18" fill="rgba(245,158,11,0.12)" stroke="#F59E0B" strokeWidth="1.5" opacity="0.7"/>
            </svg>
          </FakeWidget>
          <FakeWidget>
            <div style={{ fontSize: 10, color: INK3, marginBottom: 6, fontWeight: 600 }}>AI Visibility</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ position: 'relative', width: 50, height: 50 }}>
                <svg width="50" height="50" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#E8E8E8" strokeWidth="5"/>
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#F59E0B" strokeWidth="5" strokeDasharray={125} strokeDashoffset={125*0.69} strokeLinecap="round"/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: INK }}>31</span>
                  <span style={{ fontSize: 7, color: INK3 }}>/100</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>Low</div>
                <div style={{ fontSize: 9, color: INK3 }}>visibility</div>
              </div>
            </div>
          </FakeWidget>
        </div>
      </motion.div>
    </div>
  );
}