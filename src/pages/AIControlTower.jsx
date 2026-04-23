import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Save, Cpu, Sparkles, Shield, Zap, Target, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

// ── Config sections ─────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'vision',
    field: 'ai_vision',
    title: 'Life Vision',
    subtitle: 'What financial life is Stensor building with you?',
    icon: Target,
    color: '#f0ffd0',
    type: 'radio',
    options: [
      { value: 'fire', label: 'Total Freedom', desc: 'FIRE — early retirement, travel, full independence.' },
      { value: 'heritage', label: 'Legacy Builder', desc: 'Build a solid real estate portfolio for your family.' },
      { value: 'entrepreneur', label: 'Entrepreneur', desc: 'Fund your business and rewrite the rules of wealth.' },
      { value: 'serenite', label: 'Peace of Mind', desc: 'Live fully without ever worrying about your balance.' },
    ],
  },
  {
    id: 'personality',
    field: 'ai_personality',
    title: 'Coach Persona',
    subtitle: 'What kind of financial partner do you want?',
    icon: Cpu,
    color: '#f5f0ff',
    type: 'radio',
    options: [
      { value: 'sniper', label: 'The Sniper', desc: 'Blunt, cold, absolute focus on numbers and efficiency.' },
      { value: 'architect', label: 'The Architect', desc: 'Pedagogical, visionary — explains every step of the plan.' },
      { value: 'guardian', label: 'The Guardian', desc: 'Cautious, protective — zero unnecessary risk.' },
    ],
  },
  {
    id: 'rule',
    field: 'ai_golden_rule',
    title: 'Golden Rule',
    subtitle: 'Your hard line that Stensor will never cross.',
    icon: Shield,
    color: '#fff0f0',
    type: 'text',
    placeholder: 'e.g. "Never touch my emergency fund" or "Always invest ethically"',
    maxLength: 120,
  },
  {
    id: 'tone',
    field: 'ai_tone',
    title: 'Communication Style',
    subtitle: 'How should Stensor talk to you about your finances?',
    icon: MessageSquare,
    color: '#f0f8ff',
    type: 'radio',
    options: [
      { value: 'brutal', label: 'No Filter', desc: 'Be harsh if needed. Truth before comfort.' },
      { value: 'kind', label: 'Supportive', desc: 'Celebrate wins, help me learn without judgment.' },
    ],
  },
  {
    id: 'depth',
    field: 'ai_depth',
    title: 'Analysis Depth',
    subtitle: 'How much detail do you want in each answer?',
    icon: Zap,
    color: '#fffdf0',
    type: 'radio',
    options: [
      { value: 'concise', label: 'Just the Essentials', desc: 'Short, punchy answers. Straight to the point.' },
      { value: 'balanced', label: 'Balanced', desc: 'Clarity with context. Neither too short nor too long.' },
      { value: 'deep', label: 'Full Picture', desc: 'Exhaustive analysis, details, scenarios and perspectives.' },
    ],
  },
  {
    id: 'context',
    field: 'ai_context',
    title: 'Personal Context',
    subtitle: 'What Stensor should always keep in mind about you.',
    icon: Sparkles,
    color: '#f0fff8',
    type: 'textarea',
    placeholder: "e.g. \"Freelancer with variable income, 28 years old, no debt, $8k savings, goal: $50k in 3 years.\"",
    maxLength: 400,
  },
];

// ── DNA Progress Bar ─────────────────────────────────────────────────────
function DnaBar({ prefs }) {
  const filled = SECTIONS.filter(s => {
    const v = prefs[s.field];
    return v && String(v).trim().length > 0;
  }).length;
  const pct = Math.round((filled / SECTIONS.length) * 100);

  const barColor = pct === 100 ? '#22c55e' : pct >= 50 ? YUZU : '#e5e7eb';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-black/8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>
      <span className="text-[11px] font-black whitespace-nowrap" style={{ color: pct === 100 ? '#22c55e' : FG }}>
        {pct === 100 ? 'Complete!' : `DNA ${pct}%`}
      </span>
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────
function SectionCard({ section, value, onChange }) {
  const Icon = section.icon;
  const isFilled = value && String(value).trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border overflow-hidden"
      style={{
        borderColor: isFilled ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.07)',
        boxShadow: isFilled ? '0 4px 24px rgba(0,0,0,0.06)' : '0 1px 6px rgba(0,0,0,0.03)',
      }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start gap-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: isFilled ? FG : section.color }}>
          <Icon className="w-5 h-5" style={{ color: isFilled ? YUZU : FG }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black mb-0.5" style={{ color: FG }}>{section.title}</p>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>{section.subtitle}</p>
        </div>
        {isFilled && (
          <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: '#22c55e' }}>
            <span className="text-white text-[9px] font-black">✓</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {section.type === 'radio' && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {section.options.map(opt => {
              const active = value === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onChange(active ? '' : opt.value)}
                  className="text-left px-4 py-3 rounded-xl border transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: active ? FG : 'rgba(0,0,0,0.08)',
                    background: active ? FG : 'rgba(0,0,0,0.01)',
                  }}>
                  <p className="text-xs font-black mb-0.5" style={{ color: active ? YUZU : FG }}>{opt.label}</p>
                  <p className="text-[11px] leading-snug" style={{ color: active ? 'rgba(221,255,0,0.6)' : 'rgba(0,0,0,0.4)' }}>{opt.desc}</p>
                </button>
              );
            })}
          </div>
        )}

        {section.type === 'text' && (
          <div className="relative">
            <input
              value={value || ''}
              onChange={e => onChange(e.target.value.slice(0, section.maxLength))}
              placeholder={section.placeholder}
              className="w-full px-4 py-3 text-sm rounded-xl border focus:outline-none transition-all"
              style={{
                borderColor: value ? FG : 'rgba(0,0,0,0.08)',
                background: 'white',
                color: FG,
              }}
            />
            <span className="absolute right-3 bottom-3 text-[9px] font-bold"
              style={{ color: (value?.length || 0) > section.maxLength * 0.8 ? '#f97316' : 'rgba(0,0,0,0.2)' }}>
              {value?.length || 0}/{section.maxLength}
            </span>
          </div>
        )}

        {section.type === 'textarea' && (
          <div className="relative">
            <textarea
              value={value || ''}
              onChange={e => onChange(e.target.value.slice(0, section.maxLength))}
              placeholder={section.placeholder}
              rows={3}
              className="w-full px-4 py-3 text-sm rounded-xl border focus:outline-none transition-all resize-none"
              style={{
                borderColor: value ? FG : 'rgba(0,0,0,0.08)',
                background: 'white',
                color: FG,
              }}
            />
            <span className="absolute right-3 bottom-3 text-[9px] font-bold"
              style={{ color: (value?.length || 0) > section.maxLength * 0.8 ? '#f97316' : 'rgba(0,0,0,0.2)' }}>
              {value?.length || 0}/{section.maxLength}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function AIControlTower() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const initial = {};
      SECTIONS.forEach(s => { if (u?.[s.field]) initial[s.field] = u[s.field]; });
      setPrefs(initial);
    }).catch(() => {});
  }, []);

  const handleChange = (field, val) => {
    setPrefs(p => ({ ...p, [field]: val }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await base44.auth.updateMe(prefs);
    setSaving(false);
    setSavedOnce(true);
    toast.success('Your Stensor DNA has been saved!');
  };

  const filledCount = SECTIONS.filter(s => prefs[s.field] && String(prefs[s.field]).trim().length > 0).length;
  const pct = Math.round((filledCount / SECTIONS.length) * 100);

  return (
    <div className="min-h-screen font-be" style={{ background: '#f9f9f7' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-black" style={{ color: FG }}>Stensor DNA</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: pct === 100 ? '#22c55e' : YUZU, color: pct === 100 ? 'white' : FG }}>
              {filledCount}/{SECTIONS.length}
            </span>
          </div>
          <DnaBar prefs={prefs} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-lg transition-all hover:opacity-90 flex-shrink-0"
          style={{ background: FG, color: 'white' }}>
          {saving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
              className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: YUZU }} />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saving ? '' : 'Save'}
        </button>
      </div>

      {/* Hero */}
      <div className="px-4 pt-8 pb-6 max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full text-[10px] font-black tracking-widest uppercase"
            style={{ background: YUZU, color: FG }}>
            <Cpu className="w-3 h-3" />
            Your Stensor DNA
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: FG }}>
            Sculpt your financial intelligence
          </h1>
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.4)' }}>
            Every setting is injected into every response. The more you define, the more Stensor belongs to you.
          </p>

          {/* Progress visual */}
          {pct < 100 && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.5)' }}>
              <span style={{ color: '#f97316' }}>●</span>
              Complete your profile to unlock the full power of Stensor — {100 - pct}% to go
            </div>
          )}
        </motion.div>
      </div>

      {/* Sections */}
      <div className="max-w-2xl mx-auto px-4 pb-24 flex flex-col gap-4">
        {SECTIONS.map((section, i) => (
          <motion.div key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}>
            <SectionCard
              section={section}
              value={prefs[section.field] || ''}
              onChange={val => handleChange(section.field, val)}
            />
          </motion.div>
        ))}

        {/* Save CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 font-black text-sm rounded-2xl transition-all hover:opacity-90"
            style={{ background: FG, color: 'white' }}>
            {saving ? 'Saving...' : savedOnce ? 'Update my Stensor DNA' : 'Activate my custom Stensor →'}
          </button>
          <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(0,0,0,0.25)' }}>
            Free · No credits used · Editable anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
}