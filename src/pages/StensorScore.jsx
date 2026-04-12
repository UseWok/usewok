import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, TrendingUp, Shield, BookOpen, ArrowRight, RefreshCw, ChevronDown, CheckCircle, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useDiscussions } from '@/lib/useDiscussions';
import { getConversationMessages } from '@/lib/discussions';

const SCORE_CACHE_KEY = 'stensor_score_cache_v2';
const PILLARS = [
  { id: 'savings', label: 'Savings', icon: Shield, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-700', desc: 'Emergency fund & saving habits' },
  { id: 'investing', label: 'Investing', icon: TrendingUp, color: 'bg-green-500', lightColor: 'bg-green-50', textColor: 'text-green-700', desc: 'Portfolio & wealth building' },
  { id: 'debt', label: 'Debt', icon: Target, color: 'bg-orange-500', lightColor: 'bg-orange-50', textColor: 'text-orange-700', desc: 'Debt management & repayment' },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen, color: 'bg-purple-500', lightColor: 'bg-purple-50', textColor: 'text-purple-700', desc: 'Financial literacy & awareness' },
  { id: 'income', label: 'Income', icon: Zap, color: 'bg-yuzu', lightColor: 'bg-yellow-50', textColor: 'text-yellow-700', desc: 'Income diversification' },
];

function ScoreGauge({ score, size = 200 }) {
  const radius = 80;
  const stroke = 10;
  const circumference = Math.PI * radius;
  const progress = Math.min(score / 100, 1);
  const dashOffset = circumference * (1 - progress);

  const getColor = (s) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#DDFF00';
    if (s >= 40) return '#f97316';
    return '#ef4444';
  };
  const getLabel = (s) => {
    if (s >= 80) return { text: 'Excellent', sub: 'You\'re on track for financial freedom' };
    if (s >= 60) return { text: 'Good', sub: 'Strong foundations, keep building' };
    if (s >= 40) return { text: 'Fair', sub: 'Good progress, focus on key areas' };
    return { text: 'Starting', sub: 'Great time to build your foundation' };
  };
  const label = getLabel(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 40 }}>
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* Track */}
          <path
            d={`M ${stroke / 2 + 10} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2 - 10} ${size / 2}`}
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} strokeLinecap="round"
          />
          {/* Progress */}
          <motion.path
            d={`M ${stroke / 2 + 10} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2 - 10} ${size / 2}`}
            fill="none" stroke={getColor(score)} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-5xl font-black text-fg" style={{ color: getColor(score) }}>
            {score}
          </motion.span>
          <span className="text-xs font-bold text-zinc-400 mt-0.5">/100</span>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-3">
        <p className="font-black text-lg text-fg" style={{ color: getColor(score) }}>{label.text}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{label.sub}</p>
      </motion.div>
    </div>
  );
}

function PillarCard({ pillar, score, recommendation, delay = 0 }) {
  const [open, setOpen] = useState(false);
  const Icon = pillar.icon;
  const pct = score || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-white border border-black/8 rounded-md overflow-hidden"
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-black/2 transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className={`w-9 h-9 flex items-center justify-center rounded-md ${pillar.lightColor}`}>
          <Icon className={`w-4 h-4 ${pillar.textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-fg">{pillar.label}</span>
            <span className="text-sm font-black text-fg">{pct}<span className="text-xs text-zinc-400">/100</span></span>
          </div>
          <div className="w-full h-1.5 bg-black/8 rounded-sm overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: delay + 0.2 }}
              className={`h-full rounded-sm ${pillar.color}`}
            />
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 border-t border-black/6">
              <p className="text-xs text-zinc-500 mt-3 mb-2">{pillar.desc}</p>
              {recommendation && (
                <div className="flex items-start gap-2 p-3 bg-black/4 rounded-md">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-600 leading-relaxed">{recommendation}</p>
                </div>
              )}
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
        <div className="w-48 h-24 bg-black/8 rounded-full mb-4" />
        <div className="h-6 w-24 bg-black/8 rounded-sm" />
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-16 bg-black/5 rounded-md" />
      ))}
    </div>
  );
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
    base44.auth.me().then(u => { setUser(u); setUserPlan(getUserPlan(u)); }).catch(() => {});
    const cached = localStorage.getItem(SCORE_CACHE_KEY);
    if (cached) {
      try { const d = JSON.parse(cached); setScoreData(d.data); setLastUpdated(d.timestamp); } catch {}
    }
  }, []);

  const computeScore = async () => {
    if (loading || !user) return;
    setLoading(true);

    const userMsgs = [];
    discussions.slice(0, 20).forEach(d => {
      getConversationMessages(d.id).filter(m => m.role === 'user').slice(0, 3).forEach(m => userMsgs.push(m.content));
    });

    const prompt = userMsgs.length > 0
      ? `Based on these financial coaching conversations, evaluate the user's financial health across 5 pillars. Score each 0-100 and give 1 concise recommendation (1-2 sentences) per pillar.\n\nConversations:\n${userMsgs.slice(0, 20).join('\n---\n')}`
      : `Create a baseline financial health assessment for a new user who hasn't had conversations yet. Score each pillar at 50 and give motivating starter recommendations.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_mini',
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
      setScoreData(result);
      setLastUpdated(ts);
      localStorage.setItem(SCORE_CACHE_KEY, JSON.stringify({ data: result, timestamp: ts }));
      // deduct 1 tensor
      if (user) {
        const newUsed = (user.credits_used || 0) + 1;
        await base44.entities.User.update(user.id, { credits_used: newUsed });
        setUser(prev => ({ ...prev, credits_used: newUsed }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && !scoreData && !loading) computeScore();
  }, [user, discussions.length]);

  const overall = scoreData?.overall ? Math.round(scoreData.overall) : 0;
  const timeAgo = lastUpdated ? (() => {
    const mins = Math.floor((Date.now() - lastUpdated) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })() : null;

  return (
    <div className="min-h-screen bg-white font-be">
      {/* Header */}
      <div className="border-b border-black/8 px-4 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-fg flex items-center gap-2">
            <span className="w-7 h-7 flex items-center justify-center bg-yuzu rounded-sm">
              <Zap className="w-4 h-4 text-fg" />
            </span>
            Stensor Score
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Your personal financial health index</p>
        </div>
        <button
          onClick={computeScore}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-black/5 rounded-md hover:bg-black/8 transition-colors disabled:opacity-40"
          aria-label="Refresh score"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
          <span className="text-[9px] text-zinc-400 hidden sm:inline">1T</span>
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {loading && !scoreData ? (
          <SkeletonScore />
        ) : scoreData ? (
          <>
            {/* Gauge */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-8">
              <ScoreGauge score={overall} />
            </motion.div>

            {timeAgo && (
              <p className="text-center text-[10px] text-zinc-300 mb-6">Updated {timeAgo}</p>
            )}

            {/* Pillars */}
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">Score Breakdown</h2>
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
                className="p-4 border border-yuzu/40 bg-yuzu/5 rounded-md mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-fg" />
                  <p className="text-xs font-black text-fg">Your #1 Next Action</p>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">{scoreData.next_action}</p>
                <button onClick={() => navigate(`/chat?q=${encodeURIComponent(scoreData.next_action)}`)}
                  className="flex items-center gap-1.5 mt-3 text-xs font-black text-fg hover:opacity-70 transition-opacity">
                  Ask Stensor about this <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* Upgrade CTA */}
            {userPlan?.price_monthly === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="p-4 bg-fg rounded-md flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">Get detailed insights</p>
                  <p className="text-xs text-white/50 mt-0.5">Upgrade for weekly score tracking</p>
                </div>
                <button onClick={() => navigate('/pricing')}
                  className="px-3 py-2 bg-yuzu text-fg text-xs font-black rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1">
                  Upgrade <Lock className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          /* Empty state */
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-yuzu rounded-xl mb-5">
              <Zap className="w-8 h-8 text-fg" />
            </div>
            <h2 className="text-lg font-black text-fg mb-2">Compute your Stensor Score</h2>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed mb-6">
              AI analyzes your financial conversations to build your personalized health score.
            </p>
            <button onClick={computeScore}
              className="flex items-center gap-2 px-5 py-3 bg-fg text-white text-sm font-black rounded-md hover:opacity-90 transition-opacity">
              <Sparkles className="w-4 h-4" /> Generate my score <span className="text-[10px] opacity-50">1T</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}