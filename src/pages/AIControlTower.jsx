import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredQuiz } from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const LOGO = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const QUIZ_TO_VISION = { freedom: 'fire', wealth: 'heritage', debt_free: 'serenite', retire_early: 'fire' };
const QUIZ_TO_TONE = { calm: 'kind', justified: 'brutal', guilty: 'kind', regret: 'kind' };
const QUIZ_TO_SAVINGS = { zero: 'none', small: 'small', medium: 'medium', great: 'large' };

const GROUPS = [
  {
    id: 'dna',
    title: 'Your DNA',
    subtitle: 'What Stensor is building with you.',
    dark: true,
    sections: [
      {
        id: 'vision', field: 'ai_vision', title: 'Life Vision',
        options: [
          { value: 'fire', label: 'Total Freedom', emoji: '🦅', desc: 'FIRE — early retirement, full independence.' },
          { value: 'heritage', label: 'Legacy Builder', emoji: '🏗️', desc: 'Real estate & family wealth across generations.' },
          { value: 'entrepreneur', label: 'Entrepreneur', emoji: '⚡', desc: 'Fund your business, rewrite the rules of wealth.' },
          { value: 'serenite', label: 'Peace of Mind', emoji: '🌊', desc: 'Live fully, never worry about your balance.' },
        ]
      },
      {
        id: 'rule', field: 'ai_golden_rule', title: 'Golden Rule',
        options: [
          { value: 'Never touch my emergency fund', label: 'Emergency Sacred', emoji: '🛡️', desc: 'Your 6-month safety net is untouchable.' },
          { value: 'Always invest ethically — ESG only', label: 'Ethics First', emoji: '🌱', desc: 'ESG and sustainable investments only.' },
          { value: 'Never invest what I cannot afford to lose', label: 'Capital First', emoji: '⚠️', desc: 'Capital preservation over returns.' },
          { value: 'Maximize every euro with zero waste', label: 'Zero Waste', emoji: '🔥', desc: 'Every dollar must work hard.' },
        ]
      },
    ]
  },
  {
    id: 'custom',
    title: 'AI Customization',
    subtitle: 'Shape exactly how Stensor thinks and speaks.',
    dark: false,
    sections: [
      {
        id: 'voice', field: 'ai_voice', title: 'AI Voice',
        options: [
          { value: 'human', label: 'Human', emoji: '🤝', desc: 'Warm, empathetic, like a brilliant friend.' },
          { value: 'robotic', label: 'Robotic', emoji: '🤖', desc: 'Precise, data-driven, zero fluff.' },
          { value: 'hybrid', label: 'Hybrid', emoji: '✨', desc: 'Warmth meets precision. Best of both.' },
        ]
      },
      {
        id: 'personality', field: 'ai_personality', title: 'Coach Persona',
        options: [
          { value: 'sniper', label: 'The Sniper', emoji: '🎯', desc: 'Blunt, cold, pure numbers and efficiency.' },
          { value: 'architect', label: 'The Architect', emoji: '🏛️', desc: 'Pedagogical, explains every step of the plan.' },
          { value: 'guardian', label: 'The Guardian', emoji: '🛡️', desc: 'Cautious, protective — zero unnecessary risk.' },
        ]
      },
      {
        id: 'tone', field: 'ai_tone', title: 'Feedback Style',
        options: [
          { value: 'brutal', label: 'No Filter', emoji: '💊', desc: 'Truth before comfort. Always direct.' },
          { value: 'kind', label: 'Supportive', emoji: '🌟', desc: 'Celebrate wins. Learn without shame.' },
        ]
      },
      {
        id: 'depth', field: 'ai_depth', title: 'Response Depth',
        options: [
          { value: 'concise', label: 'Sharp', emoji: '⚡', desc: 'Short, punchy, straight to the point.' },
          { value: 'balanced', label: 'Balanced', emoji: '⚖️', desc: 'Clarity with just enough context.' },
          { value: 'deep', label: 'Full Picture', emoji: '🔬', desc: 'Exhaustive — every angle explored.' },
        ]
      },
    ]
  },
  {
    id: 'profile',
    title: 'Your Profile',
    subtitle: 'Context injected into every single answer.',
    dark: false,
    sections: [
      {
        id: 'status', field: 'ai_status', title: 'Income Type',
        options: [
          { value: 'freelancer', label: 'Freelancer', emoji: '🌀', desc: 'Variable, project-based income.' },
          { value: 'employed', label: 'Employed', emoji: '💼', desc: 'Stable monthly salary.' },
          { value: 'entrepreneur', label: 'Entrepreneur', emoji: '🚀', desc: 'Business owner, reinvesting profits.' },
          { value: 'student', label: 'Student', emoji: '📚', desc: 'Building the foundation right now.' },
        ]
      },
      {
        id: 'savings', field: 'ai_savings', title: 'Current Savings',
        options: [
          { value: 'none', label: 'Starting Fresh', emoji: '🌱', desc: 'Under $5,000 — just getting started.' },
          { value: 'small', label: 'Building Up', emoji: '📈', desc: '$5k – $20k and growing.' },
          { value: 'medium', label: 'Solid Base', emoji: '💰', desc: '$20k – $100k — real momentum.' },
          { value: 'large', label: 'Growing Wealth', emoji: '🏆', desc: 'Over $100k — time to accelerate.' },
        ]
      },
      {
        id: 'age', field: 'ai_age', title: 'Life Stage',
        options: [
          { value: 'young', label: '18–25', emoji: '🌅', desc: 'Maximum risk tolerance. Build everything.' },
          { value: 'mid', label: '26–35', emoji: '⚡', desc: 'Growth phase — aggressive compounding.' },
          { value: 'mature', label: '36–45', emoji: '🏗️', desc: 'Peak earning years — build and protect.' },
          { value: '46plus', label: '46+', emoji: '🎯', desc: 'Preservation, income, and legacy.' },
        ]
      },
    ]
  }
];

const ALL_SECTION_FIELDS = GROUPS.flatMap(g => g.sections).map(s => s.field);

function quizToPrefs(quiz) {
  if (!quiz) return {};
  const p = {};
  if (quiz.goal) p.ai_vision = QUIZ_TO_VISION[quiz.goal] || quiz.goal;
  if (quiz.emotion) p.ai_tone = QUIZ_TO_TONE[quiz.emotion] || 'kind';
  if (quiz.savings) p.ai_savings = QUIZ_TO_SAVINGS[quiz.savings] || 'small';
  return p;
}

// ── Option Button ─────────────────────────────────────────────────────────
function OptionBtn({ opt, active, onClick, dark }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: active ? 1 : 1.02 }}
      className="relative text-left px-4 py-3.5 rounded-xl border-2 transition-all"
      style={{
        borderColor: active ? YUZU : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        background: active ? YUZU : dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      }}>
      {active && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}
          className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center bg-black">
          <Check className="w-2.5 h-2.5 text-yuzu" style={{ color: YUZU }} />
        </motion.div>
      )}
      <div className="flex items-start gap-2.5">
        <span className="text-lg flex-shrink-0">{opt.emoji}</span>
        <div>
          <p className="text-sm font-black leading-tight mb-0.5" style={{ color: active ? FG : dark ? 'rgba(255,255,255,0.85)' : FG }}>
            {opt.label}
          </p>
          <p className="text-[11px] leading-snug" style={{ color: active ? 'rgba(0,0,0,0.55)' : dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>
            {opt.desc}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

// ── Section ────────────────────────────────────────────────────────────────
function Section({ section, value, onChange, dark }) {
  const cols = section.options.length <= 2 ? 'grid-cols-2' : section.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2';
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>
          {section.title}
        </p>
        {value && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#22c55e' }}>
            <Check className="w-2 h-2 text-white" />
          </motion.div>
        )}
      </div>
      <div className={`grid ${cols} gap-2`}>
        {section.options.map(opt => (
          <OptionBtn
            key={opt.value}
            opt={opt}
            active={value === opt.value}
            onClick={() => onChange(value === opt.value ? '' : opt.value)}
            dark={dark}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function AIControlTower() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({});
  const [saving, setSaving] = useState(false);
  const [quizImported, setQuizImported] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const initial = {};
      ALL_SECTION_FIELDS.forEach(f => { if (u?.[f]) initial[f] = u[f]; });
      // Also load legacy fields
      ['ai_vision','ai_personality','ai_golden_rule','ai_tone','ai_depth'].forEach(f => { if (u?.[f]) initial[f] = u[f]; });
      // Auto-import quiz answers if not yet set
      const quiz = getStoredQuiz() || u?.quiz_answers;
      if (quiz && !initial.ai_vision) {
        const quizPrefs = quizToPrefs(quiz);
        Object.assign(initial, quizPrefs);
        setQuizImported(true);
      }
      setPrefs(initial);
    }).catch(() => {});
  }, []);

  const handleChange = (field, val) => setPrefs(p => ({ ...p, [field]: val }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await base44.auth.updateMe(prefs);
    setSaving(false);
    toast.success('Stensor DNA saved ✓');
  };

  const totalFields = ALL_SECTION_FIELDS.length;
  const filledFields = ALL_SECTION_FIELDS.filter(f => prefs[f] && String(prefs[f]).trim()).length;
  const pct = Math.round((filledFields / totalFields) * 100);

  return (
    <div className="min-h-screen font-be" style={{ background: '#f9f9f7' }}>
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-black/8 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-black" style={{ color: FG }}>Stensor DNA</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: pct === 100 ? '#22c55e' : YUZU, color: pct === 100 ? 'white' : FG }}>
              {filledFields}/{totalFields}
            </span>
            {quizImported && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                ✓ Quiz imported
              </span>
            )}
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden bg-black/8">
            <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: pct === 100 ? '#22c55e' : YUZU }} />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-lg transition-all hover:opacity-90 flex-shrink-0"
          style={{ background: FG, color: 'white' }}>
          {saving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
              className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: YUZU }} />
          ) : <Zap className="w-3.5 h-3.5" />}
          {saving ? '' : 'Save'}
        </button>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-12 pb-14 text-center" style={{ background: FG }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(221,255,0,0.12), transparent)' }} />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative max-w-xl mx-auto">
          <img src={LOGO} alt="Stensor" className="w-10 h-10 mx-auto mb-4 object-contain opacity-80" />
          <p className="text-[10px] font-black tracking-[0.35em] uppercase mb-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Your Stensor DNA
          </p>
          <h1 className="font-black tracking-tighter leading-[0.95] mb-4"
            style={{ fontSize: 'clamp(2rem,6vw,3.5rem)', color: 'white' }}>
            Sculpt your<br /><span style={{ color: YUZU }}>financial AI.</span>
          </h1>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-open)' }}>
            Every choice is injected into every response. The more you define, the more Stensor belongs to you.
          </p>
          {pct < 100 && (
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full text-xs"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: YUZU }}>●</span>
              {100 - pct}% to unlock your full potential
            </div>
          )}
        </motion.div>
      </div>

      {/* Groups */}
      <div className="max-w-2xl mx-auto pb-24">
        {GROUPS.map((group, gi) => (
          <motion.div key={group.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.08, duration: 0.4 }}>
            {/* Group header */}
            <div className="relative overflow-hidden px-6 py-8"
              style={{ background: group.dark ? FG : 'white', borderBottom: `1px solid ${group.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}` }}>
              {group.dark && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 50%, rgba(221,255,0,0.06), transparent 60%)' }} />}
              <div className="relative">
                <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-1"
                  style={{ color: group.dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}>
                  {String(gi + 1).padStart(2, '0')}
                </p>
                <h2 className="text-2xl font-black tracking-tight"
                  style={{ color: group.dark ? 'white' : FG }}>
                  {group.title}
                </h2>
                <p className="text-sm mt-1" style={{ color: group.dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>
                  {group.subtitle}
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8 px-6 py-7"
              style={{ background: group.dark ? '#111' : 'white' }}>
              {group.sections.map((section, si) => (
                <motion.div key={section.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.08 + si * 0.05 }}>
                  <Section
                    section={section}
                    value={prefs[section.field] || ''}
                    onChange={val => handleChange(section.field, val)}
                    dark={group.dark}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Final save CTA */}
        <div className="px-6 pt-4 pb-8">
          <button onClick={handleSave} disabled={saving}
            className="w-full py-4 font-black text-sm rounded-2xl transition-all hover:opacity-90"
            style={{ background: FG, color: 'white' }}>
            {saving ? 'Saving...' : `Activate my Stensor DNA →`}
          </button>
          <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(0,0,0,0.25)' }}>
            Free · No credits used · Editable anytime
          </p>
        </div>
      </div>
    </div>
  );
}