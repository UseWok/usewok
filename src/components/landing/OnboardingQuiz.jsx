import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.5)';
const T3 = 'rgba(255,255,255,0.25)';

const TRADES = [
  'Florist', 'Hairdresser', 'Plumber / Electrician', 'Restaurant / Café',
  'Coach / Consultant', 'Lawyer / Notary', 'Doctor / Therapist',
  'Architect / Interior Designer', 'Realtor', 'Other',
];

const CLIENTS = [
  { label: 'Individuals', icon: '👤', desc: 'B2C' },
  { label: 'Businesses', icon: '🏢', desc: 'B2B' },
  { label: 'Both', icon: '🤝', desc: 'Mixed' },
];

const TONES = [
  {
    label: 'Warm', icon: '☀️',
    example: '"Hello! I\'m here to help you feel good and find exactly what you need."',
  },
  {
    label: 'Professional', icon: '💼',
    example: '"Our firm provides tailored expertise to meet your strategic objectives."',
  },
  {
    label: 'Direct', icon: '⚡',
    example: '"No fluff. Fast results. Real expertise."',
  },
];

const BUILDING_STEPS = [
  'Analyzing your profile...',
  'Identifying your AI optimization levers...',
  'Configuring your dedicated AI team...',
  'Building your optimization plan...',
  'Generating your first actions...',
];

export default function OnboardingQuiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    business_name: '',
    trade: '',
    city: '',
    clients: '',
    tone: '',
    has_ecommerce: null,
    products: '',
    email: '',
  });
  const [validating, setValidating] = useState(false);
  const [building, setBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [done, setDone] = useState(false);

  const TOTAL_STEPS = 8;
  const progress = ((step) / TOTAL_STEPS) * 100;

  const set = (key, value) => setAnswers(prev => ({ ...prev, [key]: value }));

  const next = () => {
    setValidating(false);
    setStep(s => s + 1);
  };

  const handleChoice = (key, value) => {
    set(key, value);
    setTimeout(next, 400);
  };

  const handleSubmit = async () => {
    setBuilding(true);
    // Animate building steps
    for (let i = 0; i < BUILDING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 900));
      setBuildStep(i + 1);
    }
    // Save lead
    try {
      await base44.entities.ContactLead.create({
        email: answers.email,
        first_name: answers.business_name,
        website: answers.city,
        role: answers.trade,
        message: JSON.stringify({ tone: answers.tone, clients: answers.clients }),
        status: 'new',
      });
    } catch {}
    await new Promise(r => setTimeout(r, 600));
    setDone(true);
    setTimeout(() => onComplete?.(answers), 1200);
  };

  if (building) {
    return (
      <div style={{ fontFamily: F, textAlign: 'center', padding: '60px 24px' }}>
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="building" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T1, marginBottom: 32, letterSpacing: '-0.03em' }}>
                Building your AI team...
              </div>
              <div style={{
                background: '#111113',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12,
                padding: '28px 32px',
                maxWidth: 420,
                margin: '0 auto',
              }}>
                {/* Progress bar */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 24 }}>
                  <div style={{
                    height: '100%',
                    width: `${(buildStep / BUILDING_STEPS.length) * 100}%`,
                    background: 'linear-gradient(90deg, #5A5AF0, #22c55e)',
                    transition: 'width 0.8s ease',
                    borderRadius: 2,
                  }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {BUILDING_STEPS.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        background: i < buildStep ? '#22c55e' : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s',
                      }}>
                        {i < buildStep && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{
                        fontSize: 13, color: i < buildStep ? T1 : T3, transition: 'color 0.3s',
                      }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T1, marginBottom: 10, letterSpacing: '-0.03em' }}>
                Your AI team is ready.
              </div>
              <div style={{ fontSize: 14, color: T2 }}>Redirecting you to your optimization dashboard...</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <QuizStep
            step={1} total={TOTAL_STEPS} progress={progress}
            title="What's your business name?"
            subtitle="We'll use it to personalize your AI optimization plan."
          >
            <input
              autoFocus
              value={answers.business_name}
              onChange={e => set('business_name', e.target.value)}
              placeholder="e.g. Maison Fleurie"
              onKeyDown={e => e.key === 'Enter' && answers.business_name.trim() && next()}
              style={inputStyle}
            />
            <NextBtn disabled={!answers.business_name.trim()} onClick={next} />
          </QuizStep>
        );

      case 1:
        return (
          <QuizStep
            step={2} total={TOTAL_STEPS} progress={progress}
            title="What's your business type?"
            subtitle="Select the option that best describes your activity."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TRADES.map(t => (
                <ChoiceBtn
                  key={t} label={t}
                  selected={answers.trade === t}
                  onClick={() => handleChoice('trade', t)}
                />
              ))}
            </div>
          </QuizStep>
        );

      case 2:
        return (
          <QuizStep
            step={3} total={TOTAL_STEPS} progress={progress}
            title="Which city do you work in?"
            subtitle="AI models use location to recommend local businesses."
          >
            <input
              autoFocus
              value={answers.city}
              onChange={e => set('city', e.target.value)}
              placeholder="e.g. Lyon, Bordeaux, Paris 11..."
              onKeyDown={e => e.key === 'Enter' && answers.city.trim() && next()}
              style={inputStyle}
            />
            <NextBtn disabled={!answers.city.trim()} onClick={next} />
          </QuizStep>
        );

      case 3:
        return (
          <QuizStep
            step={4} total={TOTAL_STEPS} progress={progress}
            title="Who is your ideal client?"
            subtitle="This helps us target the right AI queries for you."
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {CLIENTS.map(c => (
                <button
                  key={c.label}
                  onClick={() => handleChoice('clients', c.label)}
                  style={{
                    background: answers.clients === c.label ? 'rgba(90,90,240,0.12)' : '#111113',
                    border: `1.5px solid ${answers.clients === c.label ? 'rgba(90,90,240,0.6)' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: 10, padding: '20px 12px',
                    cursor: 'pointer', fontFamily: F, textAlign: 'center',
                    transition: 'all 150ms',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: T3, marginTop: 3 }}>{c.desc}</div>
                </button>
              ))}
            </div>
          </QuizStep>
        );

      case 4:
        return (
          <QuizStep
            step={5} total={TOTAL_STEPS} progress={progress}
            title="What brand tone do you want?"
            subtitle="Choose the style that fits you — here's a concrete example for each."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TONES.map(t => (
                <button
                  key={t.label}
                  onClick={() => handleChoice('tone', t.label)}
                  style={{
                    background: answers.tone === t.label ? 'rgba(90,90,240,0.12)' : '#111113',
                    border: `1.5px solid ${answers.tone === t.label ? 'rgba(90,90,240,0.6)' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: 10, padding: '14px 16px',
                    cursor: 'pointer', fontFamily: F, textAlign: 'left',
                    transition: 'all 150ms', display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T1, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: T3, fontStyle: 'italic', lineHeight: 1.5 }}>{t.example}</div>
                  </div>
                </button>
              ))}
            </div>
          </QuizStep>
        );

      case 5:
        return (
          <QuizStep
            step={6} total={TOTAL_STEPS} progress={progress}
            title="Do you sell products or services online?"
            subtitle="This determines which AI channels to prioritize for you."
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ label: 'Yes', icon: '🛒' }, { label: 'No', icon: '📞' }].map(opt => (
                <button
                  key={opt.label}
                  onClick={() => {
                    set('has_ecommerce', opt.label === 'Yes');
                    setTimeout(next, 400);
                  }}
                  style={{
                    background: '#111113',
                    border: '1.5px solid rgba(255,255,255,0.09)',
                    borderRadius: 10, padding: '24px 12px',
                    cursor: 'pointer', fontFamily: F, textAlign: 'center',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(90,90,240,0.5)'; e.currentTarget.style.background = 'rgba(90,90,240,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = '#111113'; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T1 }}>{opt.label}</div>
                </button>
              ))}
            </div>
          </QuizStep>
        );

      case 6:
        if (!answers.has_ecommerce) {
          // Skip to email
          setTimeout(() => setStep(7), 10);
          return null;
        }
        return (
          <QuizStep
            step={7} total={TOTAL_STEPS} progress={progress}
            title="List 1 to 3 of your main offers"
            subtitle="Name and approximate price — AI will use this to present you to your clients."
          >
            <textarea
              autoFocus
              value={answers.products}
              onChange={e => set('products', e.target.value)}
              placeholder={'e.g.\n- Wedding bouquet — from €120\n- Individual subscription — €49/month\n- Express consultation — €80'}
              rows={5}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
            />
            <NextBtn disabled={!answers.products.trim()} onClick={next} />
          </QuizStep>
        );

      case 7:
        return (
          <QuizStep
            step={8} total={TOTAL_STEPS} progress={progress}
            title="Where should we send your AI optimization plan?"
            subtitle="Your full report + personalized actions, delivered immediately."
          >
            <input
              autoFocus
              type="email"
              value={answers.email}
              onChange={e => set('email', e.target.value)}
              placeholder="your@email.com"
              onKeyDown={e => e.key === 'Enter' && answers.email.includes('@') && handleSubmit()}
              style={inputStyle}
            />
            <button
              onClick={handleSubmit}
              disabled={!answers.email.includes('@')}
              style={{
                marginTop: 12, width: '100%',
                fontFamily: F, fontSize: 15, fontWeight: 600,
                color: '#0A0A0B',
                background: answers.email.includes('@') ? T1 : 'rgba(255,255,255,0.15)',
                border: 'none', borderRadius: 8, padding: '14px',
                cursor: answers.email.includes('@') ? 'pointer' : 'not-allowed',
                transition: 'all 150ms',
              }}
            >
              Get my free optimization plan →
            </button>
            <p style={{ fontSize: 11, color: T3, marginTop: 10, textAlign: 'center' }}>
              No spam. No credit card. Unsubscribe anytime.
            </p>
          </QuizStep>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: F, padding: '40px 24px', maxWidth: 520, margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function QuizStep({ step, total, progress, title, subtitle, children }) {
  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: F }}>Step {step} of {total}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: F }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, #5A5AF0, #7C6AF4)',
            borderRadius: 2, transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F0F0EE', letterSpacing: '-0.03em', margin: '0 0 8px', fontFamily: F }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', lineHeight: 1.55, fontFamily: F }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function ChoiceBtn({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        background: selected ? 'rgba(90,90,240,0.12)' : '#111113',
        border: `1.5px solid ${selected ? 'rgba(90,90,240,0.6)' : 'rgba(255,255,255,0.09)'}`,
        borderRadius: 8, padding: '12px 14px',
        cursor: 'pointer', fontFamily: F,
        fontSize: 13, color: selected ? '#F0F0EE' : 'rgba(255,255,255,0.6)',
        fontWeight: selected ? 600 : 400,
        transition: 'all 150ms',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(90,90,240,0.4)'; e.currentTarget.style.color = '#F0F0EE'; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
    >
      <span>{label}</span>
      {selected && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="7" fill="#5A5AF0" />
          <path d="M4 7l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function NextBtn({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        marginTop: 12, width: '100%',
        fontFamily: F, fontSize: 14, fontWeight: 600,
        color: '#0A0A0B',
        background: disabled ? 'rgba(255,255,255,0.12)' : '#F0F0EE',
        border: 'none', borderRadius: 8, padding: '13px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 150ms',
      }}
    >
      Continue →
    </button>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: '#111113',
  border: '1.5px solid rgba(255,255,255,0.12)',
  borderRadius: 8, padding: '13px 16px',
  fontSize: 14, color: '#F0F0EE',
  fontFamily: F, outline: 'none',
  caretColor: '#5A5AF0',
  transition: 'border-color 200ms',
};