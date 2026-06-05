import { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, Globe, Smartphone, Monitor } from 'lucide-react';

const COLORS = ['#F95738', '#7B4FE0', '#3B8BEB', '#4ade80', '#E8184A'];

function Kpi({ label, value, delta, up }) {
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: '18px 20px' }}>
      <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 8 }}>{value}</div>
      {delta != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: up ? '#4ade80' : '#E8184A' }}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {up ? '+' : ''}{delta}% vs last period
        </div>
      )}
    </div>
  );
}

// Generate last 14 days of mock data using real dates
const generate14Days = () => {
  const data = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    data.push({
      name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pageviews: Math.floor(Math.random() * 300 + 100),
      visitors: Math.floor(Math.random() * 80 + 20),
      sessions: Math.floor(Math.random() * 120 + 40),
    });
  }
  return data;
};

const DEVICE_DATA = [{ name: 'Desktop', value: 58 }, { name: 'Mobile', value: 34 }, { name: 'Tablet', value: 8 }];
const COUNTRY_DATA = [
  { country: '🇫🇷 France', visitors: 1240, pct: 32 }, { country: '🇺🇸 United States', visitors: 980, pct: 25 },
  { country: '🇬🇧 United Kingdom', visitors: 620, pct: 16 }, { country: '🇩🇪 Germany', visitors: 410, pct: 11 },
  { country: '🇪🇸 Spain', visitors: 260, pct: 7 }, { country: '🇨🇦 Canada', visitors: 180, pct: 5 },
  { country: 'Other', visitors: 160, pct: 4 },
];
const CURRENCY_DATA = [
  { currency: 'EUR €', sessions: 2140 }, { currency: 'USD $', sessions: 1680 },
  { currency: 'GBP £', sessions: 840 }, { currency: 'Other', sessions: 340 },
];

const [data14] = [generate14Days()];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('14d');
  const [liveVisitors] = useState(() => Math.floor(Math.random() * 24 + 3));

  const totalPV = data14.reduce((s, d) => s + d.pageviews, 0);
  const totalV = data14.reduce((s, d) => s + d.visitors, 0);

  return (
    <div style={{ padding: '32px', color: '#fff', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Analytics</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Real-time platform intelligence</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#1A1A1A', borderRadius: 9, padding: 4 }}>
          {['7d','14d','30d','90d'].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: range === r ? '#F95738' : 'transparent', color: range === r ? '#fff' : '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Live counter */}
      <div style={{ background: '#111', border: '1px solid #4ade8044', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>{liveVisitors} visitors right now</span>
        <span style={{ fontSize: 12, color: '#555' }}>· Live · connected via cloud sync</span>
        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.2)} }`}</style>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <Kpi label="Page Views" value={totalPV.toLocaleString()} delta={18} up />
        <Kpi label="Unique Visitors" value={totalV.toLocaleString()} delta={12} up />
        <Kpi label="Avg. Session" value="3m 42s" delta={-4} up={false} />
        <Kpi label="Bounce Rate" value="38%" delta={-6} up />
      </div>

      {/* Main chart */}
      <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: 22, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Traffic Overview</h3>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 3, background: '#F95738', borderRadius: 2, display: 'inline-block' }} />Page views</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 3, background: '#7B4FE0', borderRadius: 2, display: 'inline-block' }} />Visitors</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data14}>
            <defs>
              <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F95738" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F95738" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B4FE0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7B4FE0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1E1E1E" vertical={false} />
            <XAxis dataKey="name" stroke="#333" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#333" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 12 }} />
            <Area type="monotone" dataKey="pageviews" stroke="#F95738" strokeWidth={2} fill="url(#pvGrad)" />
            <Area type="monotone" dataKey="visitors" stroke="#7B4FE0" strokeWidth={2} fill="url(#vGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Secondary charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {/* Devices */}
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Devices</h3>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart><Pie data={DEVICE_DATA} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
              {DEVICE_DATA.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie><Tooltip contentStyle={{ background: '#222', border: 'none', borderRadius: 8, fontSize: 12 }} /></PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {DEVICE_DATA.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#ccc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i] }} /> {d.name}
                </div>
                <span style={{ fontWeight: 700 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
            <Globe size={14} style={{ marginRight: 6, display: 'inline' }} />Top Countries
          </h3>
          {COUNTRY_DATA.map(c => (
            <div key={c.country} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#ccc', marginBottom: 3 }}>
                <span>{c.country}</span><span style={{ fontWeight: 700 }}>{c.pct}%</span>
              </div>
              <div style={{ height: 4, background: '#222', borderRadius: 999 }}>
                <div style={{ height: '100%', width: `${c.pct}%`, background: '#F95738', borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Currency */}
        <div style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Currency breakdown</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={CURRENCY_DATA} layout="vertical">
              <XAxis type="number" stroke="#333" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="currency" stroke="#333" tick={{ fill: '#ccc', fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ background: '#222', border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="sessions" fill="#7B4FE0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}