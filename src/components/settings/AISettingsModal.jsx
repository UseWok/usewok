import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

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
    field: 'ai_personality', title: 'Coach Style', subtitle: 'How should Stensor talk to you?',
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
    field: 'ai_savings', title: 'Current Savings', subtitle: 'Where are you right now?',
    options: [
      { value: 'none', label: 'Just Starting', emoji: '🌱' },
      { value: 'small', label: '$5k – $20k', emoji: '📈' },
      { value: 'medium', label: '$20k – $100k', emoji: '💰' },
      { value: 'large', label: 'Over $100k', emoji: '🏆' },
    ]
  },
];

export default function AISettingsModal({ open, onClose }) {
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    base44.auth.me().then(u => {
      setUser(u);
      const initial = {};
      SECTIONS.forEach(s => { if (u?.[s.field]) initial[s.field] = u[s.field]; });
      setPrefs(initial);
    }).catch(() => {});
  }, [open]);

  const handleSelect = async (field, value, isActive) => {
    const newPrefs = { ...prefs, [field]: isActive ? '' : value };
    setPrefs(newPrefs);
    if (user) {
      await base44.auth.updateMe({ [field]: isActive ? '' : value });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white w-full overflow-hidden"
            style={{ maxWidth: '480px', maxHeight: '82vh', borderRadius: '10px', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <div>
                <p className="text-sm font-black" style={{ color: FG }}>Stensor DNA</p>
                <p className="text-[10px] text-zinc-400">Personalizes every response</p>
              </div>
              <div className="flex items-center gap-3">
                {saved && <span className="text-[10px] font-black text-green-500">Saved ✓</span>}
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/5">
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-7">
              {SECTIONS.map((section) => (
                <div key={section.field}>
                  <p className="text-[10px] font-black tracking-widest uppercase mb-0.5" style={{ color: FG }}>{section.title}</p>
                  <p className="text-[10px] text-zinc-400 mb-2">{section.subtitle}</p>
                  <div className={`grid gap-1.5 ${section.options.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {section.options.map(opt => {
                      const active = prefs[section.field] === opt.value;
                      return (
                        <button key={opt.value}
                          onClick={() => handleSelect(section.field, opt.value, active)}
                          className="relative flex items-center gap-2 px-3 py-2.5 text-left transition-colors"
                          style={{ border: `1.5px solid ${active ? FG : 'rgba(0,0,0,0.08)'}`, background: active ? FG : 'white', borderRadius: '6px' }}>
                          <span className="text-sm flex-shrink-0">{opt.emoji}</span>
                          <span className="text-[11px] font-bold leading-tight" style={{ color: active ? 'white' : FG }}>{opt.label}</span>
                          {active && (
                            <div className="absolute top-1.5 right-1.5 w-3 h-3 flex items-center justify-center" style={{ background: YUZU, borderRadius: '2px' }}>
                              <Check className="w-2 h-2" style={{ color: FG }} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <p className="text-center text-[10px] pb-4" style={{ color: 'rgba(0,0,0,0.2)' }}>Auto-saved · No credits · Editable anytime</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}