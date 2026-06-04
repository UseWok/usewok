import { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const RANGES = ['Today', 'Yesterday', 'Last 24 hours', 'Last 7 days', 'Last 14 days', 'Last 30 days', 'Last 90 days', 'This month'];

function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', border: '1px solid #E0E0DC', borderRadius: 8,
        background: '#fff', fontSize: 13, color: '#333', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
      }}>
        {value} <ChevronDown style={{ width: 13, height: 13 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0,
          background: '#fff', border: '1px solid #E4E4E0', borderRadius: 10,
          boxShadow: '0 6px 24px rgba(0,0,0,0.10)', zIndex: 9999,
          padding: '4px', minWidth: 160,
        }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => { onChange(r); setOpen(false); }} style={{
              display: 'block', width: '100%', padding: '7px 12px',
              background: r === value ? '#F0F0EE' : 'transparent', border: 'none',
              borderRadius: 6, fontSize: 13, color: '#333', cursor: 'pointer',
              textAlign: 'left', fontFamily: 'Inter, sans-serif',
            }}
              onMouseEnter={e => { if (r !== value) e.currentTarget.style.background = '#F8F8F6'; }}
              onMouseLeave={e => { if (r !== value) e.currentTarget.style.background = 'transparent'; }}
            >{r}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, active }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 10,
      border: active ? '1.5px solid #2563EB' : '1px solid #E8E6E0',
      background: '#FAFAF8', minWidth: 100, flex: 1,
    }}>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{value}</div>
    </div>
  );
}

function TableBlock({ title, rows }) {
  return (
    <div style={{
      border: '1px solid #E8E6E0', borderRadius: 10,
      background: '#FAFAF8', overflow: 'hidden', flex: 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #EDEAE4' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{title}</span>
        <span style={{ fontSize: 12, color: '#888' }}>Visitors</span>
      </div>
      {rows.length === 0 ? (
        <div style={{ padding: '16px', fontSize: 13, color: '#CCC', textAlign: 'center' }}>No data</div>
      ) : rows.map((row, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '9px 16px', background: i % 2 === 0 ? 'rgba(37,99,235,0.04)' : 'transparent',
        }}>
          <span style={{ fontSize: 13, color: '#333', display: 'flex', alignItems: 'center', gap: 8 }}>
            {row.flag && <span>{row.flag}</span>}
            {row.label}
          </span>
          <span style={{ fontSize: 13, color: '#555', fontVariantNumeric: 'tabular-nums' }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPanel() {
  const [range, setRange] = useState('Last 7 days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate chart data based on range
  useEffect(() => {
    setLoading(true);
    // Build real data from base44 analytics events stored locally
    const events = (() => {
      try { return JSON.parse(localStorage.getItem('wok_analytics_events') || '[]'); } catch { return []; }
    })();

    const now = Date.now();
    const daysMap = { 'Today': 1, 'Yesterday': 1, 'Last 24 hours': 1, 'Last 7 days': 7, 'Last 14 days': 14, 'Last 30 days': 30, 'Last 90 days': 90, 'This month': 30 };
    const days = daysMap[range] || 7;
    const cutoff = now - days * 86400000;
    const filtered = events.filter(e => e.ts > cutoff);

    // Build chart points
    const points = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = filtered.filter(e => new Date(e.ts).toDateString() === d.toDateString()).length;
      points.push({ date: label, visitors: count });
    }

    // Aggregate stats
    const visitors = new Set(filtered.map(e => e.sid)).size;
    const pageviews = filtered.length;
    const sources = {};
    const pages = {};
    const countries = {};
    const devices = {};
    filtered.forEach(e => {
      sources[e.source || 'Direct'] = (sources[e.source || 'Direct'] || 0) + 1;
      pages[e.page || '/'] = (pages[e.page || '/'] || 0) + 1;
      countries[e.country || 'Unknown'] = (countries[e.country || 'Unknown'] || 0) + 1;
      devices[e.device || 'Desktop'] = (devices[e.device || 'Desktop'] || 0) + 1;
    });

    const toRows = (obj) => Object.entries(obj).sort((a,b) => b[1]-a[1]).map(([k,v]) => ({ label: k, value: v }));
    const countryFlags = { 'United States': '🇺🇸', 'France': '🇫🇷', 'Germany': '🇩🇪', 'UK': '🇬🇧', 'Spain': '🇪🇸' };

    setData({
      chart: points,
      stats: { visitors, pageviews, viewsPerVisit: visitors ? (pageviews/visitors).toFixed(1) : 0, bounceRate: '—' },
      sources: toRows(sources),
      pages: toRows(pages),
      countries: toRows(countries).map(r => ({ ...r, flag: countryFlags[r.label] || '' })),
      devices: toRows(devices).map(r => ({ ...r, value: visitors ? `${Math.round(r.value/pageviews*100)}%` : '0%' })),
    });
    setLoading(false);
  }, [range]);

  // Track page view on mount
  useEffect(() => {
    const events = (() => { try { return JSON.parse(localStorage.getItem('wok_analytics_events') || '[]'); } catch { return []; } })();
    events.push({
      ts: Date.now(),
      sid: localStorage.getItem('wok_sid') || (() => { const id = `s_${Math.random().toString(36).slice(2)}`; localStorage.setItem('wok_sid', id); return id; })(),
      page: window.location.pathname,
      source: document.referrer ? new URL(document.referrer).hostname : 'Direct',
      device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
      country: 'Unknown',
    });
    // Keep max 10000 events
    const trimmed = events.slice(-10000);
    localStorage.setItem('wok_analytics_events', JSON.stringify(trimmed));
  }, []);

  const currentVisitors = 0;

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#FAF9F5', padding: 20, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
          {currentVisitors} current visitors
        </span>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatCard label="Visitors" value={data?.stats.visitors ?? '—'} active />
        <StatCard label="Pageviews" value={data?.stats.pageviews ?? '—'} />
        <StatCard label="Views Per Visit" value={data?.stats.viewsPerVisit ?? '—'} />
        <StatCard label="Visit Duration" value="0s" />
        <StatCard label="Bounce Rate" value={data?.stats.bounceRate ?? '—'} />
      </div>

      {/* Chart */}
      <div style={{ border: '1px solid #E8E6E0', borderRadius: 10, background: '#FAFAF8', padding: '16px 8px 8px', marginBottom: 16 }}>
        {loading || !data ? (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CCC', fontSize: 13 }}>Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.chart} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEAE4" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#AAA' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#AAA' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #E0E0DC', borderRadius: 8, boxShadow: 'none' }} />
              <Area type="monotone" dataKey="visitors" stroke="#2563EB" fill="url(#agrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <TableBlock title="Source" rows={data?.sources || []} />
        <TableBlock title="Page" rows={data?.pages || []} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TableBlock title="Country" rows={data?.countries || []} />
        <TableBlock title="Device" rows={data?.devices || []} />
      </div>
    </div>
  );
}