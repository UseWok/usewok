import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, Clock, Timer, Target, Sparkles, ChevronRight, TrendingUp, TrendingDown, Minus, Brain, Heart, BarChart3 } from 'lucide-react';
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="p-5 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px' }}>
      <div className="w-9 h-9 flex items-center justify-center mb-3"
        style={{ background: accent || 'rgba(0,0,0,0.06)', borderRadius: '2px' }}>
        <Icon className="w-4 h-4" style={{ color: accent === YUZU ? FG : '#555' }} />
      </div>
      <p className="text-2xl font-black" style={{ color: FG }}>{value}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: FG }}>{label}</p>
      {sub && <p className="text-[11px] mt-1" style={{ color: '#aaa' }}>{sub}</p>}
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend > 0 ? <TrendingUp className="w-3 h-3" style={{ color: '#16a34a' }} />
            : trend < 0 ? <TrendingDown className="w-3 h-3" style={{ color: '#ef4444' }} />
            : <Minus className="w-3 h-3" style={{ color: '#aaa' }} />}
          <span className="text-[10px] font-semibold" style={{ color: trend > 0 ? '#16a34a' : trend < 0 ? '#ef4444' : '#aaa' }}>
            {trend > 0 ? `+${trend}` : trend} vs last week
          </span>
        </div>
      )}
    </motion.div>
  );
}

function SentimentBadge({ score }) {
  if (score === null || score === undefined) return null;
  const s = Math.round(score);
  const color = s >= 70 ? '#16a34a' : s >= 45 ? '#d97706' : '#ef4444';
  const label = s >= 70 ? '😊 Positive' : s >= 45 ? '😐 Neutral' : '😟 Stressed';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${s}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full" style={{ background: color, borderRadius: '2px' }} />
      </div>
      <span className="text-xs font-bold flex-shrink-0" style={{ color }}>{label}</span>
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

  // Agent distribution
  const agentCounts = {};
  discussions.forEach(d => { const a = d.agent || 'global'; agentCounts[a] = (agentCounts[a] || 0) + 1; });
  const agentData = Object.entries(agentCounts)
    .map(([id, count]) => ({ name: AGENT_LABELS[id]?.split(' ').slice(0, 3).join(' ') || id, count, id }))
    .sort((a, b) => b.count - a.count);
  const topAgent = agentData[0] ? AGENT_LABELS[agentData[0].id] || agentData[0].id : '—';

  // Weekly activity with trend
  const now = Date.now();
  const weekData = [3, 2, 1, 0].map(weeksAgo => {
    const start = now - (weeksAgo + 1) * 7 * 86400000;
    const end = now - weeksAgo * 7 * 86400000;
    const count = discussions.filter(d => {
      const t = d.updatedAt || new Date(d.date).getTime();
      return t >= start && t < end;
    }).length;
    const label = weeksAgo === 0 ? 'This week' : weeksAgo === 1 ? 'Last wk' : `${weeksAgo + 1}w ago`;
    return { label, count };
  });
  const weekTrend = weekData[3].count - weekData[2].count;

  // Daily activity (last 14 days) for line chart
  const dailyData = Array.from({ length: 14 }, (_, i) => {
    const dayStart = now - (13 - i) * 86400000;
    const dayEnd = dayStart + 86400000;
    const count = discussions.filter(d => {
      const t = d.updatedAt || new Date(d.date).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    const d = new Date(dayStart);
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, count };
  });

  // Radar for agent balance
  const allAgentIds = ['global', 'emotions-depenses', 'wealth-strategy'];
  const radarData = allAgentIds.map(id => ({
    topic: AGENT_LABELS[id]?.split(' ').slice(0, 2).join(' ') || id,
    value: agentCounts[id] || 0,
  }));

  const joinDate = user?.created_date ? new Date(user.created_date) : new Date();
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / 86400000));

  // AI Recommendation — stable per usage bracket
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

  // AI Goals detection — analyze recent message content
  useEffect(() => {
    if (!user || discussions.length === 0) return;
    const cacheKey = `${user.id}_goals_${discussions.length}`;
    const cache = getCache(GOALS_CACHE_KEY);
    if (cache[cacheKey]) { setAiGoals(cache[cacheKey]); return; }
    // Gather last 20 user messages across discussions
    const userMsgs = [];
    discussions.slice(0, 15).forEach(d => {
      const msgs = getConversationMessages(d.id);
      msgs.filter(m => m.role === 'user').slice(0, 3).forEach(m => userMsgs.push(m.content));
    });
    if (userMsgs.length === 0) return;
    setAiGoalsLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `Based on these user messages from a financial coaching app, identify the top 4 financial goals/themes the user is working on. Be specific and concise (3-6 words each). Messages:\n\n${userMsgs.slice(0, 20).join('\n---\n')}`,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: {
          goals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                emoji: { type: 'string' },
                progress: { type: 'number', description: 'Estimated engagement 0-100' }
              }
            }
          }
        }
      }
    }).then(r => {
      if (r?.goals) { setAiGoals(r.goals); setCache(GOALS_CACHE_KEY, cacheKey, r.goals); }
      setAiGoalsLoading(false);
    }).catch(() => setAiGoalsLoading(false));
  }, [user?.id, discussions.length]);

  // Sentiment analysis — analyze tone of recent conversations
  useEffect(() => {
    if (!user || discussions.length === 0) return;
    const cacheKey = `${user.id}_sentiment_${discussions.length}`;
    const cache = getCache(SENTIMENT_CACHE_KEY);
    if (cache[cacheKey]) { setSentimentData(cache[cacheKey]); return; }
    const userMsgs = [];
    discussions.slice(0, 10).forEach(d => {
      const msgs = getConversationMessages(d.id);
      msgs.filter(m => m.role === 'user').slice(0, 2).forEach(m => userMsgs.push(m.content));
    });
    if (userMsgs.length < 3) return;
    setSentimentLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the emotional tone of these messages from a financial coaching app user. Rate each dimension 0-100. Messages:\n\n${userMsgs.slice(0, 15).join('\n---\n')}`,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number', description: 'Overall positivity 0-100' },
          dimensions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                score: { type: 'number' }
              }
            }
          },
          summary: { type: 'string', description: '1 sentence interpretation' }
        }
      }
    }).then(r => {
      if (r?.overall_score !== undefined) { setSentimentData(r); setCache(SENTIMENT_CACHE_KEY, cacheKey, r); }
      setSentimentLoading(false);
    }).catch(() => setSentimentLoading(false));
  }, [user?.id, discussions.length]);

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black" style={{ color: FG }}>Analytics</h1>
          <p className="text-sm mt-1" style={{ color: '#aaa' }}>Your private dashboard · Member for {daysSinceJoin} day{daysSinceJoin > 1 ? 's' : ''}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={MessageSquare} label="Conversations" value={discussions.length} sub="Total discussions saved" trend={weekTrend} delay={0} />
          <StatCard icon={Zap} label="Tensors used" value={fmtN(creditsUsed)} sub={`of ${fmtN(creditLimit)} this month`} accent={YUZU} delay={0.05} />
          <StatCard icon={Timer} label="Time saved" value={timeSavedDisplay} sub={`vs. a human coach (~${MINS_SAVED_PER_MSG} min/answer)`} delay={0.1} />
          <StatCard icon={Clock} label="Money saved" value={`~$${moneySaved}`} sub={`Time saved × $${DOLLARS_PER_HOUR}/hr`} delay={0.15} />
        </div>

        {/* Tensor gauge */}
        <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black" style={{ color: FG }}>Tensor consumption</p>
            <span className="text-xs font-bold" style={{ color: '#aaa' }}>{Math.round(pct)}%</span>
          </div>
          <div className="w-full h-2 overflow-hidden mb-2" style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '2px' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full" style={{ background: FG, borderRadius: '2px' }} />
          </div>
          <p className="text-xs" style={{ color: '#aaa' }}>
            {fmtN(creditsUsed)} used · {fmtN(Math.max(0, creditLimit - creditsUsed))} remaining · monthly renewal
          </p>
        </div>

        {/* Sentiment Analysis */}
        <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '2px' }}>
              <Heart className="w-3.5 h-3.5" style={{ color: FG }} />
            </div>
            <p className="text-sm font-black" style={{ color: FG }}>Financial Sentiment</p>
          </div>
          {sentimentLoading ? (
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: FG }} />
              <p className="text-xs" style={{ color: '#aaa' }}>Analyzing your tone…</p>
            </div>
          ) : sentimentData ? (
            <div className="space-y-3">
              <SentimentBadge score={sentimentData.overall_score} />
              {sentimentData.dimensions?.slice(0, 4).map(d => (
                <div key={d.label} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: '#555' }}>{d.label}</span>
                    <span className="text-[11px] font-bold" style={{ color: FG }}>{Math.round(d.score)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="h-full" style={{ background: FG, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
              {sentimentData.summary && (
                <p className="text-xs mt-2 pt-2" style={{ color: '#888', borderTop: '1px solid rgba(0,0,0,0.06)' }}>{sentimentData.summary}</p>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: '#aaa' }}>Start more conversations to see your sentiment analysis.</p>
          )}
        </div>

        {/* Detected Goals */}
        <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: YUZU, borderRadius: '2px' }}>
              <Target className="w-3.5 h-3.5" style={{ color: FG }} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: FG }}>Detected Goals</p>
              <p className="text-[11px]" style={{ color: '#aaa' }}>AI-inferred from your conversations</p>
            </div>
          </div>
          {aiGoalsLoading ? (
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: FG }} />
              <p className="text-xs" style={{ color: '#aaa' }}>Detecting your goals…</p>
            </div>
          ) : aiGoals?.length > 0 ? (
            <div className="space-y-3">
              {aiGoals.map((g, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: FG }}>
                      <span>{g.emoji}</span>{g.label}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5" style={{ background: 'rgba(0,0,0,0.06)', color: '#888', borderRadius: '2px' }}>
                      {Math.round(g.progress)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)', borderRadius: '2px' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
                      className="h-full" style={{ background: i === 0 ? YUZU : FG, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs" style={{ color: '#aaa' }}>Have a few conversations and your financial goals will appear here.</p>
          )}
        </div>

        {/* Activity line chart — last 14 days */}
        {dailyData.some(d => d.count > 0) && (
          <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px' }}>
            <p className="text-sm font-black mb-4" style={{ color: FG }}>Daily activity — last 14 days</p>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={dailyData}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#ccc' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis hide />
                <Tooltip contentStyle={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px', fontSize: 11 }} />
                <Line type="monotone" dataKey="count" stroke={FG} strokeWidth={2} dot={{ r: 3, fill: YUZU, stroke: FG, strokeWidth: 1.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weekly bar chart */}
        {weekData.some(w => w.count > 0) && (
          <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px' }}>
            <p className="text-sm font-black mb-4" style={{ color: FG }}>Activity — last 4 weeks</p>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={weekData} barSize={22}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px', fontSize: 11 }} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]} fill={FG} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Agent radar + pie */}
        {agentData.length > 0 && (
          <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px' }}>
            <p className="text-sm font-black mb-1" style={{ color: FG }}>Agent balance</p>
            <p className="text-xs mb-4" style={{ color: '#aaa' }}>How you distribute coaching sessions</p>
            <div className="flex items-center gap-4">
              <PieChart width={90} height={90}>
                <Pie data={agentData} dataKey="count" cx="50%" cy="50%" innerRadius={26} outerRadius={42} paddingAngle={2}>
                  {agentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2">
                {agentData.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: '1px' }} />
                    <p className="text-xs flex-1 truncate" style={{ color: '#555' }}>{a.name}</p>
                    <span className="text-xs font-bold" style={{ color: FG }}>{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
            {radarData.some(r => r.value > 0) && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-[11px] font-semibold mb-2" style={{ color: '#aaa' }}>Coverage radar</p>
                <ResponsiveContainer width="100%" height={160}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(0,0,0,0.08)" />
                    <PolarAngleAxis dataKey="topic" tick={{ fontSize: 9, fill: '#aaa' }} />
                    <Radar dataKey="value" stroke={FG} fill={YUZU} fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Time saved breakdown */}
        <div className="mb-4 p-5" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px', background: 'white' }}>
          <p className="text-sm font-black mb-3" style={{ color: FG }}>Time saved vs. a human coach</p>
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            <div className="p-3" style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '2px' }}>
              <p className="text-lg font-black" style={{ color: FG }}>{aiResponseCount}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#aaa' }}>AI answers</p>
            </div>
            <div className="p-3 flex flex-col items-center justify-center">
              <p className="text-xs font-bold" style={{ color: '#aaa' }}>×</p>
              <p className="text-[10px] mt-1" style={{ color: '#aaa' }}>{MINS_SAVED_PER_MSG} min/answer</p>
            </div>
            <div className="p-3" style={{ background: YUZU, borderRadius: '2px' }}>
              <p className="text-lg font-black" style={{ color: FG }}>{timeSavedDisplay}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(0,0,0,0.6)' }}>= ~${moneySaved} saved</p>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="p-5 mb-4" style={{ border: '1px solid rgba(221,255,0,0.5)', borderRadius: '2px', background: 'rgba(221,255,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '2px' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: FG }} />
            </div>
            <p className="text-sm font-black" style={{ color: FG }}>AI Recommendation</p>
          </div>
          {aiRecoLoading ? (
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: FG }} />
              <p className="text-xs" style={{ color: '#aaa' }}>Analyzing your profile…</p>
            </div>
          ) : aiReco ? (
            <p className="text-sm leading-relaxed" style={{ color: '#333' }}>{aiReco}</p>
          ) : (
            <p className="text-sm" style={{ color: '#aaa' }}>Start a conversation to get your personalized plan recommendation.</p>
          )}
          <button onClick={() => navigate('/pricing')}
            className="flex items-center gap-1.5 mt-4 text-xs font-black transition-all hover:opacity-70"
            style={{ color: FG }}>
            See plans <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-xs font-semibold" style={{ color: '#ccc' }}>All data is private and stored locally on your device.</p>
        </div>
      </div>
    </div>
  );
}