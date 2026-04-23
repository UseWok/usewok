import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Save, Cpu, Sparkles, Shield, Zap, Target, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

// ── Mini SVG illustrations (inline, brand design) ──────────────────────
function IllustrationVision() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill={YUZU} fillOpacity="0.15" />
      <path d="M20 8 L32 28 L8 28 Z" fill={FG} fillOpacity="0.08" />
      <circle cx="20" cy="22" r="5" fill={YUZU} />
      <line x1="20" y1="8" x2="20" y2="13" stroke={FG} strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="27" x2="20" y2="32" stroke={FG} strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="20" x2="13" y2="20" stroke={FG} strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="20" x2="32" y2="20" stroke={FG} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IllustrationPersonality() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill={YUZU} fillOpacity="0.15" />
      <circle cx="20" cy="15" r="6" fill={FG} fillOpacity="0.12" stroke={FG} strokeWidth="1.5" />
      <path d="M10 32 C10 26 30 26 30 32" stroke={FG} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="15" r="2.5" fill={YUZU} />
    </svg>
  );
}

function IllustrationRule() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill={YUZU} fillOpacity="0.15" />
      <rect x="10" y="13" width="20" height="3" rx="1.5" fill={FG} fillOpacity="0.15" />
      <rect x="10" y="19" width="14" height="3" rx="1.5" fill={YUZU} />
      <rect x="10" y="25" width="17" height="3" rx="1.5" fill={FG} fillOpacity="0.15" />
      <circle cx="29" cy="20.5" r="4" fill={FG} />
      <path d="M27 20.5 L28.5 22 L31 19" stroke={YUZU} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IllustrationTone() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill={YUZU} fillOpacity="0.15" />
      <path d="M12 20 Q16 12 20 20 Q24 28 28 20" stroke={FG} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="20" r="2" fill={YUZU} />
      <circle cx="28" cy="20" r="2" fill={YUZU} />
      <circle cx="20" cy="20" r="2" fill={FG} fillOpacity="0.4" />
    </svg>
  );
}

// ── Config sections ─────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'vision',
    field: 'ai_vision',
    title: 'La Vision',
    subtitle: 'Quel projet de vie Stensor doit bâtir avec vous ?',
    icon: Target,
    Illustration: IllustrationVision,
    type: 'radio',
    options: [
      { value: 'fire', label: 'Liberté Totale', desc: 'FIRE — retraite anticipée, voyages, indépendance absolue.' },
      { value: 'heritage', label: 'Héritage', desc: 'Bâtir un patrimoine immobilier solide pour votre famille.' },
      { value: 'entrepreneur', label: 'Impact', desc: 'Financer votre entreprise et changer les règles du jeu.' },
      { value: 'serenite', label: 'Sérénité', desc: 'Vivre pleinement sans jamais regarder votre solde.' },
    ],
  },
  {
    id: 'personality',
    field: 'ai_personality',
    title: 'Le Caractère du Coach',
    subtitle: 'Quel type de partenaire financier voulez-vous ?',
    icon: Cpu,
    Illustration: IllustrationPersonality,
    type: 'radio',
    options: [
      { value: 'sniper', label: 'Le Sniper', desc: "Direct, froid, focus absolu sur les chiffres et l'efficacité." },
        { value: 'architect', label: "L'Architecte", desc: 'Pédagogue, visionnaire, explique chaque étape du plan.' },
      { value: 'guardian', label: 'Le Gardien', desc: 'Prudent, protecteur, zéro risque inutile.' },
    ],
  },
  {
    id: 'rule',
    field: 'ai_golden_rule',
    title: "La Règle d'Or",
    subtitle: 'Votre ligne rouge que Stensor ne franchira jamais.',
    icon: Shield,
    Illustration: IllustrationRule,
    type: 'text',
    placeholder: 'Ex : "Ne jamais toucher à mon épargne de sécurité" ou "Toujours investir éthique"',
    maxLength: 120,
  },
  {
    id: 'tone',
    field: 'ai_tone',
    title: 'Le Style de Vérité',
    subtitle: 'Comment Stensor doit-il vous parler de vos finances ?',
    icon: MessageSquare,
    Illustration: IllustrationTone,
    type: 'radio',
    options: [
      { value: 'brutal', label: 'Sans filtre', desc: 'Sois dur si nécessaire. La vérité avant le confort.' },
      { value: 'kind', label: 'Bienveillant', desc: 'Célèbre mes victoires, aide-moi à apprendre sans me blesser.' },
    ],
  },
  {
    id: 'depth',
    field: 'ai_depth',
    title: "La Profondeur d'Analyse",
    subtitle: "Quelle densité d'information vous convient ?",
    icon: Zap,
    Illustration: IllustrationTone,
    type: 'radio',
    options: [
      { value: 'concise', label: 'L'Essentiel', desc: 'Réponses courtes et percutantes. Droit au but.' },
      { value: 'balanced', label: 'Équilibré', desc: 'Clarté et contexte. Ni trop court, ni trop long.' },
      { value: 'deep', label: 'La Vision Complète', desc: 'Analyse exhaustive, détails, scénarios et perspectives.' },
    ],
  },
  {
    id: 'context',
    field: 'ai_context',
    title: 'Votre Contexte Personnel',
    subtitle: 'Ce que Stensor doit toujours garder en mémoire sur vous.',
    icon: Sparkles,
    Illustration: IllustrationVision,
    type: 'textarea',
    placeholder: 'Ex : "Je suis freelance avec revenus variables, 28 ans, aucune dette, 8k€ d'épargne, objectif 50k€ en 3 ans."',
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
  const color = pct === 100 ? '#22c55e' : pct >= 50 ? YUZU : '#e5e7eb';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-black/8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-[11px] font-black whitespace-nowrap" style={{ color: pct === 100 ? '#22c55e' : FG }}>
        {pct === 100 ? '✓ Synchronisé' : `ADN ${pct}%`}
      </span>
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────
function SectionCard({ section, value, onChange }) {
  const Icon = section.icon;
  const Illus = section.Illustration;
  const isFilled = value && String(value).trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border overflow-hidden"
      style={{
        borderColor: isFilled ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.08)',
        boxShadow: isFilled ? '0 4px 20px rgba(0,0,0,0.07)' : '0 1px 6px rgba(0,0,0,0.04)',
      }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start gap-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex-shrink-0 w-10 h-10">
          <Illus />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-black" style={{ color: FG }}>{section.title}</p>
            {isFilled && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
          </div>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.45)' }}>{section.subtitle}</p>
        </div>
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
                  className="text-left px-4 py-3 rounded-lg border transition-all"
                  style={{
                    borderColor: active ? FG : 'rgba(0,0,0,0.10)',
                    background: active ? FG : 'transparent',
                  }}>
                  <p className="text-xs font-black mb-0.5" style={{ color: active ? YUZU : FG }}>{opt.label}</p>
                  <p className="text-[11px] leading-snug" style={{ color: active ? 'rgba(221,255,0,0.65)' : 'rgba(0,0,0,0.45)' }}>{opt.desc}</p>
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
              className="w-full px-4 py-3 text-sm rounded-lg border focus:outline-none transition-all"
              style={{
                borderColor: value ? FG : 'rgba(0,0,0,0.10)',
                background: 'white',
                color: FG,
              }}
            />
            <span className="absolute right-3 bottom-3 text-[9px] font-bold"
              style={{ color: (value?.length || 0) > section.maxLength * 0.8 ? '#f97316' : 'rgba(0,0,0,0.25)' }}>
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
              className="w-full px-4 py-3 text-sm rounded-lg border focus:outline-none transition-all resize-none"
              style={{
                borderColor: value ? FG : 'rgba(0,0,0,0.10)',
                background: 'white',
                color: FG,
              }}
            />
            <span className="absolute right-3 bottom-3 text-[9px] font-bold"
              style={{ color: (value?.length || 0) > section.maxLength * 0.8 ? '#f97316' : 'rgba(0,0,0,0.25)' }}>
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
    toast.success('Tour de contrôle synchronisée ✓');
  };

  const filledCount = SECTIONS.filter(s => prefs[s.field] && String(prefs[s.field]).trim().length > 0).length;

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
            <span className="text-sm font-black" style={{ color: FG }}>Tour de Contrôle IA</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: YUZU, color: FG }}>
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
          {saving ? '' : 'Sauvegarder'}
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
            ADN de votre Stensor
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: FG }}>
            Sculptez votre intelligence financière
          </h1>
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.45)' }}>
            Chaque réglage est injecté dans chaque réponse. Plus vous définissez, plus Stensor vous appartient.
          </p>
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
            className="w-full py-4 font-black text-sm rounded-xl transition-all hover:opacity-90"
            style={{ background: FG, color: 'white' }}>
            {saving ? 'Synchronisation...' : savedOnce ? '✓ Resauvegarder les préférences' : 'Activer mon Stensor sur mesure →'}
          </button>
          <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(0,0,0,0.3)' }}>
            Gratuit · Sans crédits · Modifiable à tout moment
          </p>
        </motion.div>
      </div>
    </div>
  );
}