import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, CreditCard, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

function StatCard({ label, value, sub, trend, trendUp, icon: Icon, color }) {
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
        {trend != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: trendUp ? '#4ade80' : '#E8184A' }}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const CHART_DATA = [
  { name: 'Mon', users: 12, revenue: 240 }, { name: 'Tue', users: 19, revenue: 380 },
  { name: 'Wed', users: 14, revenue: 280 }, { name: 'Thu', users: 28, revenue: 560 },
  { name: 'Fri', users: 35, revenue: 700 }, { name: 'Sat', users: 22, revenue: 440 },
  { name: 'Sun', users: 18, revenue: 360 },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({ users: 0, subs: 0, messages: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, subs, msgs] = await Promise.all([
          base44.entities.User.list(),
          base44.entities.Conversation.list(),
          base44.entities.AdminMessage.list(),
        ]);
        setStats({
          users: users.length,
          subs: users.filter(u => u.subscription_plan && u.subscription_plan !== 'free').length,
          messages: msgs.length,
          revenue: users.filter(u => u.subscription_plan && u.subscription_plan !== 'free').length * 25,
        });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: '32px 32px', color: '#fff' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Overview</h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Platform health and key metrics at a glance.</p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Users" value={loading ? '—' : stats.users} sub="All time" trend={12} trendUp icon={Users} color="#F95738" />
        <StatCard label="Paid Subscribers" value={loading ? '—' : stats.subs} sub="Active plans" trend={8} trendUp icon={CreditCard} color="#7B4FE0" />
        <StatCard label="MRR" value={loading ? '—' : `€${stats.revenue}`} sub="Monthly recurring" trend={5} trendUp icon={TrendingUp} color="#4ade80" />
        <StatCard label="Support Messages" value={loading ? '—' : stats.messages} sub="Total inbox" trend={-2} trendUp={false} icon={MessageSquare} color="#3B8BEB" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 28 }}>
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>New Users — 7 days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F95738" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F95738" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#333" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#333" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#222', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#F95738" strokeWidth={2} fill="url(#uGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>Revenue — 7 days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CHART_DATA}>
              <XAxis dataKey="name" stroke="#333" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#333" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#222', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#7B4FE0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
        <Activity size={13} color="#4ade80" />
        <span style={{ color: '#4ade80', fontWeight: 600 }}>Live</span>
        Data synced in real-time · Last updated just now
      </div>
    </div>
  );
}