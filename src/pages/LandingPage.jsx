import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import GuestQuiz from '@/components/landing/GuestQuiz';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const YT = 'https://www.youtube.com/embed/NnEe-G3VnIk?autoplay=1&mute=1&loop=1&playlist=NnEe-G3VnIk&controls=0&modestbranding=1&showinfo=0&rel=0&disablekb=1&iv_load_policy=3&fs=0';

const FACES = [
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
];

// ─── Shared components ────────────────────────────────────────────────────────
function Scene({ children, bg = 'white', minH = '100vh', className = '' }) {
  return (
    <section className={`relative w-full flex flex-col items-center justify-center px-6 md:px-8 ${className}`}
      style={{ minHeight: minH, background: bg }}>
      {children}
    </section>
  );
}

function SectionLabel({ text, light = false }) {
  return (
    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="text-[10px] font-black tracking-[0.35em] uppercase mb-20 text-center"
      style={{ color: light ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>
      {text}
    </motion.p>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-10 py-6"
      style={{ background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent', transition: 'background 0.5s ease' }}>
      <div className="flex items-center gap-2.5">
        <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-5 h-5 object-contain" />
        <span className="text-sm font-black tracking-tight" style={{ color: FG }}>Stensor</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="/fonctionnalites" className="text-xs text-gray-400 hover:text-black transition-colors">Features</a>
        <a href="/tarifs" className="text-xs text-gray-400 hover:text-black transition-colors">Pricing</a>
        <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs text-gray-400 hover:text-black transition-colors">Sign in</button>
      </div>
      <motion.button onClick={onCta} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="text-xs font-black px-5 py-2.5"
        style={{ background: FG, color: 'white', borderRadius: '6px' }}>
        Start free →
      </motion.button>
    </motion.header>
  );
}

// ─── 01 HERO ─────────────────────────────────────────────────────────────────
function Hero({ onCta }) {
  return (
    <Scene>
      <div className="text-center max-w-4xl mx-auto">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
          style={{ color: 'rgba(0,0,0,0.2)' }}>
          AI Financial Coach
        </motion.p>

        {['Keep Your Pleasures.', 'Build Real Wealth.'].map((line, i) => (
          <div key={i} className="overflow-hidden">
            <motion.h1 initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9] block"
              style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: i === 0 ? FG : YELLOW }}>
              {line}
            </motion.h1>
          </div>
        ))}

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
          className="text-lg leading-relaxed max-w-xl mx-auto mt-16 mb-14"
          style={{ color: 'rgba(0,0,0,0.35)', fontFamily: 'var(--font-open)' }}>
          La science prouve que les gens qui gardent leurs plaisirs tiennent <strong style={{ color: FG }}>3× plus longtemps</strong> et atteignent leurs objectifs <strong style={{ color: FG }}>2× plus vite</strong>. Stensor en fait sa stratégie.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
          className="flex flex-col items-center gap-6">
          <motion.button onClick={onCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-12 py-5 font-black text-base"
            style={{ background: YELLOW, color: FG, borderRadius: '8px', boxShadow: '0 12px 48px rgba(221,255,0,0.4)' }}>
            Découvrir mon plan <ArrowRight className="w-4 h-4" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {FACES.map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              <strong className="text-black font-black">1 000+ utilisateurs</strong> construisent déjà leur avenir
            </p>
          </div>
        </motion.div>
      </div>
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.15))' }} />
        <p className="text-[9px] tracking-[0.3em] uppercase text-gray-300">Scroll</p>
      </motion.div>
    </Scene>
  );
}

// ─── 02 VIDEO ─────────────────────────────────────────────────────────────────
function VideoScene() {
  return (
    <Scene bg="#fafaf8">
      <div className="w-full max-w-5xl mx-auto">
        <SectionLabel text="Voir en action" />
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full overflow-hidden"
          style={{ borderRadius: '16px', boxShadow: '0 32px 80px rgba(0,0,0,0.1)', aspectRatio: '16/9' }}>
          <div className="absolute inset-0 z-10" style={{ pointerEvents: 'none' }} />
          <iframe src={YT} className="absolute inset-0 w-full h-full"
            style={{ border: 'none', pointerEvents: 'none' }}
            allow="autoplay; encrypted-media" title="Stensor demo" />
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 03 PLEASURE SIMULATOR ───────────────────────────────────────────────────
const PLEASURES = [
  {
    emoji: '🍕', label: 'Soirées pizza',
    result: { saved: '€94/mois récupérés', how: 'en abonnements oubliés', verdict: '✅ Pizza maintenue à jamais', impact: '+€1 128/an sans rien changer' },
    chatgpt: '"Réduisez vos dépenses alimentaires de 30%."',
  },
  {
    emoji: '✈️', label: 'Voyages',
    result: { saved: 'Voyage à €2 000', how: 'financé en 11 semaines', verdict: '✅ Départ sans toucher l\'épargne', impact: 'Portfolio intact, rêve accompli' },
    chatgpt: '"Vos dépenses voyage dépassent les recommandations."',
  },
  {
    emoji: '📱', label: 'Dernier iPhone',
    result: { saved: 'iPhone financé', how: 'via ton buffer tech', verdict: '✅ Achat dans 6 semaines', impact: 'Plan jour par jour fourni' },
    chatgpt: '"Évitez les achats impulsifs. Pensez long terme."',
  },
  {
    emoji: '☕', label: 'Café quotidien',
    result: { saved: '€1 200/an protégés', how: 'leaks trouvés ailleurs', verdict: '✅ Café intact pour toujours', impact: 'Leaks : assurances × 2, SaaS ×3' },
    chatgpt: '"Supprimez le café du matin. Économisez €400/an."',
  },
  {
    emoji: '🎮', label: 'Gaming / Netflix',
    result: { saved: 'Loisirs préservés à 100%', how: 'optimisation invisible', verdict: '✅ Aucun divertissement touché', impact: '+€187/mois redirigés vers tes objectifs' },
    chatgpt: '"Limitez vos abonnements de divertissement."',
  },
];

function PleasureSimulator({ onCta }) {
  const [selected, setSelected] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (i) => {
    setRevealed(false);
    setSelected(i);
    setTimeout(() => setRevealed(true), 300);
  };

  useEffect(() => {
    setTimeout(() => setRevealed(true), 600);
  }, []);

  const p = PLEASURES[selected];

  return (
    <Scene bg="white">
      <div className="w-full max-w-4xl mx-auto">
        <SectionLabel text="Le simulateur Plaisir" />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="text-center mb-16">
          <h2 className="font-black tracking-tighter mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: FG, lineHeight: 1.0 }}>
            Choisissez votre plaisir.<br />
            <span style={{ color: YELLOW }}>Regardez Stensor le protéger.</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto" style={{ fontFamily: 'var(--font-open)' }}>
            Ce que les autres outils vous demandent de supprimer, Stensor le garde. Et trouve les vraies économies ailleurs.
          </p>
        </motion.div>

        {/* Pleasure pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {PLEASURES.map((pl, i) => (
            <motion.button key={i} onClick={() => handleSelect(i)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-3 font-black text-sm transition-all"
              style={{
                background: selected === i ? FG : 'rgba(0,0,0,0.04)',
                color: selected === i ? 'white' : FG,
                borderRadius: '40px',
                border: selected === i ? 'none' : '1px solid rgba(0,0,0,0.08)',
              }}>
              <span>{pl.emoji}</span> {pl.label}
            </motion.button>
          ))}
        </div>

        {/* Result bento */}
        <AnimatePresence mode="wait">
          {revealed && (
            <motion.div key={selected}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="grid md:grid-cols-2 gap-4">

              {/* ChatGPT card */}
              <div className="p-8 flex flex-col gap-5" style={{ background: '#fafaf8', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                    <X className="w-2.5 h-2.5 text-gray-400" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase text-gray-300">ChatGPT répond</span>
                </div>
                <p className="text-base text-gray-400 italic" style={{ fontFamily: '"Georgia", serif', lineHeight: 1.65 }}>
                  {p.chatgpt}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-300">Résultat : abandon au bout de 3 semaines.</p>
                </div>
              </div>

              {/* Stensor card */}
              <div className="p-8 flex flex-col gap-5" style={{ background: FG, borderRadius: '12px' }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: YELLOW }}>
                    <Check className="w-2.5 h-2.5" style={{ color: FG }} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: YELLOW }}>Stensor répond</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <p className="text-2xl font-black text-white">{p.result.saved}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{p.result.how}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: YELLOW }}>
                    <p className="text-sm font-black" style={{ color: FG }}>{p.result.verdict}</p>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-open)' }}>
                    Impact : {p.result.impact}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.5 }} className="text-center mt-16">
          <p className="text-sm text-gray-400 mb-6" style={{ fontFamily: 'var(--font-open)' }}>
            Ce n'est pas de la magie. C'est de la méthode.
          </p>
          <motion.button onClick={onCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-10 py-4 font-black text-sm mx-auto"
            style={{ background: YELLOW, color: FG, borderRadius: '8px' }}>
            Tester avec ma situation <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 04 THE SCIENCE — Why pleasure works ─────────────────────────────────────
function ScienceScene() {
  const stats = [
    { n: '3×', label: 'plus longtemps en route', desc: 'Les personnes qui gardent leurs plaisirs tiennent 3× plus longtemps sur leur plan financier.' },
    { n: '2×', label: 'plus vite vers l\'objectif', desc: 'La dopamine du plaisir maintenu booste la discipline sur les autres postes.' },
    { n: '94%', label: 'd\'abandon en 90 jours', desc: 'Des budgets classiques (restriction totale) sont abandonnés avant 3 mois.' },
  ];
  return (
    <Scene bg={FG}>
      <div className="w-full max-w-5xl mx-auto">
        <SectionLabel text="La science derrière Stensor" light />

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-20">
          <h2 className="font-black tracking-tighter leading-[0.95]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: 'white' }}>
            La restriction totale ne fonctionne pas.<br />
            <span style={{ color: YELLOW }}>On le savait. Stensor aussi.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 flex flex-col gap-4"
              style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-black" style={{ fontSize: '3.5rem', color: YELLOW, lineHeight: 1 }}>{s.n}</p>
              <p className="text-base font-black text-white">{s.label}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-open)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="p-8 md:p-12 text-center"
          style={{ background: 'rgba(221,255,0,0.06)', borderRadius: '16px', border: '1px solid rgba(221,255,0,0.15)' }}>
          <p className="text-xl md:text-2xl font-black text-white leading-tight max-w-2xl mx-auto">
            "Le bonheur n'est pas une récompense au bout du chemin.<br />
            C'est le carburant qui permet d'y arriver."
          </p>
          <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-open)' }}>
            — La philosophie Stensor
          </p>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── 05 CHAT DEMO ─────────────────────────────────────────────────────────────
const CHAT_DEMOS = [
  { userMsg: 'Est-ce que je peux acheter le nouvel iPhone 16 ?', aiMsg: "Oui — dans 3 semaines via ton buffer tech. Ne touche pas ton portefeuille d'investissement. Voici le plan jour par jour." },
  { userMsg: 'Suis-je en bonne voie pour ma retraite anticipée ?', aiMsg: "À 82% de ton objectif. Un ajustement de €87/mois te remet à 100% d'ici Q3. C'est moins d'un repas au restaurant." },
  { userMsg: 'Quel est mon prochain move financier ?', aiMsg: "Augmente ton virement automatique de €50 ce mois. Impact sur ta retraite : +€12 400. 2 minutes à configurer." },
];

function ChatScene() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState('user');

  useEffect(() => {
    setPhase('user');
    const t1 = setTimeout(() => setPhase('typing'), 700);
    const t2 = setTimeout(() => setPhase('ai'), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [current]);

  const demo = CHAT_DEMOS[current];

  return (
    <Scene bg="#fafaf8">
      <div className="w-full max-w-2xl mx-auto">
        <SectionLabel text="Conversation en direct" />
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
            <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-6 h-6 object-contain" />
            <div>
              <p className="text-xs font-black" style={{ color: FG }}>Stensor</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-[10px] text-gray-400">En ligne</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-8 flex flex-col gap-5" style={{ minHeight: 200 }}>
            <AnimatePresence mode="wait">
              <motion.div key={`u-${current}`} initial={{ opacity: 0, y: 10, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.35 }} className="self-end px-5 py-3.5 max-w-sm text-sm font-medium"
                style={{ background: FG, color: 'white', borderRadius: '18px 18px 4px 18px', fontFamily: 'var(--font-open)' }}>
                {demo.userMsg}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {phase === 'typing' && (
                <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="self-start flex items-center gap-1.5 px-5 py-3.5"
                  style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '18px 18px 18px 4px' }}>
                  {[0, 1, 2].map(i => (
                    <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                      className="w-1.5 h-1.5 rounded-full" style={{ background: FG }} />
                  ))}
                </motion.div>
              )}
              {phase === 'ai' && (
                <motion.div key={`a-${current}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }} className="self-start px-5 py-3.5 max-w-sm text-sm"
                  style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '18px 18px 18px 4px', color: '#1a1a1a', fontFamily: 'var(--font-open)', lineHeight: 1.65 }}>
                  {demo.aiMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between px-6 pb-5 pt-1">
            <div className="flex gap-1.5">
              {CHAT_DEMOS.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className="transition-all rounded-full"
                  style={{ width: current === i ? 20 : 6, height: 6, background: current === i ? FG : 'rgba(0,0,0,0.12)' }} />
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setCurrent(c => (c - 1 + CHAT_DEMOS.length) % CHAT_DEMOS.length)}
                className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button onClick={() => setCurrent(c => (c + 1) % CHAT_DEMOS.length)}
                className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

// ─── 06 RESULTS TICKER — Proof of results ────────────────────────────────────
const RESULTS = [
  { name: 'Sarah K.', result: '€640/mois récupérés', time: '1ère conversation' },
  { name: 'Julien M.', result: 'Retraite anticipée à 47 ans', time: '6 mois de plan' },
  { name: 'Marc D.', result: '€0 dette en 14 mois', time: 'sans sacrifier ses sorties' },
  { name: 'Camille F.', result: 'Premier ETF acheté', time: 'après 10 min de chat' },
  { name: 'Thomas R.', result: '+€23 000 en 2 ans', time: 'café du matin intact' },
  { name: 'Léa B.', result: 'Voyage €2 800 financé', time: 'en 8 semaines' },
];

function ResultsScene() {
  return (
    <Scene bg="white">
      <div className="w-full max-w-5xl mx-auto">
        <SectionLabel text="Résultats réels" />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-16">
          <h2 className="font-black tracking-tighter"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: FG, lineHeight: 1.0 }}>
            Ils ont gardé leurs plaisirs.<br />
            <span style={{ color: YELLOW }}>Et construit quelque chose de réel.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESULTS.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="p-7 flex flex-col gap-4"
              style={{ background: '#fafaf8', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <p className="text-xl font-black" style={{ color: FG }}>{r.result}</p>
              <p className="text-xs text-gray-400" style={{ fontFamily: 'var(--font-open)' }}>{r.time}</p>
              <div className="mt-auto pt-3 border-t border-gray-100">
                <p className="text-xs font-black text-gray-500">{r.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Scene>
  );
}

// ─── 07 FINAL CTA ─────────────────────────────────────────────────────────────
function FinalScene({ onCta }) {
  return (
    <Scene bg={YELLOW}>
      <div className="text-center max-w-3xl mx-auto">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-16"
          style={{ color: 'rgba(0,0,0,0.3)' }}>
          Votre move
        </motion.p>
        {['Votre plaisir.', 'Notre problème.'].map((line, i) => (
          <div key={i} className="overflow-hidden mb-2">
            <motion.h2 initial={{ y: 80, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-black tracking-tighter leading-[0.9]"
              style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', color: i === 0 ? FG : 'rgba(0,0,0,0.22)' }}>
              {line}
            </motion.h2>
          </div>
        ))}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.3 }} className="flex flex-col items-center gap-5 mt-16">
          <motion.button onClick={onCta} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-14 py-5 font-black text-base"
            style={{ background: FG, color: 'white', borderRadius: '8px', boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }}>
            Commencer gratuitement <ArrowRight className="w-4 h-4" />
          </motion.button>
          <p className="text-xs" style={{ color: 'rgba(0,0,0,0.4)' }}>Sans carte bancaire. Sans configuration. Juste de la clarté.</p>
        </motion.div>
      </div>
    </Scene>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-8 md:px-10 py-10 flex items-center justify-between flex-wrap gap-4"
      style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-2">
        <img src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png" alt="Stensor" className="w-5 h-5 object-contain" />
        <span className="text-xs font-black" style={{ color: FG }}>Stensor</span>
      </div>
      <div className="flex items-center gap-6">
        {[['Features', '/fonctionnalites'], ['Pricing', '/tarifs'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
          <a key={l} href={h} className="text-[11px] text-gray-300 hover:text-black transition-colors">{l}</a>
        ))}
      </div>
      <p className="text-[10px] text-gray-200">2026 Stensor Inc. · Pas un conseil financier.</p>
    </footer>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
  }, [navigate]);

  if (!ready) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
    </div>
  );

  const openQuiz = () => setShowQuiz(true);

  return (
    <div className="font-inter overflow-x-hidden bg-white">
      <AnimatePresence>{showQuiz && <GuestQuiz onClose={() => setShowQuiz(false)} />}</AnimatePresence>
      <Navbar onCta={openQuiz} />
      <Hero onCta={openQuiz} />
      <VideoScene />
      <PleasureSimulator onCta={openQuiz} />
      <ScienceScene />
      <ChatScene />
      <ResultsScene />
      <FinalScene onCta={openQuiz} />
      <Footer />
    </div>
  );
}