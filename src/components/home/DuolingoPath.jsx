import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Zap, BookOpen, MessageSquare, Trophy, CheckCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useEffect } from 'react';

const PURPLE = '#3A0088';
const YUZU = '#DDFF00';
const CORAL = '#FF4F00';

const SECTIONS = [
  {
    titleKey: 'fundamentals',
    title: 'Fundamentals',
    requiredPlan: null,
    color: YUZU,
    textColor: PURPLE,
    lessons: [
      { id: 1, icon: BookOpen, label: 'Introduction to Stensor', status: 'done', xp: 50 },
      { id: 2, icon: MessageSquare, label: 'Your first conversation', status: 'done', xp: 50 },
      { id: 3, icon: Zap, label: 'Smart prompting', status: 'current', xp: 75 },
      { id: 4, icon: Star, label: 'Getting the best answers', status: 'locked', xp: 75 },
    ],
  },
  {
    title: 'Finance Basics',
    requiredPlan: 'advanced',
    requiredLabel: 'Advanced',
    color: PURPLE,
    textColor: 'white',
    lessons: [
      { id: 5, icon: BookOpen, label: 'Budget analysis with AI', status: 'locked', xp: 100 },
      { id: 6, icon: TrendingUp, label: 'Investment conversations', status: 'locked', xp: 100 },
      { id: 7, icon: Trophy, label: 'Monthly financial review', status: 'locked', xp: 150 },
    ],
  },
  {
    title: 'Wealth Strategy',
    requiredPlan: 'expert',
    requiredLabel: 'Expert',
    color: '#0A0A0A',
    textColor: YUZU,
    lessons: [
      { id: 8, icon: BookOpen, label: 'Portfolio management', status: 'locked', xp: 200 },
      { id: 9, icon: Star, label: 'Tax optimization', status: 'locked', xp: 200 },
      { id: 10, icon: Trophy, label: 'Wealth certification', status: 'locked', xp: 300 },
    ],
  },
];

function LessonNode({ lesson, index, sectionColor, sectionTextColor, isUnlocked }) {
  const [hovered, setHovered] = useState(false);
  const Icon = lesson.icon;
  const offsets = [0, 40, 60, 40, 0, -40, -60, -40];
  const offsetX = offsets[index % offsets.length];
  const isDone = lesson.status === 'done';
  const isCurrent = lesson.status === 'current' && isUnlocked;
  const isLocked = lesson.status === 'locked' || !isUnlocked;

  return (
    <motion.div className="flex flex-col items-center relative"
      style={{ marginLeft: offsetX }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}>
      {isCurrent && (
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-1 text-[10px] font-black px-2 py-0.5 tracking-widest"
          style={{ background: PURPLE, color: YUZU, borderRadius: '2px' }}>
          START
        </motion.div>
      )}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={isLocked}
        className="w-14 h-14 flex items-center justify-center transition-all shadow-md"
        style={{
          borderRadius: '50%',
          background: isDone ? PURPLE : isCurrent ? YUZU : 'rgba(0,0,0,0.06)',
          border: `3px solid ${isDone ? '#2a0066' : isCurrent ? '#b8d400' : 'rgba(0,0,0,0.1)'}`,
          color: isDone ? 'white' : isCurrent ? PURPLE : '#bbb',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
        }}>
        {isDone ? <CheckCircle className="w-6 h-6" /> : isLocked ? <Lock className="w-5 h-5" /> : <Icon className="w-6 h-6" />}
      </button>
      {hovered && !isLocked && (
        <div className="absolute top-full mt-2 bg-white shadow-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap z-10"
          style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px', color: PURPLE }}>
          {lesson.label}
          <span className="ml-2 font-black" style={{ color: CORAL }}>+{lesson.xp} XP</span>
        </div>
      )}
    </motion.div>
  );
}

export default function DuolingoPath() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUserPlan(getUserPlan(u))).catch(() => {});
  }, []);

  const PLAN_ORDER = ['free', 'essential', 'advanced', 'expert', 'supreme'];
  const userPlanIdx = PLAN_ORDER.indexOf(userPlan?.id || 'free');

  const isSectionUnlocked = (section) => {
    if (!section.requiredPlan) return true;
    const reqIdx = PLAN_ORDER.indexOf(section.requiredPlan);
    return userPlanIdx >= reqIdx;
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black" style={{ color: PURPLE }}>{t('learning_path')}</h2>
        <p className="text-sm mt-1" style={{ color: '#999' }}>{t('learning_sub')}</p>
      </div>

      <div className="space-y-10">
        {SECTIONS.map((section, sIdx) => {
          const unlocked = isSectionUnlocked(section);
          return (
            <div key={sIdx}>
              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-3 mb-6"
                style={{ background: section.color, borderRadius: '5px' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2" style={{ background: section.textColor === 'white' ? 'rgba(255,255,255,0.5)' : PURPLE, borderRadius: '50%' }} />
                  <span className="text-sm font-bold" style={{ color: section.textColor }}>{section.title}</span>
                </div>
                {!unlocked && section.requiredLabel && (
                  <button onClick={() => navigate('/pricing')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold transition-all"
                    style={{ background: 'rgba(255,255,255,0.15)', color: section.textColor, borderRadius: '3px' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                    <Lock className="w-2.5 h-2.5" />
                    {t('upgrade_to_unlock')} — {section.requiredLabel}
                  </button>
                )}
              </div>

              {/* Lesson nodes */}
              <div className={`flex flex-col gap-4 items-center ${!unlocked ? 'opacity-50 pointer-events-none' : ''}`}>
                {section.lessons.map((lesson, lIdx) => (
                  <LessonNode key={lesson.id} lesson={lesson} index={lIdx}
                    sectionColor={section.color} sectionTextColor={section.textColor}
                    isUnlocked={unlocked} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}