import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, Timer, Target, Sparkles, ChevronRight, TrendingUp, TrendingDown, Minus, Heart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useDiscussions, countTotalAiResponses } from '@/lib/useDiscussions';
import { getConversationMessages } from '@/lib/discussions';
import { getUserPlan } from '@/lib/plans-config';
import { getTotalMinutes } from '@/components/Layout';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const fmtN = (n) => { const r = Math.round(n * 10) / 10; return Number.isInteger(r) ? r.toString() : r.toFixed(1); };
const MINS_SAVED_PER_MSG = 17;
const DOLLARS_PER_HOUR = 100;

const AGENT_LABELS = {
  'global': "Knowing where I'm going",
  'emotions-depenses': 'Spend without guilt',
  'wealth-strategy': 'Becoming financially free',
};
const PIE_COLORS = [FG, YUZU, '#d1d5db', '#6b7280'];

const RECO_CACHE_KEY = 'stensor_ai_reco_cache';
const GOALS_CACHE_KEY = 'stensor_ai_goals_cache';
const SENTIMENT_CACHE_KEY = 'stensor_sentiment_cache';

const getCache = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
const setCache = (key, cacheKey, value) => { const c = getCache(key); c[cacheKey] = value; localStorage.setItem(key, JSON.stringify(c)); };

function StatCard({ icon: Icon, label, value, sub, accent, trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="p-5 bg-white border border-black/8 rounded-2xl hover:shadow-md transition-shadow">
      <div className={`w-9 h-9 flex items-center justify-center mb-3 rounded-xl ${accent === 'yuzu' ? 'bg-yuzu' : 'bg-black/5'}`}>
        <Icon className={`w-4 h-4 ${accent === 'yuzu' ? 'text-fg' : 'text-zinc-500'}`} />
      </div>
      <p className="text-2xl font-black text-fg">{value}</p>
      <p className="text-xs font-semibold mt-0.5 text-fg">{label}</p>
      {sub && <p className="text-[11px] mt-1 text-zinc-400">{sub}</p>}
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend > 0 ? <TrendingUp className="w-3 h-3 text-green-600" />
            : trend < 0 ? <TrendingDown className="w-3 h-3 text-red-500" />
            : <Minus className="w-3 h-3 text-zinc-400" />}
          <span className={`text-[10px] font-semibold ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
            {trend > 0 ? `+${trend}` : trend} vs last week
          </span>
        </div>
      )}
    </motion.div>
  );
}

function SentimentBar({ score }) {
  if (score === null || score === undefined) return null;
  const s = Math.round(score);
  const isHigh = s >= 70;
  const isMid = s >= 45;
  const label = isHigh ? '😊 Positive' : isMid ? '😐 Neutral' : '😟 Stressed';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-black/10">
        <motion.div initial={{ width: 0 }} animate={{ width: `${s}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-sm ${isHigh ? 'bg-green-600' : isMid ? 'bg-amber-500' : 'bg-red-500'}`} />
      </div>
      <span className={`text-xs font-bold flex-shrink-0 ${isHigh ? 'text-green-600' : isMid ? 'text-amber-500' : 'text-red-500'}`}>{label}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center gap-2">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        className="w-4 h-4 rounded-full border-2 border-black/10 border-t-fg" />
      <p className="text-xs text-zinc-400">Analyzing…</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [aiReco, setAiReco] = useState('');
  const [aiRecoLoading, setAiRecoLoading] = useState(false);
  const [aiGoals, setAiGoals] = useState(null);
  const [aiGoalsLoading, setAiGoalsLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const navigate = useNavigate();

  const { data: discussions = [] } = useDiscussions();
  const aiResponseCount = countTotalAiResponses(discussions);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
      setTotalMinutes(getTotalMinutes(u.id));
    }).catch(() => {});
  }, []);

  const creditsUsed = Math.round((user?.credits_used || 0) * 10) / 10;
  const creditLimit = userPlan ? (userPlan.credits_limit + (user?.credits_bonus || 0)) : 10;
  const pct = Math.min((creditsUsed / creditLimit) * 100, 100);

  const timeSavedMins = Math.round(aiResponseCount * MINS_SAVED_PER_MSG);
  const moneySaved = Math.round((timeSavedMins / 60) * DOLLARS_PER_HOUR);
  const timeSavedHours = Math.floor(timeSavedMins / 60);
  const timeSavedRemMins = timeSavedMins % 60;
  const timeSavedDisplay = timeSavedHours > 0 ? `${timeSavedHours}h ${timeSavedRemMins}min` : `${timeSavedMins} min`;

  const agentCounts = {};
  discussions.forEach(d => { const a = d.agent || 'global'; agentCounts[a] = (agentCounts[a] || 0) + 1; });
  const agentData = Object.entries(agentCounts)
    .map(([id, count]) => ({ name: AGENT_LABELS[id]?.split(' ').slice(0, 3).join(' ') || id, count, id }))
    .sort((a, b) => b.count - a.count);
  const topAgent = agentData[0] ? AGENT_LABELS[agentData[0].id] || agentData[0].id : '—';

  const now = Date.now();
  const weekData = [3, 2, 1, 0].map(weeksAgo => {
    const start = now - (weeksAgo + 1) * 7 * 86400000;
    const end = now - weeksAgo * 7 * 86400000;
    const count = discussions.filter(d => { const t = d.updatedAt || new Date(d.date).getTime(); return t >= start && t < end; }).length;
    return { label: weeksAgo === 0 ? 'This week' : weeksAgo === 1 ? 'Last wk' : `${weeksAgo + 1}w ago`, count };
  });
  const weekTrend = weekData[3].count - weekData[2].count;

  const dailyData = Array.from({ length: 14 }, (_, i) => {
    const dayStart = now - (13 - i) * 86400000;
    const dayEnd = dayStart + 86400000;
    const count = discussions.filter(d => { const t = d.updatedAt || new Date(d.date).getTime(); return t >= dayStart && t < dayEnd; }).length;
    const d = new Date(dayStart);
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, count };
  });

  const allAgentIds = ['global', 'emotions-depenses', 'wealth-strategy'];
  const radarData = allAgentIds.map(id => ({
    topic: AGENT_LABELS[id]?.split(' ').slice(0, 2).join(' ') || id,
    value: agentCounts[id] || 0,
  }));

  const joinDate = user?.created_date ? new Date(user.created_date) : new Date();
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / 86400000));

  useEffect(() => {
    if (!user || !userPlan) return;
    const bucket = Math.floor(creditsUsed / 30);
    const key = `${user.id}_${userPlan.id}_${bucket}`;
    const cache = getCache(RECO_CACHE_KEY);
    if (cache[key]) { setAiReco(cache[key]); return; }
    setAiRecoLoading(true);
    const summary = `Plan: ${userPlan.name || 'Free'} | Discussions: ${discussions.length} | Tensors: ${creditsUsed}/${creditLimit} | Agent: ${topAgent}`;
    base44.integrations.Core.InvokeLLM({
      prompt: `You are a Stensor advisor. Stats: ${summary}. In 2-3 short punchy sentences, recommend the best plan and a concrete benefit. Be direct. English only.`,
      model: 'gpt_5_mini',
    }).then(r => {
      const text = typeof r === 'string' ? r : '';
      if (text) { setAiReco(text); setCache(RECO_CACHE_KEY, key, text); }
      setAiRecoLoading(false);
    }).catch(() => setAiRecoLoading(false));
  }, [user?.id, userPlan?.id, Math.floor(creditsUsed / 30)]);

  useEffect(() => {
    if (!user || discussions.length === 0) return;
    const cacheKey = `${user.id}_goals_${discussions.length}`;
    const cache = getCache(GOALS_CACHE_KEY);
    if (cache[cacheKey]) { setAiGoals(cache[cacheKey]); return; }
    const userMsgs = [];
    discussions.slice(0, 15).forEach(d => {
      getConversationMessages(d.id).filter(m => m.role === 'user').slice(0, 3).forEach(m => userMsgs.push(m.content));
    });
    if (userMsgs.length === 0) return;
    setAiGoalsLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `Based on these user messages from a financial coaching app, identify the top 4 financial goals/themes the user is working on. Be specific and concise (3-6 words each). Messages:\n\n${userMsgs.slice(0, 20).join('\n---\n')}`,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: { goals: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, emoji: { type: 'string' }, progress: { type: 'number' } } } } }
      }
    }).then(r => {
      if (r?.goals) { setAiGoals(r.goals); setCache(GOALS_CACHE_KEY, cacheKey, r.goals); }
      setAiGoalsLoading(false);
    }).catch(() => setAiGoalsLoading(false));
  }, [user?.id, discussions.length]);

  useEffect(() => {
    if (!user || discussions.length === 0) return;
    const cacheKey = `${user.id}_sentiment_${discussions.length}`;
    const cache = getCache(SENTIMENT_CACHE_KEY);
    if (cache[cacheKey]) { setSentimentData(cache[cacheKey]); return; }
    const userMsgs = [];
    discussions.slice(0, 10).forEach(d => {
      getConversationMessages(d.id).filter(m => m.role === 'user').slice(0, 2).forEach(m => userMsgs.push(m.content));
    });
    if (userMsgs.length < 3) return;
    setSentimentLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the emotional tone of these messages from a financial coaching app user. Rate each dimension 0-100. Messages:\n\n${userMsgs.slice(0, 15).join('\n---\n')}`,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          dimensions: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, score: { type: 'number' } } } },
          summary: { type: 'string' }
        }
      }
    }).then(r => {
      if (r?.overall_score !== undefined) { setSentimentData(r); setCache(SENTIMENT_CACHE_KEY, cacheKey, r); }
      setSentimentLoading(false);
    }).catch(() => setSentimentLoading(false));
  }, [user?.id, discussions.length]);

  return (
    <div className="min-h-screen font-be" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-yuzu" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Private dashboard</p>
          </div>
          <h1 className="text-3xl font-black text-fg">Analytics</h1>
          <p className="text-sm mt-1 text-zinc-400">Member for {daysSinceJoin} day{daysSinceJoin > 1 ? 's' : ''}</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={MessageSquare} label="Conversations" value={discussions.length} sub="Total discussions saved" trend={weekTrend} delay={0} />
          <StatCard icon={Zap} label="Tensors used" value={fmtN(creditsUsed)} sub={`of ${fmtN(creditLimit)} this month`} accent="yuzu" delay={0.05} />
          <StatCard icon={Timer} label="Time saved" value={timeSavedDisplay} sub={`~${MINS_SAVED_PER_MSG} min/answer`} delay={0.1} />
          <StatCard icon={Target} label="Money saved" value={`~$${moneySaved}`} sub={`Time × $${DOLLARS_PER_HOUR}/hr`} delay={0.15} />
        </div>

        {/* Tensor gauge */}
        <div className="p-6 mb-4 bg-white border border-border rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-fg">Tensor consumption</p>
            <span className="text-xs font-bold text-zinc-400">{Math.round(pct)}%</span>
          </div>
          <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden mb-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-fg rounded-full" />
          </div>
          <p className="text-xs text-zinc-400">
            {fmtN(creditsUsed)} used · {fmtN(Math.max(0, creditLimit - creditsUsed))} remaining · monthly renewal
          </p>
        </div>

        {/* Financial Sentiment */}
        <div className="p-6 mb-4 bg-white border border-border rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 flex items-center justify-center bg-black/6 rounded-xl">
              <Heart className="w-4 h-4 text-fg" />
            </div>
            <p className="text-sm font-black text-fg">Financial Sentiment</p>
          </div>
          {sentimentLoading ? <Spinner /> : sentimentData ? (
            <div className="space-y-3">
              <SentimentBar score={sentimentData.overall_score} />
              {sentimentData.dimensions?.slice(0, 4).map(d => (
                <div key={d.label} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[11px] font-semibold text-zinc-600">{d.label}</span>
                    <span className="text-[11px] font-bold text-fg">{Math.round(d.score)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/8">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="h-full bg-fg rounded-full" />
                  </div>
                </div>
              ))}
              {sentimentData.summary && (
                <p className="text-xs mt-2 pt-2 border-t border-black/8 text-zinc-500">{sentimentData.summary}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Start more conversations to see your sentiment analysis.</p>
          )}
        </div>

        {/* Detected Goals */}
        <div className="p-6 mb-4 bg-white border border-border rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 flex items-center justify-center bg-yuzu rounded-xl">
              <Target className="w-4 h-4 text-fg" />
            </div>
            <div>
              <p className="text-sm font-black text-fg">Detected Goals</p>
              <p className="text-[11px] text-zinc-400">AI-inferred from your conversations</p>
            </div>
          </div>
          {aiGoalsLoading ? <Spinner /> : aiGoals?.length > 0 ? (
            <div className="space-y-3">
              {aiGoals.map((g, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5 text-fg">
                      <span>{g.emoji}</span>{g.label}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black/8 text-zinc-500 rounded-lg">{Math.round(g.progress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/8 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.7, delay: i * 0.1 }}
                      className={`h-full rounded-full ${i === 0 ? 'bg-yuzu' : 'bg-fg'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Have a few conversations and your financial goals will appear here.</p>
          )}
        </div>

        {/* Daily activity */}
        {dailyData.some(d => d.count > 0) && (
          <div className="p-6 mb-4 bg-white border border-border rounded-2xl">
            <p className="text-sm font-black mb-4 text-fg">Daily activity — last 14 days</p>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={dailyData}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#a1a1aa' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis hide />
                <Tooltip contentStyle={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: 11 }} />
                <Line type="monotone" dataKey="count" stroke={FG} strokeWidth={2} dot={{ r: 3, fill: YUZU, stroke: FG, strokeWidth: 1.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly bars */}
        {weekData.some(w => w.count > 0) && (
          <div className="p-6 mb-4 bg-white border border-border rounded-2xl">
            <p className="text-sm font-black mb-4 text-fg">Activity — last 4 weeks</p>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={weekData} barSize={22}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: 11 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill={FG} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Agent balance */}
        {agentData.length > 0 && (
          <div className="p-6 mb-4 bg-white border border-border rounded-2xl">
            <p className="text-sm font-black mb-1 text-fg">Agent balance</p>
            <p className="text-xs mb-4 text-zinc-400">How you distribute coaching sessions</p>
            <div className="flex items-center gap-4">
              <PieChart width={90} height={90}>
                <Pie data={agentData} dataKey="count" cx="50%" cy="50%" innerRadius={26} outerRadius={42} paddingAngle={2}>
                  {agentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2">
                {agentData.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 flex-shrink-0 rounded-md" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <p className="text-xs flex-1 truncate text-zinc-600">{a.name}</p>
                    <span className="text-xs font-bold text-fg">{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
            {radarData.some(r => r.value > 0) && (
              <div className="mt-4 pt-4 border-t border-black/8">
                <p className="text-[11px] font-semibold mb-2 text-zinc-400">Coverage radar</p>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.08)" />
                    <PolarAngleAxis dataKey="topic" tick={{ fontSize: 9, fill: '#a1a1aa' }} />
                    <Radar dataKey="value" stroke={FG} fill={YUZU} fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Time saved breakdown */}
        <div className="p-6 mb-4 bg-white border border-border rounded-2xl">
          <p className="text-sm font-black mb-4 text-fg">Time saved vs. a human coach</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-black/5 rounded-xl">
              <p className="text-lg font-black text-fg">{aiResponseCount}</p>
              <p className="text-[10px] mt-0.5 text-zinc-400">AI answers</p>
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-zinc-400">×</p>
              <p className="text-[10px] mt-1 text-zinc-400">{MINS_SAVED_PER_MSG} min/answer</p>
            </div>
            <div className="p-4 bg-yuzu rounded-xl">
              <p className="text-lg font-black text-fg">{timeSavedDisplay}</p>
              <p className="text-[10px] mt-0.5 text-fg/60">~${moneySaved} saved</p>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="p-6 mb-4 border border-yuzu/50 bg-yuzu/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-yuzu rounded-xl">
              <Sparkles className="w-4 h-4 text-fg" />
            </div>
            <p className="text-sm font-black text-fg">AI Recommendation</p>
          </div>
          {aiRecoLoading ? <Spinner /> : aiReco ? (
            <p className="text-sm leading-relaxed text-zinc-700">{aiReco}</p>
          ) : (
            <p className="text-sm text-zinc-400">Start a conversation to get your personalized plan recommendation.</p>
          )}
          <button onClick={() => navigate('/pricing')} className="flex items-center gap-1.5 mt-4 text-xs font-black text-fg hover:opacity-70 transition-opacity">
            See plans <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-xs font-semibold text-zinc-300">All data is private and stored locally on your device.</p>
        </div>
      </div>
    </div>
  );
}