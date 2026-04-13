import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, TrendingUp, Shield, BookOpen, ArrowRight, RefreshCw, ChevronDown, CheckCircle, Lock, Sparkles, Flame, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useDiscussions } from '@/lib/useDiscussions';
import { getConversationMessages } from '@/lib/discussions';

const SCORE_CACHE_KEY = 'stensor_score_cache_v3';
const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const PILLARS = [
  { id: 'savings', label: 'Épargne', icon: Shield, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-700', desc: 'Fonds d\'urgence & habitudes d\'épargne' },
  { id: 'investing', label: 'Investissement', icon: TrendingUp, color: 'bg-green-500', lightColor: 'bg-green-50', textColor: 'text-green-700', desc: 'Portefeuille & construction de richesse' },
  { id: 'debt', label: 'Dettes', icon: Target, color: 'bg-orange-500', lightColor: 'bg-orange-50', textColor: 'text-orange-700', desc: 'Gestion & remboursement des dettes' },
  { id: 'knowledge', label: 'Connaissance', icon: BookOpen, color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-700', desc: 'Littératie financière & conscience' },
  { id: 'income', label: 'Revenus', icon: Zap, color: 'bg-yellow-400', lightColor: 'bg-yellow-50', textColor: 'text-yellow-700', desc: 'Diversification des revenus' },
];

const BADGE_RULES = [
  { id: 'debt_slayer', label: 'Vainqueur de dettes', icon: '⚔️', pillar: 'debt', threshold: 70 },
  { id: 'saver_elite', label: 'Épargnant élite', icon: '🛡️', pillar: 'savings', threshold: 75 },
  { id: 'investor', label: 'Investisseur actif', icon: '📈', pillar: 'investing', threshold: 70 },
  { id: 'guru', label: 'Maître financier', icon: '🧠', pillar: 'knowledge', threshold: 75 },
];

function getScoreColor(s) {
  if (s >= 80) return '#22c55e';
  if (s >= 60) return YUZU;
  if (s >= 40) return '#f97316';
  return '#ef4444';
}

function ScoreGauge({ score, size = 220 }) {
  const radius = 85;
  const stroke = 11;
  const circumference = Math.PI * radius;
  const progress = Math.min(score / 100, 1);
  const dashOffset = circumference * (1 - progress);
  const color = getScoreColor(score);

  const getLabel = (s) => {
    if (s >= 80) return { text: 'Excellent', sub: 'Tu es sur la voie de la liberté financière' };
    if (s >= 60) return { text: 'Solide', sub: 'Bonnes bases, continue à construire' };
    if (s >= 40) return { text: 'En progrès', sub: 'Bonne dynamique, focus sur les axes clés' };
    return { text: 'Départ', sub: 'Parfait moment pour poser les bases' };
  };
  const label = getLabel(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 44 }}>
        <svg width={size} height={size / 2 + 22} viewBox={`0 0 ${size} ${size / 2 + 22}`}>
          <defs>
            <filter id="scoreGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path
            d={`M ${stroke/2+12} ${size/2} A ${radius} ${radius} 0 0 1 ${size-stroke/2-12} ${size/2}`}
            fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={stroke} strokeLinecap="round"
          />
          <motion.path
            d={`M ${stroke/2+12} ${size/2} A ${radius} ${radius} 0 0 1 ${size-stroke/2-12} ${size/2}`}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            filter="url(#scoreGlow)"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 180 }}
            className="font-black" style={{ fontSize: '4rem', color, lineHeight: 1 }}>
            {score}
          </motion.span>
          <span className="text-xs font-bold mt-1" style={{ color: 'rgba(0,0,0,0.25)' }}>/100</span>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
        className="text-center mt-4">
        <p className="font-black text-xl" style={{ color }}>{label.text}</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(0,0,0,0.4)' }}>{label.sub}</p>
      </motion.div>
    </div>
  );
}

function PillarCard({ pillar, score, recommendation, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const Icon = pillar.icon;
  const pct = score || 0;
  // Split recommendation into concrete steps
  const steps = recommendation
    ? recommendation.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 8).slice(0, 3)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-black/[0.06] rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-black/[0.02] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${pillar.lightColor} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${pillar.textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold" style={{ color: FG }}>{pillar.label}</span>
            <span className="text-sm font-black" style={{ color: FG }}>{pct}<span className="text-xs font-normal text-zinc-400">/100</span></span>
          </div>
          <div className="w-full h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: delay + 0.2 }}
              className={`h-full rounded-full ${pillar.color}`}
            />
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 border-t border-black/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-3 mb-2.5">Plan concret</p>
              <div className="space-y-2">
                {steps.length > 0 ? steps.map((step, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)' }}>
                    <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-black bg-black text-white mt-0.5">{i + 1}</span>
                    <p className="text-xs text-zinc-600 leading-relaxed">{step.trim()}</p>
                  </div>
                )) : (
                  <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)' }}>
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-600 leading-relaxed">{recommendation || 'Lance une conversation Stensor pour des conseils personnalisés.'}</p>
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

function SkeletonScore() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex flex-col items-center py-8">
        <div className="w-52 h-28 bg-black/[0.06] rounded-full mb-4" />
        <div className="h-6 w-28 bg-black/[0.06] rounded-xl" />
      </div>
      {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-black/[0.04] rounded-2xl" />)}
    </div>
  );
}

// Check if score needs daily refresh (past 5AM Paris today and score older than that)
function needsDailyUpdate(lastUpdatedISO) {
  if (!lastUpdatedISO) return false;
  const now = new Date();
  const parisOffset = 60 * 60 * 1000; // UTC+1 simplified
  const parisNow = new Date(now.getTime() + parisOffset);
  const today5AM = new Date(parisNow);
  today5AM.setHours(5, 0, 0, 0);
  const lastUpdated = new Date(lastUpdatedISO);
  return parisNow > today5AM && lastUpdated < new Date(today5AM.getTime() - parisOffset);
}

function computeBadges(data, streak) {
  const badges = [];
  const p = data?.pillars || {};
  BADGE_RULES.forEach(rule => {
    if ((p[rule.pillar]?.score || 0) >= rule.threshold) badges.push(rule.id);
  });
  if (streak >= 7) badges.push('streak_7');
  return badges;
}

export default function StensorScore() {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();
  const { data: discussions = [] } = useDiscussions();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
      // Load from cloud (User entity)
      if (u.stensor_score !== undefined && u.stensor_score_pillars) {
        setScoreData({ overall: u.stensor_score, pillars: u.stensor_score_pillars, next_action: u.stensor_score_next_action });
        setLastUpdated(u.stensor_score_updated_at ? new Date(u.stensor_score_updated_at).getTime() : null);
        // Auto daily update at 5AM Paris, free (no credit deduction)
        if (needsDailyUpdate(u.stensor_score_updated_at)) {
          runCompute(u, true);
        }
      } else {
        // Fallback to local cache
        try {
          const cached = localStorage.getItem(SCORE_CACHE_KEY);
          if (cached) { const d = JSON.parse(cached); setScoreData(d.data); setLastUpdated(d.timestamp); }
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const runCompute = useCallback(async (currentUser, isSilent = false) => {
    const u = currentUser || user;
    if (loading || !u) return;
    setLoading(true);

    const userMsgs = [];
    discussions.slice(0, 20).forEach(d => {
      try { getConversationMessages(d.id).filter(m => m.role === 'user').slice(0, 3).forEach(m => userMsgs.push(m.content)); } catch {}
    });

    const prompt = userMsgs.length > 0
      ? `Tu es un expert en finances personnelles. Analyse ces conversations et évalue la santé financière sur 5 piliers (0-100). Pour chaque pilier, donne exactement 3 actions concrètes courtes (1 phrase max chacune, très actionnables). Sépare-les par ". " dans le champ recommendation. Conversations:\n${userMsgs.slice(0, 15).join('\n---\n')}`
      : `Tu es un expert en finances personnelles. Crée une évaluation de base pour un nouvel utilisateur. Score chaque pilier entre 40 et 60. Donne 3 actions concrètes courtes (1 phrase max chacune) séparées par ". " pour commencer à progresser.`;

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
      const ts = Date.now();
      const prevStreak = (u.stensor_score_streak || 0) + 1;
      const badges = computeBadges(result, prevStreak);

      setScoreData(result);
      setLastUpdated(ts);
      localStorage.setItem(SCORE_CACHE_KEY, JSON.stringify({ data: result, timestamp: ts }));

      // Save to cloud (User entity) — no credit deduction
      await base44.auth.updateMe({
        stensor_score: Math.round(result.overall),
        stensor_score_pillars: result.pillars,
        stensor_score_next_action: result.next_action,
        stensor_score_updated_at: new Date(ts).toISOString(),
        stensor_score_badges: badges,
        stensor_score_streak: prevStreak,
      });

      // Deduct 1 tensor only for manual refreshes
      if (!isSilent && u) {
        const newUsed = (u.credits_used || 0) + 1;
        await base44.entities.User.update(u.id, { credits_used: newUsed });
        setUser(prev => ({ ...prev, credits_used: newUsed }));
      }
    }
    setLoading(false);
  }, [user, discussions, loading]);

  useEffect(() => {
    if (user && !scoreData && !loading) runCompute(user);
  }, [user, discussions.length]);

  const overall = scoreData?.overall ? Math.round(scoreData.overall) : 0;
  const timeAgo = lastUpdated ? (() => {
    const mins = Math.floor((Date.now() - lastUpdated) / 60000);
    if (mins < 1) return 'à l\'instant';
    if (mins < 60) return `il y a ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `il y a ${hrs}h`;
    return `il y a ${Math.floor(hrs / 24)}j`;
  })() : null;

  const streak = user?.stensor_score_streak || 0;
  const badges = user?.stensor_score_badges || [];

  return (
    <div className="min-h-screen font-be" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)' }}>

      {/* Header */}
      <div className="border-b border-black/[0.06] px-4 py-5 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <motion.div
          initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <h1 className="text-xl font-black flex items-center gap-2" style={{ color: FG }}>
            <span className="w-7 h-7 flex items-center justify-center rounded-xl" style={{ background: YUZU }}>
              <Zap className="w-4 h-4" style={{ color: FG }} />
            </span>
            Stensor Score
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Mis à jour chaque jour à 5H · Résultats cloud</p>
        </motion.div>
        <button
          onClick={() => runCompute()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-black/[0.05] rounded-xl hover:bg-black/[0.08] transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Rafraîchir</span>
          <span className="text-[9px] text-zinc-400 hidden sm:inline">1T</span>
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {loading && !scoreData ? (
          <SkeletonScore />
        ) : scoreData ? (
          <>
            {/* Score gauge */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center mb-2">
              <ScoreGauge score={overall} />
            </motion.div>

            {timeAgo && (
              <p className="text-center text-[10px] text-zinc-300 mb-4">Mis à jour {timeAgo}</p>
            )}

            {/* Streak & badges */}
            {(streak >= 2 || badges.length > 0) && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2.5">Accomplissements</p>
                <div className="flex flex-wrap gap-2">
                  {streak >= 2 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <Flame className="w-3.5 h-3.5" /> {streak} jours consécutifs
                    </div>
                  )}
                  {badges.map(b => {
                    const rule = BADGE_RULES.find(r => r.id === b) || { icon: '⭐', label: b };
                    return (
                      <div key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                        style={{ background: 'rgba(0,0,0,0.04)', color: FG, border: '1px solid rgba(0,0,0,0.08)' }}>
                        {rule.icon} {rule.label}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Pillars */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35 }}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
              Décomposition du score
            </motion.h2>
            <div className="space-y-2 mb-6">
              {PILLARS.map((pillar, i) => (
                <PillarCard
                  key={pillar.id}
                  pillar={pillar}
                  score={Math.round(scoreData.pillars?.[pillar.id]?.score || 0)}
                  recommendation={scoreData.pillars?.[pillar.id]?.recommendation}
                  delay={i * 0.08}
                />
              ))}
            </div>

            {/* Next action */}
            {scoreData.next_action && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className="p-4 rounded-2xl mb-6"
                style={{ border: `1px solid ${YUZU}60`, background: `${YUZU}10` }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4" style={{ color: FG }} />
                  <p className="text-xs font-black" style={{ color: FG }}>Ta priorité #1</p>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">{scoreData.next_action}</p>
                <button onClick={() => navigate(`/chat?q=${encodeURIComponent(scoreData.next_action)}`)}
                  className="flex items-center gap-1.5 mt-3 text-xs font-black hover:opacity-70 transition-opacity"
                  style={{ color: FG }}>
                  Demander un plan à Stensor <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* Upgrade CTA */}
            {userPlan?.price_monthly === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{ background: FG }}>
                <div>
                  <p className="text-sm font-black text-white">Voir l'évolution de ton score</p>
                  <p className="text-xs text-white/50 mt-0.5">Suivi hebdomadaire avec Pro</p>
                </div>
                <button onClick={() => navigate('/pricing')}
                  className="px-3 py-2 text-xs font-black rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1"
                  style={{ background: YUZU, color: FG }}>
                  Passer Pro <Lock className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          /* Empty state */
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl mb-5"
              style={{ background: YUZU, boxShadow: `0 8px 32px ${YUZU}80` }}>
              <Trophy className="w-8 h-8" style={{ color: FG }} />
            </div>
            <h2 className="text-lg font-black mb-2" style={{ color: FG }}>Calcule ton Stensor Score</h2>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed mb-6">
              L'IA analyse tes conversations financières et te donne un score 0-100 avec un plan béton pour progresser.
            </p>
            <button onClick={() => runCompute()}
              className="flex items-center gap-2 px-5 py-3 text-sm font-black rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: FG, color: 'white' }}>
              <Sparkles className="w-4 h-4" /> Générer mon score <span className="text-[10px] opacity-50 ml-1">1T</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}