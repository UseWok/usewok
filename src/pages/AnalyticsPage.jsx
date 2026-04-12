import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, TrendingUp, Clock, Target, Brain, Crown, Star, ChevronRight, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getDiscussions, getConversationMessages } from '@/lib/discussions';
import { getUserPlan } from '@/lib/plans-config';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const GREEN = '#16a34a';
const RED = '#ef4444';

const AGENT_LABELS = {
  'global': "Knowing exactly where I'm going",
  'emotions-depenses': 'Spend without guilt',
  'wealth-strategy': 'Becoming financially free',
};

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
          style={{ background: accent || YUZU, borderRadius: '4px' }}>
          <Icon className="w-4.5 h-4.5" style={{ color: FG }} />
        </div>
      </div>
      <p className="text-2xl font-black" style={{ color: FG }}>{value}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: FG }}>{label}</p>
      {sub && <p className="text-[11px] mt-1" style={{ color: '#aaa' }}>{sub}</p>}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [aiReco, setAiReco] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setUserPlan(getUserPlan(u)); }).catch(() => {});
    setDiscussions(getDiscussions());
  }, []);

  const totalDiscs = discussions.length;
  const creditsUsed = user?.credits_used || 0;
  const creditLimit = userPlan ? (userPlan.credits_limit + (user?.credits_bonus || 0)) : 10;
  const pct = Math.min((creditsUsed / creditLimit) * 100, 100);
  const joinDate = user?.created_date ? new Date(user.created_date) : new Date();
  const daysSinceJoin = Math.max(1, Math.floor((Date.now() - joinDate.getTime()) / 86400000));

  // Agent distribution
  const agentCounts = {};
  discussions.forEach(d => { const a = d.agent || 'global'; agentCounts[a] = (agentCounts[a] || 0) + 1; });
  const agentData = Object.entries(agentCounts).map(([id, count]) => ({ name: AGENT_LABELS[id]?.split(' ').slice(0, 2).join(' ') || id, count }));
  const topAgent = agentData.sort((a, b) => b.count - a.count)[0]?.name || '—';

  // Activity by week (last 4 weeks)
  const now = Date.now();
  const weekData = [3, 2, 1, 0].map(weeksAgo => {
    const start = now - (weeksAgo + 1) * 7 * 86400000;
    const end = now - weeksAgo * 7 * 86400000;
    const count = discussions.filter(d => { const t = d.updatedAt || new Date(d.date).getTime(); return t >= start && t < end; }).length;
    const label = weeksAgo === 0 ? 'Cette sem.' : weeksAgo === 1 ? 'Sem. -1' : `Sem. -${weeksAgo + 1}`;
    return { label, count };
  });

  // Time saved estimate (avg 12 min per interaction vs AI 2 min)
  const timeSavedHours = Math.round(creditsUsed * 10 / 60);
  const moneySaved = Math.round(creditsUsed * 1.8); // €1.8 avg per interaction with human coach

  const PIE_COLORS = [FG, YUZU, '#d1d5db', '#6b7280'];

  const fetchAiReco = async () => {
    if (aiLoading || aiReco) return;
    setAiLoading(true);
    const summary = `Plan actuel: ${userPlan?.name || 'Free'} | Discussions: ${totalDiscs} | Tensors utilisés: ${creditsUsed}/${creditLimit} | Agent favori: ${topAgent} | Jours d'utilisation: ${daysSinceJoin}`;
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un conseiller Stensor. Voici les stats d'un utilisateur: ${summary}. En 2-3 phrases courtes et percutantes, recommande-lui le plan d'abonnement le plus adapté et pourquoi, en mentionnant un bénéfice concret. Sois direct et motivant. Réponds en français.`,
      model: 'gpt_5_mini',
    });
    setAiReco(typeof result === 'string' ? result : '');
    setAiLoading(false);
  };

  useEffect(() => {
    if (user && userPlan) setTimeout(fetchAiReco, 800);
  }, [user, userPlan]);

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black" style={{ color: FG }}>Analyses</h1>
          <p className="text-sm mt-1" style={{ color: '#aaa' }}>Tableau de bord de votre activité — membre depuis {daysSinceJoin} jour{daysSinceJoin > 1 ? 's' : ''}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard icon={MessageSquare} label="Discussions" value={totalDiscs} sub="Conversations totales" />
          <StatCard icon={Zap} label="Tensors utilisés" value={creditsUsed} sub={`sur ${creditLimit} ce mois`} accent={YUZU} />
          <StatCard icon={Clock} label="Temps gagné" value={`~${timeSavedHours}h`} sub="estimées depuis votre inscription" accent="rgba(0,0,0,0.08)" />
          <StatCard icon={TrendingUp} label="Économies" value={`~${moneySaved}€`} sub="vs coaching humain" accent="rgba(22,163,74,0.12)" />
        </div>

        {/* Tensors gauge */}
        <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black" style={{ color: FG }}>Consommation Tensors</p>
            <span className="text-xs font-bold" style={{ color: pct > 80 ? RED : '#aaa' }}>{Math.round(pct)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(0,0,0,0.08)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: pct > 80 ? RED : FG }} />
          </div>
          <p className="text-xs" style={{ color: '#aaa' }}>{creditsUsed} utilisés · {Math.max(0, creditLimit - creditsUsed)} restants · renouvellement mensuel</p>
        </div>

        {/* Weekly activity chart */}
        {weekData.some(w => w.count > 0) && (
          <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px' }}>
            <p className="text-sm font-black mb-4" style={{ color: FG }}>Activité — 4 dernières semaines</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weekData} barSize={24}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#aaa' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', fontSize: 11 }} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]} fill={FG} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Agent distribution */}
        {agentData.length > 0 && (
          <div className="p-5 mb-4 bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '6px' }}>
            <p className="text-sm font-black mb-1" style={{ color: FG }}>Agent favori</p>
            <p className="text-xs mb-4" style={{ color: '#aaa' }}>Répartition de vos conversations par agent</p>
            <div className="flex items-center gap-6">
              <PieChart width={100} height={100}>
                <Pie data={agentData} dataKey="count" cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2}>
                  {agentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2">
                {agentData.map((a, i) => (
                  <div key={a.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: '2px' }} />
                    <p className="text-xs flex-1 truncate" style={{ color: '#555' }}>{a.name}</p>
                    <span className="text-xs font-bold" style={{ color: FG }}>{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        <div className="p-5 mb-4" style={{ border: '1px solid rgba(221,255,0,0.4)', borderRadius: '6px', background: 'rgba(221,255,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '4px' }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: FG }} />
            </div>
            <p className="text-sm font-black" style={{ color: FG }}>Recommandation IA</p>
          </div>
          {aiLoading ? (
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: FG }} />
              <p className="text-xs" style={{ color: '#aaa' }}>Analyse de votre profil...</p>
            </div>
          ) : aiReco ? (
            <p className="text-sm leading-relaxed" style={{ color: '#333' }}>{aiReco}</p>
          ) : null}
          <button onClick={() => navigate('/pricing')}
            className="flex items-center gap-1.5 mt-4 text-xs font-black transition-all hover:opacity-80"
            style={{ color: FG }}>
            Voir les plans <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Motivational footer */}
        <div className="text-center py-6">
          <p className="text-sm font-bold" style={{ color: FG }}>🚀 Continuez sur votre lancée !</p>
          <p className="text-xs mt-1" style={{ color: '#aaa' }}>Chaque conversation vous rapproche de la liberté financière.</p>
        </div>
      </div>
    </div>
  );
}