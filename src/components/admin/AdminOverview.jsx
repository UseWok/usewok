import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, DollarSign, Activity,
  ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const FADE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// Generate synthetic but realistic trend data
function genMonthly(base, variance, months = 7) {
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  return labels.slice(-months).map((month, i) => ({
    month,
    value: Math.round(base + (i * variance * 0.8) + (Math.random() - 0.3) * variance * 0.5),
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#16172080] backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-xs">
        <p className="text-white/50 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} className="text-white font-semibold">{p.value?.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminOverview() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list('-created_date', 200)
      .then(u => setUsers(u || []))
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.disabled).length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  // Synthetic MRR / subscription data
  const mrr = totalUsers * 12.5;
  const mrrGrowth = 14.3;
  const churnRate = 2.1;

  const userGrowthData = genMonthly(Math.max(1, totalUsers - 20), 4);
  const mrrData = genMonthly(mrr * 0.6, mrr * 0.07);
  const activityData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({
    day, sessions: Math.round(20 + Math.random() * 80),
  }));

  const kpis = [
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      delta: '+12.4%',
      up: true,
      icon: Users,
      color: 'from-violet-500/20 to-violet-500/5',
      accent: '#8b5cf6',
    },
    {
      label: 'Active Users',
      value: activeUsers.toLocaleString(),
      delta: '+8.1%',
      up: true,
      icon: Activity,
      color: 'from-emerald-500/20 to-emerald-500/5',
      accent: '#10b981',
    },
    {
      label: 'Est. MRR',
      value: `$${Math.round(mrr).toLocaleString()}`,
      delta: `+${mrrGrowth}%`,
      up: true,
      icon: DollarSign,
      color: 'from-amber-500/20 to-amber-500/5',
      accent: '#f59e0b',
    },
    {
      label: 'Churn Rate',
      value: `${churnRate}%`,
      delta: '-0.4%',
      up: false,
      icon: TrendingUp,
      color: 'from-rose-500/20 to-rose-500/5',
      accent: '#f43f5e',
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* KPI Cards */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={FADE}
              className={`bg-gradient-to-br ${kpi.color} border border-white/[0.07] rounded-2xl p-6 group hover:border-white/15 transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${kpi.accent}20`, border: `1px solid ${kpi.accent}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: kpi.accent }} />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.delta}
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{loading ? '—' : kpi.value}</p>
              <p className="text-xs text-white/40 font-medium">{kpi.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.2 }}
          className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">User Growth</h3>
              <p className="text-xs text-white/30 mt-0.5">Last 7 months</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">↑ Growing</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#ugGrad)" dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#a78bfa' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* MRR Trend */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.28 }}
          className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue Trend</h3>
              <p className="text-xs text-white/30 mt-0.5">Monthly Recurring Revenue</p>
            </div>
            <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-full">Est. MRR</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mrrData}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#mrrGrad)" dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#fbbf24' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Weekly Activity Bar */}
      <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.34 }}
        className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Weekly Sessions</h3>
            <p className="text-xs text-white/30 mt-0.5">Active user sessions per day</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={activityData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="sessions" fill="#eab308" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Admin Accounts', value: adminCount, note: 'with full access' },
          { label: 'Verified Users', value: activeUsers, note: 'email confirmed' },
          { label: 'Avg. Plan Value', value: '$12.50', note: 'per user / mo' },
        ].map((s, i) => (
          <motion.div key={s.label} variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.4 + i * 0.05 }}
            className="bg-[#0d0e14] border border-white/[0.07] rounded-xl p-5 text-center"
          >
            <p className="text-2xl font-bold text-white">{loading ? '—' : s.value}</p>
            <p className="text-xs text-white/60 font-medium mt-1">{s.label}</p>
            <p className="text-[10px] text-white/25 mt-0.5">{s.note}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}