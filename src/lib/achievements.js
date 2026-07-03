import { Sparkles, Rocket, Target, Wrench, Flame, Crown } from 'lucide-react';

// Computes the 6 gamification trophies from the user's profile + completed tasks.
export function computeAchievements({ profile, doneTasksCount, accountCreatedDate }) {
  const score = Math.round(profile?.score_overall || 0);
  const scorePrev = Math.round(profile?.score_previous || 0);

  const firstDayDate = accountCreatedDate ? new Date(accountCreatedDate) : null;
  const firstDayLabel = firstDayDate ? firstDayDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return [
    {
      id: 'first_day',
      name: 'Premier pas',
      description: 'Créer votre premier scan de visibilité IA sur UseWok.',
      icon: Sparkles,
      color: '#7B4FE0',
      unlocked: !!accountCreatedDate,
      date: firstDayLabel,
    },
    {
      id: 'score_50',
      name: 'Cap des 50',
      description: 'Atteindre un score de visibilité IA de 50/100.',
      icon: Target,
      color: '#3B8BEB',
      unlocked: score >= 50,
      progress: score < 50 ? (score / 50) * 100 : null,
      progressLabel: `${score}/50`,
    },
    {
      id: 'score_80',
      name: 'Élite IA',
      description: 'Atteindre un score de visibilité IA de 80/100.',
      icon: Crown,
      color: '#F59E0B',
      unlocked: score >= 80,
      progress: score < 80 ? (score / 80) * 100 : null,
      progressLabel: `${score}/80`,
    },
    {
      id: 'first_fix',
      name: 'Premier correctif',
      description: 'Marquer votre première action recommandée comme terminée.',
      icon: Wrench,
      color: '#16A34A',
      unlocked: doneTasksCount >= 1,
      progress: doneTasksCount < 1 ? 0 : null,
      progressLabel: `${doneTasksCount}/1`,
    },
    {
      id: 'five_fixes',
      name: 'Optimisateur',
      description: 'Terminer 5 actions recommandées pour améliorer votre visibilité.',
      icon: Flame,
      color: '#EF4444',
      unlocked: doneTasksCount >= 5,
      progress: doneTasksCount < 5 ? (doneTasksCount / 5) * 100 : null,
      progressLabel: `${doneTasksCount}/5`,
    },
    {
      id: 'progression',
      name: 'En progression',
      description: 'Améliorer votre score par rapport à votre dernier scan.',
      icon: Rocket,
      color: '#FF5A1F',
      unlocked: scorePrev > 0 && score > scorePrev,
    },
  ];
}