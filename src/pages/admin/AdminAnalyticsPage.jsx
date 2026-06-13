/**
 * Admin Analytics — 100% real DB data
 * MRR calculated from used AccessCodes only (annual prorated to monthly)
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, MessageSquare, Tag, RefreshCw } from 'lucide-react';
import { subDays, format, startOfDay } from 'date-fns';
import { computeRealMRR, formatMRR } from '@/lib/credit-engine';
import { getPlansConfig } from '@/lib/plans-config';

function Kpi({ label, value, sub, color = '#F95738', icon: Icon }) {
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontSize: 11, color: '#666', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
        {Icon && <Icon size={15} color={color} />}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <p style={{ fontSize: 11, color: '#555', margin: 0 }}>{sub}</p>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fff' }}>
      <p style={{ color: '#888', marginBottom: 4 }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ fontWeight: 700 }}>{p.value?.toLocaleString()}</p>)}
    </div>
  );
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState(14);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [convs, setConvs] = useState([]);
  const [codes, setCodes] = useState([]);
  const plans = getPlansConfig();

  const load = async () => {
    setLoading(true);
    try {
      const [u, c, ac] = await Promise.all([
        base44.entities.User.list('-created_date', 1000),
        base44.entities.Conversation.list('-created_date', 2000),
        base44.entities.AccessCode.list().catch(() => []),
      ]);
      setUsers(u || []);
      setConvs(c || []);
      setCodes(ac || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ── Date range helpers ──
  const now = new Date();
  const rangeStart = startOfDay(subDays(now, range - 1));
  const prevRangeStart = startOfDay(subDays(now, range * 2 - 1));
  const prevRangeEnd = startOfDay(subDays(now, range));

  const inRange = (dateStr) => {
    const t = new Date(dateStr).getTime();
    return t >= rangeStart.getTime() && t <= now.getTime();
  };
  const inPrevRange = (dateStr) => {
    const t = new Date(dateStr).getTime();
    return t >= prevRangeStart.getTime() && t < prevRangeEnd.getTime();
  };

  // ── KPI computations ──
  const totalUsers = users.length;
  const paidUsers = users.filter(u => u.subscription_plan && u.subscription_plan !== 'free').length;
  const newUsers = users.filter(u => inRange(u.created_date)).length;
  const prevNewUsers = users.filter(u => inPrevRange(u.created_date)).length;
  const userDelta = prevNewUsers > 0 ? Math.round(((newUsers - prevNewUsers) / prevNewUsers) * 100) : null;

  const totalConvs = convs.length;
  const newConvs = convs.filter(c => inRange(c.created_date)).length;
  const prevNewConvs = convs.filter(c => inPrevRange(c.created_date)).length;
  const convDelta = prevNewConvs > 0 ? Math.round(((newConvs - prevNewConvs) / prevNewConvs) * 100) : null;

  const mrr = computeRealMRR(codes, plans);
  const usedCodes = codes.filter(c => c.used || (c.use_count && c.use_count > 0)).length;

  // ── Daily chart data ──
  const userChartData = Array.from({ length: range }, (_, i) => {
    const day = subDays(now, range - 1 - i);
    const label = format(day, range <= 14 ? 'MMM d' : 'MMM d');
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86_400_000;
    return {
      day: label,
      users: users.filter(u => { const t = new Date(u.created_date).getTime(); return t >= dayStart && t < dayEnd; }).length,
      convs: convs.filter(c => { const t = new Date(c.created_date).getTime(); return t >= dayStart && t < dayEnd; }).length,
    };
  });

  // ── Paid plan breakdown ──
  const planBreakdown = plans.filter(p => p.id !== 'free').map(p => ({
    name: p.name,
    count: users.filter(u => u.subscription_plan === p.id).length,
  })).filter(p => p.count > 0);

  return (
    <div style={{ padding: 32, color: '#fff', minHeight: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Analytics</h1>
          <p style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Real database metrics only — no mock data</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4, background: '#1A1A1A', borderRadius: 9, padding: 4 }}>
            {[7, 14, 30, 90].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: range === r ? '#F95738' : 'transparent', color: range === r ? '#fff' : '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{r}d</button>
            ))}
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, color: '#888', fontSize: 12, cursor: 'pointer' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <Kpi label="Total Users" value={loading ? '—' : totalUsers.toLocaleString()} sub={`${newUsers} new in last ${range}d`} color="#8b5cf6" icon={Users} />
        <Kpi label="Paid Users" value={loading ? '—' : paidUsers.toLocaleString()} sub={`${totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0}% conversion`} color="#22c55e" icon={Tag} />
        <Kpi label="MRR (from codes)" value={loading ? '—' : formatMRR(mrr)} sub={`${usedCodes} code${usedCodes !== 1 ? 's' : ''} redeemed — annual prorated`} color="#F95738" icon={DollarSign} />
        <Kpi label="Conversations" value={loading ? '—' : totalConvs.toLocaleString()} sub={`${newConvs} in last ${range}d${convDelta !== null ? ` (${convDelta > 0 ? '+' : ''}${convDelta}%)` : ''}`} color="#3B8BEB" icon={MessageSquare} />
      </div>

      {/* Main chart */}
      <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Growth — Last {range} days</h3>
            <p style={{ fontSize: 12, color: '#555', marginTop: 3 }}>New users & conversations per day — real DB data</p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 3, background: '#8b5cf6', borderRadius: 2, display: 'inline-block' }} />Users</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 3, background: '#F95738', borderRadius: 2, display: 'inline-block' }} />Convs</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={userChartData}>
            <defs>
              <linearGradient id="uGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F95738" stopOpacity={0.3} /><stop offset="95%" stopColor="#F95738" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1E1E1E" vertical={false} />
            <XAxis dataKey="day" stroke="#333" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#333" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} fill="url(#uGrad)" />
            <Area type="monotone" dataKey="convs" stroke="#F95738" strokeWidth={2} fill="url(#cGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Plan breakdown */}
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Paid Plan Breakdown</h3>
          {loading ? (
            <p style={{ color: '#555', fontSize: 13 }}>Loading…</p>
          ) : planBreakdown.length === 0 ? (
            <p style={{ color: '#555', fontSize: 13 }}>No paid subscriptions yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={planBreakdown} layout="vertical">
                <XAxis type="number" stroke="#333" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#333" tick={{ fill: '#ccc', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#7B4FE0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* MRR detail */}
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>MRR Breakdown</h3>
          <p style={{ fontSize: 11, color: '#555', margin: '0 0 16px' }}>Computed from redeemed access codes only. Annual plans are divided by 12.</p>
          {loading ? <p style={{ color: '#555', fontSize: 13 }}>Loading…</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {getPlansConfig().filter(p => p.id !== 'free').map(plan => {
                const planCodes = codes.filter(c => c.plan_id === plan.id && (c.used || c.use_count > 0));
                const monthlyRevenue = planCodes.reduce((sum, c) => {
                  const billing = c.billing || 'monthly';
                  const price = billing === 'yearly'
                    ? (plan.price_yearly ?? plan.price_monthly ?? 0) / 12
                    : (plan.price_monthly ?? plan.price ?? 0);
                  return sum + price * (c.use_count || (c.used ? 1 : 0));
                }, 0);
                if (monthlyRevenue === 0) return null;
                return (
                  <div key={plan.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{plan.name}</span>
                      <span style={{ fontSize: 11, color: '#555', marginLeft: 8 }}>{planCodes.length} code{planCodes.length !== 1 ? 's' : ''}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F95738' }}>{formatMRR(monthlyRevenue)}/mo</span>
                  </div>
                );
              })}
              <div style={{ paddingTop: 12, borderTop: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Total MRR</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#22c55e' }}>{formatMRR(mrr)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}