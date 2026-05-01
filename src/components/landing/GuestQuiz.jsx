import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, Lock, TrendingUp, Shield, Zap, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

const QUESTIONS = [
  {
    id: 'goal',
    phase: 'Objectif',
    question: "Si dans 3 ans votre vie financiere etait parfaite, a quoi ressemblerait-elle ?",
    subtitle: "Choisissez l'ambition qui vous fait vibrer.",
    type: 'single',
    options: [
      { id: 'freedom', label: 'Liberte totale', desc: 'Travailler si je veux, pas parce que je dois', emoji: '🦅' },
      { id: 'wealth', label: 'Batir un patrimoine', desc: 'Des actifs qui travaillent a ma place', emoji: '🏗️' },
      { id: 'debt_free', label: 'Zero dette', desc: 'Dormir sans angoisse financiere', emoji: '😮‍💨' },
      { id: 'retire_early', label: 'Retraite anticipee', desc: 'Arreter avant 50 ans, vraiment', emoji: '🌴' },
      { id: 'income', label: 'Revenus passifs', desc: "Gagner de l'argent en dormant", emoji: '💸' },
    ],
  },
  {
    id: 'pleasure',
    phase: 'Psychologie',
    question: "Quelle est la depense plaisir que vous refuseriez de sacrifier, meme en mode economie ?",
    subtitle: "On ne juge pas. On adapte la strategie a votre vrai vous.",
    type: 'single',
    options: [
      { id: 'travel', label: 'Voyages et experiences', desc: "Les souvenirs ca n'a pas de prix", emoji: '✈️' },
      { id: 'food', label: 'Restos et gastronomie', desc: "Bien manger, c'est sacre", emoji: '🍽️' },
      { id: 'tech', label: 'Tech et gadgets', desc: 'Le dernier iPhone, toujours', emoji: '📱' },
      { id: 'fashion', label: 'Mode et style', desc: "S'habiller, c'est une expression", emoji: '👗' },
      { id: 'wellness', label: 'Sport et bien-etre', desc: "Salle, coach, spa — c'est de l'investissement", emoji: '🧘' },
      { id: 'entertainment', label: 'Sorties et loisirs', desc: 'Concerts, cine, musees — la vie quoi', emoji: '🎭' },
    ],
  },
  {
    id: 'fear',
    phase: 'Blocages',
    question: "Qu'est-ce qui vous empeche de dormir la nuit, financierement ?",
    subtitle: "Votre peur principale guide toute la strategie.",
    type: 'single',
    options: [
      { id: 'lose_job', label: 'Perdre mon emploi', desc: 'Et ne pas pouvoir rebondir', emoji: '💼' },
      { id: 'never_enough', label: "Ne jamais m'en sortir", desc: "Le sentiment de courir apres l'argent", emoji: '🌀' },
      { id: 'market_crash', label: 'Un krach financier', desc: "Perdre tout ce que j'ai mis de cote", emoji: '📉' },
      { id: 'retirement', label: 'La retraite insuffisante', desc: 'Vieillir sans argent', emoji: '🎠' },
      { id: 'inflation', label: "L'inflation qui devore", desc: "Economiser pour perdre du pouvoir d'achat", emoji: '🔥' },
    ],
  },
  {
    id: 'savings',
    phase: 'Situation',
    question: "Combien mettez-vous de cote chaque mois, honnetement ?",
    subtitle: "Pas de jugement. On part de la ou vous en etes.",
    type: 'single',
    options: [
      { id: 'zero', label: 'Rien pour l\'instant', desc: 'Je vis le mois dans le mois', emoji: '😶' },
      { id: 'small', label: 'Moins de 200 EUR', desc: 'Quelques economies quand possible', emoji: '🌱' },
      { id: 'medium', label: '200 EUR a 800 EUR', desc: 'Je fais des efforts reguliers', emoji: '📈' },
      { id: 'good', label: '800 EUR a 2000 EUR', desc: "J'ai de bonnes bases", emoji: '💪' },
      { id: 'great', label: 'Plus de 2000 EUR', desc: "Je suis pret a accelerer", emoji: '🚀' },
    ],
  },
  {
    id: 'emotion',
    phase: 'Mindset',
    question: "Comment vous sentez-vous juste apres un gros achat impulsif ?",
    subtitle: "Votre relation a l'argent en dit plus que vos chiffres.",
    type: 'single',
    options: [
      { id: 'guilty', label: 'Coupable, puis resigne', desc: "C'est fait, tant pis...", emoji: '😬' },
      { id: 'justified', label: 'Je le meritais', desc: "Je travaille dur, j'ai le droit", emoji: '😤' },
      { id: 'excited', label: 'Excite, mais vite oublie', desc: 'Le bonheur dure 48h', emoji: '🎢' },
      { id: 'regret', label: 'Regret immediat', desc: "Pourquoi j'ai fait ca...", emoji: '🤦' },
      { id: 'calm', label: 'Calme et assume', desc: "J'avais prevu ce budget", emoji: '😌' },
    ],
  },
];

const PLAN_NAMES = {
  freedom: 'Plan Liberte Financiere',
  wealth: 'Plan Patrimoine Accelere',
  debt_free: 'Plan Zero Dette',
  retire_early: 'Plan FIRE Anticipe',
  income: 'Plan Revenus Passifs',
};

function getPlanName(answers) {
  return PLAN_NAMES[answers.goal] || 'Plan Personnalise Stensor';
}

function getInsight(answers) {
  const map = {
    'pleasure_travel': "Votre gout pour les experiences est un atout — les bons plans voyage peuvent coexister avec un patrimoine solide.",
    'pleasure_tech': "Votre appetit tech peut devenir un levier : investir dans des ETF tech tout en gardant votre budget gadgets.",
    'fear_lose_job': "Un fonds d'urgence de 6 mois de depenses est votre premiere priorite — avant tout investissement.",
    'fear_never_enough': "Le cycle 'trop peu' se brise avec une regle simple : payer votre futur vous en premier, automatiquement.",
    'emotion_guilty': "La culpabilite post-achat revele un budget emotionnel a construire — vous avez besoin d'une enveloppe plaisir assumee.",
    'emotion_calm': "Votre maitrise emotionnelle est rare. Vous etes pret pour des strategies d'investissement plus audacieuses.",
    'savings_zero': "Commencer a 50 EUR/mois change tout. L'automatisme prime sur le montant.",
    'savings_great': "Avec plus de 2000 EUR/mois, l'optimisation fiscale devient votre levier numero 1.",
  };
  const keys = [`pleasure_${answers.pleasure}`, `fear_${answers.fear}`, `emotion_${answers.emotion}`, `savings_${answers.savings}`];
  for (const k of keys) { if (map[k]) return map[k]; }
  return "Votre profil unique revele des opportunites que la plupart des gens ignorent completement.";
}

export default function GuestQuiz({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleSelect = (optionId) => setSelected(optionId);

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
      setAnimKey(k => k + 1);
    } else {
      setShowPlan(true);
      setTimeout(() => setPlanReady(true), 1800);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      setSelected(answers[QUESTIONS[step - 1].id] || null);
      setAnimKey(k => k + 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '92vh', overflowY: 'auto' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
          <X className="w-4 h-4 text-zinc-400" />
        </button>

        <AnimatePresence mode="wait">
          {!showPlan ? (
            <motion.div key={`q-${animKey}`} initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div className="px-7 pt-7 pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase" style={{ color: '#a38f00' }}>{q.phase}</span>
                  <span className="text-[10px] font-semibold text-zinc-400">{step + 1} / {QUESTIONS.length}</span>
                </div>
                <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden mb-6">
                  <motion.div className="h-full rounded-full" style={{ background: FG }}
                    initial={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }} />
                </div>
                <h2 className="text-xl font-black tracking-tight leading-tight mb-2" style={{ color: FG }}>{q.question}</h2>
                <p className="text-sm text-zinc-400 mb-5">{q.subtitle}</p>
              </div>

              <div className="px-7 pb-2 space-y-2">
                {q.options.map((opt) => {
                  const isActive = selected === opt.id;
                  return (
                    <motion.button key={opt.id} onClick={() => handleSelect(opt.id)}
                      whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{ background: isActive ? FG : 'rgba(0,0,0,0.03)', border: `1.5px solid ${isActive ? FG : 'rgba(0,0,0,0.07)'}`, color: isActive ? 'white' : FG }}>
                      <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold leading-tight">{opt.label}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: isActive ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.4)' }}>{opt.desc}</p>
                      </div>
                      {isActive && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: YELLOW }}>
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke={FG} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="px-7 py-6 flex items-center justify-between">
                <button onClick={handleBack} disabled={step === 0}
                  className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-0">
                  <ArrowLeft className="w-3.5 h-3.5" /> Retour
                </button>
                <motion.button onClick={handleNext} disabled={!selected}
                  whileHover={selected ? { scale: 1.02 } : {}} whileTap={selected ? { scale: 0.98 } : {}}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all"
                  style={{ background: selected ? FG : 'rgba(0,0,0,0.07)', color: selected ? 'white' : 'rgba(0,0,0,0.3)', cursor: selected ? 'pointer' : 'not-allowed' }}>
                  {step === QUESTIONS.length - 1 ? 'Voir mon plan' : 'Suivant'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <PlanResult key="plan" answers={answers} planReady={planReady} onLogin={() => base44.auth.redirectToLogin('/app')} onClose={onClose} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function PlanResult({ answers, planReady, onLogin, onClose }) {
  const planName = getPlanName(answers);
  const insight = getInsight(answers);

  const actions = [
    { icon: Target, text: 'Strategie d\'investissement sur-mesure' },
    { icon: TrendingUp, text: 'Simulation de patrimoine a 10 ans' },
    { icon: Shield, text: 'Plan d\'urgence financier personnalise' },
    { icon: Zap, text: 'Accelerateurs adaptes a votre profil' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="relative px-7 pt-8 pb-6 overflow-hidden" style={{ background: FG }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 15% 50%, rgba(221,255,0,0.15) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)`
        }} />
        {!planReady ? (
          <div className="relative text-center py-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 mx-auto mb-4" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white' }} />
            <p className="text-white font-bold text-sm">Analyse de votre profil en cours...</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Nous construisons votre plan personnalise</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: 'spring' }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase mb-3"
              style={{ background: YELLOW, color: FG }}>
              ✦ Votre plan
            </motion.div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight mb-1">{planName}</h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Genere en fonction de vos 5 reponses</p>
          </motion.div>
        )}
      </div>

      {planReady && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
          <div className="px-7 py-5 border-b border-zinc-100">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-500" />
              <p className="text-sm leading-relaxed text-zinc-600">{insight}</p>
            </div>
          </div>

          <div className="px-7 py-5">
            <p className="text-[10px] font-black tracking-[0.15em] uppercase text-zinc-400 mb-3">Ce qui vous attend</p>
            <div className="space-y-2">
              {actions.map((action, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.025)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <action.icon className="w-4 h-4 flex-shrink-0 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-500 flex-1">{action.text}</span>
                  <Lock className="w-3.5 h-3.5 text-zinc-300" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="px-7 pb-7">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-black" style={{ color: FG }}>Sauvegardez votre plan</span>
                <span className="px-2 py-0.5 text-[9px] font-black rounded-md" style={{ background: YELLOW, color: FG }}>GRATUIT</span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">Sans compte, votre plan sera supprime dans <span className="font-bold text-red-500">24h</span>. Creez un compte gratuit pour l'activer.</p>
              <motion.button onClick={onLogin}
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all"
                style={{ background: FG, color: 'white' }}>
                <Sparkles className="w-4 h-4" style={{ color: YELLOW }} />
                Creer mon compte et activer mon plan
              </motion.button>
              <button onClick={onClose} className="w-full mt-2 py-2 text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                Continuer sans sauvegarder
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}