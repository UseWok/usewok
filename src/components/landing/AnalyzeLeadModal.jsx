import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Sparkles } from 'lucide-react';
import TrustpilotWidget from './TrustpilotWidget';
import ProjectionChart from './ProjectionChart';

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
    id: 'tech_level', question: 'How do you manage your site?',
    options: [
      { value: 'no_code', label: 'I manage it myself', sub: 'Wix, Squarespace, no code', logos: NO_CODE_LOGOS },
      { value: 'ai_nocode', label: 'I use AI tools', sub: 'ChatGPT, Claude to help me', logos: AI_LOGOS },
      { value: 'developer', label: "I'm a developer", sub: 'I code my site myself' },
    ],
  },
  {
    id: 'industry', question: 'What industry are you in?',
    options: [
      { value: 'ecommerce', label: 'E-commerce', sub: 'Selling products online' },
      { value: 'services', label: 'Services', sub: 'Consulting, agency, freelance' },
      { value: 'local', label: 'Local business', sub: 'Restaurant, shop, artisan' },
      { value: 'saas', label: 'SaaS / Tech', sub: 'Software, application' },
    ],
  },
  {
    id: 'main_goal', question: 'What is your main goal?',
    options: [
      { value: 'more_clients', label: 'More clients', sub: 'Get recommended by ChatGPT, Gemini…' },
      { value: 'local_visibility', label: 'Local visibility', sub: 'Show up for my area' },
      { value: 'competitor_beat', label: 'Beat my competitors', sub: 'Outrank them on AI engines' },
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
    <div className="alm-stage" onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`
        .alm-stage{
          --cream:#FBF8F2; --cream-2:#F3EEE3; --ink:#15130F; --ink-soft:#4A453B;
          --ink-faint:rgba(21,19,15,0.5); --orange:#FF5A1F; --orange-deep:#C43E14;
          --orange-pale:#FFE7D6; --green:#1E7A4C; --green-pale:#EBF6F0;
          --line:rgba(21,19,15,0.10); --line-strong:rgba(21,19,15,0.14);
          position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center;
          background:rgba(21,19,15,0.6); backdrop-filter:blur(10px); padding:16px; font-family:'Inter',sans-serif;
        }
        .alm-stage *{ box-sizing:border-box; }
        .alm-modal{
          width:100%; max-width:420px; background:var(--cream); border-radius:22px; padding:32px 30px;
          box-shadow:0 30px 70px rgba(21,19,15,0.16), 0 4px 14px rgba(21,19,15,0.06);
          position:relative; max-height:92vh; overflow-y:auto;
        }
        .alm-close{
          position:absolute; top:16px; right:16px; width:30px; height:30px; border-radius:9px;
          background:#fff; border:1px solid var(--line-strong); display:flex; align-items:center;
          justify-content:center; cursor:pointer; z-index:2;
        }
        .alm-eyebrow{
          display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700;
          letter-spacing:0.05em; text-transform:uppercase; color:var(--orange-deep); margin-bottom:16px;
        }
        .alm-eyebrow .dot{ width:6px; height:6px; border-radius:50%; background:var(--orange); }
        .alm-modal h2{ font-family:'Fraunces', serif; font-weight:500; font-size:23px; letter-spacing:-0.01em; line-height:1.2; margin:0 0 10px; color:var(--ink); }
        .alm-sub{ font-size:13.5px; color:var(--ink-soft); line-height:1.5; margin-bottom:22px; }
        .alm-input{
          width:100%; height:52px; border-radius:12px; border:1px solid var(--line-strong); background:#fff;
          padding:0 16px; font-family:inherit; font-size:14.5px; color:var(--ink); outline:none;
          margin-bottom:14px; transition:border-color .15s ease, box-shadow .15s ease;
        }
        .alm-input:focus{ border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,90,31,0.14); }
        .alm-btn-dark{
          width:100%; height:52px; border-radius:12px; border:none; background:var(--ink); color:var(--cream);
          font-family:inherit; font-size:14.5px; font-weight:700; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:22px;
          transition:background .15s ease;
        }
        .alm-btn-dark:hover{ background:var(--orange-deep); }
        .alm-btn-orange{
          width:100%; height:52px; border-radius:100px; border:none; background:var(--orange); color:#fff;
          font-family:inherit; font-size:14.5px; font-weight:700; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:12px;
          transition:background .15s ease;
        }
        .alm-btn-orange:hover{ background:var(--orange-deep); }
        .alm-trust{ text-align:center; }
        .alm-tv-label{ font-size:10px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:10px; }
        .alm-progress{ height:4px; border-radius:100px; background:var(--cream-2); overflow:hidden; margin-bottom:22px; }
        .alm-progress i{ display:block; height:100%; border-radius:100px; background:linear-gradient(90deg,var(--orange),var(--orange-deep)); }
        .alm-q-head{ display:flex; align-items:center; gap:14px; margin-bottom:20px; }
        .alm-q-icon{ width:44px; height:44px; border-radius:12px; background:var(--orange-pale); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:19px; }
        .alm-qnum{ font-size:11px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:3px; }
        .alm-q-head h3{ font-size:16.5px; font-weight:700; letter-spacing:-0.01em; color:var(--ink); margin:0; }
        .alm-opt{
          width:100%; text-align:left; background:#fff; border:1px solid var(--line-strong); border-radius:14px;
          padding:15px 17px; margin-bottom:9px; cursor:pointer; display:flex; align-items:center;
          justify-content:space-between; gap:14px; transition:border-color .15s ease, background .15s ease, transform .1s ease;
          font-family:inherit;
        }
        .alm-opt:hover{ border-color:var(--orange); background:var(--orange-pale); }
        .alm-opt:active{ transform:scale(0.99); }
        .alm-opt-text b{ display:block; font-size:14px; font-weight:700; margin-bottom:3px; color:var(--ink); }
        .alm-opt-text span{ font-size:12px; color:var(--ink-faint); }
        .alm-opt-ic{ display:flex; gap:4px; flex-shrink:0; }
        .alm-opt-ic img{ width:26px; height:26px; border-radius:8px; object-fit:contain; background:#fff; }
        .alm-success-tag{
          display:inline-flex; align-items:center; gap:6px; background:var(--green-pale); color:var(--green);
          font-size:12.5px; font-weight:700; padding:7px 13px; border-radius:100px; margin-bottom:18px;
        }
        .alm-chart-card{ background:#fff; border:1px solid var(--line); border-radius:16px; padding:20px 20px 16px; margin-bottom:20px; }
        .alm-noc{ text-align:center; font-size:12px; color:var(--ink-faint); }
      `}</style>

      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="alm-modal">
        <button onClick={onClose} className="alm-close"><X size={12} color="rgba(21,19,15,0.55)" /></button>

        <AnimatePresence mode="wait">
          {step === 'lead' && (
            <motion.div key="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="alm-eyebrow"><span className="dot"></span>Free analysis</span>
              <h2>Which site should we analyze?</h2>
              <p className="alm-sub">Get your AI visibility score and a personalized action plan.</p>

              <form onSubmit={handleLeadSubmit}>
                <input required autoFocus value={url} onChange={e => setUrl(e.target.value)} placeholder="yoursite.com" className="alm-input" />
                <button type="submit" className="alm-btn-dark">
                  Start my analysis <ArrowRight size={15} />
                </button>
              </form>

              <div className="alm-trust">
                <div className="alm-tv-label">Verified by Trustpilot</div>
                <TrustpilotWidget />
              </div>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div key={`quiz-${qStep}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div className="alm-progress">
                <motion.i animate={{ width: `${((qStep + 1) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.35, ease: 'easeOut' }} />
              </div>
              <div className="alm-q-head">
                <div className="alm-q-icon">🎯</div>
                <div>
                  <div className="alm-qnum">Question {qStep + 1}/{QUESTIONS.length}</div>
                  <h3>{QUESTIONS[qStep].question}</h3>
                </div>
              </div>
              {QUESTIONS[qStep].options.map((opt, i) => (
                <motion.button key={opt.value} onClick={() => handleAnswer(opt.value)} className="alm-opt"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="alm-opt-text"><b>{opt.label}</b><span>{opt.sub}</span></div>
                  {opt.logos && (
                    <div className="alm-opt-ic">
                      {opt.logos.map((src, j) => <img key={j} src={src} alt="" />)}
                    </div>
                  )}
                </motion.button>
              ))}

              <div className="alm-trust" style={{ marginTop: 12 }}>
                <div className="alm-tv-label">Verified by Trustpilot</div>
                <TrustpilotWidget />
              </div>
            </motion.div>
          )}

          {step === 'projection' && (
            <motion.div key="projection" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="alm-success-tag"><Check size={13} /> Your projection is ready</div>
              <h2>{url.replace(/https?:\/\//, '')} — with UseWok, in 3 months.</h2>
              <p className="alm-sub">Based on your answers.</p>

              <div className="alm-chart-card">
                <ProjectionChart answers={answers} />
              </div>

              <button onClick={goCreateAccount} className="alm-btn-orange">
                <Sparkles size={14} /> Create my account & start the scan <ArrowRight size={14} />
              </button>
              <div className="alm-noc">Results in under 60 seconds</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}