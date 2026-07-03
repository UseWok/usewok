import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Sparkles } from 'lucide-react';
import TrustpilotWidget from './TrustpilotWidget';
import ProjectionChart from './ProjectionChart';

const INK = '#15130F';
const INK_FAINT = 'rgba(21,19,15,0.55)';
const BORDER = 'rgba(21,19,15,0.10)';
const CORAL = '#FF5A1F';
const CREAM = '#FAF9F6';

const NO_CODE_LOGOS = [
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/3df0acbf1_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/aa9418491_image.png',
];
const AI_LOGOS = [
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/9e164a2da_image.png',
  'https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/01634864f_image.png',
];

const QUESTIONS = [
  {
    id: 'tech_level', emoji: '🛠️', question: 'Comment gérez-vous votre site ?',
    options: [
      { value: 'no_code', label: 'Je gère seul(e)', sub: 'Wix, Squarespace, sans code', logos: NO_CODE_LOGOS },
      { value: 'ai_nocode', label: "J'utilise des IA", sub: 'ChatGPT, Claude pour m\'aider', logos: AI_LOGOS },
      { value: 'developer', label: 'Je suis développeur', sub: 'Je code moi-même mon site' },
    ],
  },
  {
    id: 'industry', emoji: '🏢', question: 'Votre secteur d\'activité ?',
    options: [
      { value: 'ecommerce', label: 'E-commerce', sub: 'Vente de produits en ligne' },
      { value: 'services', label: 'Services', sub: 'Conseil, agence, freelance' },
      { value: 'local', label: 'Commerce local', sub: 'Restaurant, magasin, artisan' },
      { value: 'saas', label: 'SaaS / Tech', sub: 'Logiciel, application' },
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
];

export default function AnalyzeLeadModal({ onClose }) {
  const [step, setStep] = useState('lead'); // lead -> quiz -> projection
  const [url, setUrl] = useState('');
  const [qStep, setQStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setStep('quiz');
  };

  const handleAnswer = (value) => {
    const q = QUESTIONS[qStep];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (qStep < QUESTIONS.length - 1) {
      setTimeout(() => setQStep(s => s + 1), 200);
    } else {
      setTimeout(() => setStep('projection'), 200);
    }
  };

  const goCreateAccount = () => {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    sessionStorage.setItem('wok_post_login_url', cleanUrl);
    sessionStorage.setItem('wok_post_login_quiz', JSON.stringify(answers));
    window.location.href = '/register';
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(21,19,15,0.6)', backdropFilter: 'blur(10px)', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 480, background: CREAM, borderRadius: 24, overflow: 'hidden', position: 'relative', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(21,19,15,0.35)' }}>
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

              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
                <input required autoFocus value={url} onChange={e => setUrl(e.target.value)} placeholder="votresite.com"
                  style={{ padding: '13px 15px', border: `1.5px solid ${BORDER}`, borderRadius: 12, fontSize: 14.5, fontFamily: 'inherit', outline: 'none', background: '#fff' }} />
                <button type="submit"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', background: INK, color: CREAM, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Lancer mon analyse <ArrowRight size={14} />
                </button>
              </form>

              <p style={{ fontSize: 11, fontWeight: 700, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Vérifié par Trustpilot</p>
              <TrustpilotWidget />
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div key={`quiz-${qStep}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} style={{ padding: '32px 28px 24px' }}>
              <div style={{ height: 4, background: 'rgba(21,19,15,0.08)', borderRadius: 3, marginBottom: 22, overflow: 'hidden' }}>
                <motion.div animate={{ width: `${((qStep + 1) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${CORAL}, #FFB98F)`, borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(150deg, #FFE7D6, #FFB98F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                  {QUESTIONS[qStep].emoji}
                </div>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Question {qStep + 1}/{QUESTIONS.length}</span>
                  <h2 style={{ fontSize: 18.5, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>{QUESTIONS[qStep].question}</h2>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {QUESTIONS[qStep].options.map((opt, i) => {
                  const active = answers[QUESTIONS[qStep].id] === opt.value;
                  return (
                    <motion.button key={opt.value} onClick={() => handleAnswer(opt.value)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '14px 16px', background: active ? '#FFE7D6' : '#fff', border: `1.5px solid ${active ? CORAL : BORDER}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', boxShadow: active ? '0 4px 14px rgba(255,90,31,0.18)' : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{opt.label}</span>
                        <span style={{ fontSize: 11.5, color: INK_FAINT }}>{opt.sub}</span>
                      </div>
                      {opt.logos && (
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {opt.logos.map((src, j) => (
                            <img key={j} src={src} alt="" style={{ width: 26, height: 26, borderRadius: 7, objectFit: 'contain', background: '#fff' }} />
                          ))}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Vérifié par Trustpilot</p>
                <TrustpilotWidget />
              </div>
            </motion.div>
          )}

          {step === 'projection' && (
            <motion.div key="projection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 28px 28px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#EBF6F0', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#1E7A4C', marginBottom: 14 }}>
                <Check size={11} /> Votre projection est prête
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{url.replace(/https?:\/\//, '')}</h2>
              <p style={{ fontSize: 13, color: INK_FAINT, margin: '0 0 20px' }}>Basé sur vos réponses — avec UseWok, en 3 mois.</p>

              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: 18, marginBottom: 20 }}>
                <ProjectionChart answers={answers} />
              </div>

              <button onClick={goCreateAccount}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', background: CORAL, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
                <Sparkles size={14} /> Créer mon compte et lancer le scan <ArrowRight size={14} />
              </button>
              <p style={{ textAlign: 'center', fontSize: 11.5, color: INK_FAINT, margin: 0 }}>Résultat en moins de 60 secondes</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}