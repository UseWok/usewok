import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, Clock, Timer, Target, Sparkles, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getDiscussions, getConversationMessages } from '@/lib/discussions';
import { getUserPlan } from '@/lib/plans-config';
import { getTotalMinutes } from '@/components/Layout';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const fmtN = (n) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? r.toString() : r.toFixed(1);
};

// Average: human coach takes ~18 min per answer, AI takes ~1 min → 17 min saved per message
const MINS_SAVED_PER_MSG = 17;
const DOLLARS_PER_HOUR = 100;

const AGENT_LABELS = {
  'global': "Knowing where I'm going",
  'emotions-depenses': 'Spend without guilt',
  'wealth-strategy': 'Becoming financially free',
};

const PIE_COLORS = [FG, YUZU, '#d1d5db', '#6b7280'];

function StatCard({ icon: Icon, label, value, sub, accent, delay = 0 }) {
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
    </motion.div>
  );
}

const RECO_CACHE_KEY = 'stensor_ai_reco_cache';

function getRecoCache() {
  try { return JSON.parse(localStorage.getItem(RECO_CACHE_KEY) || '{}'); } catch { return {}; }
}

function setRecoCache(key, text) {
  const cache = getRecoCache();
  cache[key] = text;
  localStorage.setItem(RECO_CACHE_KEY, JSON.stringify(cache));
}

export default function AnalyticsPage() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [aiReco, setAiReco] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const navigate = useNavigate();

  const [aiResponseCount, setAiResponseCount] = useState(0);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
      const mins = getTotalMinutes(u.id);
      setTotalMinutes(mins);
    }).catch(() => {});
    const discs = getDiscussions();
    setDiscussions(discs);
    // Count total AI responses across all discussions
    let count = 0;
    discs.forEach(d => {
      const msgs = getConversationMessages(d.id);
      count += msgs.filter(m => m.role === 'assistant').length;
    });
    setAiResponseCount(count);
  }, []);

  const creditsUsed = Math.round((user?.credits_used || 0) * 10) / 10;
  const creditLimit = userPlan ? (userPlan.credits_limit + (user?.credits_bonus || 0)) : 10;
  const pct = Math.min((creditsUsed / creditLimit) * 100, 100);

  // Time calculations — based on actual AI responses (not tensors)
  const sessionHours = totalMinutes / 60;
  const timeSavedMins = Math.round(aiResponseCount * MINS_SAVED_PER_MSG);
  const moneySaved = Math.round((timeSavedMins / 60) * DOLLARS_PER_HOUR);
  const timeSavedHours = Math.floor(timeSavedMins / 60);
  const timeSavedRemMins = timeSavedMins % 60;
  const timeSavedDisplay = timeSavedHours > 0
    ? `${timeSavedHours}h ${timeSavedRemMins}min`
    : `${timeSavedMins} min`;

  // Agent distribution — private (from local storage only)
  const agentCounts = {};
  discussions.forEach(d => { const a = d.agent || 'global'; agentCounts[a] = (agentCounts[a] || 0) + 1; });
  const agentData = Object.entries(agentCounts).map(([id, count]) => ({
    name: AGENT_LABELS[id]?.split(' ').slice(0, 3).join(' ') || id,
    count,
    id,
  })).sort((a, b) => b.count - a.count);
  const topAgent = agentData[0] ? AGENT_LABELS[agentData[0].id] || agentData[0].id : '—';

  // Weekly activity — private
  const now = Date.now();
  const weekData = [3, 2, 1, 0].map(weeksAgo => {
    const start = now - (weeksAgo + 1) * 7 * 86400000;
    const end = now - weeksAgo * 7 * 86400000;
    const count = discussions.filter(d => {
      const t = d.updatedAt || new Date(d.date).getTime();
      return t >= start && t < end;
    }).length;
    const label = weeksAgo === 0 ? 'This week' : weeksAgo === 1 ? 'Last week' : `${weeksAgo + 1}w ago`;
    return { label, count };
  });

  // AI recommendation — stable, only regenerates if plan/usage bracket changes
  useEffect(() => {
    if (!user || !userPlan) return;
    const bucket = Math.floor(creditsUsed / 30); // changes every 30 tensors
    const recoKey = `${user.id}_${userPlan.id}_${bucket}`;
    const cache = getRecoCache();
    if (cache[recoKey]) { setAiReco(cache[recoKey]); return; }

    setAiLoading(true);
    const summary = `Plan: ${userPlan.name || 'Free'} | Discussions: ${discussions.length} | Tensors used: ${creditsUsed}/${creditLimit} | Favorite agent: ${topAgent} | Session time: ${Math.round(totalMinutes)} min`;
    base44.integrations.Core.InvokeLLM({
      prompt: `You are a Stensor advisor. User stats: ${summary}. In 2-3 short, punchy sentences, recommend the most suitable subscription plan and why, with a concrete benefit. Be direct and motivating. Respond in English only.`,
      model: 'gpt_5_mini',
    }).then(result => {
      const text = typeof result === 'string' ? result : '';
      if (text) { setAiReco(text); setRecoCache(recoKey, text); }
      setAiLoading(false);
    }).catch(() => setAiLoading(false));
  }, [user?.id, userPlan?.id, Math.floor(creditsUsed / 30)]);

  const joinDate = user?.created_date ? new Date(user.created_date) : new Date();
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / 86400000));

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black" style={{ color: FG }}>Analytics</h1>
          <p className="text-sm mt-1" style={{ color: '#aaa' }}>
            Your private dashboard · Member for {daysSinceJoin} day{daysSinceJoin > 1 ? 's' : ''}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={MessageSquare} label="Conversations" value={discussions.length} sub="Total discussions saved" delay={0} />
          <StatCard icon={Zap} label="Tensors used" value={fmtN(creditsUsed)} sub={`of ${fmtN(creditLimit)} this month`} accent={YUZU} delay={0.05} />
          <StatCard
            icon={Timer}
            label="Time saved"
            value={timeSavedDisplay}
            sub={`vs. a human coach (~${MINS_SAVED_PER_MSG} min/answer)`}
            delay={0.1}
          />
          <StatCard
            icon={Clock}
            label="Money saved"
            value={`~$${moneySaved}`}
            sub={`Time saved × $${DOLLARS_PER_HOUR}/hr coach rate`}
            delay={0.15}
          />
        </div>

        {/* Time saved math explainer */}
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
          <p className="text-[11px]" style={{ color: '#bbb' }}>
            A human coach needs ~18 min per answer, AI takes ~1 min → {MINS_SAVED_PER_MSG} min saved per response. 6 min on Stensor ≈ $10 saved vs. a real advisor.
          </p>
        </div>

        {/* Tensors gauge */}
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

        {/* Weekly activity */}
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

        {/* Agent distribution */}
        {agentData.length > 0 && (
          <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px' }}>
            <p className="text-sm font-black mb-1" style={{ color: FG }}>Favorite agent</p>
            <p className="text-xs mb-4" style={{ color: '#aaa' }}>Your conversations by agent</p>
            <div className="flex items-center gap-6">
              <PieChart width={100} height={100}>
                <Pie data={agentData} dataKey="count" cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2}>
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
          </div>
        )}

        {/* AI Recommendation — stable */}
        <div className="p-5 mb-4" style={{ border: '1px solid rgba(221,255,0,0.5)', borderRadius: '2px', background: 'rgba(221,255,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '2px' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: FG }} />
            </div>
            <p className="text-sm font-black" style={{ color: FG }}>AI Recommendation</p>
          </div>
          {aiLoading ? (
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: FG }} />
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