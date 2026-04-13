import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Shield, BookOpen, Target, ChevronDown, ArrowRight, RefreshCw, Star, Flame, Trophy, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useDiscussions } from '@/lib/useDiscussions';
import { getConversationMessages } from '@/lib/discussions';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const PILLARS = [
  { id: 'savings', label: 'Épargne', icon: Shield, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', desc: 'Fonds d\'urgence & habitudes d\'épargne' },
  { id: 'investing', label: 'Investissement', icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', desc: 'Portefeuille & construction de richesse' },
  { id: 'debt', label: 'Dette', icon: Target, color: '#f97316', bg: 'rgba(249,115,22,0.08)', desc: 'Gestion & remboursement des dettes' },
  { id: 'knowledge', label: 'Connaissance', icon: BookOpen, color: '#a855f7', bg: 'rgba(168,85,247,0.08)', desc: 'Littératie financière & conscience' },
  { id: 'income', label: 'Revenus', icon: Zap, color: YUZU, bg: 'rgba(221,255,0,0.08)', desc: 'Diversification des revenus' },
];

const BADGE_CONFIG = {
  debt_slayer: { label: 'Vainqueur de dettes', icon: '⚔️', color: '#f97316' },
  streak_7: { label: '7 jours consécutifs', icon: '🔥', color: '#ef4444' },
  retirement_on_track: { label: 'Retraite en bonne voie', icon: '🎯', color: '#22c55e' },
  saver_elite: { label: 'Épargnant élite', icon: '🛡️', color: '#3b82f6' },
  investor: { label: 'Investisseur actif', icon: '📈', color: '#a855f7' },
  knowledge_master: { label: 'Maître financier', icon: '🧠', color: '#06b6d4' },
};

function getScoreColor(s) {
  if (s >= 80) return '#22c55e';
  if (s >= 60) return YUZU;
  if (s >= 40) return '#f97316';
  return '#ef4444';
}

function getScoreLabel(s) {
  if (s >= 80) return { text: 'Excellent 🚀', sub: 'Tu es sur la voie de la liberté financière' };
  if (s >= 60) return { text: 'Solide 💪', sub: 'Bases solides, continue à construire' };
  if (s >= 40) return { text: 'En progrès ⚡', sub: 'Belle progression, focus sur les points clés' };
  return { text: 'Départ 🌱', sub: 'Parfait moment pour poser les bases' };
}

function ScoreRing({ score }) {
  const size = 200;
  const r = 80;
  const stroke = 12;
  const circ = Math.PI * r;
  const progress = Math.min(score / 100, 1);
  const dashOffset = circ * (1 - progress);
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 50 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d={`M ${stroke/2+10} ${size/2} A ${r} ${r} 0 0 1 ${size-stroke/2-10} ${size/2}`}
            fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke} strokeLinecap="round" />
          <motion.path
            d={`M ${stroke/2+10} ${size/2} A ${r} ${r} 0 0 1 ${size-stroke/2-10} ${size/2}`}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            filter="url(#glow)"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1">
          <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            className="font-black" style={{ fontSize: '3.5rem', color, lineHeight: 1 }}>
            {score}
          </motion.span>
          <span className="text-xs font-bold mt-0.5" style={{ color: 'rgba(0,0,0,0.25)' }}>/100</span>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
        className="text-center mt-4">
        <p className="font-black text-lg" style={{ color }}>{label.text}</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>{label.sub}</p>
      </motion.div>
    </div>
  );
}

function PillarCard({ pillar, score, recommendation, delay }) {
  const [open, setOpen] = useState(false);
  const pct = score || 0;
  const Icon = pillar.icon;
  const steps = recommendation ? recommendation.split(/[\.\!\?]/).filter(s => s.trim().length > 10).slice(0, 3) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
      style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setOpen(o => !o)}>
        <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ background: pillar.bg }}>
          <Icon className="w-5 h-5" style={{ color: pillar.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold" style={{ color: FG }}>{pillar.label}</span>
            <span className="text-sm font-black" style={{ color: pillar.color }}>{pct}<span className="text-xs font-normal" style={{ color: 'rgba(0,0,0,0.3)' }}>/100</span></span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: delay + 0.2 }}
              className="h-full rounded-full" style={{ background: pillar.color }} />
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(0,0,0,0.3)' }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <p className="text-xs mt-3 mb-2 font-semibold uppercase tracking-wider" style={{ color: 'rgba(0,0,0,0.35)' }}>Plan concret ↓</p>
              <div className="space-y-2">
                {steps.length > 0 ? steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: pillar.bg }}>
                    <span className="text-xs font-black flex-shrink-0 mt-0.5" style={{ color: pillar.color }}>{i + 1}.</span>
                    <p className="text-xs leading-relaxed" style={{ color: FG }}>{step.trim()}.</p>
                  </div>
                )) : (
                  <div className="p-2.5 rounded-xl" style={{ background: pillar.bg }}>
                    <p className="text-xs" style={{ color: FG }}>{recommendation || 'Lance une conversation Stensor pour obtenir des conseils personnalisés.'}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BadgeChip({ badge }) {
  const cfg = BADGE_CONFIG[badge] || { label: badge, icon: '⭐', color: '#888' };
  return (
    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full"
      style={{ background: cfg.color + '18', color: cfg.color, border: `1px solid ${cfg.color}30` }}>
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </motion.div>
  );
}

function StreakCounter({ streak }) {
  if (!streak || streak < 2) return null;
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
      <Flame className="w-3.5 h-3.5" />
      {streak} jours consécutifs
    </div>
  );
}

function computeBadges(data, streak) {
  const badges = [];
  const p = data?.pillars || {};
  if ((p.debt?.score || 0) >= 70) badges.push('debt_slayer');
  if (streak >= 7) badges.push('streak_7');
  if ((p.investing?.score || 0) >= 60 && (data?.overall || 0) >= 65) badges.push('retirement_on_track');
  if ((p.savings?.score || 0) >= 75) badges.push('saver_elite');
  if ((p.investing?.score || 0) >= 70) badges.push('investor');
  if ((p.knowledge?.score || 0) >= 75) badges.push('knowledge_master');
  return badges;
}

// Check if it's past 5AM Paris time today and score is older
function needsDailyUpdate(lastUpdatedISO) {
  if (!lastUpdatedISO) return false;
  const now = new Date();
  // Paris offset: UTC+1 or UTC+2 (DST). Simple approach: UTC+1
  const parisOffset = 60; // minutes, simplified
  const parisNow = new Date(now.getTime() + parisOffset * 60000);
  const paris5AM = new Date(parisNow);
  paris5AM.setHours(5, 0, 0, 0);
  const lastUpdated = new Date(lastUpdatedISO);
  // if it's after 5AM paris and score was last updated before today's 5AM → needs update
  return parisNow > paris5AM && lastUpdated < paris5AM;
}

export default function StensorScore() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const navigate = useNavigate();
  const { data: discussions = [] } = useDiscussions();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // auto-update if past 5AM Paris and stale
      if (u && needsDailyUpdate(u.stensor_score_updated_at) && u.stensor_score !== undefined) {
        runCompute(u);
      }
    }).catch(() => {});
  }, []);

  const runCompute = useCallback(async (currentUser) => {
    const u = currentUser || user;
    if (loading || !u) return;
    setLoading(true);

    const userMsgs = [];
    discussions.slice(0, 20).forEach(d => {
      try {
        getConversationMessages(d.id).filter(m => m.role === 'user').slice(0, 3).forEach(m => userMsgs.push(m.content));
      } catch {}
    });

    const hasHistory = userMsgs.length > 0;
    const prompt = hasHistory
      ? `Tu es un coach financier expert. Analyse ces conversations et évalue la santé financière de l'utilisateur sur 5 piliers (0-100). Pour chaque pilier donne 2-3 actions concrètes et courtes (max 1 phrase chacune, très actionnables). Conversations:\n${userMsgs.slice(0, 15).join('\n---\n')}`
      : `Tu es un coach financier. Crée une évaluation de départ pour un nouvel utilisateur. Score chaque pilier à 45-55 et donne 2-3 actions concrètes courtes pour progresser rapidement.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overall: { type: 'number' },
          pillars: {
            type: 'object',
            properties: {
              savings: { type: 'object', properties: { score: { type: 'number' }, recommendation: { type: 'string' } } },
              investing: { type: 'object', properties: { score: { type: 'number' }, recommendation: { type: 'string' } } },
              debt: { type: 'object', properties: { score: { type: 'number' }, recommendation: { type: 'string' } } },
              knowledge: { type: 'object', properties: { score: { type: 'number' }, recommendation: { type: 'string' } } },
              income: { type: 'object', properties: { score: { type: 'number' }, recommendation: { type: 'string' } } },
            }
          },
          next_action: { type: 'string' }
        }
      }
    });

    if (result?.overall !== undefined) {
      const now = new Date().toISOString();
      const prevStreak = u.stensor_score_streak || 0;
      const newStreak = prevStreak + 1;
      const badges = computeBadges(result, newStreak);

      const updates = {
        stensor_score: Math.round(result.overall),
        stensor_score_pillars: result.pillars,
        stensor_score_updated_at: now,
        stensor_score_badges: badges,
        stensor_score_streak: newStreak,
      };
      await base44.auth.updateMe(updates);
      setUser(prev => ({ ...prev, ...updates }));
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 4000);
    }
    setLoading(false);
  }, [user, discussions, loading]);

  const overall = user?.stensor_score ? Math.round(user.stensor_score) : null;
  const pillars = user?.stensor_score_pillars || null;
  const badges = user?.stensor_score_badges || [];
  const streak = user?.stensor_score_streak || 0;
  const lastUpdated = user?.stensor_score_updated_at;
  const hasScore = overall !== null && pillars !== null;

  const timeAgo = lastUpdated ? (() => {
    const mins = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 60000);
    if (mins < 1) return 'à l\'instant';
    if (mins < 60) return `il y a ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `il y a ${hrs}h`;
    return `il y a ${Math.floor(hrs / 24)}j`;
  })() : null;

  return (
    <div className="min-h-screen font-be" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)' }}>

      {/* Header */}
      <div className="sticky top-0 z-20 border-b px-4 py-4 flex items-center justify-between"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0,0,0,0.07)' }}>
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-lg font-black flex items-center gap-2" style={{ color: FG }}>
            <span className="w-7 h-7 flex items-center justify-center rounded-xl" style={{ background: YUZU }}>
              <Zap className="w-4 h-4" style={{ color: FG }} />
            </span>
            Stensor Score
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(0,0,0,0.35)' }}>
            Mis à jour automatiquement chaque jour à 5H • Résultats cloud
          </p>
        </motion.div>
        <button onClick={() => runCompute()} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{ background: FG, color: 'white' }}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Calcul...' : 'Mettre à jour'}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Just updated toast */}
        <AnimatePresence>
          {justUpdated && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold"
              style={{ background: YUZU, color: FG }}>
              <Sparkles className="w-4 h-4" />
              Score mis à jour ! Continue comme ça 🔥
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {loading && !hasScore && (
          <div className="animate-pulse space-y-4">
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-48 h-24 rounded-full" style={{ background: 'rgba(0,0,0,0.06)' }} />
              <div className="h-5 w-32 rounded-lg" style={{ background: 'rgba(0,0,0,0.06)' }} />
            </div>
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-2xl" style={{ background: 'rgba(0,0,0,0.05)' }} />)}
          </div>
        )}

        {/* Score content */}
        {(hasScore || (loading && hasScore)) && (
          <>
            {/* Score ring */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-6 rounded-3xl"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <ScoreRing score={overall} />
              {timeAgo && (
                <p className="mt-3 text-[10px] font-semibold" style={{ color: 'rgba(0,0,0,0.25)' }}>
                  Mis à jour {timeAgo}
                </p>
              )}
            </motion.div>

            {/* Streak + badges */}
            {(streak >= 2 || badges.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'rgba(0,0,0,0.3)' }}>Tes accomplissements</p>
                <div className="flex flex-wrap gap-2">
                  <StreakCounter streak={streak} />
                  {badges.map(b => <BadgeChip key={b} badge={b} />)}
                </div>
              </motion.div>
            )}

            {/* Pillars */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(0,0,0,0.3)' }}>
                Décomposition du score
              </p>
              <div className="space-y-2">
                {PILLARS.map((p, i) => (
                  <PillarCard key={p.id} pillar={p}
                    score={Math.round(pillars?.[p.id]?.score || 0)}
                    recommendation={pillars?.[p.id]?.recommendation}
                    delay={i * 0.07} />
                ))}
              </div>
            </div>

            {/* Progress hint */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="p-4 rounded-2xl flex items-start gap-3"
              style={{ background: YUZU + '18', border: `1px solid ${YUZU}40` }}>
              <Star className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#b3cc00' }} />
              <div>
                <p className="text-xs font-black mb-1" style={{ color: FG }}>100 = zéro souci financier</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.55)' }}>
                  Clique sur chaque pilier pour voir ton plan concret et monte ton score step by step.
                </p>
                <button onClick={() => navigate('/chat?q=Comment augmenter rapidement mon Stensor Score ?')}
                  className="flex items-center gap-1 mt-2.5 text-xs font-black transition-opacity hover:opacity-70"
                  style={{ color: FG }}>
                  Demander un plan à Stensor <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* Empty state */}
        {!loading && !hasScore && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 text-center px-4">
            <div className="w-20 h-20 flex items-center justify-center rounded-2xl mb-6"
              style={{ background: YUZU, boxShadow: `0 8px 32px ${YUZU}80` }}>
              <Trophy className="w-10 h-10" style={{ color: FG }} />
            </div>
            <h2 className="text-xl font-black mb-2" style={{ color: FG }}>Calcule ton Stensor Score</h2>
            <p className="text-sm mb-8 max-w-xs leading-relaxed" style={{ color: 'rgba(0,0,0,0.45)' }}>
              L'IA analyse tes conversations pour te donner un score financier 0-100 avec un plan concret pour progresser.
            </p>
            <button onClick={() => runCompute()}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95"
              style={{ background: FG, color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <Zap className="w-4 h-4" /> Voir mon score maintenant
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}