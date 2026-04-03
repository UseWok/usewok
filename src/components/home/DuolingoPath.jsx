import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Zap, BookOpen, MessageSquare, Trophy, CheckCircle } from 'lucide-react';

const sections = [
  {
    title: 'Les bases',
    color: 'bg-green-500',
    colorLight: 'bg-green-100',
    colorText: 'text-green-700',
    lessons: [
      { id: 1, icon: BookOpen, label: 'Introduction', status: 'done' },
      { id: 2, icon: MessageSquare, label: 'Premier agent', status: 'done' },
      { id: 3, icon: Zap, label: 'Actions rapides', status: 'current' },
      { id: 4, icon: Star, label: 'Maîtrise', status: 'locked' },
    ],
  },
  {
    title: 'Agents avancés',
    color: 'bg-blue-500',
    colorLight: 'bg-blue-100',
    colorText: 'text-blue-700',
    lessons: [
      { id: 5, icon: MessageSquare, label: 'Contexte & mémoire', status: 'locked' },
      { id: 6, icon: Zap, label: 'Automatisation', status: 'locked' },
      { id: 7, icon: Trophy, label: 'Projet final', status: 'locked' },
    ],
  },
  {
    title: 'Intégrations',
    color: 'bg-purple-500',
    colorLight: 'bg-purple-100',
    colorText: 'text-purple-700',
    lessons: [
      { id: 8, icon: BookOpen, label: 'APIs externes', status: 'locked' },
      { id: 9, icon: Star, label: 'Webhooks', status: 'locked' },
      { id: 10, icon: Trophy, label: 'Certification', status: 'locked' },
    ],
  },
];

function LessonNode({ lesson, index, total }) {
  const [hovered, setHovered] = useState(false);
  const Icon = lesson.icon;

  // Zigzag offset
  const offsets = [0, 40, 60, 40, 0, -40, -60, -40];
  const offsetX = offsets[index % offsets.length];

  const isDone = lesson.status === 'done';
  const isCurrent = lesson.status === 'current';
  const isLocked = lesson.status === 'locked';

  return (
    <motion.div
      className="flex flex-col items-center"
      style={{ marginLeft: offsetX, position: 'relative' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      {isCurrent && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mb-1 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded-full"
        >
          START
        </motion.div>
      )}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={isLocked}
        className={`w-14 h-14 rounded-full flex items-center justify-center border-b-4 transition-all shadow-md ${
          isDone
            ? 'bg-green-500 border-green-700 text-white'
            : isCurrent
            ? 'bg-primary border-orange-600 text-white scale-110'
            : 'bg-muted border-border text-muted-foreground cursor-not-allowed'
        }`}
      >
        {isDone ? (
          <CheckCircle className="w-6 h-6" />
        ) : isLocked ? (
          <Lock className="w-5 h-5" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </button>
      {hovered && !isLocked && (
        <div className="absolute top-full mt-2 bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-lg z-10">
          {lesson.label}
        </div>
      )}
    </motion.div>
  );
}

export default function DuolingoPath() {
  return (
    <div className="max-w-2xl mx-auto mt-12 px-4 pb-16">
      <h2 className="text-lg font-bold text-foreground mb-2 text-center">Votre parcours</h2>
      <p className="text-sm text-muted-foreground text-center mb-8">Apprenez à créer des agents IA étape par étape</p>

      <div className="space-y-10">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            {/* Section header */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${section.colorLight} mb-6`}>
              <div className={`w-2 h-2 rounded-full ${section.color}`} />
              <span className={`text-sm font-semibold ${section.colorText}`}>{section.title}</span>
            </div>

            {/* Lesson nodes */}
            <div className="flex flex-col gap-4 items-center">
              {section.lessons.map((lesson, lIdx) => (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  index={lIdx}
                  total={section.lessons.length}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}