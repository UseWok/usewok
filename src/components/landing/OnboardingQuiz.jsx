import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// ── Light theme tokens (Linear style)
const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#FAFAFA';
const T1 = '#0F0F0F';
const T2 = '#6B6B6B';
const T3 = '#B0B0B0';
const BORDER = '#E5E5E5';
const ACCENT = '#0F0F0F';

// ── Trades — digital/coach oriented
const TRADES = [
  { id: 'coach', label: 'Coach / Consultant' },
  { id: 'agency', label: 'Marketing Agency' },
  { id: 'ecommerce', label: 'E-commerce / Retail' },
  { id: 'saas', label: 'SaaS / Tech' },
  { id: 'freelance', label: 'Freelancer / Creator' },
  { id: 'local', label: 'Local Business' },
  { id: 'media', label: 'Media / Publisher' },
];

// ── Q2: Business maturity
const MATURITY = [
  { id: 'starting', label: 'Just getting started', desc: 'Building my first online presence' },
  { id: 'growing', label: 'Growing', desc: 'I have traffic but want more visibility' },
  { id: 'scaling', label: 'Scaling', desc: 'Optimizing an established business' },
];

// ── Q3: Marketing focus (multi-select) — updated labels
const OBJECTIVES = [
  { id: 'paid_ads', label: 'Paid Ads Management' },
  { id: 'local', label: 'Local Marketing' },
  { id: 'ai_visibility', label: 'AI Visibility' },
  { id: 'competitor', label: 'Competitor & Market Analysis' },
  { id: 'seo', label: 'SEO Optimization' },
  { id: 'content', label: 'Content Creation' },
  { id: 'not_sure', label: 'Not Sure' },
];

// ── Smooth analysis loader (60s, post-quiz)
function AnalysisLoader({ answers, onDone }) {
  const STEPS = [
    { id: 'profile', label: 'Building your business profile', sub: 'Mapping industry patterns & benchmarks', duration: 8000 },
    { id: 'crawl', label: 'Crawling AI training datasets', sub: 'Checking ChatGPT, Gemini & Perplexity indexes', duration: 12000 },
    { id: 'competitors', label: 'Scanning competitor visibility', sub: 'Identifying gaps in your market segment', duration: 14000 },
    { id: 'content', label: 'Analysing your content signals', sub: 'E-E-A-T score, structured data, citations', duration: 12000 },
    { id: 'scoring', label: 'Computing your AI visibility score', sub: 'Aggregating 47 ranking signals', duration: 10000 },
    { id: 'plan', label: 'Generating your action plan', sub: 'Personalising recommendations for ' + (answers.trade || 'your business'), duration: 4000 },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState([]);
  const totalDuration = STEPS.reduce((s, t) => s + t.duration, 0); // ~60s

  useEffect(() => {
    let elapsed = 0;
    const stepTimers = [];
    STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setCurrentStep(i);
        if (i > 0) setStepsCompleted(p => [...p, STEPS[i - 1].id]);
      }, elapsed);
      stepTimers.push(t);
      elapsed += step.duration;
    });

    // Final
    const finalTimer = setTimeout(() => {
      setStepsCompleted(STEPS.map(s => s.id));
      setProgress(100);
      setTimeout(onDone, 600);
    }, totalDuration);

    // Progress bar
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + (100 / (totalDuration / 200)), 99));
    }, 200);

    return () => {
      stepTimers.forEach(clearTimeout);
      clearTimeout(finalTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: F, padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, color: T3, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>
            Analysing your business
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: T1, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Building your<br />AI visibility strategy
          </h2>
        </motion.div>

        {/* Progress bar */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>Progress</span>
            <span style={{ fontSize: 12, color: T1, fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 2, background: BORDER, borderRadius: 1, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: T1, borderRadius: 1 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, i) => {
            const isDone = stepsCompleted.includes(step.id);
            const isActive = currentStep === i && !isDone;
            return (
              <motion.div key={step.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '16px 0',
                  borderBottom: i < STEPS.length - 1 ? `1px solid ${BORDER}` : 'none',
                  opacity: i > currentStep ? 0.35 : 1,
                  transition: 'opacity 0.4s',
                }}>
                {/* Status icon */}
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  background: isDone ? T1 : isActive ? 'transparent' : 'transparent',
                  border: isDone ? 'none' : isActive ? `2px solid ${T1}` : `2px solid ${BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                }}>
                  {isDone ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : isActive ? (
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', background: T1,
                      animation: 'pulse 1.2s ease-in-out infinite',
                    }} />
                  ) : null}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: isActive || isDone ? 600 : 400, color: isDone || isActive ? T1 : T2, marginBottom: 2, transition: 'all 0.3s' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 12, color: T3, transition: 'all 0.3s', opacity: isActive ? 1 : 0.6 }}>
                    {step.sub}
                  </div>
                  {isActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {[0, 1, 2].map(j => (
                        <div key={j} style={{
                          width: 3, height: 3, borderRadius: '50%', background: T2,
                          animation: `blink 1.2s ${j * 0.2}s ease-in-out infinite`,
                        }} />
                      ))}
                    </motion.div>
                  )}
                </div>
                {isDone && (
                  <span style={{ fontSize: 11, color: T2, fontWeight: 500, alignSelf: 'center' }}>Done</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.7); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
      `}</style>
    </div>
  );
}

// ── Plan matching screen — connected to backend plans
function PlanScreen({ answers, onFree }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    // Load from DB
    base44.entities.AppSettings.filter({ key: 'plans_config' })
      .then(res => {
        if (res?.[0]?.value) {
          try {
            const parsed = JSON.parse(res[0].value);
            const visible = parsed.filter(p => p.visible !== false && p.price_monthly > 0);
            // Sort by price ascending — always show cheapest first
            visible.sort((a, b) => (a.price_monthly ?? 0) - (b.price_monthly ?? 0));
            setPlans(visible);
            setSelectedIdx(0);
          } catch {}
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedPlan = plans[selectedIdx];

  const handleUpgrade = () => {
    if (!selectedPlan) return;
    const url = selectedPlan.checkout_url_monthly;
    if (url?.startsWith('http')) { window.location.href = url; return; }
    window.location.href = `/checkout?plan=${selectedPlan.id}&billing=monthly`;
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ width: 20, height: 20, border: `2px solid ${BORDER}`, borderTopColor: T1, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Fallback plans if DB empty
  const displayPlans = plans.length > 0 ? plans : [
    { id: 'starter', name: 'Starter', price_monthly: 49, features: [{ text: 'Monthly AI visibility audit' }, { text: '5 tracked keywords' }, { text: 'Competitor snapshot' }, { text: 'Email support' }] },
    { id: 'pro', name: 'Pro', price_monthly: 99, features: [{ text: 'Weekly AI audit' }, { text: '25 tracked keywords' }, { text: 'Real-time dashboard' }, { text: 'AI recommendations' }, { text: 'Priority support' }] },
  ];
  const sel = displayPlans[selectedIdx] || displayPlans[0];

  // Features display
  const selFeatures = (sel.features || []).map(f => f.text || f);

  // Trade label
  const tradeMap = { coach: 'coaches & consultants', agency: 'marketing agencies', ecommerce: 'e-commerce brands', saas: 'SaaS companies', freelance: 'freelancers', local: 'local businesses', media: 'media brands' };
  const tradeLabel = tradeMap[answers?.trade] || 'your business';

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: T1, margin: '0 0 10px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            This is your best<br />plan match
          </h1>
          <p style={{ fontSize: 14, color: T2, margin: 0, lineHeight: 1.6 }}>
            <span style={{ color: '#6366F1', fontWeight: 600 }}>Tailored for {tradeLabel}</span> — based on your goals.
          </p>
        </motion.div>

        {/* Plan selector tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: 0, marginBottom: 28, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', background: '#F5F5F5' }}>
          {displayPlans.map((plan, i) => {
            const isSelected = i === selectedIdx;
            return (
              <button key={plan.id} onClick={() => setSelectedIdx(i)}
                style={{
                  flex: 1, padding: '14px 16px', border: 'none', cursor: 'pointer', fontFamily: F,
                  background: isSelected ? '#fff' : 'transparent',
                  borderRadius: isSelected ? 10 : 0,
                  margin: isSelected ? 2 : 0,
                  transition: 'all 200ms',
                  boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  position: 'relative',
                }}>
                {i === 0 && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    background: '#6366F1', borderRadius: '0 0 6px 6px',
                    padding: '2px 8px', fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.04em',
                  }}>FOR YOU</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 2 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: T2 }}>${plan.price_monthly}/mo</div>
              </button>
            );
          })}
        </motion.div>

        {/* Features list */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ marginBottom: 28 }}>
          {selFeatures.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + i * 0.05 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < selFeatures.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M2.5 7l3 3 6-6" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 14, color: T1, lineHeight: 1.5 }}>{f}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Price recap */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T1 }}>
            ${sel.price_monthly}/month
            <span style={{ fontSize: 13, fontWeight: 400, color: T2, marginLeft: 6 }}>billed monthly, cancel anytime</span>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleUpgrade} style={{
            width: '100%', padding: '15px', background: T1, color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: F, transition: 'opacity 150ms',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Get started — ${sel.price_monthly}/mo
          </button>
          <button onClick={onFree} style={{
            width: '100%', padding: '14px', background: 'transparent', color: T2,
            border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: F, transition: 'all 150ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.borderColor = '#C0C0C0'; }}
            onMouseLeave={e => { e.currentTarget.style.color = T2; e.currentTarget.style.borderColor = BORDER; }}>
            Continue for free
          </button>
        </motion.div>

        {/* Legal */}
        <p style={{ fontSize: 11, color: T3, textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          No trial period. You may cancel your subscription at any time in accordance with our cancellation policy.
        </p>
      </div>
    </div>
  );
}

// ── Progress dots
function ProgressBar({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 3, borderRadius: 2,
          width: i === step ? 24 : 12,
          background: i < step ? T1 : i === step ? T1 : BORDER,
          transition: 'all 350ms cubic-bezier(0.22,1,0.36,1)',
        }} />
      ))}
    </div>
  );
}

// ── Radio option (single select)
function RadioOption({ label, desc, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', textAlign: 'left', fontFamily: F, cursor: 'pointer',
      background: '#fff',
      border: `1.5px solid ${selected ? T1 : BORDER}`,
      borderRadius: 10, transition: 'all 150ms',
      boxShadow: selected ? '0 0 0 3px rgba(0,0,0,0.06)' : 'none',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? T1 : '#D0D0D0'}`,
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? T1 : '#fff', transition: 'all 150ms',
      }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: T1 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: T2, marginTop: 1 }}>{desc}</div>}
      </div>
    </button>
  );
}

// ── Checkbox option (multi select)
function CheckOption({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', textAlign: 'left', fontFamily: F, cursor: 'pointer',
      background: selected ? 'rgba(0,0,0,0.02)' : '#fff',
      border: `1.5px solid ${selected ? T1 : BORDER}`,
      borderRadius: 10, transition: 'all 150ms',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 5, border: `2px solid ${selected ? T1 : '#D0D0D0'}`,
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? T1 : '#fff', transition: 'all 150ms',
      }}>
        {selected && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color: T1 }}>{label}</span>
    </button>
  );
}

const itemV = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.3 } },
};
const listV = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

// ── MAIN
export default function OnboardingQuiz({ onComplete }) {
  const [phase, setPhase] = useState('quiz'); // quiz | loading | plans
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ trade: '', maturity: '', objectives: [] });

  const set = (key, val) => setAnswers(p => ({ ...p, [key]: val }));

  const toggleObj = (id) => {
    setAnswers(p => ({
      ...p,
      objectives: p.objectives.includes(id) ? p.objectives.filter(x => x !== id) : [...p.objectives, id],
    }));
  };

  const next = () => setStep(s => s + 1);

  const handleFinish = () => {
    base44.entities.ContactLead.create({
      role: answers.trade,
      status: 'new',
      message: `maturity:${answers.maturity} obj:${answers.objectives.join(',')}`,
    }).catch(() => {});
    setPhase('loading');
  };

  if (phase === 'loading') return <AnalysisLoader answers={answers} onDone={() => setPhase('plans')} />;
  if (phase === 'plans') return <PlanScreen answers={answers} onFree={() => base44.auth.redirectToLogin('/app')} />;

  const TOTAL = 3;

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Top meta */}
        <div style={{ marginBottom: 32 }}>
          <ProgressBar step={step} total={TOTAL} />
          <p style={{ fontSize: 12, color: T3, margin: '8px 0 0', fontWeight: 500 }}>
            Let's customize your experience
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 0: Business type */}
          {step === 0 && (
            <motion.div key="trade"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: T1, margin: '0 0 24px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                What best describes<br />your business?
              </h2>
              <motion.div variants={listV} initial="hidden" animate="show"
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TRADES.map(t => (
                  <motion.div key={t.id} variants={itemV}>
                    <RadioOption
                      label={t.label}
                      selected={answers.trade === t.id}
                      onClick={() => { set('trade', t.id); setTimeout(next, 250); }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ── Step 1: Maturity */}
          {step === 1 && (
            <motion.div key="maturity"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: T1, margin: '0 0 24px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                Where is your business<br />right now?
              </h2>
              <motion.div variants={listV} initial="hidden" animate="show"
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MATURITY.map(m => (
                  <motion.div key={m.id} variants={itemV}>
                    <RadioOption
                      label={m.label}
                      desc={m.desc}
                      selected={answers.maturity === m.id}
                      onClick={() => { set('maturity', m.id); setTimeout(next, 250); }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ── Step 2: Objectives (multi) */}
          {step === 2 && (
            <motion.div key="objectives"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: T1, margin: '0 0 6px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                What are your main<br />marketing priorities?
              </h2>
              <p style={{ fontSize: 13, color: T2, margin: '0 0 24px' }}>Select all that apply.</p>
              <motion.div variants={listV} initial="hidden" animate="show"
                style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {OBJECTIVES.map(obj => (
                  <motion.div key={obj.id} variants={itemV}>
                    <CheckOption
                      label={obj.label}
                      selected={answers.objectives.includes(obj.id)}
                      onClick={() => toggleObj(obj.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
              <button
                onClick={handleFinish}
                disabled={answers.objectives.length === 0}
                style={{
                  width: '100%', padding: '15px',
                  background: answers.objectives.length > 0 ? T1 : '#E5E5E5',
                  color: answers.objectives.length > 0 ? '#fff' : T3,
                  border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
                  cursor: answers.objectives.length > 0 ? 'pointer' : 'default',
                  fontFamily: F, transition: 'all 200ms',
                }}>
                Continue →
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}