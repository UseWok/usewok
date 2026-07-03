import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import TrustpilotStrip from './TrustpilotStrip';
import ProjectionChart from './ProjectionChart';

const INK = '#15130F';
const INK_FAINT = 'rgba(21,19,15,0.55)';
const BORDER = 'rgba(21,19,15,0.10)';
const CORAL = '#FF5A1F';
const CREAM = '#FAF9F6';

const QUESTIONS = [
  {
    id: 'tech_level', emoji: '🛠️', question: 'Comment gérez-vous votre site ?',
    options: [
      { value: 'no_code', label: 'Je gère seul(e)', sub: 'Wix, Squarespace, sans code' },
      { value: 'ai_nocode', label: "J'utilise des IA", sub: 'ChatGPT, Claude pour m\'aider' },
      { value: 'developer', label: 'Développeur', sub: 'Je code moi-même / équipe tech' },
    ],
  },
  {
    id: 'main_goal', emoji: '🎯', question: 'Votre objectif principal ?',
    options: [
      { value: 'more_clients', label: 'Plus de clients', sub: 'Être recommandé par ChatGPT, Gemini…' },
      { value: 'local_visibility', label: 'Visibilité locale', sub: 'Apparaître pour ma zone' },
      { value: 'competitor_beat', label: 'Dépasser mes concurrents', sub: 'Les surpasser sur les IA' },
    ],
  },
  {
    id: 'engine_priority', emoji: '🤖', question: 'Quel moteur IA compte le plus pour vous ?',
    options: [
      { value: 'chatgpt', label: 'ChatGPT', sub: 'Le plus utilisé par vos clients' },
      { value: 'gemini', label: 'Gemini', sub: 'Google AI Overviews' },
      { value: 'claude', label: 'Claude', sub: 'Assistant Anthropic' },
    ],
  },
];

const ENGINE_CHIPS = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'];

export default function AnalyzeLeadModal({ onClose }) {
  const [step, setStep] = useState('lead'); // lead -> quiz -> projection
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [qStep, setQStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim() || !email.trim()) return;
    setSubmitting(true);
    try { await base44.entities.ContactLead.create({ email, website: url, status: 'new', message: 'Landing analyze CTA' }); } catch {}
    setSubmitting(false);
    setStep('quiz');
  };

  const handleAnswer = (value) => {
    const q = QUESTIONS[qStep];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (qStep < QUESTIONS.length - 1) {
      setTimeout(() => setQStep(s => s + 1), 180);
    } else {
      setTimeout(() => setStep('projection'), 180);
    }
  };

  const goCreateAccount = () => {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    sessionStorage.setItem('wok_post_login_url', cleanUrl);
    sessionStorage.setItem('wok_post_login_quiz', JSON.stringify(answers));
    window.location.href = `/register?email=${encodeURIComponent(email)}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(21,19,15,0.55)', backdropFilter: 'blur(10px)', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 460, background: CREAM, borderRadius: 22, overflow: 'hidden', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, zIndex: 2, width: 28, height: 28, borderRadius: 9, border: `1px solid ${BORDER}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={12} color={INK_FAINT} />
        </button>

        <AnimatePresence mode="wait">
          {step === 'lead' && (
            <motion.div key="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '32px 28px 28px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#C43E14', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL }} /> Analyse gratuite
              </span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Quel site voulez-vous analyser ?</h2>
              <p style={{ fontSize: 13, color: INK_FAINT, margin: '0 0 20px', lineHeight: 1.5 }}>Recevez votre score de visibilité IA et un plan d'action personnalisé.</p>

              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <input required value={url} onChange={e => setUrl(e.target.value)} placeholder="votresite.com"
                  style={{ padding: '12px 14px', border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff' }} />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com"
                  style={{ padding: '12px 14px', border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#fff' }} />
                <button type="submit" disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: INK, color: CREAM, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {submitting ? 'Un instant…' : 'Lancer mon analyse'} <ArrowRight size={14} />
                </button>
              </form>

              <TrustpilotStrip compact />
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div key={`quiz-${qStep}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} style={{ padding: '32px 28px 28px' }}>
              <div style={{ height: 3, background: 'rgba(21,19,15,0.08)', borderRadius: 2, marginBottom: 20 }}>
                <motion.div animate={{ width: `${((qStep + 1) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.3 }}
                  style={{ height: '100%', background: CORAL, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 24 }}>{QUESTIONS[qStep].emoji}</span>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: INK, margin: '10px 0 18px', letterSpacing: '-0.02em' }}>{QUESTIONS[qStep].question}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {QUESTIONS[qStep].options.map(opt => (
                  <button key={opt.value} onClick={() => handleAnswer(opt.value)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '12px 16px', background: answers[QUESTIONS[qStep].id] === opt.value ? '#FFE7D6' : '#fff', border: `1px solid ${answers[QUESTIONS[qStep].id] === opt.value ? '#FF5A1F80' : BORDER}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{opt.label}</span>
                    <span style={{ fontSize: 11.5, color: INK_FAINT }}>{opt.sub}</span>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                {ENGINE_CHIPS.map(e => (
                  <span key={e} style={{ fontSize: 10.5, fontWeight: 600, color: INK_FAINT, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 999, padding: '4px 10px' }}>{e}</span>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'projection' && (
            <motion.div key="projection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 28px 28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#EBF6F0', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#1E7A4C', marginBottom: 14 }}>
                <Check size={11} /> Votre projection est prête
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{url.replace(/https?:\/\//, '')}</h2>
              <p style={{ fontSize: 13, color: INK_FAINT, margin: '0 0 20px' }}>Basé sur vos réponses — score estimé sur 3 mois avec UseWok.</p>

              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, marginBottom: 20 }}>
                <ProjectionChart answers={answers} />
              </div>

              <button onClick={goCreateAccount}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: CORAL, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
                Créer mon compte et lancer le scan <ArrowRight size={14} />
              </button>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: INK_FAINT, margin: 0 }}>Gratuit · Sans carte bancaire</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}