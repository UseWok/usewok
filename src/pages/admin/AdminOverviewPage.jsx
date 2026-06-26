import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, CreditCard, TrendingUp, MessageSquare, ArrowUpRight, Activity, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
const BG = '#F8F7F4';
const CARD = '#FFFFFF';
const BORDER = 'rgba(21,19,15,0.09)';
const INK = '#1A1A1A';
const INK2 = '#6B6660';
const INK3 = '#A8A49F';
const CORAL = '#FF5A1F';

function StatCard({ label, value, sub, icon: Icon, color, loading }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>
        {loading ? <span style={{ color: INK3 }}>—</span> : value}
      </div>
      <div style={{ fontSize: 13, color: INK2, marginTop: 5 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Groupe inscriptions par jour (30 derniers jours)
function buildSignupChart(users) {
  const days = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    days[key] = 0;
  }
  users.forEach(u => {
    if (!u.created_date) return;
    const d = new Date(u.created_date);
    const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    if (days[key] !== undefined) days[key]++;
  });
  return Object.entries(days).map(([name, value]) => ({ name, value }));
}

// Groupe MRR par mois depuis les paiements Stripe (CreditLedger action=SCAN/FIX avec amount>0)
function buildMRRChart(payments) {
  const months = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    months[key] = 0;
  }
  payments.forEach(p => {
    if (!p.timestamp || p.amount <= 0) return;
    const d = new Date(p.timestamp);
    const key = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    if (months[key] !== undefined) months[key] += p.amount;
  });
  return Object.entries(months).map(([name, value]) => ({ name, value: Math.round(value) }));
}

export default function AdminOverviewPage() {
  const [data, setData] = useState({ users: [], payments: [], tickets: [], posts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, payments, tickets, posts] = await Promise.all([
          base44.entities.User.list('-created_date', 2000),
          base44.entities.CreditLedger.list('-created_date', 2000),
          base44.entities.SupportTicket.filter({ status: 'open' }),
          base44.entities.BlogPost.filter({ published: true }),
        ]);
        setData({ users: users || [], payments: payments || [], tickets: tickets || [], posts: posts || [] });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // MRR = sum of positive payments dans le mois courant
  const now = new Date();
  const currentMonthPayments = data.payments.filter(p => {
    if (!p.timestamp || p.amount <= 0) return false;
    const d = new Date(p.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const mrr = currentMonthPayments.reduce((s, p) => s + p.amount, 0);

  const paidUsers = data.users.filter(u => u.subscription_plan && u.subscription_plan !== 'free');
  const signupChart = buildSignupChart(data.users);
  const mrrChart = buildMRRChart(data.payments);

  // Recent users
  const recentUsers = data.users.slice(0, 8);

  const customTooltipStyle = { background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12, color: INK, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };

  return (
    <div style={{ padding: '32px 36px', fontFamily: F, background: BG, minHeight: '100vh', color: INK }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.03em' }}>Vue d'ensemble</h1>
        <p style={{ fontSize: 13, color: INK2, marginTop: 4 }}>Métriques clés de la plateforme UseWok.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Utilisateurs" value={data.users.length} sub="Inscrits total" icon={Users} color={CORAL} loading={loading} />
        <StatCard label="Abonnés payants" value={paidUsers.length} sub="Plans actifs" icon={CreditCard} color="#7B4FE0" loading={loading} />
        <StatCard label="MRR" value={`${mrr.toFixed(0)} crédits`} sub="Mois en cours (Stripe)" icon={TrendingUp} color="#22C55E" loading={loading} />
        <StatCard label="Tickets ouverts" value={data.tickets.length} sub="Support en attente" icon={MessageSquare} color="#3B8BEB" loading={loading} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 24 }}>
        {/* Inscriptions */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '22px 24px' }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Nouvelles inscriptions</p>
          <p style={{ fontSize: 11.5, color: INK3, margin: '0 0 20px' }}>30 derniers jours</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={signupChart}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CORAL} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CORAL} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: INK3, fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: INK3, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="value" stroke={CORAL} strokeWidth={2} fill="url(#sg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MRR mensuel */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '22px 24px' }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Revenus Stripe</p>
          <p style={{ fontSize: 11.5, color: INK3, margin: '0 0 20px' }}>6 derniers mois (crédits)</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={mrrChart}>
              <XAxis dataKey="name" tick={{ fill: INK3, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: INK3, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="value" fill="#7B4FE0" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Derniers utilisateurs + blog stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        {/* Recent users */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 24px' }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 16px', letterSpacing: '-0.02em' }}>Derniers inscrits</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentUsers.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < recentUsers.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: CORAL + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: CORAL, flexShrink: 0 }}>
                  {(u.full_name || u.email || '?').slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 500, color: INK, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || u.email}</p>
                  <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{u.email}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                    background: (u.subscription_plan && u.subscription_plan !== 'free') ? '#7B4FE015' : 'rgba(21,19,15,0.05)',
                    color: (u.subscription_plan && u.subscription_plan !== 'free') ? '#7B4FE0' : INK3,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {u.subscription_plan || 'free'}
                  </span>
                  <span style={{ fontSize: 10.5, color: INK3 }}>
                    {new Date(u.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <FileText size={14} color={INK2} />
              <p style={{ fontSize: 12.5, fontWeight: 600, color: INK, margin: 0 }}>Blog</p>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.04em' }}>{data.posts.length}</p>
            <p style={{ fontSize: 11.5, color: INK3, margin: 0 }}>Articles publiés</p>
          </div>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px', flex: 1 }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: INK, margin: '0 0 12px', letterSpacing: '-0.01em' }}>Conversion</p>
            {loading ? (
              <p style={{ fontSize: 11, color: INK3 }}>Chargement…</p>
            ) : (
              <>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11.5, color: INK2 }}>Free → Payant</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: INK }}>
                      {data.users.length ? ((paidUsers.length / data.users.length) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(21,19,15,0.08)', borderRadius: 999 }}>
                    <div style={{ height: '100%', width: `${data.users.length ? (paidUsers.length / data.users.length) * 100 : 0}%`, background: CORAL, borderRadius: 999 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: INK3, marginTop: 6 }}>
                  <span>{paidUsers.length} payants</span>
                  <span>{data.users.length - paidUsers.length} gratuits</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: 11.5, color: INK3 }}>
        <Activity size={12} color="#22C55E" />
        <span style={{ color: '#22C55E', fontWeight: 600 }}>Données réelles</span>
        — Chargées depuis la base de données
      </div>
    </div>
  );
}