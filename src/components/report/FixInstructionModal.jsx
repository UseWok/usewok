import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Wrench, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Thinking animation
function ThinkingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      {/* Halo orb */}
      <div className="relative flex items-center justify-center">
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.04) 60%, transparent 100%)',
          animation: 'haloPulse 2s ease-in-out infinite',
          position: 'absolute',
        }} />
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(124,58,237,0.12) 100%)',
          animation: 'haloInner 2s ease-in-out infinite 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#7C3AED',
            animation: 'dotPulse 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* Thinking label */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
          Thinking<span style={{ animation: 'ellipsis 1.5s steps(4, end) infinite' }}>...</span>
        </p>
        <p style={{ fontSize: 12, color: '#888' }}>Analyse du problème en cours</p>
      </div>

      {/* Shimmer bars */}
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[90, 70, 80, 55].map((w, i) => (
          <div key={i} style={{
            height: 10, borderRadius: 6, width: `${w}%`,
            background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)',
            backgroundSize: '400% 100%',
            animation: `skshimmer 1.4s ease-in-out infinite ${i * 0.15}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes haloPulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.3);opacity:1} }
        @keyframes haloInner { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(0.6);opacity:0.4} }
        @keyframes ellipsis { 0%{content:'.'} 33%{content:'..'} 66%,100%{content:'...'} }
        @keyframes skshimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
      `}</style>
    </div>
  );
}

export default function FixInstructionModal({ issue, issueId, profile, cachedFix, onClose, onFixSaved }) {
  const [fix, setFix] = useState(cachedFix || null);
  const [loading, setLoading] = useState(!cachedFix);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (cachedFix) { setFix(cachedFix); setLoading(false); return; }
    // Call backend — pass full profile with preferences
    base44.functions.invoke('generateFixInstruction', {
      issueId,
      issueProblem: issue,
      businessProfile: {
        identity_name: profile?.identity_name,
        identity_industry: profile?.identity_industry,
        identity_city: profile?.identity_city,
        site_url: profile?.site_url,
        identity_target: profile?.identity_target,
        user_preferences: profile?.user_preferences, // Pass preferences to detect tech_level
      },
    }).then(res => {
      const data = res?.data;
      setFix(data);
      setLoading(false);
      if (data && onFixSaved) onFixSaved(issueId, data);
    }).catch(err => {
      console.error('Error generating fix:', err);
      setFix({ summary: 'Impossible de générer les instructions.', steps: [] });
      setLoading(false);
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(fix?.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isText = fix?.type === 'TEXTE';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.93, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.93, y: 16, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480,
            boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F1F0EE', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Instructions de correction</p>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.4 }}>{issue}</p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#F5F5F3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={14} color="#888" />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px' }}>
            {loading ? (
              <ThinkingAnimation />
            ) : fix ? (
              <div>
                {/* Profile badge */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px',
                    borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    background: fix.profile_type === 'no_code' ? '#FEF3C7' : fix.profile_type === 'ai_nocode' ? '#DDD6FE' : '#F3E8FF',
                    color: fix.profile_type === 'no_code' ? '#B45309' : fix.profile_type === 'ai_nocode' ? '#5B21B6' : '#6B21A8',
                  }}>
                    {fix.profile_type === 'no_code' && '🖱️ No-Code'}
                    {fix.profile_type === 'ai_nocode' && '🤖 IA Helper'}
                    {fix.profile_type === 'developer' && '💻 Developer'}
                  </div>
                </div>

                {/* Summary (the key info) */}
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, lineHeight: 1.5 }}>
                  {fix.summary}
                </p>

                {/* Steps or Prompt */}
                {fix.prompt ? (
                  // AI-NOCODE: show the prompt
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ➡️ Copie ceci dans ChatGPT ou Claude:
                    </p>
                    <div style={{
                      background: '#F8F7F4', border: '1px solid #E8E6E1',
                      borderRadius: 12, padding: '14px 16px',
                      fontSize: 12, color: '#1a1a1a', lineHeight: 1.6,
                      whiteSpace: 'pre-wrap', fontFamily: 'monospace',
                      maxHeight: 240, overflowY: 'auto',
                    }}>
                      {fix.prompt}
                    </div>
                  </div>
                ) : fix.steps && fix.steps.length > 0 ? (
                  // NO-CODE or DEVELOPER: show steps
                  <div>
                    {fix.steps.map((step, i) => (
                      <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < fix.steps.length - 1 ? '1px solid #E8E6E1' : 'none' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Étape {i + 1}
                        </p>
                        <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : fix.explanation ? (
                  // DEVELOPER: explanation
                  <div>
                    <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>
                      {fix.explanation}
                    </p>
                  </div>
                ) : null}

                {/* Time estimate */}
                {fix.time_estimate && (
                  <p style={{ fontSize: 11, color: '#888', marginTop: 12, paddingTop: 12, borderTop: '1px solid #E8E6E1' }}>
                    ⏱️ Temps estimé: <strong>{fix.time_estimate}</strong>
                  </p>
                )}

                {/* Copy prompt button (only for ai_nocode) */}
                {fix.prompt && (
                  <button
                    onClick={handleCopy}
                    style={{
                      marginTop: 14, width: '100%', padding: '12px',
                      background: copied ? '#059669' : '#7C3AED',
                      color: '#fff', border: 'none', borderRadius: 10,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'background 0.2s',
                    }}
                  >
                    {copied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier le prompt</>}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}