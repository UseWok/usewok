import { useState, useEffect } from 'react';
import { getPageModes } from '@/lib/page-modes';
import UnderConstruction from '@/components/UnderConstruction';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Zap, BookOpen, MessageSquare, Trophy, CheckCircle, TrendingUp, Crown, ChevronRight, Brain, Flame, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';
const PURPLE = '#3A0088';
const CORAL = '#FF4F00';

const SECTIONS = [
  {
    id: 'foundations',
    title: 'Fondations IA',
    subtitle: 'Maîtrisez les bases pour des résultats immédiats',
    requiredPlan: null,
    requiredLabel: null,
    color: FG,
    accent: YUZU,
    lessons: [
      { id: 1, icon: Zap, label: 'Introduction à Stensor', desc: 'Comprendre votre coach financier IA', status: 'done', xp: 50 },
      { id: 2, icon: MessageSquare, label: 'Votre première conversation', desc: 'Démarrez votre parcours de croissance', status: 'done', xp: 50 },
      { id: 3, icon: Brain, label: 'Prompting intelligent', desc: "L'art de formuler des questions puissantes", status: 'current', xp: 75 },
      { id: 4, icon: Star, label: 'Obtenir les meilleures réponses', desc: 'Extraire le maximum de chaque échange', status: 'locked', xp: 75 },
    ],
  },
  {
    id: 'finance',
    title: 'Finance & IA',
    subtitle: 'Analyse financière augmentée par intelligence artificielle',
    requiredPlan: 'advanced',
    requiredLabel: 'Advanced',
    color: PURPLE,
    accent: YUZU,
    lessons: [
      { id: 5, icon: BookOpen, label: 'Analyser son budget avec l\'IA', desc: 'Vision claire et stratégique de vos finances', status: 'locked', xp: 100 },
      { id: 6, icon: TrendingUp, label: 'Conversations d\'investissement', desc: 'Stratégies guidées par des données réelles', status: 'locked', xp: 100 },
      { id: 7, icon: Trophy, label: 'Bilan financier mensuel', desc: 'Le rituel de performance des experts', status: 'locked', xp: 150 },
    ],
  },
  {
    id: 'wealth',
    title: 'Wealth Mastery',
    subtitle: 'Stratégies de haut niveau réservées aux élites',
    requiredPlan: 'expert',
    requiredLabel: 'Expert',
    color: '#110028',
    accent: CORAL,
    lessons: [
      { id: 8, icon: BookOpen, label: 'Gestion de portefeuille IA', desc: 'Allocation d\'actifs optimisée par algorithme', status: 'locked', xp: 200 },
      { id: 9, icon: Star, label: 'Optimisation fiscale avancée', desc: 'Gardez plus, payez moins, légalement', status: 'locked', xp: 200 },
      { id: 10, icon: Crown, label: 'Certification Wealth Mastery', desc: 'Devenez un expert certifié Stensor', status: 'locked', xp: 300 },
    ],
  },
];

export default function DuolingoPath() {
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUserPlan(getUserPlan(u))).catch(() => {});
  }, []);

  const [pageMode, setPageMode] = useState('live');
  useEffect(() => { getPageModes().then(m => setPageMode(m.parcours || 'live')); }, []);

  const PLAN_ORDER = ['free', 'essential', 'advanced', 'expert', 'supreme'];
  const userPlanIdx = PLAN_ORDER.indexOf(userPlan?.id || 'free');

  const isSectionUnlocked = (section) => {
    if (!section.requiredPlan) return true;
    return userPlanIdx >= PLAN_ORDER.indexOf(section.requiredPlan);
  };

  const totalLessons = SECTIONS.reduce((acc, s) => acc + s.lessons.length, 0);
  const doneLessons = SECTIONS.reduce((acc, s) => acc + s.lessons.filter(l => l.status === 'done').length, 0);
  const totalXP = SECTIONS.reduce((acc, s) => acc + s.lessons.filter(l => l.status === 'done').reduce((a, l) => a + l.xp, 0), 0);

  if (pageMode === 'construction') {
    return (
      <UnderConstruction
        title="Le Parcours se forge"
        subtitle="Nous construisons quelque chose d'exceptionnel — un programme d'apprentissage unique pour transformer votre rapport à l'IA et à la finance."
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20 mt-8">

      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden mb-8 px-6 py-8 text-center"
        style={{ background: FG, borderRadius: '16px' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(221,255,0,0.12) 0%, transparent 55%), radial-gradient(circle at 85% 30%, rgba(58,0,136,0.2) 0%, transparent 55%)'
        }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5"
            style={{ background: YUZU, borderRadius: '6px' }}>
            <Flame className="w-3 h-3" style={{ color: FG }} />
            <span className="text-[10px] font-black tracking-widest" style={{ color: FG }}>TENSOR ACADEMY</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Forgez votre expertise IA</h2>
          <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Maîtrisez l'IA · Maximisez vos résultats financiers
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-5">
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: YUZU }}>{doneLessons}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Leçons</p>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="text-center">
              <p className="text-2xl font-black" style={{ color: YUZU }}>{totalXP}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>XP</p>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="text-center">
              <p className="text-2xl font-black text-white">{Math.round((doneLessons / totalLessons) * 100)}%</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Complété</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(doneLessons / totalLessons) * 100}%` }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: YUZU }} />
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-5">
        {SECTIONS.map((section, sIdx) => {
          const unlocked = isSectionUnlocked(section);
          const isDark = section.color === FG || section.color === '#110028' || section.color === PURPLE;

          return (
            <motion.div key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.1 }}
              className="overflow-hidden"
              style={{ borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>

              {/* Section header */}
              <div className="px-5 py-5 relative overflow-hidden" style={{ background: section.color }}>
                <div className="absolute right-0 top-0 bottom-0 w-40 pointer-events-none" style={{
                  background: `radial-gradient(circle at right center, ${section.accent}18, transparent 70%)`
                }} />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!unlocked && <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: section.accent }} />}
                      <h3 className="font-black text-base" style={{ color: isDark ? 'white' : FG }}>{section.title}</h3>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)' }}>
                      {section.subtitle}
                    </p>
                  </div>
                  {unlocked ? (
                    <span className="text-[9px] font-black px-2.5 py-1.5 flex-shrink-0 tracking-wider whitespace-nowrap"
                      style={{ background: section.accent, color: FG, borderRadius: '6px' }}>
                      {section.lessons.filter(l => l.status === 'done').length}/{section.lessons.length} ✓
                    </span>
                  ) : (
                    <button onClick={() => navigate('/pricing')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black transition-all flex-shrink-0 whitespace-nowrap"
                      style={{ background: section.accent, color: FG, borderRadius: '7px' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                      Débloquer <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lessons list */}
              <div className={`bg-white ${!unlocked ? 'opacity-40 pointer-events-none' : ''}`}>
                {section.lessons.map((lesson, lIdx) => {
                  const Icon = lesson.icon;
                  const isDone = lesson.status === 'done';
                  const isCurrent = lesson.status === 'current' && unlocked;
                  const isLessonLocked = lesson.status === 'locked' || !unlocked;

                  return (
                    <div key={lesson.id}
                      className="flex items-center gap-4 px-5 py-3.5 transition-all"
                      style={{
                        borderTop: lIdx > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                        background: isCurrent ? 'rgba(221,255,0,0.05)' : 'transparent',
                        cursor: isLessonLocked ? 'default' : 'pointer',
                      }}
                      onMouseEnter={e => { if (!isLessonLocked) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isCurrent ? 'rgba(221,255,0,0.05)' : 'transparent'; }}>

                      {/* Icon */}
                      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isDone ? FG : isCurrent ? YUZU : 'rgba(0,0,0,0.05)',
                          borderRadius: '10px',
                        }}>
                        {isDone
                          ? <CheckCircle className="w-5 h-5 text-white" />
                          : isLessonLocked
                          ? <Lock className="w-4 h-4" style={{ color: '#ccc' }} />
                          : <Icon className="w-5 h-5" style={{ color: isCurrent ? FG : '#777' }} />
                        }
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold" style={{ color: isLessonLocked ? '#ccc' : FG }}>{lesson.label}</p>
                          {isCurrent && (
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ repeat: Infinity, duration: 1.8 }}
                              className="text-[8px] font-black px-1.5 py-0.5 tracking-widest"
                              style={{ background: FG, color: YUZU, borderRadius: '3px' }}>
                              EN COURS
                            </motion.span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5 truncate" style={{ color: '#bbb' }}>{lesson.desc}</p>
                      </div>

                      {/* XP */}
                      <span className="text-[10px] font-black px-2 py-1 flex-shrink-0"
                        style={{
                          background: isDone ? 'rgba(22,163,74,0.08)' : 'rgba(0,0,0,0.04)',
                          color: isDone ? '#16a34a' : '#ccc',
                          borderRadius: '5px',
                        }}>
                        {isDone ? '✓ ' : ''}+{lesson.xp} XP
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Locked CTA */}
              {!unlocked && (
                <div className="px-5 py-4 text-center" style={{ background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <p className="text-xs mb-3" style={{ color: '#aaa' }}>
                    Débloquez <strong>{section.lessons.length} leçons exclusives</strong> avec le plan {section.requiredLabel}
                  </p>
                  <button onClick={() => navigate('/pricing')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black transition-all"
                    style={{ background: FG, color: 'white', borderRadius: '8px' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    Voir les abonnements <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      {(userPlan?.id === 'free' || !userPlan) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 px-6 py-7 text-center"
          style={{ background: YUZU, borderRadius: '14px' }}>
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
            style={{ background: FG, borderRadius: '12px' }}>
            <Sparkles className="w-6 h-6" style={{ color: YUZU }} />
          </div>
          <h3 className="font-black text-lg mb-1" style={{ color: FG }}>Accédez à toute l'académie</h3>
          <p className="text-xs mb-5" style={{ color: 'rgba(0,0,0,0.55)' }}>
            Finances, investissement, stratégies avancées et certification Wealth Mastery
          </p>
          <button onClick={() => navigate('/pricing')}
            className="px-7 py-3 text-sm font-black transition-all"
            style={{ background: FG, color: 'white', borderRadius: '9px' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Passer à Premium →
          </button>
        </motion.div>
      )}
    </div>
  );
}