import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Check } from 'lucide-react';
import { getStoredQuiz } from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const LOGO = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const SECTIONS = [
  {
    field: 'ai_vision', title: 'Life Vision', subtitle: 'What are you building toward?',
    options: [
      { value: 'fire', label: 'Total Freedom', emoji: '🦅' },
      { value: 'heritage', label: 'Legacy Builder', emoji: '🏗️' },
      { value: 'entrepreneur', label: 'Entrepreneur', emoji: '⚡' },
      { value: 'serenite', label: 'Peace of Mind', emoji: '🌊' },
    ]
  },
  {
    field: 'ai_personality', title: 'Coach Style', subtitle: 'How should Stensor communicate?',
    options: [
      { value: 'sniper', label: 'The Sniper', emoji: '🎯' },
      { value: 'architect', label: 'The Architect', emoji: '🏛️' },
      { value: 'guardian', label: 'The Guardian', emoji: '🛡️' },
    ]
  },
  {
    field: 'ai_depth', title: 'Response Depth', subtitle: 'How much detail do you want?',
    options: [
      { value: 'concise', label: 'Sharp', emoji: '⚡' },
      { value: 'balanced', label: 'Balanced', emoji: '⚖️' },
      { value: 'deep', label: 'Full Picture', emoji: '🔬' },
    ]
  },
  {
    field: 'ai_status', title: 'Income Type', subtitle: 'How do you earn?',
    options: [
      { value: 'employed', label: 'Employed', emoji: '💼' },
      { value: 'freelancer', label: 'Freelancer', emoji: '🌀' },
      { value: 'entrepreneur', label: 'Entrepreneur', emoji: '🚀' },
      { value: 'student', label: 'Student', emoji: '📚' },
    ]
  },
  {
    field: 'ai_savings', title: 'Current Savings', subtitle: "Where are you right now?",
    options: [
      { value: 'none', label: 'Just Starting', emoji: '🌱' },
      { value: 'small', label: '$5k – $20k', emoji: '📈' },
      { value: 'medium', label: '$20k – $100k', emoji: '💰' },
      { value: 'large', label: 'Over $100k', emoji: '🏆' },
    ]
  },
];

const ALL_FIELDS = SECTIONS.map(s => s.field);

export default function AIControlTower() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const initial = {};
      ALL_FIELDS.forEach(f => { if (u?.[f]) initial[f] = u[f]; });
      const quiz = getStoredQuiz() || u?.quiz_answers;
      if (quiz) {
        const map = { freedom: 'fire', wealth: 'heritage', debt_free: 'serenite', retire_early: 'fire' };
        const savMap = { zero: 'none', small: 'small', medium: 'medium', great: 'large' };
        if (quiz.goal && !initial.ai_vision) initial.ai_vision = map[quiz.goal] || quiz.goal;
        if (quiz.savings && !initial.ai_savings) initial.ai_savings = savMap[quiz.savings] || 'small';
      }
      setPrefs(initial);
    }).catch(() => {});
  }, []);

  const handleSelect = async (field, value, isActive) => {
    const newPrefs = { ...prefs, [field]: isActive ? '' : value };
    setPrefs(newPrefs);
    if (user) {
      await base44.auth.updateMe({ [field]: isActive ? '' : value });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const filled = ALL_FIELDS.filter(f => prefs[f]).length;

  return (
    <div className="min-h-screen bg-white font-be">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white px-4 h-12 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center hover:bg-black/5">
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </button>
        <span className="font-black text-sm flex-1" style={{ color: FG }}>Stensor DNA</span>
        <span className="text-[11px] font-semibold text-zinc-400">{filled}/{ALL_FIELDS.length} set</span>
        {saved && <span className="text-[11px] font-black" style={{ color: '#22c55e' }}>Saved ✓</span>}
      </div>

      {/* Hero */}
      <div className="px-6 pt-10 pb-10 text-center" style={{ background: FG }}>
        <img src={LOGO} alt="Stensor" className="w-8 h-8 mx-auto mb-4 object-contain opacity-75" />
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Shape your AI.</h1>
        <p className="text-sm max-w-xs mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
          5 choices. Auto-saved into every response.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-xl mx-auto px-4 py-8 space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.field}>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-black tracking-widest uppercase" style={{ color: FG }}>{section.title}</p>
              {prefs[section.field] && (
                <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0" style={{ background: '#22c55e' }}>
                  <Check className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-400 mb-3">{section.subtitle}</p>
            <div className={`grid gap-2 ${section.options.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {section.options.map(opt => {
                const active = prefs[section.field] === opt.value;
                return (
                  <button key={opt.value}
                    onClick={() => handleSelect(section.field, opt.value, active)}
                    className="relative flex items-center gap-2.5 px-4 py-3 text-left border-2 transition-colors"
                    style={{
                      borderColor: active ? FG : 'rgba(0,0,0,0.08)',
                      background: active ? FG : 'white',
                    }}>
                    <span className="text-base flex-shrink-0">{opt.emoji}</span>
                    <span className="text-xs font-black leading-tight" style={{ color: active ? 'white' : FG }}>
                      {opt.label}
                    </span>
                    {active && (
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 flex items-center justify-center"
                        style={{ background: YUZU }}>
                        <Check className="w-2 h-2" style={{ color: FG }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <p className="text-center text-[10px] pb-8" style={{ color: 'rgba(0,0,0,0.25)' }}>Auto-saved · No credits · Editable anytime</p>
      </div>
    </div>
  );
}