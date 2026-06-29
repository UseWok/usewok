import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  TrendingUp, Users, DollarSign, UserMinus, ArrowUpRight, ArrowDownRight, Zap, Crown, Star
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, subMonths, startOfDay, startOfMonth } from 'date-fns';

const FADE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const PLAN_PRICES = { free: 0, starter: 45, pro: 85 };
const PLAN_LABELS = { free: 'Gratuit', starter: 'Starter', pro: 'Pro' };
const PLAN_COLORS = { free: '#6b7280', starter: '#8b5cf6', pro: '#f59e0b' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(13,14,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: 13, fontWeight: 700, color: p.color || '#fff' }}>
          {p.name === 'mrr' || p.name === 'revenue' ? '€' : ''}{p.value?.toLocaleString('fr')}
        </p>
      ))}
    </div>
  );
};

function StatCard({ label, value, sub, icon: Icon, accent, trend, loading }) {
  const isPos = trend > 0;
  return (
    <motion.div variants={FADE}
      style={{ background: `linear-gradient(135deg, ${accent}18 0%, ${accent}06 100%)`, border: `1px solid ${accent}25`, borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${accent}20`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={accent} />
        </div>
        {trend !== undefined && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: isPos ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${isPos ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 20 }}>
            {isPos ? <ArrowUpRight size={11} color="#10b981" /> : <ArrowDownRight size={11} color="#ef4444" />}
            <span style={{ fontSize: 11, fontWeight: 700, color: isPos ? '#10b981' : '#ef4444' }}>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 4px' }}>
        {loading ? '—' : value}
      </p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: '3px 0 0' }}>{sub}</p>}
    </motion.div>
  );
}

export default function AdminRevenueOverview() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.User.list('-created_date', 1000)
      .then(u => setUsers(u || []))
      .finally(() => setLoading(false));
  }, []);

  // ── Revenue calculations ──
  const paidUsers = users.filter(u => u.subscription_plan && u.subscription_plan !== 'free');
  const starterUsers = users.filter(u => u.subscription_plan === 'starter');
  const proUsers = users.filter(u => u.subscription_plan === 'pro');
  const freeUsers = users.filter(u => !u.subscription_plan || u.subscription_plan === 'free');

  const mrr = starterUsers.length * 45 + proUsers.length * 85;
  const arr = mrr * 12;

  // Churn: users who had a subscription but downgraded (approximation via no subscription_plan set but non-zero)
  const churnedUsers = users.filter(u => u.previous_plan && (!u.subscription_plan || u.subscription_plan === 'free'));
  const churnRate = paidUsers.length > 0 ? Math.round((churnedUsers.length / (paidUsers.length + churnedUsers.length)) * 100) : 0;

  const arpu = paidUsers.length > 0 ? Math.round(mrr / paidUsers.length) : 0;

  // ── MRR Growth (last 6 months) based on user join dates ──
  const mrrData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const label = format(month, 'MMM');
    const monthStart = startOfMonth(month).getTime();
    const nextMonth = startOfMonth(subMonths(new Date(), 4 - i)).getTime();

    // Users who were paying at this point in time
    const payingAtTime = users.filter(u => {
      const joined = new Date(u.created_date).getTime();
      return joined <= nextMonth && (u.subscription_plan === 'starter' || u.subscription_plan === 'pro');
    });
    const revenue = payingAtTime.filter(u => u.subscription_plan === 'starter').length * 45
      + payingAtTime.filter(u => u.subscription_plan === 'pro').length * 85;
    return { month: label, mrr: revenue };
  });

  // ── New paying users per day (last 14 days) ──
  const newPaidData = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const label = format(day, 'dd/MM');
    const dayStart = startOfDay(day).getTime();
    const dayEnd = dayStart + 86400000;
    const count = paidUsers.filter(u => {
      const t = new Date(u.created_date).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    const revenue = paidUsers.filter(u => {
      const t = new Date(u.created_date).getTime();
      return t >= dayStart && t < dayEnd;
    }).reduce((sum, u) => sum + (PLAN_PRICES[u.subscription_plan] || 0), 0);
    return { day: label, users: count, revenue };
  });

  // ── Plan distribution for pie ──
  const planDist = [
    { name: 'Gratuit', value: freeUsers.length, color: '#6b7280' },
    { name: 'Starter', value: starterUsers.length, color: '#8b5cf6' },
    { name: 'Pro', value: proUsers.length, color: '#f59e0b' },
  ].filter(p => p.value > 0);

  // ── Conversion rate ──
  const convRate = users.length > 0 ? ((paidUsers.length / users.length) * 100).toFixed(1) : '0.0';

  // ── Recent paying subscribers ──
  const recentPaid = [...paidUsers]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 8);

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── KPI Row ── */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden" animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}
      >
        <StatCard label="MRR" value={`€${mrr.toLocaleString('fr')}`} sub="Revenu mensuel récurrent" icon={DollarSign} accent="#10b981" loading={loading} />
        <StatCard label="ARR" value={`€${arr.toLocaleString('fr')}`} sub="Revenu annuel projeté" icon={TrendingUp} accent="#8b5cf6" loading={loading} />
        <StatCard label="Clients Payants" value={paidUsers.length} sub={`Conv. ${convRate}%`} icon={Users} accent="#f59e0b" loading={loading} />
        <StatCard label="ARPU" value={`€${arpu}`} sub="Revenu moyen par client" icon={Crown} accent="#f43f5e" loading={loading} />
      </motion.div>

      {/* ── Plans breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Free', count: freeUsers.length, rev: 0, color: '#6b7280', icon: Star },
          { label: 'Starter • €45/mois', count: starterUsers.length, rev: starterUsers.length * 45, color: '#8b5cf6', icon: Zap },
          { label: 'Pro • €85/mois', count: proUsers.length, rev: proUsers.length * 85, color: '#f59e0b', icon: Crown },
        ].map((p, i) => (
          <motion.div key={p.label} variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.1 + i * 0.05 }}
            style={{ background: '#0d0e14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <p.icon size={16} color={p.color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '0 0 4px' }}>{p.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>{loading ? '—' : p.count}</p>
            </div>
            {p.rev > 0 && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: '0 0 2px' }}>MRR</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: p.color, margin: 0 }}>€{p.rev.toLocaleString('fr')}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* MRR Growth Chart */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.2 }}
          style={{ background: '#0d0e14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Évolution MRR — 6 mois</h3>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '3px 0 0' }}>Revenu mensuel récurrent calculé sur vos abonnés actifs</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mrrData}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="mrr" name="mrr" stroke="#10b981" strokeWidth={2.5} fill="url(#mrrGrad)" dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Plan Pie */}
        <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.28 }}
          style={{ background: '#0d0e14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Répartition des plans</h3>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '3px 0 0' }}>Tous les utilisateurs</p>
          </div>
          {!loading && planDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={planDist} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {planDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + ' users', n]} contentStyle={{ background: '#0d0e14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {planDist.map(p => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Pas encore de données</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Revenue per day */}
      <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.32 }}
        style={{ background: '#0d0e14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px', marginBottom: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Nouveaux abonnés payants — 14 jours</h3>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '3px 0 0' }}>Clients ayant souscrit à Starter ou Pro</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={newPaidData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="users" name="Clients" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent subscribers table */}
      <motion.div variants={FADE} initial="hidden" animate="show" transition={{ delay: 0.38 }}
        style={{ background: '#0d0e14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>Derniers abonnés payants</h3>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '3px 0 0' }}>Clients Starter & Pro les plus récents</p>
          </div>
          <div style={{ padding: '4px 12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{paidUsers.length} actifs</span>
          </div>
        </div>
        <div>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Chargement…</p>
            </div>
          ) : recentPaid.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>Aucun abonné payant pour le moment</p>
            </div>
          ) : (
            recentPaid.map((u, i) => {
              const plan = u.subscription_plan || 'free';
              const planColor = PLAN_COLORS[plan] || '#6b7280';
              const rev = PLAN_PRICES[plan] || 0;
              return (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 22px', borderBottom: i < recentPaid.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', gap: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${planColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: planColor }}>
                      {(u.full_name || u.email || '?').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.full_name || u.email || 'Utilisateur'}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ padding: '3px 10px', background: `${planColor}15`, border: `1px solid ${planColor}30`, borderRadius: 20 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: planColor }}>{PLAN_LABELS[plan] || plan}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>€{rev}/mois</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                      {format(new Date(u.created_date), 'dd/MM/yy')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

    </div>
  );
}