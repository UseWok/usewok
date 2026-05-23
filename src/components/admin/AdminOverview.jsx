import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, MessageSquare, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, subDays, startOfDay } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const FADE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

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
  const [convs, setConvs] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.User.list('-created_date', 500),
      base44.entities.Conversation.list('-created_date', 200),
      base44.entities.ContactLead.list('-created_date', 100).catch(() => []),
    ]).then(([u, c, l]) => {
      setUsers(u || []);
      setConvs(c || []);
      setLeads(l || []);
    }).finally(() => setLoading(false));
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.disabled).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const totalConvs = convs.length;
  const newLeads = leads.filter(l => l.status === 'new').length;

  // Real user registrations per day (last 7 days)
  const userGrowthData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const label = format(day, 'EEE');
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86400000;
    const count = users.filter(u => {
      const t = new Date(u.created_date).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    return { day: label, value: count };
  });

  // Real conversations per day (last 7 days)
  const convData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const label = format(day, 'EEE');
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86400000;
    const count = convs.filter(c => {
      const t = new Date(c.created_date).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    return { day: label, value: count };
  });

  const kpis = [
    { label: 'Total Users', value: totalUsers, icon: Users, accent: '#8b5cf6', color: 'from-violet-500/20 to-violet-500/5' },
    { label: 'Active Users', value: activeUsers, icon: Activity, accent: '#10b981', color: 'from-emerald-500/20 to-emerald-500/5' },
    { label: 'Conversations', value: totalConvs, icon: MessageSquare, accent: '#f59e0b', color: 'from-amber-500/20 to-amber-500/5' },
    { label: 'Enterprise Leads', value: newLeads, icon: Star, accent: '#f43f5e', color: 'from-rose-500/20 to-rose-500/5' },
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
              className={`bg-gradient-to-br ${kpi.color} border border-white/[0.07] rounded-2xl p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${kpi.accent}20`, border: `1px solid ${kpi.accent}30` }}>
                  <Icon className="w-5 h-5" style={{ color: kpi.accent }} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{loading ? '—' : kpi.value.toLocaleString()}</p>
              <p className="text-xs text-white/40 font-medium">{kpi.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User signups */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.2 }}
          className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">New Registrations</h3>
              <p className="text-xs text-white/30 mt-0.5">Last 7 days — real data</p>
            </div>
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
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#ugGrad)" dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#a78bfa' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Conversations */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.28 }}
          className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Conversations Created</h3>
              <p className="text-xs text-white/30 mt-0.5">Last 7 days — real data</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={convData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Admin Accounts', value: adminCount, note: 'with full access' },
          { label: 'Non-admin Users', value: totalUsers - adminCount, note: 'regular accounts' },
          { label: 'New Enterprise Leads', value: newLeads, note: 'awaiting response' },
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